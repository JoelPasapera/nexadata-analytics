/**
 * ============================================================================
 * statistics.service.ts
 * ============================================================================
 *
 * RESPONSABILIDAD DE ESTE MÓDULO
 * ------------------------------
 *
 * Este archivo contiene la lógica estadística relacionada con un Dataset.
 *
 * Sus responsabilidades principales son:
 *
 * 1. Identificar correctamente las columnas numéricas.
 * 2. Identificar correctamente las columnas categóricas.
 * 3. Calcular estadísticas descriptivas.
 * 4. Detectar valores atípicos mediante el método IQR.
 *
 * IMPORTANTE:
 * -----------
 *
 * Este módulo NO se encarga de:
 *
 * - leer archivos CSV;
 * - recibir peticiones HTTP;
 * - renderizar el dashboard;
 * - calcular correlaciones.
 *
 * Cada responsabilidad permanece separada para mantener la arquitectura
 * modular del proyecto.
 * ============================================================================
 */

import {
  Dataset,
  DataValue,
  NumericStatistics
} from "../types/dataset.js";

import {
  mean,
  median,
  percentile,
  standardDeviation,
  variance
} from "../utils/math.js";


/**
 * ============================================================================
 * CONFIGURACIÓN DEL DETECTOR DE TIPOS
 * ============================================================================
 *
 * Una columna no será considerada numérica simplemente porque tenga UN valor
 * numérico.
 *
 * Exigimos que una proporción suficientemente alta de los valores disponibles
 * sean numéricos.
 *
 * Ejemplo:
 *
 *   [10, 20, 30, 40]
 *        → 100% numérico → NUMÉRICA
 *
 *   [10, 20, "ABC", 40]
 *        → 75% numérico → NUMÉRICA
 *
 *   [10, "ABC", "XYZ", "DEF"]
 *        → 25% numérico → NO NUMÉRICA
 *
 * El umbral puede modificarse fácilmente.
 * ============================================================================
 */

const NUMERIC_COLUMN_THRESHOLD = 0.80;


/**
 * ============================================================================
 * FUNCIÓN AUXILIAR: obtener valores no nulos
 * ============================================================================
 *
 * Esta función elimina únicamente los valores `null`.
 *
 * No elimina strings vacíos aquí porque el parser del CSV ya transforma
 * valores vacíos, "null", "na" y "n/a" en `null`.
 *
 * Esto mantiene una única responsabilidad para cada capa.
 * ============================================================================
 */

function getNonNullValues(
  values: DataValue[]
): DataValue[] {

  return values.filter(
    (value): value is Exclude<DataValue, null> =>
      value !== null
  );
}


/**
 * ============================================================================
 * FUNCIÓN AUXILIAR: obtener valores numéricos
 * ============================================================================
 *
 * Devuelve exclusivamente los valores cuyo tipo real en JavaScript es
 * `number`.
 *
 * Gracias al type predicate:
 *
 *     value is number
 *
 * TypeScript sabe que después del filter() todos los elementos son números.
 * ============================================================================
 */

function getNumericValues(
  values: DataValue[]
): number[] {

  return values.filter(
    (value): value is number =>
      typeof value === "number" &&
      Number.isFinite(value)
  );
}


/**
 * ============================================================================
 * OBTENER VALORES DE UNA COLUMNA
 * ============================================================================
 *
 * Centralizamos aquí el acceso a una columna.
 *
 * En lugar de repetir:
 *
 * dataset.rows.map(...)
 *
 * en diferentes lugares, utilizamos una única función.
 * ============================================================================
 */

function getColumnValues(
  dataset: Dataset,
  column: string
): DataValue[] {

  return dataset.rows.map(
    (row): DataValue =>
      row[column] ?? null
  );
}


/**
 * ============================================================================
 * DETERMINAR SI UNA COLUMNA ES NUMÉRICA
 * ============================================================================
 *
 * Esta es una de las partes más importantes de esta versión.
 *
 * La versión anterior consideraba numérica una columna si encontraba
 * AL MENOS UN número.
 *
 * Eso podía producir falsos positivos.
 *
 * Ahora:
 *
 * 1. Obtenemos los valores de la columna.
 * 2. Eliminamos los valores faltantes.
 * 3. Contamos cuántos son numéricos.
 * 4. Calculamos la proporción numérica.
 * 5. Comparamos esa proporción con NUMERIC_COLUMN_THRESHOLD.
 *
 * Ejemplo:
 *
 *     [100, 200, 300, 400]
 *
 *     numéricos = 4
 *     disponibles = 4
 *     proporción = 1.00
 *
 *     1.00 >= 0.80
 *
 *     => NUMÉRICA
 *
 * ============================================================================
 */

function isNumericColumn(
  values: DataValue[]
): boolean {

  const nonNullValues: DataValue[] =
    getNonNullValues(values);

  /**
   * Una columna sin datos suficientes no puede clasificarse como numérica.
   */
  if (nonNullValues.length === 0) {
    return false;
  }

  const numericValues: number[] =
    getNumericValues(nonNullValues);

  const numericRatio: number =
    numericValues.length / nonNullValues.length;

  return numericRatio >= NUMERIC_COLUMN_THRESHOLD;
}


/**
 * ============================================================================
 * OBTENER COLUMNAS NUMÉRICAS
 * ============================================================================
 *
 * Recorremos todas las columnas del Dataset y utilizamos isNumericColumn()
 * para decidir cuáles pueden participar en análisis estadísticos.
 * ============================================================================
 */

export function getNumericColumns(
  dataset: Dataset
): string[] {

  return dataset.headers.filter(
    (column: string): boolean => {

      const values: DataValue[] =
        getColumnValues(dataset, column);

      return isNumericColumn(values);
    }
  );
}


/**
 * ============================================================================
 * OBTENER COLUMNAS CATEGÓRICAS
 * ============================================================================
 *
 * Una columna se considera categórica cuando contiene valores string y
 * NO ha sido clasificada como numérica.
 *
 * Esto es importante porque una columna como:
 *
 *     producto
 *     ----------------
 *     Laptop
 *     Celular
 *     Tablet
 *
 * no debe entrar en cálculos de media, desviación estándar o correlación.
 *
 * ============================================================================
 */

export function getCategoricalColumns(
  dataset: Dataset
): string[] {

  return dataset.headers.filter(
    (column: string): boolean => {

      const values: DataValue[] =
        getColumnValues(dataset, column);

      const hasStringValues: boolean =
        values.some(
          (value: DataValue): boolean =>
            typeof value === "string"
        );

      /**
       * Si contiene strings y no fue clasificada como numérica,
       * la consideramos categórica.
       */
      return (
        hasStringValues &&
        !isNumericColumn(values)
      );
    }
  );
}


/**
 * ============================================================================
 * CALCULAR ESTADÍSTICAS DE UNA COLUMNA
 * ============================================================================
 *
 * Esta función recibe UNA columna numérica y calcula todas sus estadísticas.
 *
 * Separar esta operación permite que calculateStatistics() sea solamente
 * responsable de recorrer las columnas.
 * ============================================================================
 */

function calculateColumnStatistics(
  dataset: Dataset,
  column: string
): NumericStatistics {

  /**
   * Obtenemos todos los valores originales.
   */
  const allValues: DataValue[] =
    getColumnValues(dataset, column);

  /**
   * Nos quedamos exclusivamente con números válidos.
   */
  const values: number[] =
    getNumericValues(allValues);

  /**
   * Cantidad de valores faltantes.
   *
   * La cantidad total de filas menos la cantidad de valores numéricos
   * representa los datos que no pudieron utilizarse para el análisis.
   */
  const missing: number =
    dataset.rows.length - values.length;


  /**
   * --------------------------------------------------------------------------
   * PROTECCIÓN CONTRA COLUMNAS SIN DATOS NUMÉRICOS
   * --------------------------------------------------------------------------
   *
   * Aunque esta función debería recibir solamente columnas clasificadas
   * como numéricas, mantenemos una protección adicional.
   *
   * Esto evita ejecutar Math.min(), mean(), percentile(), etc. sobre un
   * array vacío si en el futuro cambia otra parte del sistema.
   */
  if (values.length === 0) {

    return {
      column,
      count: 0,
      missing,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      variance: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      outliers: []
    };
  }


  /**
   * --------------------------------------------------------------------------
   * ESTADÍSTICOS DE TENDENCIA CENTRAL
   * --------------------------------------------------------------------------
   */

  const average: number =
    mean(values);

  const middle: number =
    median(values);


  /**
   * --------------------------------------------------------------------------
   * VALORES EXTREMOS
   * --------------------------------------------------------------------------
   */

  const minimum: number =
    Math.min(...values);

  const maximum: number =
    Math.max(...values);


  /**
   * --------------------------------------------------------------------------
   * DISPERSIÓN
   * --------------------------------------------------------------------------
   */

  const standardDeviationValue: number =
    standardDeviation(values);

  const varianceValue: number =
    variance(values);


  /**
   * --------------------------------------------------------------------------
   * CUARTILES
   * --------------------------------------------------------------------------
   *
   * Q1 = percentil 25
   * Q3 = percentil 75
   *
   * Posteriormente:
   *
   * IQR = Q3 - Q1
   */
  const q1: number =
    percentile(values, 25);

  const q3: number =
    percentile(values, 75);

  const iqr: number =
    q3 - q1;


  /**
   * --------------------------------------------------------------------------
   * LÍMITES PARA DETECCIÓN DE OUTLIERS
   * --------------------------------------------------------------------------
   *
   * Método IQR:
   *
   * límite inferior = Q1 - 1.5 × IQR
   *
   * límite superior = Q3 + 1.5 × IQR
   */
  const lowerBound: number =
    q1 - 1.5 * iqr;

  const upperBound: number =
    q3 + 1.5 * iqr;


  /**
   * --------------------------------------------------------------------------
   * DETECCIÓN DE OUTLIERS
   * --------------------------------------------------------------------------
   *
   * Un valor es considerado potencialmente atípico si está fuera de los
   * límites definidos anteriormente.
   */
  const outliers: number[] =
    values.filter(
      (value: number): boolean =>
        value < lowerBound ||
        value > upperBound
    );


  /**
   * --------------------------------------------------------------------------
   * RESULTADO
   * --------------------------------------------------------------------------
   *
   * Construimos explícitamente NumericStatistics.
   *
   * Al declarar el tipo de retorno de la función como NumericStatistics,
   * TypeScript comprobará que no olvidemos ninguna propiedad requerida.
   */
  return {
    column,
    count: values.length,
    missing,

    mean: average,
    median: middle,

    min: minimum,
    max: maximum,

    stdDev: standardDeviationValue,
    variance: varianceValue,

    q1,
    q3,
    iqr,

    outliers
  };
}


/**
 * ============================================================================
 * CALCULAR ESTADÍSTICAS DEL DATASET
 * ============================================================================
 *
 * Esta función representa el punto de entrada público para el análisis
 * estadístico.
 *
 * Recibe:
 *
 *     Dataset
 *
 * y recibe también:
 *
 *     numericColumns
 *
 * que ya fueron determinadas por getNumericColumns().
 *
 * Después calcula las estadísticas de cada columna.
 * ============================================================================
 */

export function calculateStatistics(
  dataset: Dataset,
  numericColumns: string[]
): NumericStatistics[] {

  return numericColumns.map(
    (column: string): NumericStatistics =>
      calculateColumnStatistics(
        dataset,
        column
      )
  );
}
