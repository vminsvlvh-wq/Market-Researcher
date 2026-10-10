import { Candle, TechnicalIndicators, ScoreComponent, DecisionType, AnalysisResult, Timeframe } from '../types';

export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const emas: number[] = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    const ema = prices[i] * k + emas[i - 1] * (1 - k);
    emas.push(ema);
  }
  return emas;
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return Array(prices.length).fill(50);
  const rsis: number[] = Array(period).fill(50);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsis.push(100 - (100 / (1 + firstRs)));

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsis.push(100 - (100 / (1 + rs)));
  }

  return rsis;
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = prices.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = macdLine.map((val, i) => val - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

export function findSupportResistance(candles: Candle[], lookback: number = 50) {
  if (candles.length < 10) {
    const last = candles[candles.length - 1]?.close || 100;
    return { supports: [last * 0.98, last * 0.95], resistances: [last * 1.02, last * 1.05] };
  }

  const slice = candles.slice(-lookback);
  const highs = slice.map(c => c.high);
  const lows = slice.map(c => c.low);

  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];

  for (let i = 2; i < slice.length - 2; i++) {
    if (
      highs[i] > highs[i - 1] &&
      highs[i] > highs[i - 2] &&
      highs[i] > highs[i + 1] &&
      highs[i] > highs[i + 2]
    ) {
      pivotHighs.push(highs[i]);
    }
    if (
      lows[i] < lows[i - 1] &&
      lows[i] < lows[i - 2] &&
      lows[i] < lows[i + 1] &&
      lows[i] < lows[i + 2]
    ) {
      pivotLows.push(lows[i]);
    }
  }

  const currentPrice = candles[candles.length - 1].close;

  // Filter and cluster supports (below current price)
  const supports = pivotLows
    .filter(p => p < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3);

  // Filter and cluster resistances (above current price)
  const resistances = pivotHighs
    .filter(p => p > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3);

  // Fallbacks if not enough pivots
  if (supports.length === 0) {
    supports.push(Math.min(...lows) * 0.99);
  }
  if (resistances.length === 0) {
    resistances.push(Math.max(...highs) * 1.01);
  }

  return { supports, resistances };
}

export function analyzeMarket(candles: Candle[], symbol: string, timeframe: Timeframe): AnalysisResult {
  if (!candles || candles.length < 30) {
    throw new Error('بيانات الشموع غير كافية للتحليل الفني');
  }

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  const currentPrice = closes[closes.length - 1];
  const previousPrice = closes[closes.length - 2];
  const change24h = ((currentPrice - candles[0].close) / candles[0].close) * 100;

  // 1. EMA Calculations
  const ema20Array = calculateEMA(closes, 20);
  const ema50Array = calculateEMA(closes, 50);
  const currentEma20 = ema20Array[ema20Array.length - 1];
  const currentEma50 = ema50Array[ema50Array.length - 1];
  const prevEma20 = ema20Array[ema20Array.length - 2];
  const prevEma50 = ema50Array[ema50Array.length - 2];

  // 2. RSI Calculation
  const rsiArray = calculateRSI(closes, 14);
  const currentRsi = rsiArray[rsiArray.length - 1];
  const prevRsi = rsiArray[rsiArray.length - 2];

  // 3. MACD Calculation
  const macdData = calculateMACD(closes, 12, 26, 9);
  const currentMacd = macdData.macdLine[macdData.macdLine.length - 1];
  const currentSignal = macdData.signalLine[macdData.signalLine.length - 1];
  const currentHist = macdData.histogram[macdData.histogram.length - 1];
  const prevHist = macdData.histogram[macdData.histogram.length - 2];

  // 4. Volume Moving Average
  const volumeSlice = volumes.slice(-20);
  const volumeAvg = volumeSlice.reduce((a, b) => a + b, 0) / volumeSlice.length;
  const currentVolume = volumes[volumes.length - 1];

  // 5. Support & Resistance
  const { supports, resistances } = findSupportResistance(candles, 60);
  const closestSupport = supports[0] || currentPrice * 0.97;
  const closestResistance = resistances[0] || currentPrice * 1.03;

  // --- SCORING ALGORITHM (0 - 100) ---
  const scoreComponents: ScoreComponent[] = [];

  // A. EMA Trend & Crossover Score (Max 25 pts)
  let emaScore = 0;
  let emaDesc = '';
  let emaStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  const isGoldenCross = prevEma20 <= prevEma50 && currentEma20 > currentEma50;
  const isDeathCross = prevEma20 >= prevEma50 && currentEma20 < currentEma50;

  if (currentPrice > currentEma20 && currentEma20 > currentEma50) {
    emaScore = 25;
    emaStatus = 'bullish';
    emaDesc = isGoldenCross
      ? 'تقاطع إيجابي ذهبي حديث (EMA20 يخترق EMA50 للأعلى) - ترند صاعد قوي جداً'
      : 'السعر أعلى من المتوسطين EMA20 و EMA50 والترند صاعد بشكل مريح';
  } else if (currentPrice > currentEma20 && currentPrice < currentEma50) {
    emaScore = 15;
    emaStatus = 'bullish';
    emaDesc = 'السعر فوق EMA20 ولكن تحت EMA50 - محاولة تعافي صعودي مبكر';
  } else if (currentPrice < currentEma20 && currentPrice > currentEma50) {
    emaScore = 10;
    emaStatus = 'neutral';
    emaDesc = 'السعر كسر EMA20 لأسفل ويدعم عند EMA50 - تذبذب حذر';
  } else if (isDeathCross) {
    emaScore = 0;
    emaStatus = 'bearish';
    emaDesc = 'تقاطع سلبي (Death Cross) حديث بين EMA20 و EMA50 - تحذير من هبوط قادم';
  } else {
    emaScore = 0;
    emaStatus = 'bearish';
    emaDesc = 'السعر أدنى من المتوسطات EMA20 و EMA50 - الترند العام هابط';
  }

  scoreComponents.push({
    name: 'المتوسطات المتحركة (EMA 20 / 50)',
    weight: 25,
    score: emaScore,
    maxScore: 25,
    status: emaStatus,
    description: emaDesc,
  });

  // B. RSI Momentum Score (Max 20 pts)
  let rsiScore = 0;
  let rsiDesc = '';
  let rsiStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  if (currentRsi >= 45 && currentRsi <= 65) {
    rsiScore = 20;
    rsiStatus = 'bullish';
    rsiDesc = `مؤشر RSI ممتاز عند ${currentRsi.toFixed(1)} - قوة زخم صعودي صحية بدون تشبع`;
  } else if (currentRsi < 30) {
    rsiScore = 18;
    rsiStatus = 'bullish';
    rsiDesc = `تشبع بيعي شديد عند RSI ${currentRsi.toFixed(1)} - ارتداد صعودي مرجح جداً`;
  } else if (currentRsi > 30 && currentRsi < 45) {
    rsiScore = 12;
    rsiStatus = 'neutral';
    rsiDesc = `RSI عند ${currentRsi.toFixed(1)} - زخم ضعيف ولكن يتجهز للصعود`;
  } else if (currentRsi > 65 && currentRsi <= 75) {
    rsiScore = 8;
    rsiStatus = 'neutral';
    rsiDesc = `RSI عند ${currentRsi.toFixed(1)} - اقتراب من التشبع الشرائي، كن حذراً عند الدخول`;
  } else {
    // RSI > 75
    rsiScore = 2;
    rsiStatus = 'bearish';
    rsiDesc = `RSI عند ${currentRsi.toFixed(1)} - تشبع شرائي مرتفع جداً يرفع مخاطر تصحيح هابط`;
  }

  scoreComponents.push({
    name: 'مؤشر القوة النسبية (RSI 14)',
    weight: 20,
    score: rsiScore,
    maxScore: 20,
    status: rsiStatus,
    description: rsiDesc,
  });

  // C. MACD Signal Score (Max 20 pts)
  let macdScore = 0;
  let macdDesc = '';
  let macdStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  if (currentMacd > currentSignal && currentHist > 0) {
    if (prevHist <= 0) {
      macdScore = 20;
      macdStatus = 'bullish';
      macdDesc = 'تقاطع إيجابي طازج في MACD مع بداية ارتفاع الهيستوجرام فوق الصفر';
    } else if (currentHist > prevHist) {
      macdScore = 18;
      macdStatus = 'bullish';
      macdDesc = 'MACD إيجابي أعلى من خط الإشارة والهيستوجرام يتوسع صعوداً';
    } else {
      macdScore = 14;
      macdStatus = 'bullish';
      macdDesc = 'MACD إيجابي فوق الإشارة ولكن الزخم الصعودي للهيستوجرام يتباطأ قليلاً';
    }
  } else if (currentMacd < currentSignal && currentHist < 0) {
    if (currentHist > prevHist) {
      macdScore = 8;
      macdStatus = 'neutral';
      macdDesc = 'MACD سلبي لكن الهيستوجرام يظهر انحساراً في الزخم البيعي';
    } else {
      macdScore = 0;
      macdStatus = 'bearish';
      macdDesc = 'MACD أدنى من خط الإشارة مع هيستوجرام سلبي متزايد - سيطرة للبائعين';
    }
  } else {
    macdScore = 10;
    macdStatus = 'neutral';
    macdDesc = 'MACD في حالة تقارب وتذبذب محايد قرب خط الصفر';
  }

  scoreComponents.push({
    name: 'مؤشر الماكدي (MACD)',
    weight: 20,
    score: macdScore,
    maxScore: 20,
    status: macdStatus,
    description: macdDesc,
  });

  // D. Volume Confirmation Score (Max 15 pts)
  let volScore = 0;
  let volDesc = '';
  let volStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  const volRatio = currentVolume / (volumeAvg || 1);
  const isGreenCandle = currentPrice >= previousPrice;

  if (volRatio >= 1.5 && isGreenCandle) {
    volScore = 15;
    volStatus = 'bullish';
    volDesc = `ارتفاع حاد في حجم التداول (Volume Spike) بنسبة ${(volRatio * 100).toFixed(0)}% فوق المتوسط مع شمعة خضراء - تأكيد دخول السيولة`;
  } else if (volRatio >= 1.1 && isGreenCandle) {
    volScore = 12;
    volStatus = 'bullish';
    volDesc = 'حجم التداول أعلى من المتوسط مع صعود السعر - دعم جيد للترند';
  } else if (volRatio < 0.8 && isGreenCandle) {
    volScore = 6;
    volStatus = 'neutral';
    volDesc = 'صعود السعر بحجم تداول ضعيف - ضعف في سيولة المشترين';
  } else if (volRatio >= 1.5 && !isGreenCandle) {
    volScore = 2;
    volStatus = 'bearish';
    volDesc = 'ضغط بيعي مرتفع بحجم تداول ضخم مع شمعة حمراء';
  } else {
    volScore = 8;
    volStatus = 'neutral';
    volDesc = 'حجم التداول حول معدله الطبيعي بدون تغيرات مفاجئة';
  }

  scoreComponents.push({
    name: 'حجم التداول (Volume Analysis)',
    weight: 15,
    score: volScore,
    maxScore: 15,
    status: volStatus,
    description: volDesc,
  });

  // E. Support & Resistance Score (Max 20 pts)
  let srScore = 0;
  let srDesc = '';
  let srStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  const distToSupportPct = ((currentPrice - closestSupport) / currentPrice) * 100;
  const distToResistPct = ((closestResistance - currentPrice) / currentPrice) * 100;

  if (distToSupportPct >= 0 && distToSupportPct <= 1.5) {
    srScore = 20;
    srStatus = 'bullish';
    srDesc = `السعر يرتكز الآن تماماً فوق مستوى دعم قوي عند $${closestSupport.toFixed(2)} - نقطة دخول بوقف خسارة قريب جداً`;
  } else if (distToSupportPct > 1.5 && distToResistPct > 3.0) {
    srScore = 15;
    srStatus = 'bullish';
    srDesc = `السعر في منتصف القناة مع مسافة مريحة صعوداً للمقاومة المقابلة عند $${closestResistance.toFixed(2)}`;
  } else if (distToResistPct <= 1.0) {
    srScore = 4;
    srStatus = 'bearish';
    srDesc = `السعر اصطدم مباشرة بمقاومة قوية عند $${closestResistance.toFixed(2)} - احتمال ارتداد هابط`;
  } else {
    srScore = 10;
    srStatus = 'neutral';
    srDesc = `السعر يتداول بين الدعم ($${closestSupport.toFixed(2)}) والمقاومة ($${closestResistance.toFixed(2)})`;
  }

  scoreComponents.push({
    name: 'الدعوم والمقاومات (Support / Resistance)',
    weight: 20,
    score: srScore,
    maxScore: 20,
    status: srStatus,
    description: srDesc,
  });

  // Calculate Total Score (0 - 100)
  const totalScore = Math.min(
    100,
    Math.max(0, scoreComponents.reduce((acc, c) => acc + c.score, 0))
  );

  // Decision Threshold
  let decision: DecisionType = 'WAIT';
  if (totalScore >= 78) {
    decision = 'STRONG_BUY';
  } else if (totalScore >= 62) {
    decision = 'BUY';
  } else if (totalScore <= 32) {
    decision = 'STRONG_SELL';
  } else if (totalScore <= 45) {
    decision = 'SELL';
  } else {
    decision = 'WAIT';
  }

  // Calculate Suggested Stop Loss & Take Profits
  const stopLossPadding = currentPrice * 0.012; // 1.2% buffer
  const suggestedStopLoss = Math.max(closestSupport - stopLossPadding, currentPrice * 0.96);
  const riskDist = currentPrice - suggestedStopLoss;

  const suggestedTakeProfits: [number, number, number] = [
    Number((currentPrice + riskDist * 1.5).toFixed(2)),
    Number((currentPrice + riskDist * 2.5).toFixed(2)),
    Number((currentPrice + riskDist * 4.0).toFixed(2)),
  ];

  return {
    symbol,
    timeframe,
    currentPrice,
    change24h,
    totalScore,
    decision,
    indicators: {
      rsi: Number(currentRsi.toFixed(2)),
      macd: {
        macdLine: Number(currentMacd.toFixed(4)),
        signalLine: Number(currentSignal.toFixed(4)),
        histogram: Number(currentHist.toFixed(4)),
      },
      ema20: Number(currentEma20.toFixed(2)),
      ema50: Number(currentEma50.toFixed(2)),
      volumeAvg: Number(volumeAvg.toFixed(2)),
      currentVolume: Number(currentVolume.toFixed(2)),
      supportLevels: supports.map(s => Number(s.toFixed(2))),
      resistanceLevels: resistances.map(r => Number(r.toFixed(2))),
    },
    scoreBreakdown: scoreComponents,
    closestSupport: Number(closestSupport.toFixed(2)),
    closestResistance: Number(closestResistance.toFixed(2)),
    suggestedEntry: Number(currentPrice.toFixed(2)),
    suggestedStopLoss: Number(suggestedStopLoss.toFixed(2)),
    suggestedTakeProfits,
    timestamp: Date.now(),
  };
}
