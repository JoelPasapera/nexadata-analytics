export type DataValue = string | number | null;

export interface Dataset {
  headers: string[];
  rows: Record<string, DataValue>[];
}

export interface NumericStatistics {
  column: string;
  count: number;
  missing: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  variance: number;
  q1: number;
  q3: number;
  iqr: number;
  outliers: number[];
}

export interface CorrelationResult {
  variableA: string;
  variableB: string;
  correlation: number;
  strength:
    | "very weak"
    | "weak"
    | "moderate"
    | "strong"
    | "very strong";
}

export interface DatasetAnalysis {
  rows: number;
  columns: number;
  numericColumns: string[];
  categoricalColumns: string[];
  statistics: NumericStatistics[];
  correlations: CorrelationResult[];
  missingValues: Record<string, number>;
}
