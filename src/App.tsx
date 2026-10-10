import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ScoreGauge } from './components/ScoreGauge';
import { PriceChart } from './components/PriceChart';
import { RiskCalculator } from './components/RiskCalculator';
import { AiAssistant } from './components/AiAssistant';
import { TradingJournal } from './components/TradingJournal';
import { PseudocodeAndDocs } from './components/PseudocodeAndDocs';
import { BacktestPanel } from './components/BacktestPanel';
import { AlertsAndSignalExporter } from './components/AlertsAndSignalExporter';
import { MarketTicker, AnalysisResult, Candle, Timeframe } from './types';
import { AlertCircle, RefreshCw, Zap, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('analysis');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('15m');

  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Tickers
  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch('/api/market/ticker');
      const data = await res.json();
      if (data.status === 'ok') {
        setTickers(data.tickers);
      }
    } catch (err) {
      console.error('Failed to load tickers:', err);
    }
  }, []);

  // Fetch Analysis & Candles
  const fetchAnalysisData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/market/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol, timeframe: selectedTimeframe }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setAnalysis(data.analysis);
        setCandles(data.candles);
      } else {
        setError(data.message || 'فشل تحميل بيانات التحليل الفني');
      }
    } catch (err: any) {
      console.error('Failed to fetch market analysis:', err);
      setError('تعذر الاتصال بمركز معالجة بيانات السوق الحية');
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    fetchTickers();
    fetchAnalysisData();

    // Auto-refresh tickers every 20 seconds
    const interval = setInterval(() => {
      fetchTickers();
      fetchAnalysisData();
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchTickers, fetchAnalysisData]);

  const handleLogTradeToJournal = async (tradeData: any) => {
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tradeData,
          status: 'OPEN',
          notes: `تم فتح الصفقة تلقائياً من حاسبة مخاطر ${selectedSymbol} عند Score ${analysis?.totalScore || 75}`,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setActiveTab('journal');
      }
    } catch (err) {
      console.error('Error logging trade:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl antialiased selection:bg-emerald-500 selection:text-slate-950 pb-16">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tickers={tickers}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        isRefreshing={isRefreshing}
        onRefresh={fetchAnalysisData}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchAnalysisData}
              className="bg-rose-900 hover:bg-rose-800 text-white px-3 py-1 rounded text-xs font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* TAB 1: Main Analysis & Score Gauge & Price Chart */}
        {activeTab === 'analysis' && analysis && (
          <div className="flex flex-col gap-6">
            {/* Top Score Gauge Widget */}
            <ScoreGauge analysis={analysis} />

            {/* Price & Indicator Interactive Chart */}
            <PriceChart
              candles={candles}
              analysis={analysis}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
            />

            {/* Quick S/R & Trade Target Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-slate-400 font-sans font-bold text-[11px]">
                  مستوى الدعم الرئيسي (Support)
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  ${analysis.closestSupport}
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  يعتبر هذا المستوى منطقة ارتكاز مثالية لوضع طلبات الشراء أو وقف الخسارة.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5">
                <span className="text-slate-400 font-sans font-bold text-[11px]">
                  مستوى المقاومة الرئيسية (Resistance)
                </span>
                <span className="text-xl font-bold text-rose-400">
                  ${analysis.closestResistance}
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  منطقة جني أرباح مبكرة أو احتمال ارتداد هابط عند الاصطدام بها.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 justify-between">
                <div>
                  <span className="text-slate-400 font-sans font-bold text-[11px]">
                    الأهداف ووقف الخسارة التلقائي
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-rose-400 font-bold">SL: ${analysis.suggestedStopLoss}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-emerald-400 font-bold">TP1: ${analysis.suggestedTakeProfits[0]}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('risk')}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-sans font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1 mt-2 border border-slate-700 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" /> انتقال لحاسبة إدارة المخاطر وتحديد القيمة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Risk Calculator */}
        {activeTab === 'risk' && (
          <RiskCalculator
            analysis={analysis || undefined}
            onLogTradeToJournal={handleLogTradeToJournal}
          />
        )}

        {/* TAB 3: Backtest Engine */}
        {activeTab === 'backtest' && (
          <BacktestPanel
            currentSymbol={selectedSymbol}
            currentTimeframe={selectedTimeframe}
          />
        )}

        {/* TAB 4: Alerts & Signal Exporter */}
        {activeTab === 'alerts' && analysis && (
          <AlertsAndSignalExporter analysisResult={analysis} />
        )}

        {/* TAB 5: Gemini AI Decision Assistant */}
        {activeTab === 'ai' && analysis && <AiAssistant analysis={analysis} />}

        {/* TAB 6: Trading Journal */}
        {activeTab === 'journal' && <TradingJournal />}

        {/* TAB 7: Architectural Documentation, Pseudocode & API */}
        {activeTab === 'docs' && <PseudocodeAndDocs />}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6">
        <p>
          نبض السوق (Market Pulse) - مساعد قرار وتأكيد استراتيجيات التداول © 2026.
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          إخلاء مسؤولية: التداول يحتوي على مخاطر عالية. هذه الأداة مخصصة كـ "مساعد قرار" فني وتحليلي فقط وليست نصيحة استثمارية مؤكدة.
        </p>
      </footer>
    </div>
  );
}
