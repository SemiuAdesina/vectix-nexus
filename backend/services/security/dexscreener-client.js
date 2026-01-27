"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSolanaTrending = fetchSolanaTrending;
exports.fetchTokenByAddress = fetchTokenByAddress;
exports.calculateTokenAge = calculateTokenAge;
const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';
async function fetchSolanaTrending() {
    try {
        const queries = ['meme', 'ai', 'pump', 'cat', 'dog'];
        const allPairs = [];
        for (const query of queries) {
            const response = await fetch(`${DEXSCREENER_BASE}/search?q=${query}`);
            if (response.ok) {
                const data = (await response.json());
                if (data.pairs) {
                    allPairs.push(...data.pairs.filter(p => p.chainId === 'solana'));
                }
            }
        }
        const uniquePairs = new Map();
        for (const pair of allPairs) {
            if (!uniquePairs.has(pair.baseToken.address)) {
                uniquePairs.set(pair.baseToken.address, pair);
            }
        }
        const sortedPairs = Array.from(uniquePairs.values())
            .filter(p => p.liquidity?.usd >= 10000)
            .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
            .slice(0, 30);
        return sortedPairs.map(pair => ({
            address: pair.baseToken.address,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            priceUsd: parseFloat(pair.priceUsd) || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidityUsd: pair.liquidity?.usd || 0,
            trustScore: 0,
            trustGrade: 'N/A',
            marketCap: pair.fdv || 0,
        }));
    }
    catch (error) {
        console.error('DexScreener fetch error:', error);
        return [];
    }
}
async function fetchTokenByAddress(address) {
    try {
        const response = await fetch(`${DEXSCREENER_BASE}/tokens/${address}`);
        if (!response.ok)
            return null;
        const data = (await response.json());
        const pair = data.pairs?.[0];
        if (!pair)
            return null;
        return {
            address: pair.baseToken.address,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            priceUsd: parseFloat(pair.priceUsd) || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidityUsd: pair.liquidity?.usd || 0,
            trustScore: 0,
            trustGrade: 'N/A',
            marketCap: pair.fdv || 0,
        };
    }
    catch (error) {
        console.error('DexScreener token fetch error:', error);
        return null;
    }
}
function calculateTokenAge(createdAt) {
    const now = Date.now();
    const ageMs = now - createdAt;
    return Math.floor(ageMs / (1000 * 60 * 60));
}
