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

/**
 * ============================================================================
 * TIPOS DE CORRELACIÓN
 * ============================================================================
 */


/**
 * Clasificación de la fuerza absoluta de una correlación.
 *
 * La dirección positiva/negativa se conserva en el valor `correlation`.
 */
export type CorrelationStrength =
  | "very weak"
  | "weak"
  | "moderate"
  | "strong"
  | "very strong";


/**
 * Resultado de una correlación de Pearson.
 */
export interface CorrelationResult {

  /**
   * Primera variable analizada.
   */
  variableA: string;

  /**
   * Segunda variable analizada.
   */
  variableB: string;

  /**
   * Coeficiente de Pearson.
   *
   * Rango matemático:
   *
   *     -1 <= correlation <= 1
   */
  correlation: number;

  /**
   * Cantidad de observaciones utilizadas realmente
   * para calcular Pearson.
   *
   * Este valor puede ser menor que dataset.rows.length
   * debido a valores faltantes.
   */
  sampleSize: number;

  /**
   * Fuerza absoluta de la relación.
   */
  strength: CorrelationStrength;
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
