'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">{t('title')}</h1>
      <p className="text-slate-400 mb-6">{t('description')}</p>
      <Link href="/">
        <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
          {t('backHome')}
        </Button>
      </Link>
    </div>
  );
}
