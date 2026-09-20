import { db } from '@/lib/db'
import { signatureRefusalReason } from '@/lib/uipathSignature'
import { computeEvidenceHash } from '@/lib/evidenceEnvelope'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-uipath-signature') || request.headers.get('x-webhook-signature')
    const refusal = signatureRefusalReason(signature, process.env.UIPATH_WEBHOOK_SECRET)
    if (refusal) {
      // Server-side distinction between a misconfigured deployment and a
      // bad caller — the 401 body stays generic on purpose.
      console.warn(`[uipath] webhook refused (${refusal})`)
      return NextResponse.json({ error: 'Invalid UiPath signature' }, { status: 401 })
    }

    const body = await request.json()
    const kind = String(body.kind || body.type || 'access_log')

    if (kind === 'credential') {
      const { userId, type, issuer, expiresAt, data } = body
      if (!userId || !type) {
        return NextResponse.json({ error: 'userId and type are required for credential payloads' }, { status: 400 })
      }

      const credential = await db.credential.create({
        data: {
          userId,
          type,
          issuer: issuer || 'UiPath',
          status: 'active',
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          data: JSON.stringify(data || body),
        },
      })

      return NextResponse.json({ kind, credential }, { status: 201 })
    }

    if (kind === 'presentation') {
      const { credentialId, verifier, agentId, status, proof } = body
      if (!credentialId || !agentId) {
        return NextResponse.json({ error: 'credentialId and agentId are required for presentation payloads' }, { status: 400 })
      }

      const presentation = await db.presentation.create({
        data: {
          credentialId,
          verifier: verifier || 'UiPath',
          agentId: agentId || '',
          status: status || 'pending',
          proof: JSON.stringify(proof || body),
        },
      })

      return NextResponse.json({ kind, presentation }, { status: 201 })
    }

    const { agentId, action, resource, details } = body
    if (!agentId || !action) {
      return NextResponse.json({ error: 'agentId and action are required for access log payloads' }, { status: 400 })
    }

    // Seal the entry into the evidence chain (row 10): hash over canonical
    // content plus the prior row's entryHash.
    const last = await db.accessLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { entryHash: true },
    })
    const prevHash = last?.entryHash ?? ''
    const entry = {
      agentId,
      action,
      resource: resource || body.subject || 'UiPath handoff',
      details: JSON.stringify(details || body),
      createdAt: new Date(),
    }
    const accessLog = await db.accessLog.create({
      data: {
        ...entry,
        prevHash,
        entryHash: computeEvidenceHash(entry, prevHash),
      },
    })

    return NextResponse.json({ kind: 'access_log', accessLog }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to ingest UiPath payload' },
      { status: 500 }
    )
  }
}
