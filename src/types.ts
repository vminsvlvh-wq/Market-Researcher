export type MarketType = 'crypto' | 'stocks' | 'forex';
export type TradingType = 'scalping' | 'day_trading' | 'swing_trading';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  volumeAvg: number;
  currentVolume: number;
  supportLevels: number[];
  resistanceLevels: number[];
}

export type DecisionType = 'STRONG_BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG_SELL';

export interface ScoreComponent {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  status: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface AnalysisResult {
  symbol: string;
  timeframe: Timeframe;
  currentPrice: number;
  change24h: number;
  totalScore: number; // 0 to 100
  decision: DecisionType;
  indicators: TechnicalIndicators;
  scoreBreakdown: ScoreComponent[];
  closestSupport: number;
  closestResistance: number;
  suggestedEntry: number;
  suggestedStopLoss: number;
  suggestedTakeProfits: [number, number, number];
  timestamp: number;
}

export interface RiskCalculation {
  accountCapital: number;
  riskPercentage: number;
  riskAmountUsdt: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  positionSizeQty: number;
  positionValueUsdt: number;
  riskRewardRatio: number;
  isValidRisk: boolean;
  warnings: string[];
}

export interface TradeJournalEntry {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  entryTime: number;
  exitTime?: number;
  status: 'OPEN' | 'WIN' | 'LOSS' | 'CLOSED';
  notes?: string;
  pnlUsdt?: number;
  scoreAtEntry: number;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface BacktestTrade {
  id: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  entryTime: number;
  exitTime: number;
  pnlPercentage: number;
  pnlUsdt: number;
  reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'SIGNAL_CHANGE';
}

export interface BacktestResult {
  symbol: string;
  timeframe: Timeframe;
  initialCapital: number;
  finalCapital: number;
  totalReturnPct: number;
  buyAndHoldReturnPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  averageWinUsdt: number;
  averageLossUsdt: number;
  profitFactor: number;
  maxDrawdownPct: number;
  equityCurve: { time: number; equity: number }[];
  trades: BacktestTrade[];
}

export interface TradingAlert {
  id: string;
  symbol: string;
  type: 'SCORE_ABOVE' | 'SCORE_BELOW' | 'CROSS_EMA' | 'PRICE_LEVEL';
  targetValue: number;
  timeframe: Timeframe;
  channel: 'telegram' | 'email' | 'push';
  isActive: boolean;
  lastTriggered?: number;
}

export interface StructuredSignal {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  type: 'BUY' | 'SELL' | 'WAIT';
  score: number;
  confidencePct: number;
  reason: string;
  entryPrice: number;
  stopLossPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  timestamp: number;
}
