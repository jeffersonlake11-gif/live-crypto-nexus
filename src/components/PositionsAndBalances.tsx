import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, Download, Upload, X, RefreshCw, Boxes } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { NETWORKS, fmt, pnlColor, fmtCompact } from '../constants';

type Tab = 'positions' | 'orders' | 'history' | 'portfolio';

export default function PositionsAndBalances() {
  const { positions, orders, closePosition, cancelOrder, trades, balances, pair, feeds, execute } = useTrading();
  const [tab, setTab] = useState<Tab>('positions');
  const [swapOpen, setSwapOpen] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'positions', label: `Positions (${positions.length})` },
    { id: 'orders', label: `Open Orders (${orders.length})` },
    { id: 'history', label: 'Trade History' },
    { id: 'portfolio', label: `Multi-Chain Portfolio (${balances.length})` },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-800 bg-[#0d0f18]">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-1 py-0.5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.label}</button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        <AnimatePresence mode="wait">
          {tab === 'positions' && (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {positions.length === 0 ? (
                <EmptyState title="No open positions" sub="Place a long or short order to open a leveraged position." />
              ) : (
                <div className="space-y-1.5">
                  {positions.map((p) => {
                    const mid = feeds[p.pair] ?? pair.price;
                    const pnl = ((mid - p.entryPrice) / p.entryPrice) * p.size * (p.side === 'long' ? 1 : -1);
                    const pnlPct = ((mid - p.entryPrice) / p.entryPrice) * 100 * (p.side === 'long' ? 1 : -1) * p.leverage;
                    return (
                      <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${p.side === 'long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>{p.side.toUpperCase()}</span>
                            <span className="text-sm font-bold text-zinc-100">{p.pair}</span>
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{p.leverage}x</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono text-sm font-bold ${pnlColor(pnl)}`}>${fmt(pnl)}{pnl >= 0 ? ' ▲' : ' ▼'}</div>
                            <div className={`font-mono text-[10px] ${pnlColor(pnl)}`}>{fmt(pnlPct)}%</div>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2 font-mono text-[10px] text-zinc-500">
                          <div><div className="text-zinc-500">Entry</div><div className="text-zinc-300">${fmt(p.entryPrice)}</div></div>
                          <div><div className="text-zinc-500">Mark</div><div className="text-zinc-300">${fmt(mid)}</div></div>
                          <div><div className="text-zinc-500">Liq. Price</div><div className="text-rose-400">${fmt(p.liquidationPrice)}</div></div>
                          <div><div className="text-zinc-500">Margin</div><div className="text-zinc-300">${fmt(p.margin)}</div></div>
                        </div>
                        <button onClick={() => closePosition(p.id)} className="mt-2.5 w-full rounded-lg bg-zinc-800 py-1.5 text-xs font-bold text-zinc-200 hover:bg-rose-500 hover:text-zinc-950 active:scale-[0.98]">
                          Close Position
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'orders' && (
            <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {orders.length === 0 ? (
                <EmptyState title="No open orders" sub="Limit and stop orders you place will appear here." />
              ) : (
                <div className="space-y-1.5">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${o.side === 'long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>{o.side === 'long' ? 'BUY' : 'SELL'}</span>
                          <span className="text-sm font-semibold text-zinc-100">{o.pair}</span>
                          <span className="text-[10px] capitalize text-zinc-500">{o.type} · {o.leverage}x</span>
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-400">{o.type === 'market' ? 'Market' : `Price $${fmt(o.price)}`}{o.triggerPrice ? ` · Trigger $${fmt(o.triggerPrice)}` : ''} · Size {fmt(o.remaining, 2)} USDT</div>
                      </div>
                      <button onClick={() => cancelOrder(o.id)} className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {trades.length === 0 ? (
                <EmptyState title="No trades yet" sub="Your executed trades will stream here in real time." />
              ) : (
                <div className="space-y-1">
                  {trades.slice(0, 30).map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-zinc-900/30 px-3 py-1.5 font-mono text-xs">
                      <span className={t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>{t.side === 'buy' ? 'BUY' : 'SELL'}</span>
                      <span className="text-zinc-300">${fmt(t.price)}</span>
                      <span className="text-zinc-400">{t.size.toFixed(3)}</span>
                      <span className="text-[10px] text-zinc-600">{new Date(t.time).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'portfolio' && (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-end pb-2">
                <button onClick={() => setSwapOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:opacity-90 active:scale-[0.98]">
                  <ArrowDownUp className="h-3.5 w-3.5" /> Cross-Chain Bridge
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {balances.map((b) => {
                  const net = NETWORKS.find((n) => n.id === b.network)!;
                  const isNative = net.gasToken === b.symbol;
                  return (
                    <div key={b.network} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold" style={{ background: net.color + '22', color: net.color }}>{net.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-zinc-100">{b.symbol}</div>
                          <div className="text-[10px] text-zinc-500">{b.token} · {net.name}</div>
                        </div>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${isNative ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>{isNative ? 'Native gas' : 'Token'}</span>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="font-mono text-lg font-bold text-zinc-100">{fmt(b.balance, 4)}</div>
                          <div className="font-mono text-xs text-zinc-500">≈ ${fmt(b.usdValue)}</div>
                        </div>
                      </div>
                      <div className="mt-2 font-mono text-[10px] text-zinc-600">{b.address.slice(0, 6)}…{b.address.slice(-4)}</div>
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <button className="flex items-center justify-center gap-1 rounded-lg bg-zinc-800 py-1.5 text-[11px] font-semibold text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-400"><Download className="h-3 w-3" /> Deposit</button>
                        <button className="flex items-center justify-center gap-1 rounded-lg bg-zinc-800 py-1.5 text-[11px] font-semibold text-zinc-300 hover:bg-rose-500/20 hover:text-rose-400"><Upload className="h-3 w-3" /> Withdraw</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {swapOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSwapOpen(false)}>
                  <div className="w-full max-w-md rounded-2xl border border-zinc-700/60 bg-[#12141f] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-100"><Boxes className="h-5 w-5 text-emerald-400" /> Cross-Chain Bridge</h3>
                      <button onClick={() => setSwapOpen(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-3">
                      <SwapRow label="From" fromDefault={balances[0]} direction={false} />
                      <div className="grid place-items-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><ArrowDownUp className="h-4 w-4" /></span></div>
                      <SwapRow label="To" fromDefault={balances[1]} direction delayPct={0} />
                    </div>
                    <button onClick={() => { setSwapOpen(false); execute({ side: 'long', type: 'market', size: 100, leverage: 1, marginMode: 'isolated' }); }} className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-zinc-950 hover:opacity-90 active:scale-[0.98]">
                      Bridge Assets
                    </button>
                    <p className="mt-2 text-center text-[10px] text-zinc-600">Instant bridge across BTC, Ethereum, Solana, Arbitrum, BNB and Polygon.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SwapRow({ label, fromDefault, direction, delayPct }: { label: string; fromDefault: WalletLike; direction: boolean; delayPct?: number }) {
  void fromDefault; void direction; void delayPct;
  const { balances } = useTrading();
  const bal = balances[0];
  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-3">
      <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="flex items-center gap-2">
        <input defaultValue={bal ? fmt(bal.balance, 4) : ''} className="min-w-0 flex-1 bg-transparent font-mono text-xl font-bold text-zinc-100 outline-none" />
        <span className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-sm font-semibold text-zinc-100">
          <span style={{ color: NETWORKS.find((n) => n.id === bal?.network)?.color }}>{NETWORKS.find((n) => n.id === bal?.network)?.icon ?? '₿'}</span>
          <span>{bal ? bal.symbol : 'BTC'}</span>
          <RefreshCw className="h-3 w-3 text-zinc-500" />
        </span>
      </div>
      <div className="mt-1 text-[10px] text-zinc-600">Balance {bal ? fmt(bal.usdValue) : '0'} USDT · Network: {NETWORKS.find((n) => n.id === bal?.network)?.name}</div>
    </div>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-zinc-900 border border-zinc-800">
        <Boxes className="h-6 w-6 text-zinc-600" />
      </div>
      <div className="text-sm font-semibold text-zinc-300">{title}</div>
      <div className="mt-1 max-w-[26ch] text-xs text-zinc-600">{sub}</div>
    </div>
  );
}

type WalletLike = { network: string }; // eslint-disable-line