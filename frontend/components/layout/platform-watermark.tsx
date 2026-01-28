'use client';

import { useEffect } from 'react';

export function PlatformWatermark() {
  useEffect(() => {
    console.info(
      "%c VectixLogic Platform %c\n© 2026 Vectix Logic LLC. All Rights Reserved.\n\nThis software is protected under the Business Source License 1.1.\nCommercial reproduction or production use without a license is prohibited.",
      "color: #2dd4bf; font-size: 24px; font-weight: bold; font-family: sans-serif;",
      "color: #8b949e; font-size: 14px; line-height: 1.5;"
    );
  }, []);

  return null;
}

export function PlatformFooter() {
  return (
    <footer className="w-full py-3 text-center text-xs text-gray-500 border-t border-gray-800 bg-[#0d1117]/80 backdrop-blur-sm">
      Platform Secured by{' '}
      <strong className="text-teal-400">VectixLogic Compliance Engine™</strong>
      <span className="mx-2 text-gray-700">|</span>
      <span className="text-gray-600">v1.0.0</span>
    </footer>
  );
}
