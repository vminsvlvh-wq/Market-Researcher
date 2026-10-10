import React from 'react';
import { FileCode2, Database, Network, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export const PseudocodeAndDocs: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-8 text-slate-200">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <FileCode2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            وثيقة الهندسة المعمارية واستراتيجية أداة "نبض السوق"
          </h2>
          <p className="text-xs text-slate-400">
            الشرح الكامل للاختيارات الاستراتيجية، المعادلة الرياضية للـ Score، قاعدة البيانات، API، و Pseudocode
          </p>
        </div>
      </div>

      {/* Section 1 & 2: Market Selection & Trading Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 1. السوق المختار وتبرير الاختيار
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>السوق المختار:</strong> سوق العملات الرقمية (Crypto Market - BTC/USDT, ETH/USDT, SOL/USDT).
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong>بيانات حية 24/7:</strong> سيولة متصلة عبر Binance REST & WebSocket APIs بدون توقف.</li>
            <li><strong>احجام سيولة ضخمة (High Volume):</strong> مثالية لتطبيق مؤشر Volume Spike ومؤشرات الزخم.</li>
            <li><strong>فرص سكالبينج متكررة:</strong> تقلبات سريعة واضحة الاستجابة للمستويات الفنية.</li>
          </ul>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 2. نوع التداول المعتمد والأطر الزمنية
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>النوع المختار:</strong> التداول اليومي والسكالبينج السريع (Day Trading & Scalping).
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong>أطر التنفيذ الدقيق (Execution):</strong> 1m, 5m, 15m لالتقاط نقاط الدخول والخروج.</li>
            <li><strong>أطر تحديد الاتجاه (Trend Context):</strong> 1h, 4h, 1d لضمان عدم التداول عكس الاتجاه العام.</li>
            <li><strong>استجابة حاسبة المخاطر:</strong> تتطلب حسم جني الأرباح ووقف الخسارة في فترات قصيرة.</li>
          </ul>
        </div>
      </div>

      {/* Section 3 & 4: Score Algorithm & Strategy Breakdown */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
          <Cpu className="w-4 h-4" /> 3 & 4. استراتيجية المؤشرات الخمسة ونظام التقييم Score (0-100)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <strong className="text-emerald-400 block mb-1">Score ≥ 70 (شراء / شراء قوي)</strong>
            تأكيد صعودي قوي من 3 مؤشرات على الأقل مع سيولة متزايدة وارتكاز على دعم.
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <strong className="text-amber-400 block mb-1">Score 40 - 69 (انتظار / حياد)</strong>
            تضارب أو تذبذب بين مؤشرات الزخم والترند. يوصى بعدم فتح صفقات جديدة.
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <strong className="text-rose-400 block mb-1">Score ≤ 39 (بيع / بيع قوي)</strong>
            سيطرة للبائعين، كسر للمتوسطات EMA20/50 وتوسع سلبي لمؤشر MACD.
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3">المؤشر الفني</th>
                <th className="py-2 px-3">الوزن الأقصى</th>
                <th className="py-2 px-3">شرط الـ Bullish (نقاط عالية)</th>
                <th className="py-2 px-3">شرط الـ Bearish (نقاط منخفضة)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200 font-sans">EMA 20 & EMA 50</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">25 Pts</td>
                <td className="py-2 px-3 text-slate-300">السعر فوق EMA20 و EMA20 فوق EMA50 (Golden Cross)</td>
                <td className="py-2 px-3 text-slate-400">السعر تحتهما أو تقاطع Death Cross</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200 font-sans">RSI 14</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">20 Pts</td>
                <td className="py-2 px-3 text-slate-300">زخم صحي بين 45-65 أو ارتداد من تشبع بيعي &lt; 30</td>
                <td className="py-2 px-3 text-slate-400">تشبع شرائي مفرط &gt; 75 أو دايفرجنس سلبي</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200 font-sans">MACD (12,26,9)</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">20 Pts</td>
                <td className="py-2 px-3 text-slate-300">MACD أعلى من Signal وتوسع هيستوجرام موجب</td>
                <td className="py-2 px-3 text-slate-400">تقاطع سلبي وهيستوجرام سالب متزايد</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200 font-sans">Volume Analysis</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">15 Pts</td>
                <td className="py-2 px-3 text-slate-300">Volume Spike أكبر من 1.5x المعدل مع شمعة خضراء</td>
                <td className="py-2 px-3 text-slate-400">فوليوم مرتفع جداً مع شمعة بيع حمراء</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-200 font-sans">Support & Resistance</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">20 Pts</td>
                <td className="py-2 px-3 text-slate-300">الارتكاز على دعم قريب جدًا مع مسافة مريحة للمقاومة</td>
                <td className="py-2 px-3 text-slate-400">الاصطدام بمقاومة قوية أو كسر الدعم</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Risk Management Rules */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> 5. قواعد محرك إدارة المخاطر الإجبارية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">وقف الخسارة (Stop Loss):</strong>
            يتم توقيعه تحت أدنى مستوى دعم قريب أو Swing Low مع هامش حماية 1.2% لضمان حماية رأس المال.
          </div>
          <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">أهداف جني الأرباح (TP Targets):</strong>
            تحديد 3 أهداف متدرجة (TP1: 1:1.5, TP2: 1:2.5, TP3: 1:4.0) لجني الأرباح تدريجياً وإغلاق الأجزاء.
          </div>
          <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">حساب حجم الصفقة الحسابي:</strong>
            المعادلة: <br />
            <code className="text-emerald-400 font-mono text-[11px]">
              Qty = (Capital * Risk%) / |Entry - StopLoss|
            </code>
          </div>
        </div>
      </div>

      {/* Section 6 & 7: Database & API Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> 6. تصميم قاعدة البيانات (Database Schema)
          </h3>
          <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`-- 1. Table: technical_signals
CREATE TABLE technical_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  total_score INT NOT NULL,
  decision VARCHAR(20) NOT NULL,
  price NUMERIC(18, 8) NOT NULL,
  stop_loss NUMERIC(18, 8),
  tp1 NUMERIC(18, 8),
  tp2 NUMERIC(18, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: trading_journal
CREATE TABLE trading_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('BUY', 'SELL')),
  entry_price NUMERIC(18, 8) NOT NULL,
  exit_price NUMERIC(18, 8),
  position_size NUMERIC(18, 8) NOT NULL,
  pnl_usdt NUMERIC(18, 8),
  status VARCHAR(10) CHECK (status IN ('OPEN', 'WIN', 'LOSS')),
  score_at_entry INT,
  notes TEXT,
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Network className="w-4 h-4" /> 7. تصميم API Endpoints
          </h3>
          <div className="text-xs space-y-2 font-mono">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">GET</span> /api/market/ticker
              <p className="font-sans text-slate-400 text-[11px] mt-0.5">جلب أسعار الكريبتو والتغير 24h</p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-cyan-400 font-bold">POST</span> /api/market/analysis
              <p className="font-sans text-slate-400 text-[11px] mt-0.5">
                إجراء حساب الـ Score وحساب أوزان RSI, MACD, EMA, Volume, S/R
              </p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-cyan-400 font-bold">POST</span> /api/risk/calculate
              <p className="font-sans text-slate-400 text-[11px] mt-0.5">
                حساب حجم العقود/القطع بناءً على رأس المال ونسبة المخاطرة
              </p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-purple-400 font-bold">POST</span> /api/ai-assistant
              <p className="font-sans text-slate-400 text-[11px] mt-0.5">
                استدعاء نموذج Gemini لصياغة تقرير مساعد القرار بالعربية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 8: Pseudocode */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
          <FileCode2 className="w-4 h-4" /> 8. Pseudocode خوارزمية حساب النتيجة وولادة الإشارة
        </h3>
        <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
{`FUNCTION CalculateMarketScore(candles, symbol, timeframe):
    closes = EXTRACT_CLOSES(candles)
    volumes = EXTRACT_VOLUMES(candles)
    
    // 1. Calculate Technical Indicators
    ema20 = CALCULATE_EMA(closes, 20)
    ema50 = CALCULATE_EMA(closes, 50)
    rsi = CALCULATE_RSI(closes, 14)
    macd, signal, hist = CALCULATE_MACD(closes, 12, 26, 9)
    supports, resistances = DETECT_PIVOT_SR_LEVELS(candles)
    
    score = 0
    
    // 2. EMA Trend Evaluation (25 Points Max)
    IF currentPrice > ema20 AND ema20 > ema50 THEN
        score += 25  // Strong Uptrend Alignment
    ELSE IF currentPrice > ema20 THEN
        score += 15  // Moderate Bullish Recovery
    ENDIF
    
    // 3. RSI Evaluation (20 Points Max)
    IF rsi BETWEEN 45 AND 65 THEN
        score += 20  // Healthy Momentum
    ELSE IF rsi < 30 THEN
        score += 18  // Oversold Bounce Reversal
    ENDIF
    
    // 4. MACD Evaluation (20 Points Max)
    IF macd > signal AND hist > 0 THEN
        score += 20  // Positive Crossover
    ENDIF
    
    // 5. Volume Evaluation (15 Points Max)
    IF currentVolume > 1.5 * volumeAvg AND priceIsGreen THEN
        score += 15  // Volume Spike Confirmation
    ENDIF
    
    // 6. Support Proximity Evaluation (20 Points Max)
    IF DISTANCE_TO(closestSupport) <= 1.5% THEN
        score += 20  // Bounce from Support Zone
    ENDIF
    
    // 7. Decision Mapping
    IF score >= 75 THEN decision = "STRONG_BUY"
    ELSE IF score >= 60 THEN decision = "BUY"
    ELSE IF score <= 35 THEN decision = "SELL"
    ELSE decision = "WAIT"
    
    RETURN { totalScore: score, decision, indicators }
END FUNCTION`}
        </pre>
      </div>
    </div>
  );
};
