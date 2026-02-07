import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18n = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/:locale',
  '/:locale/pricing',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/api/webhooks(.*)',
]);

const clerkGuarded = clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const i18nResponse = handleI18n(request);
  if (i18nResponse.status === 307 || i18nResponse.status === 302) {
    return i18nResponse;
  }
  const publishableKey = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '').trim();
  const secretKey = (process.env.CLERK_SECRET_KEY ?? '').trim();
  if (publishableKey.length === 0 || secretKey.length === 0) {
    return i18nResponse;
  }
  const clerkResponse = await clerkGuarded(request, event);
  if (clerkResponse?.status === 307 || clerkResponse?.status === 302) {
    return clerkResponse;
  }
  return i18nResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|env-check|[^/]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
};

