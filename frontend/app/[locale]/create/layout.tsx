import { AppShell } from '@/components/layout';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

