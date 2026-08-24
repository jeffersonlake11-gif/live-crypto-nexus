import React, { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { QrCode, X, ShieldCheck, Cpu, Clock, Activity } from 'lucide-react';
import { TradingProvider } from './context/TradingContext';
import Header from './components/Header';
import TradingTerminal from './components/TradingTerminal';
import OrderForm from './components/OrderForm';
import PositionsAndBalances from './components/PositionsAndBalances';
import { NETWORKS, BRAND, ASSETS } from './constants';

function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [netId, setNetId] = useState('btc');
  const [amt, setAmt] = useState('');
  const net = NETWORKS.find((n) => n.id === netId)!;
  const addr = net.chainId
    ? `0x${net.id}${'a'.repeat(24)}${Math.floor(Math.random() * 0xffff).toString(16)}`
    : `bc1q${net.id}${'x'.repeat(20)}${Math.floor(Math.random() * 0xffff).toString(16)}`;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-700/60 bg-[#12141f] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-100">Deposit to <span style={{ color: net.color }}>{net.name}</span></h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NETWORKS.map((n) => (
            <button key={n.id} onClick={() => setNetId(n.id)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${netId === n.id ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
              <span className="mr-1">{n.icon}</span>{n.short}
            </button>
          ))}
        </div>
        <div className="mt-4 grid place-items-center rounded-xl border border-zinc-700/60 bg-white/5 p-5">
          <div className="grid h-40 w-40 place-items-center rounded-lg bg-white text-zinc-900">
            <QrCode className="h-28 w-28" strokeWidth={1.5} />
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-zinc-900/60 p-2.5 font-mono text-xs text-zinc-300">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Network address</div>
          <div className="mt-1 break-all">{addr}</div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-900/60 p-2.5">
          <span className="text-sm text-zinc-400">Amount ({net.gasToken})</span>
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0" className="w-32 bg-transparent text-right font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600" />
        </div>
        <div className="mt-3 flex gap-2">
          <input placeholder="Memo / Tag (optional)" className="flex-1 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50" />
          <button onClick={() => { toast.success(`Deposit request queued on ${net.name}`); onClose(); }} className="rounded-lg bg-emerald-500 px-4 text-sm font-bold text-zinc-950 hover:bg-emerald-400 active:scale-[0.98]">Confirm</button>
        </div>
        <p className="mt-2 text-center text-[10px] text-zinc-600">Only send {net.gasToken} on the {net.name} network. Deposits confirm after ~{net.blockTime}.</p>
      </div>
    </div>
  );
}

function App() {
  const [deposit, setDeposit] = useState(false);

  return (
    <TradingProvider>
      <div className="flex min-h-[100dvh] flex-col bg-[#0a0c14] text-zinc-100">
        <Header onDeposit={() => setDeposit(true)} />

        {/* Stats strip */}
        <div className="flex items-center gap-5 border-b border-zinc-800/70 bg-[#0d0f18] px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-zinc-500">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" /> <span className="font-semibold text-emerald-400">Futures</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap text-[11px]">
            {ASSETS.slice(0, 5).map((a) => (
              <span key={a.symbol} className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-300">{a.symbol}</span>
                <span className="font-mono text-zinc-400">${a.price.toLocaleString()}</span>
                <span className={`font-mono ${a.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{a.change24h >= 0 ? '▲' : '▼'} {Math.abs(a.change24h)}%</span>
              </span>
            ))}
          </div>
          <div className="ml-auto hidden items-center gap-1.5 whitespace-nowrap text-[11px] text-zinc-500 md:flex">
            <Clock className="h-3.5 w-3.5" /> 24h Vol <span className="font-mono text-zinc-300">$72.4B</span>
            <span className="mx-1.5 h-3 w-px bg-zinc-700" />
            <Activity className="h-3.5 w-3.5 text-emerald-400" /> <span className="text-emerald-400">Operational</span>
          </div>
        </div>

        {/* Main trading layout */}
        <main className="grid flex-1 min-h-0 grid-cols-1 gap-2 p-2 lg:grid-cols-[1fr_310px]">
          <div className="flex min-h-0 flex-col gap-2">
            <div className="min-h-0 flex-[1.4] overflow-hidden rounded-lg border border-zinc-800 bg-[#0d0f18]">
              <TradingTerminal />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-[#0d0f18]">
              <PositionsAndBalances />
            </div>
          </div>
          <div className="min-h-0 overflow-hidden rounded-lg border border-zinc-800 bg-[#0d0f18] lg:h-auto">
            <OrderForm />
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 bg-[#0d0f18] px-5 py-2.5 text-[11px] text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Paper trading is active by default. Switch to <span className="text-emerald-400">Live</span> in the header to execute real orders.</span>
          </div>
          <div className="font-mono">© {new Date().getFullYear()} {BRAND} · BTC · ETH · SOL · ARB · BNB · POL</div>
        </footer>
      </div>
      <DepositModal open={deposit} onClose={() => setDeposit(false)} />
      <Toaster position="top-center" theme="dark" richColors />
    </TradingProvider>
  );
}

export default App;