import React, { useState, useEffect } from 'react';
import { TradeJournalEntry } from '../types';
import { BookOpen, PlusCircle, Trash2, TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';

export const TradingJournal: React.FC = () => {
  const [journal, setJournal] = useState<TradeJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState<number>(95000);
  const [exitPrice, setExitPrice] = useState<number>(96500);
  const [stopLoss, setStopLoss] = useState<number>(93800);
  const [takeProfit, setTakeProfit] = useState<number>(96500);
  const [positionSize, setPositionSize] = useState<number>(0.1);
  const [status, setStatus] = useState<'WIN' | 'LOSS' | 'OPEN'>('WIN');
  const [notes, setNotes] = useState('');

  const fetchJournal = async () => {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (data.status === 'ok') {
        setJournal(data.journal);
      }
    } catch (err) {
      console.error('Error fetching journal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          type,
          entryPrice,
          exitPrice,
          stopLoss,
          takeProfit,
          positionSize,
          status,
          notes,
          scoreAtEntry: 75,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setJournal(data.journal);
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to save trade:', err);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'ok') {
        setJournal(data.journal);
      }
    } catch (err) {
      console.error('Failed to delete trade:', err);
    }
  };

  // Metrics
  const totalTrades = journal.length;
  const wins = journal.filter((t) => t.status === 'WIN').length;
  const losses = journal.filter((t) => t.status === 'LOSS').length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const totalPnl = journal.reduce((acc, t) => acc + (t.pnlUsdt || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">دفتر سجل التداول المحاكى (Trading Journal)</h2>
            <p className="text-xs text-slate-400">
              تسجيل وتتبع أداء الصفقات المفتوحة والمنتهية لحساب نسبة النجاح (Win Rate)
            </p>
          </div>
        </div>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">إجمالي الصفقات</span>
            <span className="text-2xl font-mono font-bold text-slate-100">{totalTrades}</span>
          </div>
          <BookOpen className="w-6 h-6 text-slate-600" />
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">نسبة النجاح (Win Rate)</span>
            <span className="text-2xl font-mono font-bold text-emerald-400">{winRate}%</span>
          </div>
          <Award className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">الصفقات الناجحة / الخاسرة</span>
            <span className="text-lg font-mono font-bold text-slate-200">
              <span className="text-emerald-400">{wins}W</span> / <span className="text-rose-400">{losses}L</span>
            </span>
          </div>
          <TrendingUp className="w-6 h-6 text-teal-500" />
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">صافي الأرباح PnL ($)</span>
            <span
              className={`text-2xl font-mono font-bold ${
                totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ${totalPnl.toFixed(2)}
            </span>
          </div>
          <DollarSign className="w-6 h-6 text-cyan-500" />
        </div>
      </div>

      {/* Add New Trade Form */}
      <form
        onSubmit={handleAddTrade}
        className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4"
      >
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-400" /> تسجيل صفقة جديدة في الدفتر
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">الزوج</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">سعر الدخول</label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">سعر الخروج</label>
            <input
              type="number"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">الحالة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
            >
              <option value="WIN">صفقة ناجحة (WIN)</option>
              <option value="LOSS">صفقة خاسرة (LOSS)</option>
              <option value="OPEN">قيد الانتظار (OPEN)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات سبب الدخول (مثال: دخول بعد تأكيد Score 80 واختراق الدعم)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
          />
          <button
            type="submit"
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0"
          >
            حفظ الصفقة
          </button>
        </div>
      </form>

      {/* Trades Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
              <th className="py-3 px-3">الزوج</th>
              <th className="py-3 px-3">النوع</th>
              <th className="py-3 px-3">سعر الدخول</th>
              <th className="py-3 px-3">سعر الخروج</th>
              <th className="py-3 px-3">الكمية</th>
              <th className="py-3 px-3">الربح / الخسارة PnL</th>
              <th className="py-3 px-3">النتيجة</th>
              <th className="py-3 px-3">ملاحظات</th>
              <th className="py-3 px-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {journal.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-slate-200">{trade.symbol}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold">
                    {trade.type}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono">${trade.entryPrice}</td>
                <td className="py-3 px-3 font-mono">${trade.exitPrice || '-'}</td>
                <td className="py-3 px-3 font-mono">{trade.positionSize}</td>
                <td
                  className={`py-3 px-3 font-mono font-bold ${
                    (trade.pnlUsdt || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {trade.pnlUsdt ? `$${trade.pnlUsdt.toFixed(2)}` : '-'}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      trade.status === 'WIN'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : trade.status === 'LOSS'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {trade.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{trade.notes || '-'}</td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => handleDeleteTrade(trade.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
