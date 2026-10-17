export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Whole-dollar amounts for summaries, e.g. "$6,730". Never shows a partial cents value like "$363.3".
export const formatWholeCurrency = (amount: number): string => {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const formatDateLong = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const getCalendarYear = (dateString: string): number => {
  return new Date(dateString).getUTCFullYear();
};

// Very large gains read better as a multiple of cost: +19,797.4% becomes "199× cost".
export const formatPercentage = (percentage: number): string => {
  if (isNaN(percentage) || !isFinite(percentage)) return '—';
  if (percentage >= 900) {
    return `${Math.round(1 + percentage / 100).toLocaleString('en-US')}× cost`;
  }
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

export type ValueTrend = 'up' | 'down' | 'flat';

export interface ValueChange {
  amount: number;
  percentage: number | null;
  trend: ValueTrend;
}

// A change is only known when both the purchase price and the current value were recorded.
export const getValueChange = (purchasePrice?: number, currentValue?: number): ValueChange | null => {
  if (purchasePrice === undefined || currentValue === undefined) return null;
  const amount = Math.round((currentValue - purchasePrice) * 100) / 100;
  return {
    amount,
    percentage: purchasePrice > 0 ? (amount / purchasePrice) * 100 : null,
    trend: amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat',
  };
};

export const formatSignedCurrency = (amount: number): string => {
  if (amount > 0) return `+${formatCurrency(amount)}`;
  if (amount < 0) return `-${formatCurrency(Math.abs(amount))}`;
  return formatCurrency(0);
};

export const formatValueChange = (change: ValueChange): string => {
  const amount = formatSignedCurrency(change.amount);
  return change.percentage === null || change.trend === 'flat'
    ? amount
    : `${amount} (${formatPercentage(change.percentage)})`;
};

export const formatComicLabel = (comic: { seriesName: string; issueNumber: number; isVariant?: boolean }): string =>
  `${comic.seriesName} #${comic.issueNumber}${comic.isVariant ? ' (Variant)' : ''}`;
