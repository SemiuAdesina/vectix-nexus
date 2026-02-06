"use client";

import { useEffect } from 'react';

export function OwnershipWatermark() {
  useEffect(() => {
    console.info(
      "%c Vectix Foundry Platform %c\n" +
      "© 2026 Vectix Logic LLC. All Rights Reserved.\n\n" +
      "This software is protected under the Business Source License 1.1.\n" +
      "Commercial reproduction or production use without a license is prohibited.",
      "color: #14b8a6; font-size: 24px; font-weight: bold; font-family: system-ui, sans-serif;",
      "color: #94a3b8; font-size: 14px; line-height: 1.5;"
    );
  }, []);

  return null;
}
