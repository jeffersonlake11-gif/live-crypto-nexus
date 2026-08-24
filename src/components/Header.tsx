import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, ChevronDown, ArrowDownUp, ShieldCheck, Activity, Zap } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { NETWORKS, PAIRS, BRAND, fmt, pnlColor, fmtCompact } from '../constants';

export default function Header({ onDeposit }: { onDeposit: () => void }) {
  const { networkId, setNetworkId, pair, setPair, feeds, accountEquity, paper, togglePaper, balances } = useTrading();
  const [netOpen, setNetOpen] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const livePrice = feeds[pair.id] ?? pair.price;
  const net = NETWORKS.find((n) => n.id === networkId)!;
  const totalUsd = balances.reduce((a, b) => a + b.usdValue, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#0a0c14]/90 backdrop-blur-lg">
      <div className="flex h-14 items-center gap-3 px-3">
        <div className="flex items-center gap-2 pr-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-zinc-950">
            <Zap className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-tight text-zinc-100">{BRAND}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Multi-chain desk</div>
          </div>
        </div>

        {/* Market pair switcher */}
        <div className="relative">
          <button onClick={() => { setPairOpen(!pairOpen); setNetOpen(false); }} className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm font-semibold text-zinc-100 hover:border-zinc-600">
            <Bitcoin className="h-4 w-4 text-[#f7931a]" />
            {pair.id}
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </button>
          <AnimatePresence>
            {pairOpen && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 top-11 w-56 rounded-xl border border-zinc-700/60 bg-[#12141f] p-1 shadow-2xl">
                {PAIRS.map((p) => {
                  const v = feeds[p.id] ?? p.price;
                  const change = v > (p.price * 0.999) ? p.change24h : p.change24h;
                  return (
                    <button key={p.id} onClick={() => { setPair(p.id); setPairOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-zinc-800">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{p.id}</div>
                        <div className="text-[10px] text-zinc-500">{NETWORKS.find((n) => n.id === p.network)?.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-200">${fmt(v)}</div>
                        <div className={`text-xs ${pnlColor(change)}`}>{change > 0 ? '+' : ''}{change}%</div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live price */}
        <div className="hidden md:flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-lg font-bold ${pnlColor(livePrice - pair.price)}`}>${fmt(livePrice)}</span>
            <span className={`text-xs ${pnlColor(pair.change24h)}`}>{pair.change24h > 0 ? '▲' : '▼'} {Math.abs(pair.change24h)}%</span>
          </div>
          <div className="text-[10px] text-zinc-500">Funding {pair.fundingRate}% · Vol {fmtCompact(pair.volume24h)}</div>
        </div>

        <div className="flex-1" />

        {/* Network switcher */}
        <div className="relative">
          <button onClick={() => { setNetOpen(!netOpen); setPairOpen(false); }} className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-100 hover:border-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full ${net.status === 'operational' ? 'animate-ping bg-emerald-400/60' : 'bg-amber-400/60'}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${net.status === 'operational' ? 'bg-emerald-400' : net.status === 'degraded' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
            </span>
            <span className="font-medium">{net.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </button>
          <AnimatePresence>
            {netOpen && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-11 w-64 rounded-xl border border-zinc-700/60 bg-[#12141f] p-1 shadow-2xl">
                {NETWORKS.map((n) => (
                  <button key={n.id} onClick={() => { setNetworkId(n.id); setNetOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-zinc-800">
                    <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-bold" style={{ background: n.color + '22', color: n.color }}>{n.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-zinc-100">{n.name} <span className="text-zinc-500">({n.short})</span></div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Activity className="h-3 w-3" /> {n.blockTime} · {n.gasToken} gas
                      </div>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${n.status === 'operational' ? 'bg-emerald-400' : n.status === 'degraded' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Equity + Paper toggle */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Equity</span>
          <span className="font-mono text-sm font-bold text-emerald-400">${fmt(accountEquity)}</span>
        </div>

        <button onClick={() => { setNetworkId; }} className="flex cursor-default items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-100">
          <ArrowDownUp className="h-4 w-4 text-zinc-400" />
          <span className="font-mono">${fmt(totalUsd)}</span>
        </button>

        <button onClick={togglePaper} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${paper ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40' : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40'}`}>
          <ShieldCheck className="h-3.5 w-3.5" />
          {paper ? 'Paper' : 'Live'}
          <span className={`ml-1 inline-flex h-1.5 w-1.5 rounded-full ${paper ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
        </button>

        <button onClick={onDeposit} className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 active:scale-[0.98]">
          Deposit
        </button>
      </div>
    </header>
  );
}