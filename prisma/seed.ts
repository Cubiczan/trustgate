import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: ['error', 'warn'],
});

function hoursAgo(n: number) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d;
}

async function main() {
  // Clean existing data
  await db.accessLog.deleteMany();
  await db.presentation.deleteMany();
  await db.credential.deleteMany();
  await db.agent.deleteMany();

  // =====================================================
  // AI Agents
  // =====================================================
  const agents = await Promise.all([
    db.agent.create({
      data: {
        name: "TradeBot Alpha",
        description: "High-frequency trading agent for decentralized exchanges with MEV protection and multi-chain arbitrage capabilities.",
        did: "did:t3:agent_7a3f9c2e1b4d",
        permissions: JSON.stringify(["trade:execute", "wallet:read", "credential:request", "market:data"]),
        status: "active",
      },
    }),
    db.agent.create({
      data: {
        name: "DataSentinel",
        description: "Real-time data pipeline monitor that validates data integrity across multi-chain oracle sources and alerts on anomalies.",
        did: "did:t3:agent_8e4d0a3f2c5e",
        permissions: JSON.stringify(["data:read", "credential:verify", "alert:create", "audit:log"]),
        status: "active",
      },
    }),
    db.agent.create({
      data: {
        name: "ComplianceGuard",
        description: "Regulatory compliance agent that monitors transactions for AML/KYC violations and generates audit reports.",
        did: "did:t3:agent_9f5e1b4a3d6f",
        permissions: JSON.stringify(["transaction:monitor", "credential:verify", "report:generate", "audit:log"]),
        status: "active",
      },
    }),
    db.agent.create({
      data: {
        name: "LiquidityProvider",
        description: "Automated market maker agent managing liquidity pools across DEXs with dynamic fee optimization.",
        did: "did:t3:agent_0a6f2c5b4e7g",
        permissions: JSON.stringify(["liquidity:manage", "trade:execute", "wallet:read", "pool:create"]),
        status: "active",
      },
    }),
    db.agent.create({
      data: {
        name: "ResearchOracle",
        description: "AI research agent that aggregates on-chain analytics, market sentiment, and protocol metrics for investment thesis generation.",
        did: "did:t3:agent_1b7g3d6c5f8h",
        permissions: JSON.stringify(["data:read", "credential:request", "report:generate", "market:analyze"]),
        status: "suspended",
      },
    }),
  ]);

  // =====================================================
  // Verifiable Credentials
  // =====================================================
  const credentials = await Promise.all([
    db.credential.create({
      data: {
        userId: "user_t3_001",
        type: "KYC",
        issuer: "Terminal 3 Network",
        status: "active",
        issuedAt: daysAgo(90),
        expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // 275 days from now
        data: JSON.stringify({ level: "enhanced", jurisdiction: "US", verifiedBy: "Onfido", documentType: "passport" }),
      },
    }),
    db.credential.create({
      data: {
        userId: "user_t3_001",
        type: "accredited-investor",
        issuer: "Terminal 3 Network",
        status: "active",
        issuedAt: daysAgo(60),
        expiresAt: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ netWorthRange: "$1M-$5M", verifiedBy: "Coinbase Verify", accreditationDate: "2025-04-05" }),
      },
    }),
    db.credential.create({
      data: {
        userId: "user_t3_001",
        type: "professional-license",
        issuer: "Terminal 3 Network",
        status: "active",
        issuedAt: daysAgo(30),
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ licenseType: "Series 7", jurisdiction: "FINRA", licenseNumber: "TR-2025-8842" }),
      },
    }),
    db.credential.create({
      data: {
        userId: "user_t3_002",
        type: "KYC",
        issuer: "Terminal 3 Network",
        status: "active",
        issuedAt: daysAgo(45),
        expiresAt: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ level: "standard", jurisdiction: "EU", verifiedBy: "Jumio", documentType: "national_id" }),
      },
    }),
    db.credential.create({
      data: {
        userId: "user_t3_002",
        type: "accredited-investor",
        issuer: "Terminal 3 Network",
        status: "expired",
        issuedAt: daysAgo(400),
        expiresAt: daysAgo(35),
        data: JSON.stringify({ netWorthRange: "$500K-$1M", verifiedBy: "SelfAttest", accreditationDate: "2024-05-01" }),
      },
    }),
  ]);

  // =====================================================
  // Verifiable Presentations
  // =====================================================
  await Promise.all([
    db.presentation.create({
      data: {
        credentialId: credentials[0].id,
        verifier: "Uniswap V3 Router",
        agentId: agents[0].id,
        status: "verified",
        proof: JSON.stringify({ vpHash: "0xab12cd34...", verificationTimestamp: hoursAgo(2).toISOString(), schema: "KYC-Enhanced-v2" }),
        createdAt: hoursAgo(2),
      },
    }),
    db.presentation.create({
      data: {
        credentialId: credentials[1].id,
        verifier: "Aave Protocol",
        agentId: agents[3].id,
        status: "verified",
        proof: JSON.stringify({ vpHash: "0xef56gh78...", verificationTimestamp: hoursAgo(5).toISOString(), schema: "AccreditedInvestor-v1" }),
        createdAt: hoursAgo(5),
      },
    }),
    db.presentation.create({
      data: {
        credentialId: credentials[2].id,
        verifier: "Compound Finance",
        agentId: agents[2].id,
        status: "pending",
        proof: JSON.stringify({ vpHash: "0xij90kl12...", verificationTimestamp: null, schema: "ProfessionalLicense-v1" }),
        createdAt: hoursAgo(1),
      },
    }),
  ]);

  // =====================================================
  // Access Logs
  // =====================================================
  const actions = [
    "credential_requested", "data_accessed", "transaction_executed",
    "credential_verified", "presentation_generated", "did_resolved",
    "policy_checked", "wallet_connected", "sub_client_created",
    "audit_report_generated",
  ];
  const resources = [
    "/v1/vc/credentials", "/v1/user/wallet_addresses", "/v1/did",
    "/v1/transaction/sign", "/v1/vc/presentation", "/v1/sub_client",
    "/v1/user/social_data", "/v1/notification/webhook",
  ];

  const accessLogs = [];
  for (let i = 0; i < 12; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    accessLogs.push({
      agentId: agent.id,
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      details: JSON.stringify({
        ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: "trustgate-agent-sdk/1.2.0",
        requestId: `req_${Date.now() - Math.floor(Math.random() * 86400000)}`,
      }),
      createdAt: hoursAgo(Math.floor(Math.random() * 72)),
    });
  }

  await db.accessLog.createMany({ data: accessLogs });

  console.log("TrustGate database seeded successfully:");
  console.log(`  - ${agents.length} AI agents`);
  console.log(`  - ${credentials.length} verifiable credentials`);
  console.log(`  - 3 verifiable presentations`);
  console.log(`  - ${accessLogs.length} access log entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
