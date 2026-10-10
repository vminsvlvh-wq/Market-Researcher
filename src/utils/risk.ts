import { RiskCalculation } from '../types';

export function calculateRiskAndPositionSize(
  accountCapital: number,
  riskPercentage: number,
  entryPrice: number,
  stopLossPrice: number,
  takeProfit1Custom?: number,
  takeProfit2Custom?: number,
  takeProfit3Custom?: number
): RiskCalculation {
  const warnings: string[] = [];

  // Sanity checks
  if (accountCapital <= 0) {
    accountCapital = 1000;
  }
  if (riskPercentage <= 0) {
    riskPercentage = 1;
  }
  if (entryPrice <= 0) {
    entryPrice = 100;
  }
  if (stopLossPrice <= 0 || stopLossPrice >= entryPrice) {
    // Default SL 1.5% below entry
    stopLossPrice = entryPrice * 0.985;
  }

  const riskAmountUsdt = accountCapital * (riskPercentage / 100);
  const priceDistanceToSl = Math.abs(entryPrice - stopLossPrice);

  if (priceDistanceToSl === 0) {
    return {
      accountCapital,
      riskPercentage,
      riskAmountUsdt,
      entryPrice,
      stopLossPrice,
      takeProfit1: entryPrice * 1.02,
      takeProfit2: entryPrice * 1.04,
      takeProfit3: entryPrice * 1.06,
      positionSizeQty: 0,
      positionValueUsdt: 0,
      riskRewardRatio: 0,
      isValidRisk: false,
      warnings: ['سعر وقف الخسارة مطابق لسعر الدخول - غير صالح.'],
    };
  }

  // Position Quantity = Risk Amount / Price Distance per unit
  const positionSizeQty = riskAmountUsdt / priceDistanceToSl;
  const positionValueUsdt = positionSizeQty * entryPrice;

  // Take profit targets
  const tp1 = takeProfit1Custom || entryPrice + priceDistanceToSl * 1.5;
  const tp2 = takeProfit2Custom || entryPrice + priceDistanceToSl * 2.5;
  const tp3 = takeProfit3Custom || entryPrice + priceDistanceToSl * 4.0;

  const priceDistanceToTp1 = Math.abs(tp1 - entryPrice);
  const riskRewardRatio = priceDistanceToTp1 / priceDistanceToSl;

  let isValidRisk = true;

  if (riskPercentage > 3) {
    warnings.push('تنبيه: مخاطرة أكثر من 3% من رأس المال يعتبر مخاطرة عالية جداً في التداول اليومي.');
  }

  if (riskRewardRatio < 1.5) {
    warnings.push(`نسبة المخاطرة للمكافأة (${riskRewardRatio.toFixed(2)}) أقل من الحد الأدنى الموصى به (1:1.5).`);
    isValidRisk = false;
  }

  if (positionValueUsdt > accountCapital * 5) {
    warnings.push('تنبيه: حجم الصفقة يتطلب رافعة مالية عالية لفتحها بهذه الكمية.');
  }

  return {
    accountCapital,
    riskPercentage,
    riskAmountUsdt: Number(riskAmountUsdt.toFixed(2)),
    entryPrice: Number(entryPrice.toFixed(2)),
    stopLossPrice: Number(stopLossPrice.toFixed(2)),
    takeProfit1: Number(tp1.toFixed(2)),
    takeProfit2: Number(tp2.toFixed(2)),
    takeProfit3: Number(tp3.toFixed(2)),
    positionSizeQty: Number(positionSizeQty.toFixed(4)),
    positionValueUsdt: Number(positionValueUsdt.toFixed(2)),
    riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
    isValidRisk,
    warnings,
  };
}
