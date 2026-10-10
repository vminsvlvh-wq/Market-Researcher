import React, { useState } from 'react';
import { Candle, Timeframe, AnalysisResult } from '../types';
import { TrendingUp, Layers, Crosshair } from 'lucide-react';

interface PriceChartProps {
  candles: Candle[];
  analysis: AnalysisResult;
  selectedTimeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  candles,
  analysis,
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        جاري تحميل الشموع المباشرة...
      </div>
    );
  }

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

  // Calculate chart boundaries
  const prices = candles.map((c) => [c.high, c.low, c.open, c.close]).flat();
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  const chartHeight = 280;
  const chartWidth = 700;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = Math.max(3, Math.floor((chartWidth - 20) / candles.length) - 2);

  // EMA Lines Path Generator
  const generateEmaPath = (emaPeriod: number) => {
    // Simple EMA calculation for chart overlay
    const k = 2 / (emaPeriod + 1);
    let currentEma = candles[0].close;
    const points: string[] = [];

    candles.forEach((c, idx) => {
      currentEma = c.close * k + currentEma * (1 - k);
      const x = (idx / candles.length) * (chartWidth - 20) + 10;
      const y = getY(currentEma);
      points.push(`${idx === 0 ? 'M' : 'L'} ${x} ${y}`);
    });

    return points.join(' ');
  };

  const ema20Path = generateEmaPath(20);
  const ema50Path = generateEmaPath(50);

  const activeDisplayCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Chart Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">الرسم البياني والمؤشرات المباشرة</span>
          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
            {analysis.symbol}
          </span>
        </div>

        {/* Timeframe Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedTimeframe === tf
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Candle Hover Tooltip Info Header */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <span className="text-slate-400 font-sans flex items-center gap-1">
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" /> البيانات:
        </span>
        <span>
          افتاح: <strong className="text-slate-100">${activeDisplayCandle.open}</strong>
        </span>
        <span>
          أعلى: <strong className="text-emerald-400">${activeDisplayCandle.high}</strong>
        </span>
        <span>
          أدنى: <strong className="text-rose-400">${activeDisplayCandle.low}</strong>
        </span>
        <span>
          إغلاق: <strong className="text-slate-100">${activeDisplayCandle.close}</strong>
        </span>
        <span>
          حجم: <strong className="text-cyan-400">{activeDisplayCandle.volume.toLocaleString()}</strong>
        </span>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl p-3 border border-slate-800">
        <svg
          className="w-full h-[280px] overflow-visible"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const y = chartHeight * ratio;
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Support Level Line (Dashed Green) */}
          {analysis.closestSupport && (
            <g>
              <line
                x1="0"
                y1={getY(analysis.closestSupport)}
                x2={chartWidth}
                y2={getY(analysis.closestSupport)}
                stroke="#10b981"
                strokeDasharray="5 3"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <text
                x={chartWidth - 70}
                y={getY(analysis.closestSupport) - 5}
                fill="#10b981"
                fontSize="10"
                fontWeight="bold"
              >
                دعم ${analysis.closestSupport}
              </text>
            </g>
          )}

          {/* Resistance Level Line (Dashed Red) */}
          {analysis.closestResistance && (
            <g>
              <line
                x1="0"
                y1={getY(analysis.closestResistance)}
                x2={chartWidth}
                y2={getY(analysis.closestResistance)}
                stroke="#f43f5e"
                strokeDasharray="5 3"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <text
                x={chartWidth - 85}
                y={getY(analysis.closestResistance) - 5}
                fill="#f43f5e"
                fontSize="10"
                fontWeight="bold"
              >
                مقاومة ${analysis.closestResistance}
              </text>
            </g>
          )}

          {/* Candlesticks rendering */}
          {candles.map((c, i) => {
            const x = (i / candles.length) * (chartWidth - 20) + 10;
            const isGreen = c.close >= c.open;
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(openY - closeY));
            const color = isGreen ? '#10b981' : '#f43f5e';

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredCandle(c)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {/* Wick */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* EMA 20 Path (Cyan) */}
          <path d={ema20Path} fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.9" />

          {/* EMA 50 Path (Amber) */}
          <path d={ema50Path} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.9" />
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span> EMA 20
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 inline-block"></span> EMA 50
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 border border-dashed border-emerald-500 inline-block"></span> مستوى دعم
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border border-dashed border-rose-500 inline-block"></span> مستوى مقاومة
          </span>
        </div>
        <span className="text-slate-500 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> عدد الشموع: {candles.length}
        </span>
      </div>
    </div>
  );
};
