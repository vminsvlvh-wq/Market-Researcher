import React from 'react';
import { Activity, ShieldCheck, Bot, BookOpen, FileCode2, RefreshCw, Layers, Bell } from 'lucide-react';
import { MarketTicker } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tickers: MarketTicker[];
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tickers,
  selectedSymbol,
  setSelectedSymbol,
  isRefreshing,
  onRefresh,
}) => {
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT'];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      {/* Top Bar / Brand */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              نبض السوق <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 font-normal">Market Pulse v1.0</span>
            </h1>
            <p className="text-xs text-slate-400">مساعد قرار التداول واستراتيجيات التحليل الفني</p>
          </div>
        </div>

        {/* Quick Symbol Selector & Refresh Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {symbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            title="تحديث البيانات الفنية"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Live Ticker Marquee */}
      <div className="bg-slate-950/80 border-t border-b border-slate-800/80 py-1.5 px-4 overflow-x-auto text-xs scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-6 min-w-max">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            الأسواق المباشرة:
          </span>
          {tickers.map((ticker) => {
            const isPositive = ticker.change24h >= 0;
            return (
              <button
                key={ticker.symbol}
                onClick={() => setSelectedSymbol(ticker.symbol)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-colors ${
                  selectedSymbol === ticker.symbol
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <span className="font-semibold">{ticker.name}</span>
                <span className="font-mono">${ticker.price.toLocaleString()}</span>
                <span
                  className={`font-mono text-[11px] px-1 rounded ${
                    isPositive
                      ? 'text-emerald-400 bg-emerald-950/50'
                      : 'text-rose-400 bg-rose-950/50'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {ticker.change24h}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'analysis'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>لوحة النتيجة والتحليل (Score)</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'risk'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>حاسبة إدارة المخاطر</span>
        </button>

        <button
          onClick={() => setActiveTab('backtest')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'backtest'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الاختبار الخلفي (Backtest)</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>التنبيهات وتصدير الإشارات</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>مساعد القرار الذكي AI</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'journal'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>دفتر التداول المحاكى</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'docs'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>التوثيق، الخوارزمية و API</span>
        </button>
      </nav>
    </header>
  );
};
