import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Candle, DepthLevel, MarketPair, Order, OrderBook, OrderType, Position, PositionSide, WalletBalance, Trade, MarginMode } from '../types';
import { ASSETS, NETWORKS, PAIRS, generator } from '../constants';

export interface Ctx {
  networkId: string;
  setNetworkId: (id: string) => void;
  pair: MarketPair;
  setPair: (id: string) => void;
  feeds: Record<string, number>;
  chartPx: number;
  candles: Record<string, Candle[]>;
  orderBook: Record<string, OrderBook>;
  trades: Trade[];
  balances: WalletBalance[];
  positions: Position[];
  orders: Order[];
  paper: boolean;
  togglePaper: () => void;
  accountEquity: number;
  execute: (opts: { side: PositionSide; type: OrderType; size: number; price?: number; trigger?: number; leverage: number; marginMode: MarginMode; tp?: number; sl?: number }) => string | null;
  closePosition: (id: string) => void;
  cancelOrder: (id: string) => void;
}

const CtxRef = createContext<Ctx | null>(null);

const rand = generator(42);

function genCandles(seed: number, start: number): Candle[] {
  const out: Candle[] = [];
  let p = seed;
  for (let i = 0; i < 180; i++) {
    const drift = (rand() - 0.485) * p * 0.008;
    const o = p;
    const c = Math.max(0.001, p + drift);
    const h = Math.max(o, c) * (1 + rand() * 0.004);
    const l = Math.min(o, c) * (1 - rand() * 0.004);
    out.push({ t: start + i * 60000, o, h, l, c, v: 5 + rand() * 120 });
    p = c;
  }
  return out;
}

function mkDepth(mid: number, side: 'bids' | 'asks'): DepthLevel[] {
  const levels: DepthLevel[] = [];
  let total = 0;
  for (let i = 0; i < 12; i++) {
    const sp = side === 'bids' ? 1 - (i / 12) * 0.06 : 1 + ((i + 1) / 12) * 0.06;
    const price = mid * sp;
    const size = (2 + rand() * 20) * 0.5;
    total += size;
    levels.push({ price, size, total });
  }
  return levels;
}

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [networkId, setNetworkId] = useState('btc');
  const [pairId, setPairId] = useState(PAIRS[0].id);
  const [paper, setPaper] = useState(true);

  const pair = PAIRS.find((p) => p.id === pairId)!;

  const [feeds, setFeeds] = useState<Record<string, number>>(() =>
    Object.fromEntries(PAIRS.map((p) => [p.id, p.price]))
  );
  const [chartPx, setChartPx] = useState(0);
  const [candles, setCandles] = useState<Record<string, Candle[]>>(() =>
    Object.fromEntries(PAIRS.map((p) => [p.id, genCandles(p.price, Date.now() - 180 * 60000)]))
  );
  const [orderBook, setOrderBook] = useState<Record<string, OrderBook>>(() =>
    Object.fromEntries(PAIRS.map((p) => [p.id, { bids: mkDepth(p.price, 'bids'), asks: mkDepth(p.price, 'asks'), spread: p.price * 0.0004 }]))
  );
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([
    { network: 'btc', symbol: 'BTC', token: 'Bitcoin', balance: 0.84, usdValue: 0, address: 'bc1qxl0mlmlptq0f9j7xz0q9k9v', },
    { network: 'eth', symbol: 'ETH', token: 'Ethereum', balance: 12.4, usdValue: 0, address: '0x7a3F29Bc44B1D3e2C8D1f0e8B9a', },
    { network: 'sol', symbol: 'SOL', token: 'Solana', balance: 640, usdValue: 0, address: 'H4k2…m9xZ', },
    { network: 'arb', symbol: 'ARB', token: 'Arbitrum', balance: 8500, usdValue: 0, address: '0x1c0e…44fA', },
    { network: 'bnb', symbol: 'BNB', token: 'BNB Chain', balance: 32, usdValue: 0, address: '0x24A9…71Bc', },
    { network: 'poly', symbol: 'POL', token: 'Polygon', balance: 4400, usdValue: 0, address: '0x58D2…beE7', },
  ]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const posRef = useRef(positions);
  posRef.current = positions;

  const equity = useMemo(() => {
    const bal = balances.reduce((a, b) => a + (b.usdValue || b.balance * (ASSETS.find((x) => x.symbol === b.symbol)?.price || 0)), 250000);
    const pnl = positions.reduce((a, p) => a + ((p.markPrice - p.entryPrice) / p.entryPrice) * p.size * (p.side === 'long' ? 1 : -1), 0);
    return bal + pnl;
  }, [balances, positions]);

  // live feed loop
  useEffect(() => {
    const iv = setInterval(() => {
      setFeeds((prev) => {
        const next = { ...prev };
        for (const p of PAIRS) {
          const drift = (rand() - 0.495) * prev[p.id] * 0.00015;
          next[p.id] = Math.max(0.001, prev[p.id] + drift);
        }
        return next;
      });
      setChartPx(Math.floor(Date.now() / 5000));
      setOrderBook((prev) => {
        const next: Record<string, OrderBook> = {};
        for (const p of PAIRS) {
          const mid = feeds[p.id] ?? p.price;
          next[p.id] = { bids: mkDepth(mid, 'bids'), asks: mkDepth(mid, 'asks'), spread: mid * 0.0004 };
        }
        return next;
      });
      // trade tick
      const mid = feeds[pairId] ?? pair.price;
      const t = { id: Math.random().toString(36).slice(2), time: Date.now(), price: mid, size: 0.02 + rand() * 1.5, side: (rand() > 0.5 ? 'buy' : 'sell') as 'buy' | 'sell' }; setTrades((prev) => [t, ...prev].slice(0, 60));
      // candle update
      setCandles((prev) => {
        const arr = [...(prev[pairId] ?? [])];
        const last = arr[arr.length - 1];
        if (last && Date.now() - last.t < 60000) {
          last.c = mid;
          last.h = Math.max(last.h, mid);
          last.l = Math.min(last.l, mid);
          arr[arr.length - 1] = { ...last };
        } else {
          arr.push({ t: Date.now(), o: mid, h: mid, l: mid, c: mid, v: rand() * 50 });
        }
        return { ...prev, [pairId]: arr.slice(-200) };
      });
    }, 900);
    return () => clearInterval(iv);
  });

  // update mark prices + pnl on positions live
  useEffect(() => {
    const loadEq = () => {
      setBalances((prev) =>
        prev.map((b) => {
          const a = ASSETS.find((x) => x.symbol === b.symbol);
          return { ...b, usdValue: b.balance * (a?.price || 0) };
        })
      );
      setPositions((prev) =>
        prev.map((p) => ({ ...p, markPrice: feeds[p.pair] ?? p.markPrice }))
      );
    };
    const t = setInterval(loadEq, 1200);
    return () => clearInterval(t);
  }, [feeds]);

  function liquidation(entry: number, side: PositionSide, size: number, leverage: number, marginMode: MarginMode, margin: number): number {
    const m = marginMode === 'isolated' ? margin : equity * 0.25;
    if (side === 'long') return entry * (1 - (m / size) * 0.9);
    return entry * (1 + (m / size) * 0.9);
  }

  function execute(opts: { side: PositionSide; type: OrderType; size: number; price?: number; trigger?: number; leverage: number; marginMode: MarginMode; tp?: number; sl?: number }): string | null {
    const mid = feeds[pairId] ?? pair.price;
    if (opts.size <= 0) return 'Enter a position size';
    const margin = opts.size / opts.leverage;
    const marginUsd = margin * mid;
    const balToken = balances.find((b) => b.network === pair.network);
    const priceToUse = opts.type === 'market' ? mid : opts.price || mid;

    if (opts.type !== 'market' || isNaN(priceToUse) || priceToUse <= 0) {
      setOrders((prev) => [...prev, { id: Math.random().toString(36).slice(2), time: Date.now(), pair: pair.id, side: opts.side, type: opts.type, price: priceToUse, triggerPrice: opts.trigger, size: opts.size, leverage: opts.leverage, remaining: opts.size, status: 'open' }]);
      return null;
    }

    // market fill immediately
    setPositions((prev) => {
      const existing = prev.find((p) => p.pair === pair.id && p.side === opts.side && p.leverage === opts.leverage);
      if (existing) {
        const totalSize = existing.size + opts.size;
        const newEntry = (existing.entryPrice * existing.size + priceToUse * opts.size) / totalSize;
        return prev.map((p) => (p.id === existing.id ? { ...p, size: totalSize, entryPrice: newEntry, margin: p.margin + marginUsd, liquidationPrice: liquidation(existing.entryPrice, opts.side, totalSize, opts.leverage, opts.marginMode, p.margin + marginUsd) } : p));
      }
      const newPos: Position = {
        id: Math.random().toString(36).slice(2), time: Date.now(), pair: pair.id, side: opts.side,
        entryPrice: priceToUse, markPrice: priceToUse, size: opts.size, leverage: opts.leverage,
        marginMode: opts.marginMode, margin: marginUsd, liquidationPrice: liquidation(priceToUse, opts.side, opts.size, opts.leverage, opts.marginMode, marginUsd),
        tp: opts.tp, sl: opts.sl,
      };
      return [...prev, newPos];
    });
    setTrades((prev) => {
      const tt: Trade = { id: Math.random().toString(36).slice(2), time: Date.now(), price: priceToUse, size: opts.size, side: opts.side === 'long' ? 'buy' : 'sell' };
      return [tt, ...prev].slice(0, 60);
    });
    if (balToken) {
      setBalances((prev) => prev.map((b) => (b.network === balToken.network && b.symbol === balToken.symbol ? { ...b, balance: Math.max(0, b.balance - 0.001 * opts.size) } : b)));
    }
    return null;
  }

  function closePosition(id: string) {
    const p = positions.find((x) => x.id === id);
    if (!p) return;
    const mid = feeds[p.pair] ?? pair.price;
    const pnl = ((mid - p.entryPrice) / p.entryPrice) * p.size * (p.side === 'long' ? 1 : -1);
    const base = p.pair.split('/')[0];
    setBalances((prev) => prev.map((b) => (b.symbol === base ? { ...b, balance: b.balance + p.size } : b)));
    setPositions((prev) => prev.filter((x) => x.id !== id));
    setTrades((prev) => {
      const tt: Trade = { id: Math.random().toString(36).slice(2), time: Date.now(), price: mid, size: p.size, side: p.side === 'long' ? 'sell' : 'buy' };
      return [tt, ...prev].slice(0, 60);
    });
    void pnl;
  }

  function cancelOrder(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  const value: Ctx = {
    networkId, setNetworkId, pair, setPair: setPairId, feeds, chartPx, candles, orderBook, trades,
    balances, positions, orders, paper, togglePaper: () => setPaper((p) => !p), accountEquity: equity,
    execute, closePosition, cancelOrder,
  };

  return <CtxRef.Provider value={value}>{children}</CtxRef.Provider>;
}

export function useTrading(): Ctx {
  const ctx = useContext(CtxRef);
  if (!ctx) throw new Error('useTrading must be inside TradingProvider');
  return ctx;
}