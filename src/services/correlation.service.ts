/**
 * ============================================================================
 * correlation.service.ts
 * ============================================================================
 *
 * RESPONSABILIDAD
 * ----------------------------------------------------------------------------
 *
 * Este módulo es responsable de:
 *
 * 1. Recibir un Dataset.
 * 2. Recibir las columnas numéricas que deben analizarse.
 * 3. Construir pares válidos de observaciones.
 * 4. Verificar que existan suficientes datos.
 * 5. Verificar que las variables tengan variabilidad.
 * 6. Calcular la correlación de Pearson.
 * 7. Clasificar la fuerza de la correlación.
 * 8. Devolver resultados fuertemente tipados.
 *
 *
 * NO es responsabilidad de este archivo:
 *
 * - calcular matemáticamente Pearson desde cero;
 * - leer CSV;
 * - detectar tipos de columnas;
 * - manejar HTTP;
 * - renderizar HTML.
 *
 *
 * La matemática está centralizada en:
 *
 *     ../utils/math.ts
 *
 * ============================================================================
 */


import {
  Dataset,
  DataValue,
  CorrelationResult,
  CorrelationStrength
} from "../types/dataset.js";


import {
  correlation
} from "../utils/math.js";


/**
 * ============================================================================
 * CONFIGURACIÓN
 * ============================================================================
 *
 * Definimos explícitamente el mínimo de observaciones necesario.
 *
 * Aunque matemáticamente Pearson puede calcularse con dos observaciones,
 * una correlación con N = 2 tiene una utilidad estadística extremadamente
 * limitada.
 *
 * Por ahora utilizamos 3 como mínimo técnico.
 *
 * Esta constante permite cambiar la política sin modificar la lógica
 * principal del algoritmo.
 * ============================================================================
 */

const MINIMUM_OBSERVATIONS_FOR_CORRELATION = 3;


/**
 * ============================================================================
 * TIPO INTERNO: PAR DE OBSERVACIONES
 * ============================================================================
 *
 * Cuando calculamos la correlación entre:
 *
 *     ventas
 *
 * y:
 *
 *     clientes
 *
 * necesitamos mantener la correspondencia:
 *
 *     ventas[0] <-> clientes[0]
 *     ventas[1] <-> clientes[1]
 *     ventas[2] <-> clientes[2]
 *
 * Este tipo representa exactamente esa relación.
 * ============================================================================
 */

interface NumericPair {

  /**
   * Valor perteneciente a la variable A.
   */
  a: number;

  /**
   * Valor perteneciente a la variable B.
   */
  b: number;
}


/**
 * ============================================================================
 * CLASIFICACIÓN DE LA FUERZA
 * ============================================================================
 *
 * Recibe el coeficiente de Pearson y devuelve una clasificación textual.
 *
 * Utilizamos Math.abs() porque la fuerza depende de la magnitud de la
 * correlación, no de su dirección.
 *
 * Ejemplo:
 *
 *     r =  0.90 → very strong
 *     r = -0.90 → very strong
 *
 * La dirección se conserva en `correlation`.
 * ============================================================================
 */

function correlationStrength(
  value: number
): CorrelationStrength {

  /**
   * Validación defensiva.
   *
   * Pearson debe estar entre -1 y 1.
   */
  if (
    !Number.isFinite(value) ||
    value < -1 ||
    value > 1
  ) {
    throw new Error(
      `correlationStrength: coeficiente inválido (${value}).`
    );
  }


  const absoluteValue: number =
    Math.abs(value);


  if (absoluteValue < 0.2) {
    return "very weak";
  }


  if (absoluteValue < 0.4) {
    return "weak";
  }


  if (absoluteValue < 0.6) {
    return "moderate";
  }


  if (absoluteValue < 0.8) {
    return "strong";
  }


  return "very strong";
}


/**
 * ============================================================================
 * OBTENER VALOR NUMÉRICO VÁLIDO
 * ============================================================================
 *
 * Esta función convierte la unión:
 *
 *     string | number | null
 *
 * en:
 *
 *     number | null
 *
 * No realiza conversiones automáticas.
 *
 * Esto es deliberado.
 *
 * Si el parser ya determinó que un valor es string, no debemos convertirlo
 * nuevamente aquí porque estaríamos mezclando responsabilidades.
 * ============================================================================
 */

function getNumericValue(
  value: DataValue
): number | null {

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }


  return null;
}


/**
 * ============================================================================
 * CONSTRUIR PARES VÁLIDOS
 * ============================================================================
 *
 * Esta es una parte MUY importante.
 *
 * Supongamos:
 *
 *     ventas   = [100, 200, null, 400]
 *     clientes = [10,   20,  30,  40]
 *
 * No podemos hacer:
 *
 *     ventas válidas = [100, 200, 400]
 *     clientes       = [10, 20, 30, 40]
 *
 * porque perderíamos la correspondencia entre observaciones.
 *
 * En cambio debemos eliminar la fila completa:
 *
 *     [100, 10]
 *     [200, 20]
 *     [400, 40]
 *
 * Por eso construimos pares fila por fila.
 * ============================================================================
 */

function buildNumericPairs(
  dataset: Dataset,
  columnA: string,
  columnB: string
): NumericPair[] {

  const pairs: NumericPair[] = [];


  for (
    const row of dataset.rows
  ) {

    const rawValueA: DataValue =
      row[columnA] ?? null;

    const rawValueB: DataValue =
      row[columnB] ?? null;


    const valueA: number | null =
      getNumericValue(rawValueA);

    const valueB: number | null =
      getNumericValue(rawValueB);


    /**
     * Solamente incorporamos la fila cuando AMBOS valores son numéricos.
     *
     * Esto garantiza que:
     *
     *     pairs[i].a
     *
     * y:
     *
     *     pairs[i].b
     *
     * pertenecen exactamente a la misma observación.
     */
    if (
      valueA !== null &&
      valueB !== null
    ) {

      pairs.push({
        a: valueA,
        b: valueB
      });
    }
  }


  return pairs;
}


/**
 * ============================================================================
 * EXTRAER COLUMNA A PARTIR DE LOS PARES
 * ============================================================================
 *
 * Una vez construidos los pares:
 *
 *     [{ a: 10, b: 20 },
 *      { a: 15, b: 25 },
 *      { a: 30, b: 40 }]
 *
 * podemos obtener:
 *
 *     A = [10, 15, 30]
 *     B = [20, 25, 40]
 *
 * ============================================================================
 */

function extractColumnA(
  pairs: NumericPair[]
): number[] {

  return pairs.map(
    (pair: NumericPair): number =>
      pair.a
  );
}


function extractColumnB(
  pairs: NumericPair[]
): number[] {

  return pairs.map(
    (pair: NumericPair): number =>
      pair.b
  );
}


/**
 * ============================================================================
 * VERIFICAR VARIABILIDAD
 * ============================================================================
 *
 * Una correlación de Pearson necesita que ambas variables tengan variación.
 *
 * Ejemplo:
 *
 *     X = [10, 10, 10, 10]
 *
 * La desviación estándar de X es 0.
 *
 * Por tanto Pearson no está definido.
 *
 * No devolvemos:
 *
 *     correlation = 0
 *
 * porque eso sería semánticamente incorrecto.
 *
 * En lugar de eso, indicamos que el cálculo no es posible.
 * ============================================================================
 */

function hasVariation(
  values: number[]
): boolean {

  if (values.length === 0) {
    return false;
  }


  const firstValue: number =
    values[0];


  return values.some(
    (value: number): boolean =>
      value !== firstValue
  );
}


/**
 * ============================================================================
 * CALCULAR UNA CORRELACIÓN
 * ============================================================================
 *
 * Esta función encapsula el análisis de UNA pareja de columnas.
 *
 * Esto evita que calculateCorrelations() tenga demasiadas responsabilidades.
 * ============================================================================
 */

function calculatePairCorrelation(
  dataset: Dataset,
  columnA: string,
  columnB: string
): CorrelationResult | null {

  const pairs: NumericPair[] =
    buildNumericPairs(
      dataset,
      columnA,
      columnB
    );


  /**
   * --------------------------------------------------------------------------
   * VALIDACIÓN 1: cantidad mínima de observaciones
   * --------------------------------------------------------------------------
   */

  if (
    pairs.length <
    MINIMUM_OBSERVATIONS_FOR_CORRELATION
  ) {

    /**
     * Devolvemos null porque esta pareja no puede producir un resultado
     * estadísticamente útil.
     *
     * No devolvemos un CorrelationResult falso.
     */
    return null;
  }


  const valuesA: number[] =
    extractColumnA(pairs);

  const valuesB: number[] =
    extractColumnB(pairs);


  /**
   * --------------------------------------------------------------------------
   * VALIDACIÓN 2: variabilidad
   * --------------------------------------------------------------------------
   */

  const variableAHasVariation: boolean =
    hasVariation(valuesA);

  const variableBHasVariation: boolean =
    hasVariation(valuesB);


  /**
   * Si cualquiera de las dos variables es constante, Pearson no está
   * definido.
   *
   * Nuevamente, NO devolvemos correlation = 0.
   */
  if (
    !variableAHasVariation ||
    !variableBHasVariation
  ) {
    return null;
  }


  /**
   * --------------------------------------------------------------------------
   * CÁLCULO MATEMÁTICO
   * --------------------------------------------------------------------------
   *
   * Aquí NO implementamos Pearson manualmente.
   *
   * Esa responsabilidad pertenece a math.ts.
   */
  const correlationValue: number =
    correlation(
      valuesA,
      valuesB
    );


  /**
   * --------------------------------------------------------------------------
   * VALIDACIÓN DEFENSIVA DEL RESULTADO
   * --------------------------------------------------------------------------
   *
   * Aunque math.ts ya valida el resultado, esta capa protege el contrato
   * del servicio.
   */
  if (
    !Number.isFinite(correlationValue) ||
    correlationValue < -1 ||
    correlationValue > 1
  ) {

    throw new Error(
      `La correlación calculada para "${columnA}" y "${columnB}" no es válida.`
    );
  }


  /**
   * --------------------------------------------------------------------------
   * RESULTADO FINAL
   * --------------------------------------------------------------------------
   */

  return {

    variableA: columnA,

    variableB: columnB,

    correlation:
      Number(
        correlationValue.toFixed(4)
      ),

    sampleSize:
      pairs.length,

    strength:
      correlationStrength(
        correlationValue
      )
  };
}


/**
 * ============================================================================
 * FUNCIÓN PÚBLICA
 * ============================================================================
 *
 * Calcula todas las correlaciones posibles entre las columnas numéricas.
 *
 * Si tenemos:
 *
 *     [ventas, precio, clientes, satisfaccion]
 *
 * generaremos:
 *
 *     ventas       × precio
 *     ventas       × clientes
 *     ventas       × satisfaccion
 *     precio       × clientes
 *     precio       × satisfaccion
 *     clientes     × satisfaccion
 *
 * No analizamos:
 *
 *     ventas × ventas
 *
 * porque no tendría sentido para este análisis.
 * ============================================================================
 */

export function calculateCorrelations(
  dataset: Dataset,
  numericColumns: string[]
): CorrelationResult[] {

  const results: CorrelationResult[] = [];


  /**
   * Recorremos las columnas utilizando i y j.
   *
   * j comienza en i + 1 para evitar:
   *
   *     A × A
   *
   * y duplicados:
   *
   *     A × B
   *     B × A
   */
  for (
    let i: number = 0;
    i < numericColumns.length;
    i++
  ) {

    for (
      let j: number = i + 1;
      j < numericColumns.length;
      j++
    ) {

      const columnA: string =
        numericColumns[i];

      const columnB: string =
        numericColumns[j];


      /**
       * Analizamos esta pareja.
       */
      const result:
        CorrelationResult | null =
        calculatePairCorrelation(
          dataset,
          columnA,
          columnB
        );


      /**
       * Si la correlación no puede calcularse, no inventamos un resultado.
       */
      if (result === null) {
        continue;
      }


      results.push(result);
    }
  }


  /**
   * Ordenamos por magnitud absoluta.
   *
   * De esta forma:
   *
   *     -0.95
   *
   * aparecerá antes que:
   *
   *      0.70
   *
   * porque la fuerza de la relación es mayor.
   */
  return results.sort(
    (
      first: CorrelationResult,
      second: CorrelationResult
    ): number =>
      Math.abs(second.correlation) -
      Math.abs(first.correlation)
  );
}
