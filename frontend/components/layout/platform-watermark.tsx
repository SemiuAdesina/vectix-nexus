'use client';

import { useEffect } from 'react';

export function PlatformWatermark() {
  useEffect(() => {
    console.info(
      "%c Vectix Foundry Platform %c\n© 2026 Vectix Logic LLC. All Rights Reserved.\n\nThis software is protected under the Business Source License 1.1.\nCommercial reproduction or production use without a license is prohibited.",
      "color: #14b8a6; font-size: 24px; font-weight: bold; font-family: sans-serif;",
      "color: #94a3b8; font-size: 14px; line-height: 1.5;"
    );
  }, []);

  return null;
}

export function PlatformFooter() {
  return (
    <footer className="w-full py-3 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      Platform Secured by{' '}
      <strong className="text-teal-400">Vectix Foundry Compliance Engine™</strong>
      <span className="mx-2 text-gray-700">|</span>
      <span className="text-gray-600">v1.0.0</span>
    </footer>
  );
}
