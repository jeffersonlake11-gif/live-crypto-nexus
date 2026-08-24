import React from 'react';
import { motion } from 'framer-motion';
import { useTrading } from '../context/TradingContext';
import { TIMEFRAMES, fmt, pnlColor } from '../constants';

function Chart({ width = 520, height = 260 }: { width?: number; height?: number }) {
  const { candles, pair, feeds } = useTrading();
  const data = candles[pair.id] ?? [];
  const last = feeds[pair.id] ?? pair.price;
  const pad = 8;
  const cw = (width - pad * 2) / Math.max(1, data.length);
  const high = Math.max(...data.map((d) => d.h), last);
  const low = Math.min(...data.map((d) => d.l), last);
  const range = (high - low) || 1;
  const y = (p: number) => pad + ((high - p) / range) * (height - pad * 2);

  const grid = [0.25, 0.5, 0.75].map((g) => ({
    y: y(high - range * g),
    label: fmt(high - range * g),
  }));

  return (
    <div className="relative h-full w-full" style={{ minWidth: width }}>
      <svg width={width} height={height} className="block">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad} x2={width - pad} y1={g.y} y2={g.y} stroke="#1c2130" strokeDasharray="2 4" strokeWidth="1" />
            <text x={width - pad} y={g.y - 3} fontSize="9" fill="#4b5563" textAnchor="end" fontFamily="monospace">{g.label}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const openY = y(d.o);
          const closeY = y(d.c);
          const bodyTop = Math.min(openY, closeY);
          const bodyH = Math.max(2, Math.abs(openY - closeY));
          const up = d.c >= d.o;
          const color = up ? '#10b981' : '#f43f5e';
          const x = pad + i * cw + cw / 2;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={color} strokeWidth="1" opacity="0.7" />
              <rect x={x - cw * 0.35} y={bodyTop} width={Math.max(2, cw * 0.7)} height={bodyH} fill={color} rx={1} />
            </g>
          );
        })}
        <line x1={pad} x2={width - pad} y1={y(last)} y2={y(last)} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
      </svg>
      <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-zinc-900/70 px-2 py-0.5 font-mono text-xs font-semibold text-amber-400">
        ${fmt(last)}
        <span className={`ml-1.5 ${pnlColor(pair.change24h)}`}>{pair.change24h > 0 ? '+' : ''}{pair.change24h}%</span>
      </div>
    </div>
  );
}

export default function TradingTerminal() {
  const { orderBook, trades, pair, feeds } = useTrading();
  const [tf, setTf] = React.useState<string>('1m');
  const [view, setView] = React.useState<'chart' | 'depth'>('chart');
  const liveMid = feeds[pair.id] ?? pair.price;
  const book = orderBook[pair.id];
  const maxDepth = Math.max(...(book ? [...book.bids.map((b) => b.total), ...book.asks.map((a) => a.total)] : [1]));

  const bestBid = book?.bids[book.bids.length - 1]?.price ?? 0;
  const bestAsk = book?.asks[0]?.price ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* toolbar */}
      <div className="flex items-center gap-1 border-b border-zinc-800 px-2 py-1.5">
        <button onClick={() => setView('chart')} className={`rounded-md px-3 py-1 text-xs font-semibold ${view === 'chart' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>Chart</button>
        <button onClick={() => setView('depth')} className={`rounded-md px-3 py-1 text-xs font-semibold ${view === 'depth' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>Depth</button>
        <div className="mx-2 h-4 w-px bg-zinc-800" />
        <div className="flex gap-1">
          {TIMEFRAMES.map((t) => (
            <button key={t} onClick={() => setTf(t)} className={`rounded px-2 py-0.5 text-[11px] font-medium ${tf === t ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="font-mono text-[10px] text-zinc-600">OHLC · EMA · RSI · {tf}</span>
      </div>

      <div className="grid flex-1 grid-cols-1 min-h-0 lg:grid-cols-[1fr_220px]">
        {/* Chart area */}
        <div className="relative min-h-0 overflow-hidden border-zinc-800 lg:border-r">
          {view === 'chart' ? (
            <Chart width={620} height={300} />
          ) : (
            <div className="flex h-full items-center justify-center gap-8 px-6">
              {book && (
                <>
                  <div className="flex-1">
                    <div className="mb-2 flex justify-between font-mono text-[10px] text-zinc-500">
                      <span>Bids</span><span>Total</span>
                    </div>
                    {[...book.bids].reverse().map((b, i) => (
                      <div key={i} className="relative mb-0.5 flex justify-between font-mono text-xs text-emerald-400">
                        <div className="absolute inset-0 -z-0 rounded bg-emerald-500/10" style={{ width: `${(b.total / maxDepth) * 100}%` }} />
                        <span className="relative z-10 pl-2">{fmt(b.price)}</span>
                        <span className="relative z-10 pr-2">{b.size.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex justify-between font-mono text-[10px] text-zinc-500">
                      <span>Asks</span><span>Total</span>
                    </div>
                    {book.asks.map((a, i) => (
                      <div key={i} className="relative mb-0.5 flex justify-between font-mono text-xs text-rose-400">
                        <div className="absolute inset-0 rounded bg-rose-500/10" style={{ width: `${(a.total / maxDepth) * 100}%` }} />
                        <span className="relative z-10 pl-2">{fmt(a.price)}</span>
                        <span className="relative z-10 pr-2">{a.size.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0c14] to-transparent" />
        </div>

        {/* Right: order book + trades */}
        <div className="flex min-h-0 flex-col">
          <div className="border-b border-zinc-800 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Order Book <span className="mx-1 text-zinc-700">|</span> <span className="text-zinc-300">Spread {book ? fmt(book.spread, 2) : '-'} <span className="text-zinc-500">({((book?.spread ?? 0) / pair.price * 100).toFixed(3)}%)</span></span>
          </div>
          <div className="flex justify-between px-2 py-1 text-[10px] font-medium text-zinc-500">
            <span>Price</span><span className={pnlColor(pair.change24h)}>{pair.change24h >= 0 ? `▲ ${fmt(bestAsk)}` : `▼ ${fmt(bestBid)}`}</span><span>Size (USD)</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {book && [...book.asks].slice(0, 8).reverse().map((a, i) => (
              <div key={i} className="relative flex items-center justify-between px-2 py-0.5 font-mono text-xs text-rose-400">
                <div className="absolute left-0 top-0 h-full bg-rose-500/[0.07]" style={{ width: `${(a.total / maxDepth) * 100}%` }} />
                <span className="relative z-10">{fmt(a.price)}</span>
                <span className="relative z-10 text-zinc-300">{a.size.toFixed(3)}</span>
              </div>
            ))}
            <div className="my-1 border-y border-zinc-700/60 bg-zinc-900/50 px-2 py-1 text-center">
              <span className="font-mono text-lg font-bold text-amber-400">${fmt(liveMid)}</span>
            </div>
            {book && book.bids.slice(0, 8).map((b, i) => (
              <div key={i} className="relative flex items-center justify-between px-2 py-0.5 font-mono text-xs text-emerald-400">
                <div className="absolute left-0 top-0 h-full bg-emerald-500/[0.07]" style={{ width: `${(b.total / maxDepth) * 100}%` }} />
                <span className="relative z-10">{fmt(b.price)}</span>
                <span className="relative z-10 text-zinc-300">{b.size.toFixed(3)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Recent Trades</div>
          <div className="max-h-28 overflow-hidden px-2 pb-2">
            {trades.slice(0, 8).map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between py-0.5 font-mono text-xs">
                <span className={t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>{t.side === 'buy' ? '▲' : '▼'} {fmt(t.price)}</span>
                <span className="text-zinc-400">{t.size.toFixed(3)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}