export function mean(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce(
    (sum, value) => sum + value,
    0
  ) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

export function variance(
  values: number[]
): number {

  if (values.length < 2) return 0;

  const avg = mean(values);

  return values.reduce(
    (sum, value) =>
      sum + Math.pow(value - avg, 2),
    0
  ) / values.length;
}

export function standardDeviation(
  values: number[]
): number {
  return Math.sqrt(
    variance(values)
  );
}

export function percentile(
  values: number[],
  percentileValue: number
): number {

  if (values.length === 0) return 0;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const index =
    (percentileValue / 100) *
    (sorted.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return (
    sorted[lower] +
    weight *
      (sorted[upper] - sorted[lower])
  );
}

export function covariance(
  x: number[],
  y: number[]
): number {

  if (
    x.length !== y.length ||
    x.length < 2
  ) {
    return 0;
  }

  const meanX = mean(x);
  const meanY = mean(y);

  return x.reduce(
    (sum, value, index) =>
      sum +
      (value - meanX) *
      (y[index] - meanY),
    0
  ) / x.length;
}

export function correlation(
  x: number[],
  y: number[]
): number {

  const cov = covariance(x, y);

  const stdX =
    standardDeviation(x);

  const stdY =
    standardDeviation(y);

  if (
    stdX === 0 ||
    stdY === 0
  ) {
    return 0;
  }

  return (
    cov /
    (stdX * stdY)
  );
}
