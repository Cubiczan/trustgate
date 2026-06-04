'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, ShieldCheck, Fingerprint, KeyRound, Bot, FileCheck, Eye, ScrollText,
  Plus, Copy, Check, Loader2, ExternalLink, Clock, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, Activity, Lock, Unlock, Cpu, Zap, Globe, Database,
  RefreshCw, Trash2, Edit3, Search, Filter, Download, ArrowRight,
  IdCard, BadgeCheck, ScanFace, ServerCog, Network, Layers, ArrowUpRight,
  CircleDot, CheckCheck, Hourglass, Ban, UserCheck, X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────
interface Agent {
  id: string
  name: string
  description: string
  did: string
  permissions: string
  status: string
  createdAt: string
  updatedAt: string
  _count?: { accessLogs: number }
}

interface Credential {
  id: string
  userId: string
  type: string
  issuer: string
  status: string
  issuedAt: string
  expiresAt: string | null
  data: string
  _count?: { presentations: number }
}

interface Presentation {
  id: string
  credentialId: string
  verifier: string
  agentId: string
  status: string
  proof: string
  createdAt: string
  credential?: { type: string; issuer: string; userId: string }
}

interface AccessLog {
  id: string
  agentId: string
  action: string
  resource: string
  details: string
  createdAt: string
  agent?: { name: string; did: string }
}

interface DashboardStats {
  agents: number
  credentials: number
  presentations: number
  accessLogs: number
}

// ─── Main Component ────────────────────────────────────
export default function TrustGatePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({ agents: 0, credentials: 0, presentations: 0, accessLogs: 0 })
  const [seeded, setSeeded] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const fetchStats = useCallback(async () => {
    try {
      const [agentsRes, credsRes, presRes, logsRes] = await Promise.all([
        fetch('/api/agents'), fetch('/api/credentials'),
        fetch('/api/presentations'), fetch('/api/access-logs'),
      ])
      const [agentsData, credsData, presData, logsData] = await Promise.all([
        agentsRes.json(), credsRes.json(), presRes.json(), logsRes.json(),
      ])
      setStats({
        agents: agentsData.agents?.length || 0,
        credentials: credsData.credentials?.length || 0,
        presentations: presData.presentations?.length || 0,
        accessLogs: logsData.logs?.length || 0,
      })
    } catch {
      // ignore
    }
  }, [])

  const seedDemoData = async () => {
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' })
      if (res.ok) {
        setSeeded(true)
        toast.success('Demo data seeded successfully!')
        fetchStats()
      }
    } catch {
      toast.error('Failed to seed demo data')
    }
  }

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (stats.agents === 0 && !seeded) {
      seedDemoData()
    }
  }, [stats.agents, seeded])

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
                <Shield className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-foreground">TrustGate</h1>
                <p className="text-[10px] text-muted-foreground hidden sm:block -mt-0.5">Terminal 3 Network &middot; DoraHacks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {mounted && (theme === 'dark' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
              </Button>
              <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20">
                <ShieldCheck className="w-3 h-3 mr-1" />
                T3N
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-card/50 border border-border/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="dashboard" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-3 py-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="did" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-3 py-1.5">
                <Fingerprint className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DID Identity</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-3 py-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Agents</span>
              </TabsTrigger>
              <TabsTrigger value="credentials" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-3 py-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Credentials</span>
              </TabsTrigger>
              <TabsTrigger value="verification" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-3 py-1.5">
                <ScanFace className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verification</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-3 py-1.5">
                <ScrollText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Access Logs</span>
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => { seedDemoData(); fetchStats() }}
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Re-seed</span>
            </Button>
          </div>

          <TabsContent value="dashboard" className="tab-enter">
            <DashboardTab stats={stats} onNavigate={setActiveTab} onRefresh={fetchStats} />
          </TabsContent>
          <TabsContent value="did" className="tab-enter">
            <DIDTab />
          </TabsContent>
          <TabsContent value="agents" className="tab-enter">
            <AgentsTab onRefresh={fetchStats} onNavigate={setActiveTab} />
          </TabsContent>
          <TabsContent value="credentials" className="tab-enter">
            <CredentialsTab onRefresh={fetchStats} />
          </TabsContent>
          <TabsContent value="verification" className="tab-enter">
            <VerificationTab onRefresh={fetchStats} />
          </TabsContent>
          <TabsContent value="logs" className="tab-enter">
            <LogsTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-primary/60" />
              TrustGate — Verifiable Identity for AI Agents
            </p>
            <p>Built for DoraHacks ADK Challenge &middot; Terminal 3 Network (T3N)</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────
function DashboardTab({ stats, onNavigate, onRefresh }: {
  stats: DashboardStats; onNavigate: (tab: string) => void; onRefresh: () => void
}) {
  const [recentLogs, setRecentLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch('/api/access-logs')
        const data = await res.json()
        setRecentLogs(data.logs?.slice(0, 6) || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const statCards = [
    { label: 'Total Agents', value: stats.agents, icon: Bot, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: 'Active Credentials', value: stats.credentials, icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Presentations', value: stats.presentations, icon: IdCard, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'Access Logs', value: stats.accessLogs, icon: ScrollText, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ]

  const quickActions = [
    { label: 'Register DID', tab: 'did', icon: Fingerprint },
    { label: 'Create Agent', tab: 'agents', icon: Bot },
    { label: 'Store Credential', tab: 'credentials', icon: FileCheck },
    { label: 'Run Verification', tab: 'verification', icon: ScanFace },
  ]

  const actionIcons: Record<string, typeof Activity> = {
    credential_requested: Search,
    presentation_verified: CheckCircle2,
    data_accessed: Eye,
    transaction_executed: ArrowUpRight,
    'verify:compliance': ShieldCheck,
    'flag:transaction': AlertTriangle,
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-primary/15 text-primary border-primary/25 text-[10px]">
                  <Zap className="w-2.5 h-2.5 mr-1" />
                  HACKATHON SUBMISSION
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-card/50 text-muted-foreground border-border/50">
                  DoraHacks ADK Challenge
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                <span className="text-foreground">Verifiable Identity</span>{' '}
                <span className="text-primary">for AI Agents</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                TrustGate enables AI agents to verify user identity via Terminal 3 Network before performing
                sensitive actions — without ever accessing raw private data. Powered by decentralized DIDs,
                verifiable credentials, and TEE-processed presentations.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.tab}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs bg-card/50 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      onClick={() => onNavigate(action.tab)}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {action.label}
                    </Button>
                  )
                })}
              </div>
            </div>
            {/* Shield Illustration */}
            <div className="hidden lg:flex items-center justify-center w-40 h-40 float">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-14 h-14 text-primary" strokeWidth={1.2} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -left-3 w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="card-glow border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => onNavigate('logs')}>
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentLogs.map((log) => {
                  const ActionIcon = actionIcons[log.action] || Activity
                  return (
                    <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <ActionIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{log.agent?.name || 'Unknown Agent'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {log.action.replace(/_/g, ' ')} &middot; {log.resource}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(log.createdAt)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              T3N Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: '1', title: 'User DID Registration', desc: 'Decentralized identity created on Terminal 3 Network', icon: Fingerprint, status: 'complete' },
                { step: '2', title: 'Verifiable Credential Issuance', desc: 'KYC, accreditation, and license VCs stored on-chain', icon: FileCheck, status: 'complete' },
                { step: '3', title: 'Agent Identity Request', desc: 'AI agent requests selective credential disclosure', icon: Bot, status: 'complete' },
                { step: '4', title: 'TEE Presentation Processing', desc: 'Zero-knowledge proof generated in trusted enclave', icon: Cpu, status: 'active' },
                { step: '5', title: 'Verifier Confirmation', desc: 'Agent confirms identity without raw data access', icon: ShieldCheck, status: 'pending' },
              ].map((item) => {
                const StepIcon = item.icon
                return (
                  <div key={item.step} className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/10 border border-border/20">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      item.status === 'complete' ? 'bg-emerald-500/10 border-emerald-500/20' :
                      item.status === 'active' ? 'bg-primary/15 border-primary/25 ring-2 ring-primary/10' :
                      'bg-secondary/20 border-border/30'
                    }`}>
                      {item.status === 'complete' ? (
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                      ) : item.status === 'active' ? (
                        <StepIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">{item.step}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${
                        item.status === 'complete' ? 'text-foreground' :
                        item.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                      }`}>{item.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    {item.status === 'active' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 health-pulse" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── DID Tab ──────────────────────────────────────────
function DIDTab() {
  const [did, setDid] = useState<string | null>(null)
  const [didDoc, setDidDoc] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchDID = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/t3/did')
      const data = await res.json()
      if (data.success && data.data) {
        setDidDoc(data.data)
        setDid(data.data.did || data.data.id || JSON.stringify(data.data, null, 2))
      } else {
        setDidDoc(null)
        setDid(null)
      }
    } catch {
      setDid(null)
    }
    setLoading(false)
  }

  const registerDID = async () => {
    setRegistering(true)
    try {
      const res = await fetch('/api/t3/did/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (data.success && data.data) {
        toast.success('DID registered successfully!')
        fetchDID()
      } else {
        toast.info('DID registration initiated. The DID will be available shortly.')
        fetchDID()
      }
    } catch {
      toast.error('Failed to register DID')
    }
    setRegistering(false)
  }

  const copyDID = () => {
    if (did) {
      navigator.clipboard.writeText(did)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => { fetchDID() }, [fetchDID])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Fingerprint className="w-6 h-6 text-primary" />
          DID Identity
        </h2>
        <p className="text-sm text-muted-foreground">Manage your Decentralized Identifier on the Terminal 3 Network.</p>
      </div>

      {/* Current DID Display */}
      <Card className="card-glow border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Your Decentralized Identifier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : did ? (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/20 border border-border/30">
                <code className="flex-1 text-xs font-mono text-primary break-all">{did}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyDID}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              {didDoc && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">DID Document</Label>
                  <pre className="p-3 rounded-lg bg-secondary/10 border border-border/20 text-[10px] font-mono text-muted-foreground overflow-auto max-h-48">
                    {JSON.stringify(didDoc, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Fingerprint className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No DID registered yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Register a DID to get started with verifiable identity</p>
            </div>
          )}
          <Button
            onClick={registerDID}
            disabled={registering}
            className="w-full gap-2 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          >
            {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Register New DID
          </Button>
        </CardContent>
      </Card>

      {/* DID Info Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'DID Method', value: 'did:t3', desc: 'Terminal 3 Network', icon: Globe },
          { label: 'Controller', value: 'Self-Sovereign', desc: 'User-controlled identity', icon: Lock },
          { label: 'Service', value: 'T3 API', desc: 'api.terminal3.io', icon: ServerCog },
        ].map((info) => {
          const Icon = info.icon
          return (
            <Card key={info.label} className="border-border/50 bg-card/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{info.label}</span>
                </div>
                <p className="text-sm font-semibold">{info.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{info.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agents Tab ───────────────────────────────────────
function AgentsTab({ onRefresh, onNavigate }: { onRefresh: () => void; onNavigate: (tab: string) => void }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', did: '', permissions: '["read:kyc"]' })

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data.agents || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    try {
      const permissions = JSON.parse(formData.permissions)
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          did: formData.did,
          permissions,
        }),
      })
      if (res.ok) {
        toast.success('Agent created successfully!')
        setDialogOpen(false)
        setFormData({ name: '', description: '', did: '', permissions: '["read:kyc"]' })
        fetchAgents()
        onRefresh()
      }
    } catch {
      toast.error('Failed to create agent')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' })
      toast.success('Agent deleted')
      fetchAgents()
      onRefresh()
    } catch {
      toast.error('Failed to delete agent')
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await fetch(`/api/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' }),
      })
      toast.success('Agent revoked')
      fetchAgents()
    } catch {
      toast.error('Failed to revoke agent')
    }
  }

  const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; class: string }> = {
    active: { label: 'Active', icon: CheckCircle2, class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
    revoked: { label: 'Revoked', icon: Ban, class: 'bg-red-500/15 text-red-400 border-red-500/25' },
    suspended: { label: 'Suspended', icon: XCircle, class: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Agents
          </h2>
          <p className="text-sm text-muted-foreground">{agents.length} registered agent{agents.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 text-xs bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
              <Plus className="w-3.5 h-3.5" /> Register Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-base">Register New Agent</DialogTitle>
              <DialogDescription className="text-xs">Add a new AI agent to TrustGate for identity verification.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Agent Name *</Label>
                <Input placeholder="e.g., DeFi Portfolio Manager" className="bg-secondary/30 border-border/50 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea placeholder="Agent capabilities and purpose..." className="bg-secondary/30 border-border/50 text-sm min-h-[60px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">DID (optional)</Label>
                <Input placeholder="did:t3:agent:..." className="bg-secondary/30 border-border/50 text-sm" value={formData.did} onChange={(e) => setFormData({ ...formData, did: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Permissions (JSON array)</Label>
                <Input placeholder='["read:kyc", "execute:trade"]' className="bg-secondary/30 border-border/50 text-sm font-mono" value={formData.permissions} onChange={(e) => setFormData({ ...formData, permissions: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30" onClick={handleCreate} disabled={!formData.name.trim()}>Create Agent</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50"><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No agents registered</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const sc = statusConfig[agent.status] || statusConfig.active
            const StatusIcon = sc.icon
            const perms: string[] = JSON.parse(agent.permissions || '[]')
            return (
              <Card key={agent.id} className="border-border/50 bg-card/80 card-glow group">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Bot className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{agent.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground">{agent._count?.accessLogs || 0} log entries</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${sc.class}`}>
                      <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                      {sc.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                  {agent.did && (
                    <div className="flex items-center gap-1.5 p-2 rounded-md bg-secondary/15 border border-border/20">
                      <Fingerprint className="w-3 h-3 text-muted-foreground shrink-0" />
                      <code className="text-[10px] font-mono text-muted-foreground truncate">{agent.did}</code>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {perms.slice(0, 3).map((p) => (
                      <Badge key={p} variant="outline" className="text-[9px] bg-secondary/15 border-border/30 text-muted-foreground">
                        {p}
                      </Badge>
                    ))}
                    {perms.length > 3 && (
                      <Badge variant="outline" className="text-[9px] bg-secondary/15 border-border/30 text-muted-foreground">+{perms.length - 3}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1 bg-secondary/10" onClick={() => onNavigate('logs')}>
                      <Eye className="w-3 h-3" /> Logs
                    </Button>
                    {agent.status === 'active' ? (
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 text-amber-400 border-amber-500/25 hover:bg-amber-500/10" onClick={() => handleRevoke(agent.id)}>
                        <Ban className="w-3 h-3" /> Revoke
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 text-red-400 border-red-500/25 hover:bg-red-500/10" onClick={() => handleDelete(agent.id)}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Credentials Tab ──────────────────────────────────
function CredentialsTab({ onRefresh }: { onRefresh: () => void }) {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vpDialogOpen, setVpDialogOpen] = useState(false)
  const [vpResult, setVpResult] = useState<string | null>(null)
  const [vpLoading, setVpLoading] = useState(false)
  const [formData, setFormData] = useState({ userId: '', type: 'KYC Verified', issuer: 'Terminal 3', data: '{}' })

  const fetchCredentials = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/credentials')
      const data = await res.json()
      setCredentials(data.credentials || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCredentials() }, [fetchCredentials])

  const handleCreate = async () => {
    if (!formData.userId.trim() || !formData.type.trim()) return
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          type: formData.type,
          issuer: formData.issuer,
          data: JSON.parse(formData.data || '{}'),
        }),
      })
      if (res.ok) {
        toast.success('Credential stored!')
        setDialogOpen(false)
        setFormData({ userId: '', type: 'KYC Verified', issuer: 'Terminal 3', data: '{}' })
        fetchCredentials()
        onRefresh()
      }
    } catch {
      toast.error('Failed to store credential')
    }
  }

  const handleGenerateVP = async (cred: Credential) => {
    setVpLoading(true)
    setVpDialogOpen(true)
    setVpResult(null)
    try {
      // Try real T3 API
      const res = await fetch('/api/t3/credentials/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential_id: cred.id, type: cred.type }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setVpResult(JSON.stringify(data.data, null, 2))
        // Also save to local DB
        await fetch('/api/presentations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentialId: cred.id,
            verifier: 'TrustGate Portal',
            proof: data.data,
          }),
        })
        onRefresh()
      } else {
        // Generate a demo VP
        const demoVP = {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: {
            credentialSubject: { id: cred.userId, type: cred.type },
            issuer: `did:t3:issuer:${cred.issuer.toLowerCase().replace(/\s/g, '')}`,
            issuanceDate: new Date().toISOString(),
          },
          proof: {
            type: 'Ed25519Signature2020',
            created: new Date().toISOString(),
            proofPurpose: 'assertionMethod',
            verificationMethod: `did:t3:${cred.userId}#key-1`,
            jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..' + Math.random().toString(36).substring(2),
          },
        }
        setVpResult(JSON.stringify(demoVP, null, 2))
        await fetch('/api/presentations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentialId: cred.id,
            verifier: 'TrustGate Portal',
            proof: demoVP,
          }),
        })
        onRefresh()
      }
    } catch {
      setVpResult('Error generating presentation. This is expected if T3 API credentials are not configured.')
    }
    setVpLoading(false)
  }

  const credIcons: Record<string, typeof BadgeCheck> = {
    'KYC Verified': UserCheck,
    'Accredited Investor': BadgeCheck,
    'Professional License': IdCard,
    'DeFi Risk Assessment': Shield,
  }

  const statusConfig: Record<string, { class: string }> = {
    active: { class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
    expired: { class: 'bg-red-500/15 text-red-400 border-red-500/25' },
    revoked: { class: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-primary" />
            Verifiable Credentials
          </h2>
          <p className="text-sm text-muted-foreground">{credentials.length} credential{credentials.length !== 1 ? 's' : ''} stored</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 text-xs bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
              <Plus className="w-3.5 h-3.5" /> Store Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-base">Store New Credential</DialogTitle>
              <DialogDescription className="text-xs">Issue a new verifiable credential on Terminal 3.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">User ID *</Label>
                <Input placeholder="user:alice_terminal3" className="bg-secondary/30 border-border/50 text-sm" value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Credential Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-secondary/30 border-border/50 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KYC Verified">KYC Verified</SelectItem>
                    <SelectItem value="Accredited Investor">Accredited Investor</SelectItem>
                    <SelectItem value="Professional License">Professional License</SelectItem>
                    <SelectItem value="DeFi Risk Assessment">DeFi Risk Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Issuer</Label>
                <Input placeholder="Terminal 3" className="bg-secondary/30 border-border/50 text-sm" value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Credential Data (JSON)</Label>
                <Textarea placeholder='{"key": "value"}' className="bg-secondary/30 border-border/50 text-sm font-mono min-h-[60px]" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30" onClick={handleCreate} disabled={!formData.userId.trim()}>Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* VP Dialog */}
      <Dialog open={vpDialogOpen} onOpenChange={setVpDialogOpen}>
        <DialogContent className="bg-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Verifiable Presentation</DialogTitle>
            <DialogDescription className="text-xs">Zero-knowledge proof generated via T3N TEE.</DialogDescription>
          </DialogHeader>
          {vpLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : vpResult ? (
            <pre className="p-3 rounded-lg bg-secondary/15 border border-border/20 text-[10px] font-mono text-foreground overflow-auto max-h-64">
              {vpResult}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No presentation generated</p>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50"><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {credentials.map((cred) => {
            const Icon = credIcons[cred.type] || FileCheck
            const sc = statusConfig[cred.status] || statusConfig.active
            const credData: Record<string, string> = JSON.parse(cred.data || '{}')
            return (
              <Card key={cred.id} className="border-border/50 bg-card/80 card-glow group">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{cred.type}</p>
                        <p className="text-[10px] text-muted-foreground">{cred.issuer}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${sc.class}`}>
                      {cred.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(cred.issuedAt)}</span>
                    {cred.expiresAt && <span>→ {formatDate(cred.expiresAt)}</span>}
                  </div>
                  {Object.keys(credData).length > 0 && (
                    <div className="p-2 rounded-md bg-secondary/10 border border-border/15 space-y-0.5">
                      {Object.entries(credData).slice(0, 3).map(([k, v]) => (
                        <p key={k} className="text-[10px] text-muted-foreground">
                          <span className="font-medium text-foreground/70">{k}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}
                        </p>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-[10px] gap-1 bg-secondary/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                    onClick={() => handleGenerateVP(cred)}
                    disabled={cred.status !== 'active'}
                  >
                    <IdCard className="w-3 h-3" /> Generate Presentation
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Verification Flow Tab ─────────────────────────────
function VerificationTab({ onRefresh }: { onRefresh: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStates, setStepStates] = useState<(string | null)[]>([null, null, null, null])
  const [simulating, setSimulating] = useState(false)
  const [vpJson, setVpJson] = useState<string | null>(null)

  const steps = [
    {
      title: 'AI Agent Requests Verification',
      desc: 'The DeFi Portfolio Manager agent initiates a KYC verification request before executing a $15,000 trade.',
      icon: Bot,
      color: 'text-primary',
      bg: 'bg-primary/15',
      border: 'border-primary/25',
    },
    {
      title: 'T3N Processes in TEE',
      desc: 'Terminal 3 Network processes the credential request inside a Trusted Execution Environment. Zero-knowledge proofs are generated without exposing raw data.',
      icon: Cpu,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/25',
    },
    {
      title: 'Verifiable Presentation Generated',
      desc: 'A W3C-compliant Verifiable Presentation (VP) is created, containing only the necessary claims with cryptographic proof.',
      icon: FileCheck,
      color: 'text-sky-400',
      bg: 'bg-sky-500/15',
      border: 'border-sky-500/25',
    },
    {
      title: 'Verifier Confirms Identity',
      desc: 'The AI agent confirms the user\'s identity is verified. The sensitive trade is now authorized to proceed.',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/25',
    },
  ]

  const simulateStep = async (stepIndex: number) => {
    setSimulating(true)
    setCurrentStep(stepIndex)

    // Mark current step as processing
    setStepStates((prev) => {
      const next = [...prev]
      next[stepIndex] = 'processing'
      return next
    })

    // Simulate async processing
    await new Promise((r) => setTimeout(r, 1500))

    // Mark step as complete
    setStepStates((prev) => {
      const next = [...prev]
      next[stepIndex] = 'complete'
      return next
    })
    setSimulating(false)

    // Create real records for certain steps
    if (stepIndex === 0) {
      try {
        await fetch('/api/access-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: 'placeholder',
            action: 'credential_requested',
            resource: 'KYC Verified',
          }),
        })
      } catch { /* ignore */ }
    }

    if (stepIndex === 2) {
      const demoVP = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation', 'KYCPresentation'],
        verifiableCredential: {
          credentialSubject: {
            id: 'user:alice_terminal3',
            kycLevel: 'Level 3 - Full KYC',
            country: 'United States',
          },
          issuer: 'did:t3:issuer:terminal3',
          issuanceDate: '2025-01-15T10:30:00Z',
          credentialSchema: {
            id: 'did:t3:schema:kyc-level3',
            type: 'JsonSchema',
          },
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:t3:alice_terminal3#key-1',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..a' + Math.random().toString(36).substring(2, 20),
        },
        holder: 'did:t3:alice_terminal3',
      }
      setVpJson(JSON.stringify(demoVP, null, 2))

      try {
        await fetch('/api/presentations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentialId: 'demo',
            verifier: 'Verification Demo',
            agentId: 'demo',
            proof: demoVP,
          }),
        })
        onRefresh()
      } catch { /* ignore */ }
    }

    if (stepIndex === 3) {
      onRefresh()
    }
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setStepStates([null, null, null, null])
    setVpJson(null)
  }

  const allComplete = stepStates.every((s) => s === 'complete')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-primary" />
            Verification Flow Demo
          </h2>
          <p className="text-sm text-muted-foreground">Interactive walkthrough of the TrustGate identity verification process.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={resetDemo}>
          <RefreshCw className="w-3 h-3" /> Reset
        </Button>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const state = stepStates[idx]
          const isCurrent = idx === currentStep
          return (
            <div key={idx}>
              <Card className={`border-border/50 bg-card/80 transition-all duration-500 ${
                state === 'complete' ? 'ring-1 ring-emerald-500/20' :
                state === 'processing' ? 'ring-2 ring-primary/30 shadow-lg shadow-primary/5' :
                isCurrent ? 'border-primary/20' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Step Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                      state === 'complete' ? `${step.bg} ${step.border}` :
                      state === 'processing' ? `${step.bg} ${step.border} verify-pulse` :
                      'bg-secondary/20 border-border/30'
                    }`}>
                      {state === 'complete' ? (
                        <CheckCheck className={`w-5 h-5 ${step.color}`} />
                      ) : state === 'processing' ? (
                        <Loader2 className={`w-5 h-5 animate-spin ${step.color}`} />
                      ) : (
                        <Icon className={`w-5 h-5 ${state === null && isCurrent ? step.color : 'text-muted-foreground/40'}`} />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">STEP {idx + 1}</span>
                        {state === 'complete' && (
                          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Complete
                          </Badge>
                        )}
                        {state === 'processing' && (
                          <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">
                            <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" /> Processing
                          </Badge>
                        )}
                      </div>
                      <h3 className={`text-sm font-semibold ${state === 'complete' ? step.color : state === null ? 'text-foreground' : step.color}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>

                      {/* Action Button */}
                      {state === null && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 h-7 text-[10px] gap-1 bg-secondary/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                          disabled={simulating || (idx > 0 && stepStates[idx - 1] !== 'complete')}
                          onClick={() => simulateStep(idx)}
                        >
                          {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          Simulate Step
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center mt-3">
                      <div className={`w-0.5 h-4 rounded-full ${
                        state === 'complete' ? 'bg-emerald-500/40' : 'bg-border/30'
                      }`} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* VP JSON Display after step 3 */}
              {idx === 2 && vpJson && state === 'complete' && (
                <div className="mt-3 ml-16">
                  <Card className="border-sky-500/20 bg-sky-500/5">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-sky-400">
                        <FileCheck className="w-3.5 h-3.5" /> Generated Verifiable Presentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <pre className="p-2 rounded-md bg-background/50 border border-border/20 text-[9px] font-mono text-foreground/80 overflow-auto max-h-40">
                        {vpJson}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Success Banner */}
      {allComplete && (
        <Card className="border-emerald-500/25 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400">Verification Complete!</p>
              <p className="text-xs text-muted-foreground">The AI agent has verified the user's identity without accessing raw private data. The trade is authorized.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Logs Tab ──────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [agents, setAgents] = useState<Agent[]>([])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterAgent !== 'all') params.append('agentId', filterAgent)
      if (filterAction !== 'all') params.append('action', filterAction)
      const res = await fetch(`/api/access-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterAgent, filterAction])

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data.agents || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])
  useEffect(() => { fetchLogs() }, [fetchLogs])

  const actionColors: Record<string, string> = {
    credential_requested: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    presentation_verified: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    data_accessed: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
    transaction_executed: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    'verify:compliance': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    'flag:transaction': 'bg-red-500/15 text-red-400 border-red-500/25',
  }

  const uniqueActions = [...new Set(logs.map((l) => l.action))]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-primary" />
          Access Logs
        </h2>
        <p className="text-sm text-muted-foreground">{logs.length} log entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-card/50 border-border/50">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-card/50 border-border/50">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ScrollText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-[10px] font-medium text-muted-foreground h-8 px-3">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-medium text-muted-foreground h-8 px-3">Agent</TableHead>
                    <TableHead className="text-[10px] font-medium text-muted-foreground h-8 px-3">Action</TableHead>
                    <TableHead className="text-[10px] font-medium text-muted-foreground h-8 px-3">Resource</TableHead>
                    <TableHead className="text-[10px] font-medium text-muted-foreground h-8 px-3 hidden md:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const details: Record<string, string> = JSON.parse(log.details || '{}')
                    return (
                      <TableRow key={log.id} className="border-border/20 hover:bg-secondary/10">
                        <TableCell className="px-3 py-2.5 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <p className="text-xs font-medium">{log.agent?.name || 'Unknown'}</p>
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <Badge variant="outline" className={`text-[9px] whitespace-nowrap ${actionColors[log.action] || 'bg-secondary/15 border-border/30 text-muted-foreground'}`}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-xs text-muted-foreground">{log.resource}</TableCell>
                        <TableCell className="px-3 py-2.5 text-[10px] text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                          {details.reason || details.status || details.dataType || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────
function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
