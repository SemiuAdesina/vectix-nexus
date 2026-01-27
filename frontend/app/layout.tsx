import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: "VectixLogic | AI Agent Factory",
  description: "Deploy profitable AI agents on Solana in minutes",
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#2dd4bf',
    colorBackground: '#0d1117',
    colorInputBackground: '#161b22',
    colorInputText: '#e6edf3',
    colorText: '#e6edf3',
    colorTextSecondary: '#8b949e',
    colorDanger: '#f85149',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    rootBox: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalContent: { margin: 'auto' },
    card: { backgroundColor: '#0d1117', border: '1px solid #30363d', boxShadow: '0 16px 32px rgba(0,0,0,0.5)' },
    headerTitle: { color: '#e6edf3' },
    headerSubtitle: { color: '#8b949e' },
    socialButtonsBlockButton: { backgroundColor: '#161b22', border: '1px solid #30363d', color: '#e6edf3' },
    formFieldLabel: { color: '#e6edf3' },
    formFieldInput: { backgroundColor: '#161b22', border: '1px solid #30363d', color: '#e6edf3' },
    formButtonPrimary: { backgroundColor: '#2dd4bf', color: '#0d1117', fontWeight: '600' },
    footerActionLink: { color: '#2dd4bf' },
  },
};

function isValidClerkKey(key: string | undefined): boolean {
  return Boolean(key && (key.startsWith('pk_live_') || key.startsWith('pk_test_')) && key.length > 20);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = isValidClerkKey(clerkKey);

  const content = (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );

  if (!hasValidClerkKey) {
    return content;
  }

  return (
    <ClerkProvider appearance={clerkAppearance}>
      {content}
    </ClerkProvider>
  );
}
