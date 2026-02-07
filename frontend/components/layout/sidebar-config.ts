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
    titleKey: 'sectionCommandCenter' as const,
    items: [
      { icon: LayoutGrid, labelKey: 'dashboard', href: '/dashboard', badge: null },
      { icon: Bot, labelKey: 'myAgents', href: '/dashboard/agents', badge: null },
      { icon: Plus, labelKey: 'deployAgent', href: '/create', badge: 'NEW' },
    ],
  },
  {
    titleKey: 'sectionIntelligence' as const,
    items: [
      { icon: Store, labelKey: 'marketplace', href: '/dashboard/marketplace', badge: null },
      { icon: BarChart3, labelKey: 'analysis', href: '/dashboard/analysis', badge: null },
      { icon: TrendingUp, labelKey: 'trending', href: '/dashboard/trending', badge: 'LIVE' },
    ],
  },
  {
    titleKey: 'sectionTreasury' as const,
    items: [
      { icon: Wallet, labelKey: 'billing', href: '/dashboard/billing', badge: null },
      { icon: Users, labelKey: 'affiliates', href: '/dashboard/affiliates', badge: null },
    ],
  },
  {
    titleKey: 'sectionConfiguration' as const,
    items: [
      { icon: Shield, labelKey: 'security', href: '/advanced', badge: null },
      { icon: Link2, labelKey: 'onChain', href: '/dashboard/onchain', badge: 'NEW' },
      { icon: FileText, labelKey: 'auditDashboard', href: '/dashboard/audit', badge: null },
      { icon: Vote, labelKey: 'governance', href: '/dashboard/governance', badge: null },
      { icon: AlertTriangle, labelKey: 'threatIntel', href: '/dashboard/threats', badge: null },
      { icon: Globe, labelKey: 'publicApi', href: '/dashboard/public-api', badge: null },
      { icon: Key, labelKey: 'apiKeys', href: '/dashboard/api-keys', badge: null },
      { icon: FileCode, labelKey: 'documentation', href: '/docs/api', badge: null },
      { icon: Shield, labelKey: 'bugBounty', href: '/dashboard/bug-bounty', badge: null },
    ],
  },
];
