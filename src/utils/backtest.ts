import { Candle, Timeframe, BacktestResult, BacktestTrade } from '../types';
import { analyzeMarket } from './indicators';

export function runBacktest(
  candles: Candle[],
  symbol: string,
  timeframe: Timeframe,
  initialCapital: number = 10000,
  riskPerTradePct: number = 1.5
): BacktestResult {
  if (!candles || candles.length < 40) {
    throw new Error('بيانات الشموع الفردية غير كافية لإجراء الاختبار الخلفي.');
  }

  let capital = initialCapital;
  let peakCapital = initialCapital;
  let maxDrawdownUsdt = 0;
  let maxDrawdownPct = 0;

  const trades: BacktestTrade[] = [];
  const equityCurve: { time: number; equity: number }[] = [
    { time: candles[0].time, equity: initialCapital },
  ];

  let currentPosition: {
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    qty: number;
    entryTime: number;
    tradeId: string;
  } | null = null;

  // Step through candles starting after warm-up period (30 candles)
  for (let i = 30; i < candles.length; i++) {
    const subCandles = candles.slice(0, i + 1);
    const currentCandle = candles[i];

    // 1. Check existing open position
    if (currentPosition) {
      const { entryPrice, stopLoss, takeProfit1, qty, entryTime, tradeId } = currentPosition;

      // Check if Stop Loss hit
      if (currentCandle.low <= stopLoss) {
        const exitPrice = stopLoss;
        const pnlUsdt = (exitPrice - entryPrice) * qty;
        const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;

        capital += pnlUsdt;
        trades.push({
          id: tradeId,
          type: 'BUY',
          entryPrice,
          exitPrice,
          entryTime,
          exitTime: currentCandle.time,
          pnlPercentage: Number(pnlPct.toFixed(2)),
          pnlUsdt: Number(pnlUsdt.toFixed(2)),
          reason: 'STOP_LOSS',
        });
        currentPosition = null;
      }
      // Check if Take Profit 1 hit
      else if (currentCandle.high >= takeProfit1) {
        const exitPrice = takeProfit1;
        const pnlUsdt = (exitPrice - entryPrice) * qty;
        const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;

        capital += pnlUsdt;
        trades.push({
          id: tradeId,
          type: 'BUY',
          entryPrice,
          exitPrice,
          entryTime,
          exitTime: currentCandle.time,
          pnlPercentage: Number(pnlPct.toFixed(2)),
          pnlUsdt: Number(pnlUsdt.toFixed(2)),
          reason: 'TAKE_PROFIT',
        });
        currentPosition = null;
      }
    }

    // 2. Evaluate Market Analysis for new signal if no active position
    if (!currentPosition) {
      try {
        const analysis = analyzeMarket(subCandles, symbol, timeframe);

        // Signal Entry Rule: Score >= 70 (STRONG_BUY / BUY)
        if (analysis.totalScore >= 68) {
          const entryPrice = currentCandle.close;
          const stopLoss = analysis.suggestedStopLoss;
          const takeProfit1 = analysis.suggestedTakeProfits[0];

          const riskAmount = capital * (riskPerTradePct / 100);
          const priceRiskDist = Math.abs(entryPrice - stopLoss);

          if (priceRiskDist > 0) {
            const qty = riskAmount / priceRiskDist;
            currentPosition = {
              entryPrice,
              stopLoss,
              takeProfit1,
              qty,
              entryTime: currentCandle.time,
              tradeId: `bt-${i}-${Date.now()}`,
            };
          }
        }
      } catch (err) {
        // Skip if not enough data slice
      }
    }

    // Update drawdown and equity curve
    if (capital > peakCapital) {
      peakCapital = capital;
    }
    const currentDrawdownUsdt = peakCapital - capital;
    const currentDrawdownPct = (currentDrawdownUsdt / peakCapital) * 100;
    if (currentDrawdownPct > maxDrawdownPct) {
      maxDrawdownPct = currentDrawdownPct;
      maxDrawdownUsdt = currentDrawdownUsdt;
    }

    equityCurve.push({ time: currentCandle.time, equity: Number(capital.toFixed(2)) });
  }

  // Calculate Metrics
  const winningTrades = trades.filter((t) => t.pnlUsdt > 0);
  const losingTrades = trades.filter((t) => t.pnlUsdt <= 0);

  const totalWinsUsdt = winningTrades.reduce((a, b) => a + b.pnlUsdt, 0);
  const totalLossesUsdt = Math.abs(losingTrades.reduce((a, b) => a + b.pnlUsdt, 0));

  const winRatePct = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const averageWinUsdt = winningTrades.length > 0 ? totalWinsUsdt / winningTrades.length : 0;
  const averageLossUsdt = losingTrades.length > 0 ? totalLossesUsdt / losingTrades.length : 0;

  const profitFactor = totalLossesUsdt > 0 ? totalWinsUsdt / totalLossesUsdt : totalWinsUsdt > 0 ? 99 : 0;

  const totalReturnPct = ((capital - initialCapital) / initialCapital) * 100;

  const startPrice = candles[0].close;
  const endPrice = candles[candles.length - 1].close;
  const buyAndHoldReturnPct = ((endPrice - startPrice) / startPrice) * 100;

  return {
    symbol,
    timeframe,
    initialCapital,
    finalCapital: Number(capital.toFixed(2)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    buyAndHoldReturnPct: Number(buyAndHoldReturnPct.toFixed(2)),
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRatePct: Number(winRatePct.toFixed(2)),
    averageWinUsdt: Number(averageWinUsdt.toFixed(2)),
    averageLossUsdt: Number(averageLossUsdt.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
    equityCurve,
    trades,
  };
}
