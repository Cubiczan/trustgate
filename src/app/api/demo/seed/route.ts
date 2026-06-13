import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuthResponse } from '@/lib/resilience'

export async function POST(req: Request) {
  // This endpoint is destructive (it wipes agents/credentials/presentations/
  // logs before re-seeding). Gate it behind a bearer token and FAIL CLOSED:
  // when DEMO_SEED_TOKEN is unset, requireAuthResponse returns 503 rather than
  // allowing the wipe. Callers send `Authorization: Bearer <DEMO_SEED_TOKEN>`.
  const denied = requireAuthResponse(req, { token: process.env.DEMO_SEED_TOKEN })
  if (denied) return denied

  try {
    // Clear existing data
    await db.accessLog.deleteMany()
    await db.presentation.deleteMany()
    await db.credential.deleteMany()
    await db.agent.deleteMany()

    // Create demo agents
    const agent1 = await db.agent.create({
      data: {
        name: 'DeFi Portfolio Manager',
        description: 'AI agent that manages decentralized finance portfolios. Requires KYC verification before executing trades over $10,000.',
        did: 'did:t3:agent:7f3a2b1c4e5d6a8b9c0d1e2f3a4b5c6d',
        permissions: JSON.stringify(['read:kyc', 'read:wallet', 'execute:trade', 'read:balance']),
        status: 'active',
      },
    })

    const agent2 = await db.agent.create({
      data: {
        name: 'Compliance Sentinel',
        description: 'Monitors blockchain transactions for regulatory compliance. Verifies accredited investor status before allowing private placement access.',
        did: 'did:t3:agent:9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
        permissions: JSON.stringify(['read:kyc', 'read:accredited', 'verify:compliance', 'flag:transaction']),
        status: 'active',
      },
    })

    const agent3 = await db.agent.create({
      data: {
        name: 'NFT Marketplace Curator',
        description: 'Curates and manages premium NFT collections. Requires identity verification for high-value listings above $5,000.',
        did: 'did:t3:agent:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
        permissions: JSON.stringify(['read:kyc', 'read:identity', 'manage:listings', 'verify:premium']),
        status: 'active',
      },
    })

    const agent4 = await db.agent.create({
      data: {
        name: 'DAO Governance Bot',
        description: 'Automated governance agent that votes on proposals. Requires verified delegate credentials for voting power assignment.',
        did: 'did:t3:agent:4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
        permissions: JSON.stringify(['read:delegate', 'execute:vote', 'read:proposal', 'verify:credential']),
        status: 'revoked',
      },
    })

    const agent5 = await db.agent.create({
      data: {
        name: 'Cross-Chain Bridge Operator',
        description: 'Facilitates asset transfers across blockchains. Verifies user identity for large cross-chain operations exceeding $50,000.',
        did: 'did:t3:agent:2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
        permissions: JSON.stringify(['read:kyc', 'execute:bridge', 'read:balance', 'verify:high_value']),
        status: 'active',
      },
    })

    // Create demo credentials
    const cred1 = await db.credential.create({
      data: {
        userId: 'user:alice_terminal3',
        type: 'KYC Verified',
        issuer: 'Terminal 3',
        status: 'active',
        issuedAt: new Date('2025-01-15'),
        expiresAt: new Date('2026-01-15'),
        data: JSON.stringify({
          fullName: 'Alice Chen',
          country: 'United States',
          verificationLevel: 'Level 3 - Full KYC',
          documentType: 'Passport',
          verifiedAt: '2025-01-15T10:30:00Z',
        }),
      },
    })

    const cred2 = await db.credential.create({
      data: {
        userId: 'user:alice_terminal3',
        type: 'Accredited Investor',
        issuer: 'Terminal 3',
        status: 'active',
        issuedAt: new Date('2025-02-20'),
        expiresAt: new Date('2026-02-20'),
        data: JSON.stringify({
          accreditationType: 'Net Worth',
          minimumNetWorth: '$1,000,000',
          verifiedBy: 'SEC Registered Advisor',
          annualIncomeRange: '$200,000+',
        }),
      },
    })

    const cred3 = await db.credential.create({
      data: {
        userId: 'user:bob_t3network',
        type: 'Professional License',
        issuer: 'Terminal 3',
        status: 'active',
        issuedAt: new Date('2025-03-10'),
        expiresAt: new Date('2025-12-31'),
        data: JSON.stringify({
          licenseType: 'Series 7 & 63',
          jurisdiction: 'FINRA',
          licenseNumber: 'FINRA-2025-44892',
          holderName: 'Bob Martinez',
        }),
      },
    })

    const cred4 = await db.credential.create({
      data: {
        userId: 'user:alice_terminal3',
        type: 'KYC Verified',
        issuer: 'Terminal 3',
        status: 'expired',
        issuedAt: new Date('2024-06-01'),
        expiresAt: new Date('2025-06-01'),
        data: JSON.stringify({
          fullName: 'Alice Chen',
          country: 'United States',
          verificationLevel: 'Level 2 - Basic KYC',
          documentType: 'Driver License',
          verifiedAt: '2024-06-01T14:20:00Z',
        }),
      },
    })

    const cred5 = await db.credential.create({
      data: {
        userId: 'user:carol_web3',
        type: 'DeFi Risk Assessment',
        issuer: 'Terminal 3',
        status: 'active',
        issuedAt: new Date('2025-04-05'),
        expiresAt: new Date('2026-04-05'),
        data: JSON.stringify({
          riskScore: 'Low',
          defiExperience: 'Advanced',
          totalProtocolsInteracted: 47,
          averageHoldPeriod: '6 months',
          walletAge: '3 years',
        }),
      },
    })

    // Create demo presentations
    const vp1 = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation', 'KYCPresentation'],
      verifiableCredential: {
        credentialSubject: { id: 'user:alice_terminal3', kycLevel: 'Level 3' },
        issuer: 'did:t3:issuer:terminal3',
        issuanceDate: '2025-01-15T10:30:00Z',
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: '2025-06-01T12:00:00Z',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:t3:alice#key-1',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mock-signature',
      },
    }

    const vp2 = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation', 'AccreditedPresentation'],
      verifiableCredential: {
        credentialSubject: { id: 'user:alice_terminal3', accreditedInvestor: true },
        issuer: 'did:t3:issuer:terminal3',
        issuanceDate: '2025-02-20T09:00:00Z',
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: '2025-06-01T14:30:00Z',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:t3:alice#key-1',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mock-signature-2',
      },
    }

    const vp3 = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation', 'LicensePresentation'],
      verifiableCredential: {
        credentialSubject: { id: 'user:bob_t3network', licenseType: 'Series 7' },
        issuer: 'did:t3:issuer:terminal3',
        issuanceDate: '2025-03-10T11:00:00Z',
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: '2025-06-01T16:00:00Z',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:t3:bob#key-1',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mock-signature-3',
      },
    }

    await db.presentation.create({
      data: {
        credentialId: cred1.id,
        verifier: 'DeFi Portfolio Manager',
        agentId: agent1.id,
        status: 'verified',
        proof: JSON.stringify(vp1),
        createdAt: new Date('2025-06-01T12:00:00'),
      },
    })

    await db.presentation.create({
      data: {
        credentialId: cred2.id,
        verifier: 'Compliance Sentinel',
        agentId: agent2.id,
        status: 'verified',
        proof: JSON.stringify(vp2),
        createdAt: new Date('2025-06-01T14:30:00'),
      },
    })

    await db.presentation.create({
      data: {
        credentialId: cred3.id,
        verifier: 'DeFi Portfolio Manager',
        agentId: agent1.id,
        status: 'pending',
        proof: JSON.stringify(vp3),
        createdAt: new Date('2025-06-01T16:00:00'),
      },
    })

    // Create demo access logs
    await db.accessLog.createMany({
      data: [
        {
          agentId: agent1.id,
          action: 'credential_requested',
          resource: 'KYC Verified',
          details: JSON.stringify({ credentialType: 'KYC Verified', userId: 'user:alice_terminal3', reason: 'Trade execution verification' }),
          createdAt: new Date('2025-06-01T11:55:00'),
        },
        {
          agentId: agent1.id,
          action: 'presentation_verified',
          resource: 'Verifiable Presentation',
          details: JSON.stringify({ presentationId: 'vp_001', status: 'verified', processingTime: '2.3s' }),
          createdAt: new Date('2025-06-01T12:00:00'),
        },
        {
          agentId: agent1.id,
          action: 'data_accessed',
          resource: 'KYC Level',
          details: JSON.stringify({ dataType: 'kyc_level', value: 'Level 3', disclosed: true }),
          createdAt: new Date('2025-06-01T12:00:05'),
        },
        {
          agentId: agent1.id,
          action: 'transaction_executed',
          resource: 'Trade #TX-78291',
          details: JSON.stringify({ amount: '$15,000', token: 'ETH', direction: 'buy', verified: true }),
          createdAt: new Date('2025-06-01T12:01:00'),
        },
        {
          agentId: agent2.id,
          action: 'credential_requested',
          resource: 'Accredited Investor',
          details: JSON.stringify({ credentialType: 'Accredited Investor', userId: 'user:alice_terminal3', reason: 'Private placement access' }),
          createdAt: new Date('2025-06-01T14:25:00'),
        },
        {
          agentId: agent2.id,
          action: 'presentation_verified',
          resource: 'Verifiable Presentation',
          details: JSON.stringify({ presentationId: 'vp_002', status: 'verified', processingTime: '1.8s' }),
          createdAt: new Date('2025-06-01T14:30:00'),
        },
        {
          agentId: agent2.id,
          action: 'verify:compliance',
          resource: 'SEC Regulation D',
          details: JSON.stringify({ regulation: 'Reg D Rule 506(c)', compliant: true, exemptions: ['accredited'] }),
          createdAt: new Date('2025-06-01T14:31:00'),
        },
        {
          agentId: agent3.id,
          action: 'credential_requested',
          resource: 'KYC Verified',
          details: JSON.stringify({ credentialType: 'KYC Verified', userId: 'user:alice_terminal3', reason: 'Premium listing verification' }),
          createdAt: new Date('2025-06-01T15:45:00'),
        },
        {
          agentId: agent4.id,
          action: 'credential_requested',
          resource: 'Delegate Credential',
          details: JSON.stringify({ credentialType: 'Delegate', reason: 'Governance voting', status: 'denied - agent revoked' }),
          createdAt: new Date('2025-06-01T10:00:00'),
        },
        {
          agentId: agent5.id,
          action: 'credential_requested',
          resource: 'KYC Verified',
          details: JSON.stringify({ credentialType: 'KYC Verified', userId: 'user:carol_web3', reason: 'Cross-chain bridge $75K' }),
          createdAt: new Date('2025-06-01T16:30:00'),
        },
        {
          agentId: agent1.id,
          action: 'credential_requested',
          resource: 'Professional License',
          details: JSON.stringify({ credentialType: 'Professional License', userId: 'user:bob_t3network', reason: 'Advisory trade verification' }),
          createdAt: new Date('2025-06-01T15:55:00'),
        },
        {
          agentId: agent2.id,
          action: 'flag:transaction',
          resource: 'TX-FLAG-0042',
          details: JSON.stringify({ amount: '$250,000', risk: 'medium', flags: ['large_volume', 'new_counterparty'] }),
          createdAt: new Date('2025-06-01T17:00:00'),
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      stats: {
        agents: 5,
        credentials: 5,
        presentations: 3,
        accessLogs: 12,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed demo data' },
      { status: 500 }
    )
  }
}
