"use client";

import { useEffect } from 'react';

export function OwnershipWatermark() {
  useEffect(() => {
    console.info(
      "%c VectixLogic Platform %c\n" +
      "© 2026 Vectix Logic LLC. All Rights Reserved.\n\n" +
      "This software is protected under the Business Source License 1.1.\n" +
      "Commercial reproduction or production use without a license is prohibited.",
      "color: #2dd4bf; font-size: 24px; font-weight: bold; font-family: system-ui, sans-serif;",
      "color: #8b949e; font-size: 14px; line-height: 1.5;"
    );
  }, []);

  return null;
}
