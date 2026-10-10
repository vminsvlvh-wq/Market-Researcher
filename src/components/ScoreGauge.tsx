import React from 'react';
import { AnalysisResult, DecisionType } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface ScoreGaugeProps {
  analysis: AnalysisResult;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ analysis }) => {
  const { totalScore, decision, scoreBreakdown } = analysis;

  const getDecisionBadge = (dec: DecisionType) => {
    switch (dec) {
      case 'STRONG_BUY':
        return {
          label: 'شراء قوي (STRONG BUY)',
          bg: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
          gaugeColor: '#10b981',
          desc: 'توافق كامل بين جميع المؤشرات الفنية لصالح الاتجاه الصاعد مع سيولة داعمة.',
        };
      case 'BUY':
        return {
          label: 'شراء (BUY)',
          bg: 'bg-teal-500/20 border-teal-500 text-teal-300',
          gaugeColor: '#14b8a6',
          desc: 'إشارات إيجابية ترجح كفة المشترين مع درجة مخاطرة مقبولة.',
        };
      case 'WAIT':
        return {
          label: 'انتظار / حياد (WAIT)',
          bg: 'bg-amber-500/20 border-amber-500 text-amber-300',
          gaugeColor: '#f59e0b',
          desc: 'تضارب بين إشارات المؤشرات الفنية أو تذبذب عرضي - يوصى بالانتظار.',
        };
      case 'SELL':
        return {
          label: 'بيع (SELL)',
          bg: 'bg-rose-500/20 border-rose-500 text-rose-300',
          gaugeColor: '#f43f5e',
          desc: 'ضغط بيعي وتدهور الزخم مع كسر متوسطات متحركة رئيسية.',
        };
      case 'STRONG_SELL':
        return {
          label: 'بيع قوي (STRONG SELL)',
          bg: 'bg-red-600/30 border-red-500 text-red-200',
          gaugeColor: '#dc2626',
          desc: 'تحذير شديد: سيطرة كاملة للبائعين وكسر مستويات الدعم الهامة.',
        };
    }
  };

  const decisionInfo = getDecisionBadge(decision);

  // SVG Gauge Math
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-6">
      {/* Header & Main Gauge */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
        {/* Semi Circle Gauge Widget */}
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 110">
            {/* Background Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Filled Score Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={decisionInfo.gaugeColor}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text Score */}
          <div className="absolute bottom-2 text-center">
            <span className="text-4xl font-black font-mono text-slate-100 tracking-tight">
              {totalScore}
            </span>
            <span className="text-xs text-slate-400 block font-medium">من 100</span>
          </div>
        </div>

        {/* Decision Summary Banner */}
        <div className="flex-1 text-center lg:text-right flex flex-col gap-2">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <span
              className={`px-4 py-1.5 rounded-full border text-sm font-bold shadow-md ${decisionInfo.bg}`}
            >
              {decisionInfo.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              رمز: <span className="text-slate-200 font-semibold">{analysis.symbol}</span> | {analysis.timeframe}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {decisionInfo.desc}
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-1 text-xs text-slate-400">
            <span>
              السعر الحالي: <strong className="text-emerald-400 font-mono">${analysis.currentPrice}</strong>
            </span>
            <span>
              وقف الخسارة المقترح: <strong className="text-rose-400 font-mono">${analysis.suggestedStopLoss}</strong>
            </span>
            <span>
              هدف TP1 المقترح: <strong className="text-teal-400 font-mono">${analysis.suggestedTakeProfits[0]}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Score Components Breakdown Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <span>تفاصيل تفكيك درجة الـ Score (مساهمة المؤشرات الخمسة)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreBreakdown.map((item, idx) => {
            const pct = Math.round((item.score / item.maxScore) * 100);
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.status === 'bullish' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : item.status === 'bearish' ? (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <span className="font-semibold text-xs text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {item.score} / {item.maxScore} pts
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      item.status === 'bullish'
                        ? 'bg-emerald-500'
                        : item.status === 'bearish'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
