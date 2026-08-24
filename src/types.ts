export interface Network {
  id: string;
  name: string;
  short: string;
  chainId: number | null;
  blockTime: string;
  gasToken: string;
  icon: string;
  color: string;
  status: 'operational' | 'degraded' | 'syncing';
  feeBase: number;
}

export interface Asset {
  symbol: string;
  name: string;
  network: string;
  decimals: number;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  native: boolean;
}

export interface MarketPair {
  id: string;
  base: string;
  quote: string;
  network: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fundingRate: number;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface DepthLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: DepthLevel[];
  asks: DepthLevel[];
  spread: number;
}

export interface Trade {
  id: string;
  time: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export type OrderType = 'market' | 'limit' | 'stop';
export type PositionSide = 'long' | 'short';
export type MarginMode = 'cross' | 'isolated';

export interface Order {
  id: string;
  time: number;
  pair: string;
  side: PositionSide;
  type: OrderType;
  price: number;
  triggerPrice?: number;
  size: number;
  leverage: number;
  remaining: number;
  status: 'open' | 'filled' | 'cancelled';
}

export interface Position {
  id: string;
  time: number;
  pair: string;
  side: PositionSide;
  entryPrice: number;
  markPrice: number;
  size: number; // notional in quote
  leverage: number;
  marginMode: MarginMode;
  margin: number;
  liquidationPrice: number;
  tp?: number;
  sl?: number;
}

export interface WalletBalance {
  network: string;
  symbol: string;
  token: string;
  balance: number;
  usdValue: number;
  address: string;
}

export interface ExchangeState {
  balances: WalletBalance[];
  orders: Order[];
  positions: Position[];
  trades: Trade[];
  paper: boolean;
}