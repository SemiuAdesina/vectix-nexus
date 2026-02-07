'use client';

import { useEffect, useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthEnabled } from '@/contexts/auth-enabled';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const t = useTranslations('SignIn');
  const tCommon = useTranslations('Common');
  const authEnabled = useAuthEnabled();
  const [checking, setChecking] = useState(true);
  const [envCheckDone, setEnvCheckDone] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- env-check / auth sync */
  useEffect(() => {
    if (authEnabled && typeof window !== 'undefined') {
      sessionStorage.removeItem('signin-reload');
      setEnvCheckDone(true);
      setChecking(false);
    }
  }, [authEnabled]);

  useEffect(() => {
    if (!authEnabled && typeof window !== 'undefined' && !sessionStorage.getItem('signin-reload')) {
      fetch('/env-check')
        .then((r) => r.json())
        .then((data) => {
          if (data?.clerkConfigured) {
            sessionStorage.setItem('signin-reload', '1');
            window.location.reload();
            return;
          }
          setEnvCheckDone(true);
        })
        .catch(() => setEnvCheckDone(true))
        .finally(() => setChecking(false));
    } else if (!authEnabled) {
      setChecking(false);
      setEnvCheckDone(true);
    }
  }, [authEnabled]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!authEnabled) {
    if (checking || !envCheckDone) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 max-w-md mx-auto text-center">
        <p className="text-slate-400 mb-2">{t('notConfigured')}</p>
        <p className="text-slate-500 text-sm mb-6">
          {t('envHint')}
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4" /> {tCommon('backToHome')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-slate-400 hover:text-teal-400 text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {tCommon('home')}
        </Link>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#14b8a6',
            colorBackground: '#020617',
            colorInputBackground: '#1e293b',
            colorInputText: '#f8fafc',
            colorText: '#f8fafc',
            colorTextSecondary: '#94a3b8',
            borderRadius: '0.5rem',
          },
        }}
      />
    </div>
  );
}
