import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Gauge, ShieldCheck, Zap } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { fmt, NETWORKS } from '../constants';
import type { OrderType, PositionSide, MarginMode } from '../types';

export default function OrderForm() {
  const { pair, feeds, execute, networkId } = useTrading();
  const live = feeds[pair.id] ?? pair.price;
  const net = NETWORKS.find((n) => n.id === networkId)!;

  const [side, setSide] = useState<PositionSide>('long');
  const [ot, setOt] = useState<OrderType>('market');
  const [leverage, setLeverage] = useState(10);
  const [marginMode, setMarginMode] = useState<MarginMode>('isolated');
  const [sizeUsd, setSizeUsd] = useState(1000);
  const [price, setPrice] = useState(fmt(live, 2));
  const [stop, setStop] = useState('');
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const margin = sizeUsd / leverage;
  const estFee = sizeUsd * net.feeBase;
  const liq = side === 'long'
    ? (Number(price) || live) * (1 - 1 / leverage * 0.95)
    : (Number(price) || live) * (1 + 1 / leverage * 0.95);

  const quick = [100, 500, 1000, 5000, 10000];

  function submit() {
    setErr(null);
    const msg = execute({
      side, type: ot, size: sizeUsd, leverage, marginMode,
      price: ot === 'limit' ? Number(price) : undefined,
      trigger: ot === 'stop' ? Number(stop) : undefined,
      tp: tp ? Number(tp) : undefined,
      sl: sl ? Number(sl) : undefined,
    });
    if (msg) setErr(msg);
  }

  const accent = side === 'long' ? 'emerald' : 'rose';

  return (
    <div className="flex h-full flex-col p-3">
      {/* tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-900 p-1">
        <button onClick={() => setSide('long')} className={`rounded-lg py-2 text-sm font-bold transition-colors ${side === 'long' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-emerald-400'}`}>
          Long Isolated
        </button>
        <button onClick={() => setSide('short')} className={`rounded-lg py-2 text-sm font-bold transition-colors ${side === 'short' ? 'bg-rose-500 text-zinc-950' : 'text-zinc-400 hover:text-rose-400'}`}>
          Short Isolated
        </button>
      </div>

      {/* order type */}
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-zinc-900 p-1">
        {(['market', 'limit', 'stop'] as const).map((t) => (
          <button key={t} onClick={() => setOt(t)} className={`rounded-md py-1.5 text-xs font-semibold capitalize ${ot === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
        ))}
      </div>

      {/* price inputs */}
      <div className="mt-3 space-y-2">
        {ot === 'limit' && (
          <Labeled label="Limit Price" value={`$${price}`}>
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent text-right font-mono text-sm text-zinc-100 outline-none" />
          </Labeled>
        )}
        {ot === 'stop' && (
          <Labeled label="Stop Trigger" value={`$${stop || '-'}`}>
            <input value={stop} onChange={(e) => setStop(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={fmt(live, 2)} className="w-full bg-transparent text-right font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600" />
          </Labeled>
        )}

        <Labeled label="Size (USDT)" value={`≈ ${fmt(sizeUsd / (Number(price) || live), 5)} ${pair.base}`}>
          <input inputMode="numeric" value={sizeUsd} onChange={(e) => setSizeUsd(Number(e.target.value.replace(/[^0-9.]/g, '')) || 0)} className="w-full bg-transparent text-right font-mono text-sm text-zinc-100 outline-none" />
        </Labeled>
        <div className="flex gap-1">
          {quick.map((q) => (
            <button key={q} onClick={() => setSizeUsd(q)} className="flex-1 rounded bg-zinc-800 py-1 text-[10px] font-semibold text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">{q}</button>
          ))}
        </div>
      </div>

      {/* leverage */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> Leverage</span>
          <span className={`font-mono text-sm font-bold ${leverage >= 25 ? 'text-amber-400' : 'text-emerald-400'}`}>{leverage}x</span>
        </div>
        <input type="range" min={1} max={100} value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className="mt-2 w-full accent-emerald-400" />
        <div className="mt-1.5 grid grid-cols-6 gap-1">
          {[1, 5, 10, 25, 50, 100].map((l) => (
            <button key={l} onClick={() => setLeverage(l)} className={`rounded py-1 text-[10px] font-semibold ${leverage === l ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/60 text-zinc-500 hover:text-zinc-300'}`}>{l}x</button>
          ))}
        </div>
      </div>

      {/* margin mode + TP/SL */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => setMarginMode(marginMode === 'isolated' ? 'cross' : 'isolated')} className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-2 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-600">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          {marginMode === 'isolated' ? 'Isolated' : 'Cross'}
        </button>
        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Est. Liq {side === 'long' ? '↓' : '↑'} {fmt(liq, 2)}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input value={tp} onChange={(e) => setTp(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={`TP ${side === 'long' ? '>' : '<'} ${fmt((Number(price) || live) * (side === 'long' ? 1.1 : 0.9), 2)}`} className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50" />
        <input value={sl} onChange={(e) => setSl(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={`SL ${side === 'long' ? '<' : '>'} ${fmt((Number(price) || live) * (side === 'long' ? 0.95 : 1.05), 2)}`} className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-rose-500/50" />
      </div>

      {/* summary */}
      <div className="mt-3 space-y-1 rounded-lg bg-zinc-900/60 p-2 font-mono text-[11px] text-zinc-400">
        <div className="flex justify-between"><span>Margin Required</span><span className="text-zinc-200">${fmt(margin, 2)}</span></div>
        <div className="flex justify-between"><span>{net.name} Network Fee</span><span className="text-zinc-200">${fmt(estFee, 4)} ({net.gasToken})</span></div>
        <div className="flex justify-between"><span>Block time / confirm</span><span className="text-zinc-200">{net.blockTime}</span></div>
      </div>

      {err && <p className="mt-2 text-xs font-medium text-rose-400">{err}</p>}

      <button onClick={submit} className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-zinc-950 transition-transform active:scale-[0.98] ${accent === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}>
        <Zap className="h-4 w-4" strokeWidth={2.5} />
        {side === 'long' ? 'Buy / Long' : 'Sell / Short'} {pair.base}
        <AnimatePresence>{ot !== 'market' && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs opacity-70">· {ot}</motion.span>}</AnimatePresence>
      </button>
      <p className="mt-2 text-center text-[10px] text-zinc-600">Futures with leverage carry high risk of loss. Paper mode is on by default.</p>
    </div>
  );
}

function Labeled({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 focus-within:border-zinc-500">
      <span className="text-xs text-zinc-500">{label}</span>
      <div className="flex flex-1 items-center justify-end">
        {children}
        <span className="ml-1 text-[10px] text-zinc-600">{value.startsWith('$') ? '' : value}</span>
      </div>
    </label>
  );
}