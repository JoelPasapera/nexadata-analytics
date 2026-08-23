/**
 * ============================================================================
 * math.ts
 * ============================================================================
 *
 * CAPA MATEMÁTICA DE NEXADATA ANALYTICS
 * ----------------------------------------------------------------------------
 *
 * Este módulo contiene las operaciones matemáticas fundamentales utilizadas
 * por los servicios estadísticos del proyecto.
 *
 * RESPONSABILIDAD:
 * ----------------
 *
 * Este archivo SOLO se ocupa de cálculos matemáticos.
 *
 * NO debe:
 *
 * - leer CSV;
 * - conocer Dataset;
 * - acceder a HTTP;
 * - manipular el DOM;
 * - generar respuestas de API;
 * - decidir qué columnas son numéricas.
 *
 * La separación es intencional:
 *
 *                    Dataset
 *                       │
 *                       ▼
 *              statistics.service
 *                       │
 *                       ▼
 *                    math.ts
 *
 * De esta manera, si existe un error matemático, podemos localizarlo
 * directamente en esta capa.
 *
 * ============================================================================
 */


/**
 * ============================================================================
 * TIPOS
 * ============================================================================
 */


/**
 * Define explícitamente qué tipo de varianza queremos calcular.
 *
 * "population"
 *     Utiliza N como denominador.
 *
 * "sample"
 *     Utiliza N - 1 como denominador.
 *
 * No utilizamos un booleano porque:
 *
 *     variance(values, true)
 *
 * no deja claro qué significa `true`.
 *
 * En cambio:
 *
 *     variance(values, "sample")
 *
 * hace explícita la intención.
 */
export type VarianceMode =
  | "population"
  | "sample";


/**
 * ============================================================================
 * VALIDACIÓN DE DATOS NUMÉRICOS
 * ============================================================================
 */


/**
 * Determina si un valor es un número válido para nuestros cálculos.
 *
 * IMPORTANTE:
 * -----------
 *
 * En JavaScript:
 *
 *     typeof NaN === "number"
 *
 * y:
 *
 *     typeof Infinity === "number"
 *
 * Por eso NO basta con:
 *
 *     typeof value === "number"
 *
 * Utilizamos Number.isFinite() para aceptar únicamente números reales
 * utilizables en los cálculos estadísticos.
 */
function isFiniteNumber(
  value: number
): boolean {

  return Number.isFinite(value);
}


/**
 * Valida un conjunto de datos antes de ejecutar un cálculo estadístico.
 *
 * Esta función evita que las funciones matemáticas trabajen silenciosamente
 * con:
 *
 * - arrays vacíos;
 * - NaN;
 * - Infinity;
 * - -Infinity.
 *
 * Si los datos no son válidos, lanzamos un Error explícito.
 *
 * Esto es preferible a devolver 0 porque:
 *
 *     0
 *
 * podría parecer un resultado estadístico real cuando en realidad significa
 * "no se pudo calcular".
 */
function validateNumericValues(
  values: number[],
  operationName: string
): void {

  if (values.length === 0) {
    throw new Error(
      `${operationName}: se requiere al menos un valor numérico.`
    );
  }

  const containsInvalidValue: boolean =
    values.some(
      (value: number): boolean =>
        !isFiniteNumber(value)
    );

  if (containsInvalidValue) {
    throw new Error(
      `${operationName}: los datos contienen valores numéricos inválidos (NaN o Infinity).`
    );
  }
}


/**
 * ============================================================================
 * MEDIA ARITMÉTICA
 * ============================================================================
 *
 * Fórmula:
 *
 *                  Σx
 *     media = -----------
 *                   N
 *
 * ============================================================================
 */
export function mean(
  values: number[]
): number {

  validateNumericValues(
    values,
    "mean"
  );

  const sum: number =
    values.reduce(
      (
        accumulator: number,
        value: number
      ): number =>
        accumulator + value,
      0
    );

  return sum / values.length;
}


/**
 * ============================================================================
 * MEDIANA
 * ============================================================================
 *
 * La mediana es el valor central de un conjunto ordenado.
 *
 * Si N es impar:
 *
 *     [1, 2, 3]
 *
 *     mediana = 2
 *
 * Si N es par:
 *
 *     [1, 2, 3, 4]
 *
 *     mediana = (2 + 3) / 2
 *
 * IMPORTANTE:
 * -----------
 *
 * No modificamos el array original.
 *
 * Array.prototype.sort() modifica el array recibido, por lo que utilizamos:
 *
 *     [...values]
 *
 * para crear una copia.
 *
 * Esto evita efectos secundarios y posibles bugs difíciles de detectar.
 * ============================================================================
 */
export function median(
  values: number[]
): number {

  validateNumericValues(
    values,
    "median"
  );

  const sortedValues: number[] =
    [...values].sort(
      (
        first: number,
        second: number
      ): number =>
        first - second
    );

  const middleIndex: number =
    Math.floor(
      sortedValues.length / 2
    );

  const isEvenLength: boolean =
    sortedValues.length % 2 === 0;

  if (isEvenLength) {

    const leftMiddle: number =
      sortedValues[middleIndex - 1];

    const rightMiddle: number =
      sortedValues[middleIndex];

    return (
      leftMiddle + rightMiddle
    ) / 2;
  }

  return sortedValues[middleIndex];
}


/**
 * ============================================================================
 * VARIANZA
 * ============================================================================
 *
 * Existen dos definiciones importantes.
 *
 *
 * 1. VARIANZA POBLACIONAL
 *
 *                  Σ(x - μ)²
 *     σ² = -----------------------
 *                       N
 *
 *
 * 2. VARIANZA MUESTRAL
 *
 *                  Σ(x - x̄)²
 *     s² = -----------------------
 *                     N - 1
 *
 *
 * Por eso el modo debe ser explícito.
 *
 * Ejemplo:
 *
 *     variance(values, "population")
 *
 * o:
 *
 *     variance(values, "sample")
 *
 * No usamos un parámetro opcional porque queremos obligar al código que
 * llame a esta función a tomar una decisión estadística explícita.
 * ============================================================================
 */
export function variance(
  values: number[],
  mode: VarianceMode
): number {

  validateNumericValues(
    values,
    "variance"
  );


  /**
   * La varianza muestral requiere al menos dos observaciones.
   */
  if (
    mode === "sample" &&
    values.length < 2
  ) {
    throw new Error(
      "variance: la varianza muestral requiere al menos dos valores."
    );
  }


  const average: number =
    mean(values);


  const squaredDeviationsSum: number =
    values.reduce(
      (
        accumulator: number,
        value: number
      ): number => {

        const deviation: number =
          value - average;

        return (
          accumulator +
          deviation * deviation
        );
      },
      0
    );


  const denominator: number =
    mode === "population"
      ? values.length
      : values.length - 1;


  return (
    squaredDeviationsSum /
    denominator
  );
}


/**
 * ============================================================================
 * DESVIACIÓN ESTÁNDAR
 * ============================================================================
 *
 * La desviación estándar es la raíz cuadrada de la varianza.
 *
 * σ = √σ²
 *
 * Utilizamos exactamente el mismo modo que variance().
 *
 * Esto evita que el usuario pueda calcular, accidentalmente:
 *
 *     varianza poblacional
 *
 * y después:
 *
 *     desviación estándar muestral
 *
 * ============================================================================
 */
export function standardDeviation(
  values: number[],
  mode: VarianceMode
): number {

  const calculatedVariance: number =
    variance(
      values,
      mode
    );

  return Math.sqrt(
    calculatedVariance
  );
}


/**
 * ============================================================================
 * PERCENTIL
 * ============================================================================
 *
 * Calcula un percentil mediante interpolación lineal.
 *
 * percentileValue debe estar entre:
 *
 *     0 <= percentileValue <= 100
 *
 * Ejemplos:
 *
 *     percentile(values, 25)
 *         → Q1
 *
 *     percentile(values, 50)
 *         → mediana
 *
 *     percentile(values, 75)
 *         → Q3
 *
 * ============================================================================
 */
export function percentile(
  values: number[],
  percentileValue: number
): number {

  validateNumericValues(
    values,
    "percentile"
  );


  /**
   * Validamos explícitamente el porcentaje.
   *
   * No tiene sentido calcular:
   *
   *     percentile(values, -20)
   *
   * ni:
   *
   *     percentile(values, 120)
   */
  if (
    !Number.isFinite(percentileValue) ||
    percentileValue < 0 ||
    percentileValue > 100
  ) {
    throw new Error(
      "percentile: el percentil debe estar entre 0 y 100."
    );
  }


  /**
   * Un único valor tiene como percentil cualquier posición el mismo valor.
   */
  if (values.length === 1) {
    return values[0];
  }


  /**
   * Trabajamos con una copia para no modificar el Dataset original.
   */
  const sortedValues: number[] =
    [...values].sort(
      (
        first: number,
        second: number
      ): number =>
        first - second
    );


  /**
   * Posición interpolada.
   *
   * Ejemplo:
   *
   *     P25
   *
   *     index = 0.25 * (N - 1)
   */
  const position: number =
    (percentileValue / 100) *
    (sortedValues.length - 1);


  const lowerIndex: number =
    Math.floor(position);

  const upperIndex: number =
    Math.ceil(position);


  /**
   * Si ambos índices son iguales, el percentil coincide exactamente
   * con uno de los elementos.
   */
  if (
    lowerIndex === upperIndex
  ) {
    return sortedValues[lowerIndex];
  }


  /**
   * Parte decimal utilizada para interpolar entre ambos valores.
   */
  const interpolationWeight: number =
    position - lowerIndex;


  const lowerValue: number =
    sortedValues[lowerIndex];

  const upperValue: number =
    sortedValues[upperIndex];


  return (
    lowerValue +
    interpolationWeight *
    (upperValue - lowerValue)
  );
}


/**
 * ============================================================================
 * COVARIANZA
 * ============================================================================
 *
 * La covarianza mide cómo dos variables varían conjuntamente.
 *
 * IMPORTANTE:
 * -----------
 *
 * x e y deben tener exactamente la misma cantidad de observaciones.
 *
 * Si tenemos:
 *
 *     x = [1, 2, 3]
 *     y = [4, 5]
 *
 * no existe una correspondencia válida entre todos los pares.
 *
 * En lugar de continuar silenciosamente, lanzamos un Error.
 *
 * ============================================================================
 */
export function covariance(
  x: number[],
  y: number[],
  mode: VarianceMode
): number {

  validateNumericValues(
    x,
    "covariance"
  );

  validateNumericValues(
    y,
    "covariance"
  );


  if (x.length !== y.length) {
    throw new Error(
      "covariance: ambas variables deben tener la misma cantidad de observaciones."
    );
  }


  if (
    mode === "sample" &&
    x.length < 2
  ) {
    throw new Error(
      "covariance: la covarianza muestral requiere al menos dos observaciones."
    );
  }


  const meanX: number =
    mean(x);

  const meanY: number =
    mean(y);


  const crossDeviationSum: number =
    x.reduce(
      (
        accumulator: number,
        valueX: number,
        index: number
      ): number => {

        const valueY: number =
          y[index];

        const deviationX: number =
          valueX - meanX;

        const deviationY: number =
          valueY - meanY;

        return (
          accumulator +
          deviationX * deviationY
        );
      },
      0
    );


  const denominator: number =
    mode === "population"
      ? x.length
      : x.length - 1;


  return (
    crossDeviationSum /
    denominator
  );
}


/**
 * ============================================================================
 * CORRELACIÓN DE PEARSON
 * ============================================================================
 *
 * Fórmula:
 *
 *              Cov(X,Y)
 *     r = -------------------
 *             σX × σY
 *
 * El resultado pertenece al intervalo:
 *
 *     -1 <= r <= 1
 *
 * Interpretación básica:
 *
 *     r > 0  → relación positiva
 *     r < 0  → relación negativa
 *     r = 0  → ausencia de relación lineal
 *
 * IMPORTANTE:
 * -----------
 *
 * Si una variable tiene desviación estándar igual a cero, no existe una
 * correlación de Pearson definida.
 *
 * Ejemplo:
 *
 *     X = [10, 10, 10, 10]
 *
 * No existe variabilidad.
 *
 * En la versión anterior se devolvía 0.
 *
 * Eso puede ser peligroso porque:
 *
 *     "0"
 *
 * parece significar "correlación cero".
 *
 * En realidad significa:
 *
 *     "no se puede calcular".
 *
 * Por eso ahora lanzamos un error explícito.
 *
 * ============================================================================
 */
export function correlation(
  x: number[],
  y: number[]
): number {

  validateNumericValues(
    x,
    "correlation"
  );

  validateNumericValues(
    y,
    "correlation"
  );


  if (x.length !== y.length) {
    throw new Error(
      "correlation: ambas variables deben tener la misma cantidad de observaciones."
    );
  }


  if (x.length < 2) {
    throw new Error(
      "correlation: se requieren al menos dos observaciones."
    );
  }


  /**
   * Para Pearson podemos utilizar la desviación estándar poblacional.
   *
   * La elección de N frente a N-1 no cambia el coeficiente de Pearson porque
   * los factores de escala se cancelan en el cociente.
   *
   * Lo dejamos explícito para evitar una llamada ambigua.
   */
  const standardDeviationX: number =
    standardDeviation(
      x,
      "population"
    );

  const standardDeviationY: number =
    standardDeviation(
      y,
      "population"
    );


  /**
   * Una desviación estándar de cero significa que la variable es constante.
   *
   * En ese caso Pearson NO está definido.
   */
  if (
    standardDeviationX === 0 ||
    standardDeviationY === 0
  ) {
    throw new Error(
      "correlation: no se puede calcular Pearson cuando una variable no presenta variabilidad."
    );
  }


  const covarianceXY: number =
    covariance(
      x,
      y,
      "population"
    );


  const correlationValue: number =
    covarianceXY /
    (
      standardDeviationX *
      standardDeviationY
    );


  /**
   * Debido a pequeñas imprecisiones de punto flotante, un resultado
   * matemáticamente igual a 1 podría aparecer como:
   *
   *     1.0000000000000002
   *
   * Limitamos el resultado al intervalo matemáticamente válido.
   */
  return Math.max(
    -1,
    Math.min(
      1,
      correlationValue
    )
  );
}
