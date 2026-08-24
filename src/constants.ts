import type { Network, Asset, MarketPair } from './types';

export const BRAND = 'ApexTrade';
export const DAY = 24 * 60 * 60 * 1000;

export const NETWORKS: Network[] = [
  { id: 'btc', name: 'Bitcoin', short: 'BTC', chainId: null, blockTime: '10 min', gasToken: 'BTC', icon: '₿', color: '#f7931a', status: 'operational', feeBase: 0.00004 },
  { id: 'ln', name: 'Lightning', short: 'LN', chainId: null, blockTime: 'Instant', gasToken: 'sats', icon: '⚡', color: '#f5a623', status: 'operational', feeBase: 0.00001 },
  { id: 'eth', name: 'Ethereum', short: 'ETH', chainId: 1, blockTime: '12 sec', gasToken: 'ETH', icon: '◆', color: '#627eea', status: 'operational', feeBase: 0.0009 },
  { id: 'sol', name: 'Solana', short: 'SOL', chainId: null, blockTime: '400 ms', gasToken: 'SOL', icon: '◎', color: '#14f195', status: 'operational', feeBase: 0.0002 },
  { id: 'arb', name: 'Arbitrum', short: 'ARB', chainId: 42161, blockTime: '250 ms', gasToken: 'ETH', icon: '▲', color: '#28a0f0', status: 'operational', feeBase: 0.0003 },
  { id: 'bnb', name: 'BNB Chain', short: 'BNB', chainId: 56, blockTime: '3 sec', gasToken: 'BNB', icon: '◆', color: '#f0b90b', status: 'degraded', feeBase: 0.0005 },
  { id: 'poly', name: 'Polygon', short: 'MATIC', chainId: 137, blockTime: '2 sec', gasToken: 'POL', icon: '⬡', color: '#8247e5', status: 'operational', feeBase: 0.0004 },
];

export const ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'btc', decimals: 8, price: 67250, change24h: 2.34, high24h: 68300, low24h: 64800, volume24h: 28.4e9, native: true },
  { symbol: 'ETH', name: 'Ethereum', network: 'eth', decimals: 18, price: 3450, change24h: -1.2, high24h: 3580, low24h: 3360, volume24h: 15.2e9, native: true },
  { symbol: 'SOL', name: 'Solana', network: 'sol', decimals: 9, price: 178.4, change24h: 5.87, high24h: 182, low24h: 166, volume24h: 6.1e9, native: true },
  { symbol: 'ARB', name: 'Arbitrum', network: 'arb', decimals: 18, price: 1.05, change24h: -3.4, high24h: 1.12, low24h: 1.01, volume24h: 0.9e9, native: false },
  { symbol: 'BNB', name: 'BNB Chain', network: 'bnb', decimals: 18, price: 594, change24h: 1.1, high24h: 610, low24h: 575, volume24h: 2.3e9, native: true },
  { symbol: 'POL', name: 'Polygon', network: 'poly', decimals: 18, price: 0.92, change24h: 0.4, high24h: 0.96, low24h: 0.88, volume24h: 1.1e9, native: true },
];

export const PAIRS: MarketPair[] = [
  { id: 'BTC/USDT', base: 'BTC', quote: 'USDT', network: 'btc', price: 67250, change24h: 2.34, high24h: 68300, low24h: 64800, volume24h: 28.4e9, fundingRate: 0.01 },
  { id: 'ETH/USDT', base: 'ETH', quote: 'USDT', network: 'eth', price: 3450, change24h: -1.2, high24h: 3580, low24h: 3360, volume24h: 15.2e9, fundingRate: -0.004 },
  { id: 'SOL/USDT', base: 'SOL', quote: 'USDT', network: 'sol', price: 178.4, change24h: 5.87, high24h: 182, low24h: 166, volume24h: 6.1e9, fundingRate: 0.024 },
  { id: 'BTC/EUR', base: 'BTC', quote: 'EUR', network: 'btc', price: 61870, change24h: 1.9, high24h: 63010, low24h: 59900, volume24h: 4.2e9, fundingRate: 0.008 },
  { id: 'ARB/USDT', base: 'ARB', quote: 'USDT', network: 'arb', price: 1.05, change24h: -3.4, high24h: 1.12, low24h: 1.01, volume24h: 0.9e9, fundingRate: -0.01 },
  { id: 'BNB/USDT', base: 'BNB', quote: 'USDT', network: 'bnb', price: 594, change24h: 1.1, high24h: 610, low24h: 575, volume24h: 2.3e9, fundingRate: 0.012 },
];

export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'] as const;

export function fmt(n: number, d = 2): string {
  if (!isFinite(n)) return '-';
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return fmt(n);
}

export function pnlColor(v: number): string {
  if (v > 0.0001) return 'text-emerald-400';
  if (v < -0.0001) return 'text-rose-400';
  return 'text-zinc-400';
}

export function generator(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}