"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeToken = analyzeToken;
exports.shouldAutoReject = shouldAutoReject;
const rugcheck_client_1 = require("./rugcheck-client");
const dexscreener_client_1 = require("./dexscreener-client");
const trust_score_1 = require("./trust-score");
async function analyzeToken(tokenAddress) {
    const [rugCheckData, marketData] = await Promise.all([
        (0, rugcheck_client_1.fetchRugCheckData)(tokenAddress),
        (0, dexscreener_client_1.fetchTokenByAddress)(tokenAddress),
    ]);
    const liquidityUsd = marketData?.liquidityUsd || 0;
    const tokenAgeHours = 48;
    if (rugCheckData) {
        const report = {
            tokenAddress,
            isHoneypot: false,
            isMintable: rugCheckData.isMintable,
            isFreezable: rugCheckData.isFreezable,
            isBlacklisted: false,
            hasProxyContract: false,
            holderConcentration: rugCheckData.top10HoldersPercent,
            top10HoldersPercent: rugCheckData.top10HoldersPercent,
            liquidityLocked: rugCheckData.lpLockedPercent >= 90,
            liquidityLockedPercent: rugCheckData.lpLockedPercent,
            liquidityUsd,
            contractRenounced: !rugCheckData.isMintable && !rugCheckData.isFreezable,
            tokenAgeHours,
            buyTax: 0,
            sellTax: 0,
            totalSupply: '0',
            circulatingSupply: '0',
            creatorAddress: '',
            creatorBalance: 0,
        };
        return { report, trustScore: (0, trust_score_1.calculateTrustScore)(report) };
    }
    const report = createHeuristicReport(tokenAddress, liquidityUsd, tokenAgeHours);
    return { report, trustScore: (0, trust_score_1.calculateTrustScore)(report) };
}
function createHeuristicReport(tokenAddress, liquidityUsd, tokenAgeHours) {
    const hasGoodLiquidity = liquidityUsd >= 100000;
    const hasDecentLiquidity = liquidityUsd >= 50000;
    return {
        tokenAddress,
        isHoneypot: false,
        isMintable: !hasGoodLiquidity,
        isFreezable: false,
        isBlacklisted: false,
        hasProxyContract: false,
        holderConcentration: hasGoodLiquidity ? 30 : 60,
        top10HoldersPercent: hasGoodLiquidity ? 30 : 60,
        liquidityLocked: hasGoodLiquidity,
        liquidityLockedPercent: hasGoodLiquidity ? 95 : hasDecentLiquidity ? 50 : 0,
        liquidityUsd,
        contractRenounced: hasGoodLiquidity,
        tokenAgeHours,
        buyTax: 0,
        sellTax: 0,
        totalSupply: '0',
        circulatingSupply: '0',
        creatorAddress: '',
        creatorBalance: 0,
    };
}
function shouldAutoReject(trustScore, safetyMode) {
    if (!safetyMode) {
        return { reject: false, reason: 'Safety mode disabled' };
    }
    if (trustScore < 70) {
        return { reject: true, reason: `Trust score too low: ${trustScore}/100` };
    }
    return { reject: false, reason: 'Token passed safety checks' };
}
