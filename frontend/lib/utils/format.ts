export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

export function formatPriceChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(1)}%`;
}

export function formatLiquidity(usd: number): string {
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(2)}M`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(0)}K`;
  }
  return `$${usd.toFixed(0)}`;
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000) {
    return `$${(cap / 1_000_000_000).toFixed(2)}B`;
  }
  if (cap >= 1_000_000) {
    return `$${(cap / 1_000_000).toFixed(2)}M`;
  }
  if (cap >= 1_000) {
    return `$${(cap / 1_000).toFixed(0)}K`;
  }
  return `$${cap.toFixed(0)}`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

