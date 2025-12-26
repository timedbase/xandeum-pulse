/**
 * XAND Token Price Service
 * Fetches live price data from DEXScreener API
 */

const XAND_TOKEN_ADDRESS = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';
const DEXSCREENER_API = `https://api.dexscreener.com/latest/dex/tokens/${XAND_TOKEN_ADDRESS}`;

export interface TokenPrice {
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  lastUpdated: number;
}

/**
 * Fetch XAND token price from DEXScreener
 */
export async function fetchXandPrice(): Promise<TokenPrice | null> {
  try {
    const response = await fetch(DEXSCREENER_API);

    if (!response.ok) {
      console.warn('Failed to fetch XAND price from DEXScreener');
      return null;
    }

    const data = await response.json();

    // DEXScreener returns an array of pairs for the token
    if (!data.pairs || data.pairs.length === 0) {
      console.warn('No trading pairs found for XAND token');
      return null;
    }

    // Get the main pair (usually the one with highest liquidity)
    const mainPair = data.pairs.reduce((prev: any, current: any) => {
      return (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? current : prev;
    });

    return {
      price: parseFloat(mainPair.priceUsd || '0'),
      priceChange24h: parseFloat(mainPair.priceChange?.h24 || '0'),
      volume24h: parseFloat(mainPair.volume?.h24 || '0'),
      liquidity: parseFloat(mainPair.liquidity?.usd || '0'),
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching XAND price:', error);
    return null;
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
}

/**
 * Format price change percentage
 */
export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
