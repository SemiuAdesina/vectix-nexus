"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRugCheckData = fetchRugCheckData;
const RUGCHECK_BASE = 'https://api.rugcheck.xyz/v1';
async function fetchRugCheckData(tokenAddress) {
    try {
        const response = await fetch(`${RUGCHECK_BASE}/tokens/${tokenAddress}/report`, {
            headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) {
            return null;
        }
        const data = (await response.json());
        const top10Pct = (data.topHolders || [])
            .slice(0, 10)
            .reduce((sum, h) => sum + (h.pct || 0), 0);
        const lpLockedRaw = data.markets?.[0]?.lp?.lpLockedPct || 0;
        const lpLocked = Math.min(lpLockedRaw * 100, 100);
        return {
            score: data.score || 0,
            isMintable: data.mintAuthority !== null,
            isFreezable: data.freezeAuthority !== null,
            lpLockedPercent: lpLocked,
            top10HoldersPercent: top10Pct,
            risks: (data.risks || []).map(r => ({
                name: r.name,
                level: r.level,
                description: r.description,
            })),
        };
    }
    catch (error) {
        console.error('RugCheck fetch error:', error);
        return null;
    }
}
