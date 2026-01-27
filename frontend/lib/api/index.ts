export { getApiBaseUrl, API_ENDPOINTS } from './config';
export { getAuthHeaders, getBackendUrl } from './auth';

export {
  deployAgent,
  getAgents,
  getAgent,
  startAgent,
  stopAgent,
  restartAgent,
  deleteAgent,
  getAgentStatus,
  getAgentLogs,
} from './agents';

export {
  getAgentBalance,
  requestWithdrawal,
  confirmWithdrawal,
  updateUserWallet,
  getUserWallet,
} from './wallet';

export {
  getApiKeys,
  createApiKey,
  revokeApiKey,
  getApiConfig,
  getWebhooks,
  createWebhook,
  deleteWebhook,
} from './api-keys';

export {
  getSubscriptionStatus,
  createCheckoutSession,
  getPricingPlans,
  openBillingPortal,
} from './subscription';

export {
  getStrategies,
  getStrategy,
  getPurchasedStrategies,
  purchaseStrategy,
} from './marketplace';

export {
  executeTrade,
  getTrendingTokens,
} from './trading';

export {
  analyzeToken,
  checkTradeSafety,
  getSafeTrending,
  getAllTrending,
} from './security';

export {
  getWhitelistStatus,
  setWhitelistedWallet,
  getAffiliateStats,
  generateReferralCode,
  applyReferralCode,
  toggleMevProtection,
  getTurboFees,
  checkSanctions,
} from './protection';

export {
  getPreflightStats,
  getSupervisorRules,
  updateSupervisorRule,
  evaluateTrade,
  createShadowPortfolio,
  getShadowReport,
  stopShadowMode,
  getTEEStatus,
  storeKeyInTEE,
  getNarrativeStatus,
  getNarrativeClusters,
  getNarrativeSignals,
} from './advanced-features';

export type { ApiScope, ApiTier, ApiKeyData, WebhookData, ApiConfig } from './api-keys';
export type { Strategy, PurchaseResult } from './marketplace';
export type { TradeAction, TradeMode, TradeRequest, TradeResult, TrendingToken, MarketDataResult } from './trading';
export type { RiskItem, TrustScore, SecurityReport, SafeToken } from './security';
export type { WhitelistStatus, AffiliateStats, TurboFees } from './protection';
export type { WithdrawRequestResult } from './wallet';
