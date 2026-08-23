import {
  Dataset,
  CorrelationResult
} from "../types/dataset.js";

import {
  correlation
} from "../utils/math.js";

function correlationStrength(
  value: number
): CorrelationResult["strength"] {

  const abs =
    Math.abs(value);

  if (abs < 0.2)
    return "very weak";

  if (abs < 0.4)
    return "weak";

  if (abs < 0.6)
    return "moderate";

  if (abs < 0.8)
    return "strong";

  return "very strong";
}

export function calculateCorrelations(
  dataset: Dataset,
  numericColumns: string[]
): CorrelationResult[] {

  const results:
    CorrelationResult[] = [];

  for (
    let i = 0;
    i < numericColumns.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < numericColumns.length;
      j++
    ) {

      const columnA =
        numericColumns[i];

      const columnB =
        numericColumns[j];

      const pairs =
        dataset.rows
          .map((row) => ({
            a: row[columnA],
            b: row[columnB]
          }))
          .filter(
            (
              pair
            ): pair is {
              a: number;
              b: number;
            } =>
              typeof pair.a ===
                "number" &&
              typeof pair.b ===
                "number"
          );

      if (pairs.length < 2) {
        continue;
      }

      const a =
        pairs.map(
          (p) => p.a
        );

      const b =
        pairs.map(
          (p) => p.b
        );

      const value =
        correlation(a, b);

      results.push({
        variableA: columnA,
        variableB: columnB,
        correlation:
          Number(
            value.toFixed(4)
          ),
        strength:
          correlationStrength(value)
      });
    }
  }

  return results.sort(
    (a, b) =>
      Math.abs(b.correlation) -
      Math.abs(a.correlation)
  );
}
