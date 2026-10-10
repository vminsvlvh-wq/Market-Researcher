import React, { useState, useEffect } from 'react';
import { Share2, Bell, Copy, Check, Send, Plus, Trash2, Smartphone, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { AnalysisResult, TradingAlert, Timeframe } from '../types';

interface AlertsAndSignalExporterProps {
  analysisResult: AnalysisResult;
}

export const AlertsAndSignalExporter: React.FC<AlertsAndSignalExporterProps> = ({ analysisResult }) => {
  const [telegramText, setTelegramText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Alerts State
  const [alerts, setAlerts] = useState<TradingAlert[]>([]);
  const [alertType, setAlertType] = useState<'SCORE_ABOVE' | 'SCORE_BELOW' | 'PRICE_LEVEL'>('SCORE_ABOVE');
  const [targetValue, setTargetValue] = useState<number>(75);
  const [alertChannel, setAlertChannel] = useState<'telegram' | 'email' | 'push'>('telegram');
  const [isSavingAlert, setIsSavingAlert] = useState<boolean>(false);

  // Load Alerts
  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.status === 'ok') {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Generate Telegram Formatted Signal
  const generateSignalExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/signals/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTelegramText(data.formattedTelegramText);
      }
    } catch (err) {
      console.error('Error exporting signal:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    generateSignalExport();
  }, [analysisResult]);

  const copyToClipboard = () => {
    if (!telegramText) return;
    navigator.clipboard.writeText(telegramText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddAlert = async () => {
    setIsSavingAlert(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: analysisResult.symbol,
          timeframe: analysisResult.timeframe,
          type: alertType,
          targetValue,
          channel: alertChannel,
        }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Error adding alert:', err);
    } finally {
      setIsSavingAlert(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'ok') {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Telegram Signal Exporter */}
      <div id="card-telegram-exporter" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-base">تصدير إشارة تلغرام المنسقة</h3>
            </div>
            <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full text-xs font-semibold">
              Telegram Format
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            نسخ إشارة التداول الحالية بصيغة منسقة ومجهزة ومناسبة للنشر المباشر في القنوات أو المجموعات:
          </p>

          <div className="relative">
            <textarea
              readOnly
              rows={9}
              value={telegramText}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none resize-none"
            />
            <button
              id="btn-copy-signal"
              onClick={copyToClipboard}
              className="absolute top-3 left-3 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> تم النسخ!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> نسخ الإشارة
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>حالة الإشارة: Score {analysisResult.totalScore}/100</span>
          <span>رمز الزوج: {analysisResult.symbol}</span>
        </div>
      </div>

      {/* 2. Automated Alerts Manager */}
      <div id="card-alerts-manager" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">إدارة التنبيهات الذكية (Trading Alerts)</h3>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">
              Live Monitor
            </span>
          </div>

          {/* Add Alert Form */}
          <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4">
            <span className="text-xs font-semibold text-slate-300 block">إضافة تنبيه جديد لـ {analysisResult.symbol}</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={alertType}
                onChange={(e: any) => setAlertType(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="SCORE_ABOVE">النتيجة تتجاوز (Score &gt;)</option>
                <option value="SCORE_BELOW">النتيجة تنخفض (Score &lt;)</option>
                <option value="PRICE_LEVEL">السعر يلامس مستوى ($)</option>
              </select>

              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                placeholder="القيمة المستهدفة"
                className="bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-2 focus:outline-none"
              />

              <select
                value={alertChannel}
                onChange={(e: any) => setAlertChannel(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="telegram">Telegram Bot</option>
                <option value="email">البريد الإلكتروني</option>
                <option value="push">تنبيه المتصفح (Push)</option>
              </select>
            </div>

            <button
              id="btn-add-alert"
              onClick={handleAddAlert}
              disabled={isSavingAlert}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> حفظ التنبيه الذكي
            </button>
          </div>

          {/* Active Alerts List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-slate-400 block mb-1">التنبيهات المفعّلة ({alerts.length})</span>
            {alerts.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-4 bg-slate-950/30 rounded-lg">
                لا توجد تنبيهات مفعّلة حالياً.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-white font-mono">{alt.symbol}</span>
                      <span className="text-slate-400 text-[11px] block">
                        {alt.type === 'SCORE_ABOVE' ? `Score > ${alt.targetValue}` : alt.type === 'SCORE_BELOW' ? `Score < ${alt.targetValue}` : `السعر = $${alt.targetValue}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] uppercase">
                      {alt.channel}
                    </span>
                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
