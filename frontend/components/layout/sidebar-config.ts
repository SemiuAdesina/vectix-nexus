import {
  LayoutGrid,
  Bot,
  Plus,
  Store,
  BarChart3,
  TrendingUp,
  Wallet,
  Users,
  Shield,
  Key,
  Link2,
  FileText,
  Vote,
  AlertTriangle,
  Globe,
  FileCode,
} from 'lucide-react';

export const NAV_SECTIONS = [
  {
    title: 'COMMAND CENTER',
    items: [
      { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard', badge: null },
      { icon: Bot, label: 'My Agents', href: '/dashboard/agents', badge: null },
      { icon: Plus, label: 'Deploy Agent', href: '/create', badge: 'NEW' },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { icon: Store, label: 'Marketplace', href: '/dashboard/marketplace', badge: null },
      { icon: BarChart3, label: 'Analysis', href: '/dashboard/analysis', badge: null },
      { icon: TrendingUp, label: 'Trending', href: '/dashboard/trending', badge: 'LIVE' },
    ]
  },
  {
    title: 'TREASURY',
    items: [
      { icon: Wallet, label: 'Billing', href: '/dashboard/billing', badge: null },
      { icon: Users, label: 'Affiliates', href: '/dashboard/affiliates', badge: null },
    ]
  },
  {
    title: 'CONFIGURATION',
    items: [
      { icon: Shield, label: 'Security', href: '/advanced', badge: null },
      { icon: Link2, label: 'On-Chain', href: '/dashboard/onchain', badge: 'NEW' },
      { icon: FileText, label: 'Audit Dashboard', href: '/dashboard/audit', badge: null },
      { icon: Vote, label: 'Governance', href: '/dashboard/governance', badge: null },
      { icon: AlertTriangle, label: 'Threat Intel', href: '/dashboard/threats', badge: null },
      { icon: Globe, label: 'Public API', href: '/dashboard/public-api', badge: null },
      { icon: Key, label: 'API Keys', href: '/dashboard/api-keys', badge: null },
      { icon: FileCode, label: 'Documentation', href: '/docs/api', badge: null },
      { icon: Shield, label: 'Bug Bounty', href: '/dashboard/bug-bounty', badge: null },
    ]
  },
];
