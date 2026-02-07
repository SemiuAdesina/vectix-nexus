'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 text-slate-400 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          disabled={pending}
          className={`
            px-2 py-1 rounded uppercase font-medium transition-colors
            ${locale === loc ? 'text-teal-400 bg-teal-500/10' : 'hover:text-teal-400'}
          `}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
