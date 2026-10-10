import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Bot, Sparkles, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

interface AiAssistantProps {
  analysis: AnalysisResult;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ analysis }) => {
  const [reportText, setReportText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const generateReport = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult: analysis }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setReportText(data.summary);
      } else {
        setErrorMsg(data.message || 'حدث خطأ أثناء توليد التقرير');
      }
    } catch (err: any) {
      setErrorMsg('تعذر الاتصال بخادم مساعد التداول الذكي');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              مساعد القرار الذكي (AI Decision Assistant)
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
                Gemini AI Powered
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              توليد تقرير تحليلي وتوجيهي شامل لتدقيق القرار قبل فتح الصفقة
            </p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={isLoading}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-950/50 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> جاري التفكير والتحليل...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> توليد تقرير مساعد القرار بالذكاء الاصطناعي
            </>
          )}
        </button>
      </div>

      {/* Non-Financial Advice Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-300/90 flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block text-amber-200 mb-0.5">تنبيه هام وميثاق الاستخدام:</strong>
          هذه الأداة مصممة خصيصاً لتكون <strong>مساعد قرار فني فقط (Decision Support Assistant)</strong>. الأدوات التحليلية والمؤشرات توفر احتمالات إحصائية ولا تضمن التوقع المؤكد في أسواق التداول. القرار النهائي ومسؤولية تنفيذ الصفقة تقع بالكامل على عاتق المتداول.
        </div>
      </div>

      {/* Report Content */}
      {reportText ? (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line space-y-3">
          {reportText}
        </div>
      ) : (
        <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
          <Sparkles className="w-8 h-8 text-slate-600 animate-bounce" />
          <p className="text-xs">
            انقر على زر "توليد تقرير مساعد القرار" ليقوم النموذج بتحليل بيانات Score الحالية للرمز{' '}
            <span className="text-emerald-400 font-bold">{analysis.symbol}</span> وتزويدك بتوصية مفصلة.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
