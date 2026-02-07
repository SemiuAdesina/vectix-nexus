import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  const publishableKey = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '').trim();
  const secretKey = (process.env.CLERK_SECRET_KEY ?? '').trim();
  const clerkConfigured = publishableKey.length > 0 && secretKey.length > 0;
  return NextResponse.json({ clerkConfigured });
}
