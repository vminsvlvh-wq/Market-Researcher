import React, { useState, useEffect } from 'react';
import { AnalysisResult, RiskCalculation } from '../types';
import { calculateRiskAndPositionSize } from '../utils/risk';
import { ShieldCheck, AlertOctagon, ArrowUpRight, DollarSign, Percent, Target } from 'lucide-react';

interface RiskCalculatorProps {
  analysis?: AnalysisResult;
  onLogTradeToJournal?: (tradeData: any) => void;
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  analysis,
  onLogTradeToJournal,
}) => {
  const [accountCapital, setAccountCapital] = useState<number>(5000);
  const [riskPercentage, setRiskPercentage] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(analysis?.currentPrice || 95000);
  const [stopLossPrice, setStopLossPrice] = useState<number>(
    analysis?.suggestedStopLoss || 93800
  );
  const [takeProfit1, setTakeProfit1] = useState<number>(
    analysis?.suggestedTakeProfits[0] || 96800
  );

  // Sync inputs if analysis changes
  useEffect(() => {
    if (analysis) {
      setEntryPrice(analysis.currentPrice);
      setStopLossPrice(analysis.suggestedStopLoss);
      setTakeProfit1(analysis.suggestedTakeProfits[0]);
    }
  }, [analysis]);

  const riskResult: RiskCalculation = calculateRiskAndPositionSize(
    accountCapital,
    riskPercentage,
    entryPrice,
    stopLossPrice,
    takeProfit1
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">حاسبة محرك إدارة المخاطر الإجبارية</h2>
            <p className="text-xs text-slate-400">
              حساب حجم الصفقة الدقيق الموصى به ومستويات الأرباح ووقف الخسارة لتفادي التصفية
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Parameters Form */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> مدخلات الصفقة وحجم المحفظة
          </h3>

          {/* Account Capital */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رأس مال الحساب المخصص للتداول ($)
            </label>
            <div className="relative">
              <input
                type="number"
                value={accountCapital}
                onChange={(e) => setAccountCapital(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                placeholder="5000"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">USDT</span>
            </div>
          </div>

          {/* Risk Percentage per Trade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              نسبة المخاطرة المسموحة في هذه الصفقة (%)
            </label>
            <div className="flex items-center gap-2">
              {[1, 1.5, 2, 3].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskPercentage(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    riskPercentage === r
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}%
                </button>
              ))}
              <input
                type="number"
                step="0.1"
                value={riskPercentage}
                onChange={(e) => setRiskPercentage(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono text-center focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Entry Price & Stop Loss */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                سعر الدخول ($)
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                وقف الخسارة SL ($)
              </label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Take Profit 1 Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              هدف جني الأرباح الأول TP1 ($)
            </label>
            <input
              type="number"
              step="any"
              value={takeProfit1}
              onChange={(e) => setTakeProfit1(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculated Results Display */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between gap-4">
          <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Target className="w-4 h-4" /> المخرجات والتوصية بالحجم الحسابي
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Position Size Quantity */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1 font-semibold">
                حجم الصفقة الموصى به (قطع)
              </span>
              <span className="text-xl font-mono font-black text-emerald-400">
                {riskResult.positionSizeQty}
              </span>
            </div>

            {/* Position Value USDT */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1 font-semibold">
                إجمالي قيمة الصفقة ($)
              </span>
              <span className="text-xl font-mono font-black text-slate-100">
                ${riskResult.positionValueUsdt.toLocaleString()}
              </span>
            </div>

            {/* Risk Amount USDT */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1 font-semibold">
                المبلغ المعرض للمخاطرة
              </span>
              <span className="text-lg font-mono font-bold text-rose-400">
                ${riskResult.riskAmountUsdt} ({riskPercentage}%)
              </span>
            </div>

            {/* Risk / Reward Ratio */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1 font-semibold">
                نسبة المخاطرة للمكافأة (R:R)
              </span>
              <span
                className={`text-lg font-mono font-bold ${
                  riskResult.riskRewardRatio >= 1.5 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                1 : {riskResult.riskRewardRatio}
              </span>
            </div>
          </div>

          {/* Target Levels Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-300">أهداف أرباح إضافية مقترحة:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TP1 (1:1.5)</span>
                <span className="text-emerald-400 font-bold">${riskResult.takeProfit1}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TP2 (1:2.5)</span>
                <span className="text-teal-400 font-bold">${riskResult.takeProfit2}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TP3 (1:4.0)</span>
                <span className="text-cyan-400 font-bold">${riskResult.takeProfit3}</span>
              </div>
            </div>
          </div>

          {/* Warnings Banner */}
          {riskResult.warnings.length > 0 && (
            <div className="bg-rose-950/50 border border-rose-800/80 rounded-xl p-3 text-xs text-rose-300 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" /> تنبيهات محرك إدارة المخاطر:
              </div>
              {riskResult.warnings.map((w, idx) => (
                <p key={idx} className="leading-relaxed">
                  • {w}
                </p>
              ))}
            </div>
          )}

          {/* Log Trade Button */}
          {onLogTradeToJournal && (
            <button
              onClick={() =>
                onLogTradeToJournal({
                  symbol: analysis?.symbol || 'BTC/USDT',
                  type: 'BUY',
                  entryPrice,
                  stopLoss: stopLossPrice,
                  takeProfit: takeProfit1,
                  positionSize: riskResult.positionSizeQty,
                  scoreAtEntry: analysis?.totalScore || 75,
                })
              }
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50"
            >
              <ArrowUpRight className="w-4 h-4" /> إضافة هذه الصفقة لدفتر التداول المحاكى
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
