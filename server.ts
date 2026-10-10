import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Candle, Timeframe, TradeJournalEntry, TradingAlert } from './src/types';
import { analyzeMarket } from './src/utils/indicators';
import { calculateRiskAndPositionSize } from './src/utils/risk';
import { runBacktest } from './src/utils/backtest';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Trading Alerts Storage
let savedAlerts: TradingAlert[] = [
  {
    id: 'alt-1',
    symbol: 'BTC/USDT',
    type: 'SCORE_ABOVE',
    targetValue: 70,
    timeframe: '15m',
    channel: 'telegram',
    isActive: true,
  },
  {
    id: 'alt-2',
    symbol: 'ETH/USDT',
    type: 'SCORE_ABOVE',
    targetValue: 75,
    timeframe: '1h',
    channel: 'email',
    isActive: true,
  },
];

// In-memory Trading Journal Storage
let tradingJournal: TradeJournalEntry[] = [
  {
    id: 'tr-101',
    symbol: 'BTC/USDT',
    type: 'BUY',
    entryPrice: 94200,
    exitPrice: 96100,
    stopLoss: 93100,
    takeProfit: 96000,
    positionSize: 0.15,
    entryTime: Date.now() - 86400000 * 2,
    exitTime: Date.now() - 86400000,
    status: 'WIN',
    notes: 'دخول بناءً على اختراق EMA20 وارتفاع الفوليوم عند Score 82',
    pnlUsdt: 285,
    scoreAtEntry: 82,
  },
  {
    id: 'tr-102',
    symbol: 'ETH/USDT',
    type: 'BUY',
    entryPrice: 2680,
    exitPrice: 2750,
    stopLoss: 2630,
    takeProfit: 2760,
    positionSize: 2.5,
    entryTime: Date.now() - 86400000 * 1,
    exitTime: Date.now() - 3600000 * 5,
    status: 'WIN',
    notes: 'ارتداد من مستوى الدعم الهام $2,630 مع تقاطع إيجابي في MACD',
    pnlUsdt: 175,
    scoreAtEntry: 75,
  },
];

// Helper: Generate Mock Candlesticks if external API is unreachable
function generateFallbackCandles(symbol: string, limit: number = 80): Candle[] {
  let basePrice = 95000;
  if (symbol.includes('ETH')) basePrice = 2700;
  if (symbol.includes('SOL')) basePrice = 180;
  if (symbol.includes('BNB')) basePrice = 640;
  if (symbol.includes('XRP')) basePrice = 2.4;
  if (symbol.includes('DOGE')) basePrice = 0.25;

  const candles: Candle[] = [];
  let currentClose = basePrice;
  const now = Date.now();
  const timeStep = 15 * 60 * 1000;

  for (let i = limit; i >= 0; i--) {
    const time = now - i * timeStep;
    const volatility = currentClose * 0.008;
    const change = (Math.random() - 0.48) * volatility;
    const open = currentClose;
    currentClose = Math.max(open + change, basePrice * 0.5);
    const high = Math.max(open, currentClose) + Math.random() * volatility * 0.5;
    const low = Math.min(open, currentClose) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 500 + 100) * (basePrice > 1000 ? 1 : 100);

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(currentClose.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    });
  }
  return candles;
}

// Convert timeframe string to Binance interval
function getBinanceInterval(tf: Timeframe): string {
  switch (tf) {
    case '1m': return '1m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '1h': return '1h';
    case '4h': return '4h';
    case '1d': return '1d';
    default: return '15m';
  }
}

// Map Binance raw symbol
function formatSymbolForBinance(sym: string): string {
  return sym.replace('/', '').toUpperCase();
}

// Fetch Candles safely with fallback
async function fetchMarketCandles(symbol: string, timeframe: Timeframe): Promise<Candle[]> {
  try {
    const binanceSymbol = formatSymbolForBinance(symbol);
    const interval = getBinanceInterval(timeframe);
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=80`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 20) {
        return data.map((item: any) => ({
          time: item[0],
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
        }));
      }
    }
  } catch (err) {
    console.warn('Fallback to local candle generator due to fetch error:', err);
  }
  return generateFallbackCandles(symbol, 80);
}

// --- API ENDPOINTS ---

// 1. Ticker endpoint
app.get('/api/market/ticker', async (req, res) => {
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT'];
  try {
    const tickers = await Promise.all(
      symbols.map(async sym => {
        const candles = await fetchMarketCandles(sym, '15m');
        const lastCandle = candles[candles.length - 1];
        const firstCandle = candles[0];
        const change24h = ((lastCandle.close - firstCandle.close) / firstCandle.close) * 100;
        return {
          symbol: sym,
          name: sym.split('/')[0],
          price: lastCandle.close,
          change24h: Number(change24h.toFixed(2)),
          high24h: Math.max(...candles.map(c => c.high)),
          low24h: Math.min(...candles.map(c => c.low)),
          volume24h: candles.reduce((acc, c) => acc + c.volume, 0),
        };
      })
    );
    res.json({ status: 'ok', tickers });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Klines endpoint
app.get('/api/market/klines', async (req, res) => {
  const symbol = (req.query.symbol as string) || 'BTC/USDT';
  const timeframe = (req.query.timeframe as Timeframe) || '15m';

  try {
    const candles = await fetchMarketCandles(symbol, timeframe);
    res.json({ status: 'ok', symbol, timeframe, candles });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. Technical Analysis & Score Endpoint
app.post('/api/market/analysis', async (req, res) => {
  const { symbol = 'BTC/USDT', timeframe = '15m' } = req.body;

  try {
    const candles = await fetchMarketCandles(symbol, timeframe as Timeframe);
    const analysis = analyzeMarket(candles, symbol, timeframe as Timeframe);
    res.json({ status: 'ok', analysis, candles });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. Position Sizing & Risk Calculation Endpoint
app.post('/api/risk/calculate', (req, res) => {
  const {
    accountCapital = 1000,
    riskPercentage = 1,
    entryPrice = 95000,
    stopLossPrice = 93800,
    takeProfit1,
    takeProfit2,
    takeProfit3,
  } = req.body;

  const result = calculateRiskAndPositionSize(
    accountCapital,
    riskPercentage,
    entryPrice,
    stopLossPrice,
    takeProfit1,
    takeProfit2,
    takeProfit3
  );

  res.json({ status: 'ok', calculation: result });
});

// 5. Trading Journal Endpoints
app.get('/api/journal', (req, res) => {
  res.json({ status: 'ok', journal: tradingJournal });
});

app.post('/api/journal', (req, res) => {
  const newTrade: TradeJournalEntry = {
    id: `tr-${Date.now()}`,
    symbol: req.body.symbol || 'BTC/USDT',
    type: req.body.type || 'BUY',
    entryPrice: Number(req.body.entryPrice),
    exitPrice: req.body.exitPrice ? Number(req.body.exitPrice) : undefined,
    stopLoss: Number(req.body.stopLoss),
    takeProfit: Number(req.body.takeProfit),
    positionSize: Number(req.body.positionSize),
    entryTime: Date.now(),
    status: req.body.status || 'OPEN',
    notes: req.body.notes || '',
    scoreAtEntry: req.body.scoreAtEntry || 70,
  };

  if (newTrade.status === 'WIN' && newTrade.exitPrice) {
    newTrade.pnlUsdt = (newTrade.exitPrice - newTrade.entryPrice) * newTrade.positionSize;
  } else if (newTrade.status === 'LOSS' && newTrade.exitPrice) {
    newTrade.pnlUsdt = (newTrade.exitPrice - newTrade.entryPrice) * newTrade.positionSize;
  }

  tradingJournal.unshift(newTrade);
  res.json({ status: 'ok', trade: newTrade, journal: tradingJournal });
});

app.delete('/api/journal/:id', (req, res) => {
  const { id } = req.params;
  tradingJournal = tradingJournal.filter(t => t.id !== id);
  res.json({ status: 'ok', journal: tradingJournal });
});

// 6. Gemini AI Decision Assistance Endpoint
app.post('/api/ai-assistant', async (req, res) => {
  const { analysisResult } = req.body;

  if (!analysisResult) {
    return res.status(400).json({ status: 'error', message: 'بيانات التحليل مطلوبة' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback deterministic response if no API key set
      return res.json({
        status: 'ok',
        summary: `### 📊 تقرير مساعد القرار الفني (نبض السوق)\n\n**الزوج:** ${analysisResult.symbol} (${analysisResult.timeframe})\n**النتيجة الكلية:** ${analysisResult.totalScore} / 100\n**التوصية الموجهة:** ${analysisResult.decision}\n\n**الملخص:**\nيظهر الزوج إشارات فنية متوافقة مع النتيجة الكلية. مؤشر القوة النسبية (RSI: ${analysisResult.indicators.rsi}) يعطي قراءة متوازنة. المتوسط المتحرك EMA20 ($${analysisResult.indicators.ema20}) يمثل منطقة دعم ديناميكية.\n\n**خطة التداول المقترحة:**\n- **سعر الدخول:** $${analysisResult.suggestedEntry}\n- **وقف الخسارة:** $${analysisResult.suggestedStopLoss}\n- **أهداف جني الأرباح:** TP1: $${analysisResult.suggestedTakeProfits[0]}, TP2: $${analysisResult.suggestedTakeProfits[1]}\n\n*ملاحظة: هذا تقرير تحليلي مساعد وليس توصية ماليّة مؤكدة.*`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت خبير تداول وتحليل فني محترف يعمل كمساعد لقرار التداول في أداة "نبض السوق".
بناءً على البيانات التحليلية التالية لخوارزمية النتيجة (Score System):

- الزوج: ${analysisResult.symbol}
- الإطار الزمني: ${analysisResult.timeframe}
- السعر الحالي: $${analysisResult.currentPrice}
- التغير 24 ساعة: ${analysisResult.change24h}%
- النتيجة الكلية (Score 0-100): ${analysisResult.totalScore} / 100
- القرار الفني الخوارزمي: ${analysisResult.decision}
- RSI: ${analysisResult.indicators.rsi}
- MACD Line: ${analysisResult.indicators.macd.macdLine}, Signal: ${analysisResult.indicators.macd.signalLine}, Histogram: ${analysisResult.indicators.macd.histogram}
- EMA 20: $${analysisResult.indicators.ema20}, EMA 50: $${analysisResult.indicators.ema50}
- حجم التداول الحالي: ${analysisResult.indicators.currentVolume} (المتوسط: ${analysisResult.indicators.volumeAvg})
- أقرب دعم: $${analysisResult.closestSupport}
- أقرب مقاومة: $${analysisResult.closestResistance}
- وقف الخسارة المقترح: $${analysisResult.suggestedStopLoss}
- أهداف جني الأرباح: $${analysisResult.suggestedTakeProfits.join(' , $')}

اكتب تقريراً تحليلياً باللغة العربية بأسلوب احترافي ومباشر للمتداول يغطي:
1. **تشخيص الوضع الحالي للاتجاه والسيولة**
2. **تفكيك قوة المؤشرات الفنية النقاط الإيجابية والسلبية**
3. **تحديد منطقة الدخول، وقف الخسارة، وأهداف جني الأرباح مع تبريرها**
4. **نصيحة إدارة مخاطر حازمة**

تنبيه مهم: تأكد من تذكير المتداول في نهاية التقرير بأن الأدوات التحليلية هي مساعد قرار وليست توقعاً مؤكداً. استخدم تنسيق Markdown أنيق باللغة العربية.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summaryText = response.text || 'لم يتم توليد نص التقرير.';
    res.json({ status: 'ok', summary: summaryText });
  } catch (err: any) {
    console.error('Gemini AI API Error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'تعذر التواصل مع المساعد الذكي' });
  }
});

// 7. Backtesting Endpoint
app.post('/api/backtest', async (req, res) => {
  const { symbol = 'BTC/USDT', timeframe = '15m', initialCapital = 10000, riskPerTradePct = 1.5 } = req.body;
  try {
    const candles = await fetchMarketCandles(symbol, timeframe as Timeframe);
    const result = runBacktest(candles, symbol, timeframe as Timeframe, Number(initialCapital), Number(riskPerTradePct));
    res.json({ status: 'ok', result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 8. Alerts Management Endpoints
app.get('/api/alerts', (req, res) => {
  res.json({ status: 'ok', alerts: savedAlerts });
});

app.post('/api/alerts', (req, res) => {
  const newAlert: TradingAlert = {
    id: `alt-${Date.now()}`,
    symbol: req.body.symbol || 'BTC/USDT',
    type: req.body.type || 'SCORE_ABOVE',
    targetValue: Number(req.body.targetValue || 70),
    timeframe: req.body.timeframe || '15m',
    channel: req.body.channel || 'telegram',
    isActive: true,
  };
  savedAlerts.unshift(newAlert);
  res.json({ status: 'ok', alert: newAlert, alerts: savedAlerts });
});

app.delete('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  savedAlerts = savedAlerts.filter(a => a.id !== id);
  res.json({ status: 'ok', alerts: savedAlerts });
});

// 9. Structured Signal / Telegram Format Endpoint
app.post('/api/signals/export', (req, res) => {
  const { analysisResult } = req.body;
  if (!analysisResult) {
    return res.status(400).json({ status: 'error', message: 'بيانات التحليل مطلوبة' });
  }

  const signalType = analysisResult.totalScore >= 70 ? 'BUY' : analysisResult.totalScore <= 35 ? 'SELL' : 'WAIT';
  const confidence = Math.min(Math.round((analysisResult.totalScore / 100) * 100), 98);

  const telegramText = `🚨 *إشارة تداول جديدة - نبض السوق* 🚨
━━━━━━━━━━━━━━━━━━━━
📈 *الزوج:* \`${analysisResult.symbol}\`
⏱ *الإطار الزمني:* \`${analysisResult.timeframe}\`
🎯 *نوع الإشارة:* *${signalType === 'BUY' ? 'شراء 🟢' : signalType === 'SELL' ? 'بيع 🔴' : 'انتظار 🟡'}*
📊 *مؤشر النتيجة (Score):* \`${analysisResult.totalScore}/100\` (نسبة ثقة ${confidence}%)
━━━━━━━━━━━━━━━━━━━━
💵 *سعر الدخول المقترح:* \`$${analysisResult.suggestedEntry}\`
🛑 *وقف الخسارة (SL):* \`$${analysisResult.suggestedStopLoss}\`
🎯 *الهدف الأول (TP1):* \`$${analysisResult.suggestedTakeProfits[0]}\`
🎯 *الهدف الثاني (TP2):* \`$${analysisResult.suggestedTakeProfits[1]}\`
🎯 *الهدف الثالث (TP3):* \`$${analysisResult.suggestedTakeProfits[2]}\`
━━━━━━━━━━━━━━━━━━━━
⚖️ *نسبة المخاطرة للمكافأة (R:R):* \`1 : ${analysisResult.riskRewardRatio}\`
💡 *السبب الفني:* ${analysisResult.decisionReason}

⚠️ *تنبيه:* هذه الإشارة أُنتجت بواسطة نظام "نبض السوق" لمساعدة القرار وليست توصية مالية حتمية. إلتزم بوقف الخسارة دائماً!`;

  res.json({
    status: 'ok',
    signal: {
      id: `sig-${Date.now()}`,
      symbol: analysisResult.symbol,
      timeframe: analysisResult.timeframe,
      type: signalType,
      score: analysisResult.totalScore,
      confidencePct: confidence,
      reason: analysisResult.decisionReason,
      entryPrice: analysisResult.suggestedEntry,
      stopLossPrice: analysisResult.suggestedStopLoss,
      takeProfit1: analysisResult.suggestedTakeProfits[0],
      takeProfit2: analysisResult.suggestedTakeProfits[1],
      takeProfit3: analysisResult.suggestedTakeProfits[2],
      riskRewardRatio: analysisResult.riskRewardRatio,
      timestamp: Date.now(),
    },
    formattedTelegramText: telegramText,
  });
});

// START SERVER & VITE MIDDLEWARE
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
