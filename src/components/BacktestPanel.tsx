import React, { useState } from 'react';
import { Play, TrendingUp, TrendingDown, ShieldAlert, DollarSign, Award, Percent, RefreshCw, Layers } from 'lucide-react';
import { Timeframe, BacktestResult } from '../types';

interface BacktestPanelProps {
  currentSymbol: string;
  currentTimeframe: Timeframe;
}

export const BacktestPanel: React.FC<BacktestPanelProps> = ({ currentSymbol, currentTimeframe }) => {
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktesting = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: currentSymbol,
          timeframe: currentTimeframe,
          initialCapital,
          riskPerTradePct: riskPerTrade,
        }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setResult(data.result);
      } else {
        setError(data.message || 'فشل في إجراء الاختبار الخلفي');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التوصيل بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="backtest-panel-card" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">محاكي الاختبار الخلفي (Backtesting Engine)</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            اختبار استراتيجية "نبض السوق" (Score System) على البيانات التاريخية لـ{' '}
            <span className="text-emerald-400 font-semibold">{currentSymbol}</span> ({currentTimeframe})
          </p>
        </div>

        <button
          id="btn-run-backtest"
          onClick={runBacktesting}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري تشغيل المحاكاة...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              بدء الاختبار الخلفي الان
            </>
          )}
        </button>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">رأس المال الأولي ($)</label>
          <div className="relative">
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Math.max(100, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">المخاطرة لكل صفقة (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Math.max(0.1, Math.min(10, Number(e.target.value))))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
            <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">قواعد الاستراتيجية</label>
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono">
            Score ≥ 68 → دخول شراء | SL/TP تلقائي
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results Overview */}
      {result ? (
        <div className="space-y-6">
          {/* Main KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">الصافي النهائي (Capital)</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                ${result.finalCapital.toLocaleString()}
              </div>
              <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${result.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.totalReturnPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {result.totalReturnPct >= 0 ? '+' : ''}{result.totalReturnPct}% عائد الاستراتيجية
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">نسبة النجاح (Win Rate)</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {result.winRatePct}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.winningTrades} رابحة / {result.losingTrades} خاسرة (من {result.totalTrades})
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">عامل الربحية (Profit Factor)</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {result.profitFactor}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                متوسط ربح ${result.averageWinUsdt} / خصر ${result.averageLossUsdt}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">أقصى تراجع (Max Drawdown)</span>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                -{result.maxDrawdownPct}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                مقابلة الشراء والاحتفاظ: {result.buyAndHoldReturnPct >= 0 ? '+' : ''}{result.buyAndHoldReturnPct}%
              </div>
            </div>
          </div>

          {/* Equity Curve Simple Visual */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-300">منحنى نمو المحفظة (Equity Curve)</span>
              <span className="text-xs text-slate-500">حساب الأرباح التراكمية مع كل صفقة مغلقة</span>
            </div>
            <div className="h-32 flex items-end gap-1 pt-4 px-2 border-b border-slate-800">
              {result.equityCurve.map((pt, idx) => {
                const minEq = Math.min(...result.equityCurve.map(e => e.equity)) * 0.95;
                const maxEq = Math.max(...result.equityCurve.map(e => e.equity)) * 1.05;
                const heightPct = Math.max(10, Math.min(100, ((pt.equity - minEq) / (maxEq - minEq || 1)) * 100));
                const isProfitable = pt.equity >= result.initialCapital;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t transition-all ${isProfitable ? 'bg-emerald-500/60 group-hover:bg-emerald-400' : 'bg-rose-500/60 group-hover:bg-rose-400'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] text-white font-mono pointer-events-none whitespace-nowrap z-20">
                      ${pt.equity}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade Log Table */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">سجل صفقات المحاكاة التاريخية ({result.trades.length})</h3>
            {result.trades.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm bg-slate-950/50 rounded-xl border border-slate-800">
                لم يتم إغلاق أي صفقات ضمن الشروط المحددة خلال نطاق البيانات الحالية.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">نوع الصفقة</th>
                      <th className="p-3">سعر الدخول</th>
                      <th className="p-3">سعر الخروج</th>
                      <th className="p-3">النتيجة (%)</th>
                      <th className="p-3">الأرباح ($)</th>
                      <th className="p-3">سبب الخروج</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {result.trades.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-emerald-400 font-bold">{tr.type}</td>
                        <td className="p-3 text-white">${tr.entryPrice}</td>
                        <td className="p-3 text-white">${tr.exitPrice}</td>
                        <td className={`p-3 font-bold ${tr.pnlPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tr.pnlPercentage >= 0 ? '+' : ''}{tr.pnlPercentage}%
                        </td>
                        <td className={`p-3 font-bold ${tr.pnlUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tr.pnlUsdt >= 0 ? '+' : ''}${tr.pnlUsdt}
                        </td>
                        <td className="p-3 text-slate-400">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${tr.reason === 'TAKE_PROFIT' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                            {tr.reason === 'TAKE_PROFIT' ? 'جني الأرباح (TP)' : 'وقف الخسارة (SL)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
          اضغط على <span className="text-emerald-400 font-semibold">"بدء الاختبار الخلفي"</span> لتشغيل المحاكاة واستخراج نسبة النجاح والنتائج.
        </div>
      )}
    </div>
  );
};
