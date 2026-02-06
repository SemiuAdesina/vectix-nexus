import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { OwnershipWatermark, AuthTokenBridge } from "@/components/layout";

export const metadata: Metadata = {
  title: "Vectix Foundry | AI Agent Factory",
  description: "Enterprise-grade autonomous AI trading agents on Solana with institutional security",
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#14b8a6',
    colorBackground: '#020617',
    colorInputBackground: '#1e293b',
    colorInputText: '#f8fafc',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    colorDanger: '#dc2626',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    rootBox: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: {
      backgroundColor: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: { margin: 'auto' },
    card: {
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    },
    headerTitle: { color: '#f8fafc' },
    headerSubtitle: { color: '#94a3b8' },
    socialButtonsBlockButton: {
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      color: '#f8fafc',
    },
    formFieldLabel: { color: '#f8fafc' },
    formFieldInput: {
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      color: '#f8fafc',
    },
    formButtonPrimary: {
      backgroundColor: '#14b8a6',
      color: '#ffffff',
      fontWeight: '600',
    },
    footerActionLink: { color: '#14b8a6' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance} dynamic>
      <html lang="en" className="dark">
        <body>
          <OwnershipWatermark />
          <AuthTokenBridge />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
