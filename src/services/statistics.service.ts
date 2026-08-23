import {
  Dataset,
  NumericStatistics
} from "../types/dataset.js";

import {
  mean,
  median,
  percentile,
  standardDeviation,
  variance
} from "../utils/math.js";

export function getNumericColumns(
  dataset: Dataset
): string[] {

  return dataset.headers.filter(
    (column) => {

      const values =
        dataset.rows
          .map(
            (row) => row[column]
          )
          .filter(
            (value): value is number =>
              typeof value === "number"
          );

      return values.length > 0;
    }
  );
}

export function getCategoricalColumns(
  dataset: Dataset
): string[] {

  return dataset.headers.filter(
    (column) => {

      const values =
        dataset.rows.map(
          (row) => row[column]
        );

      return values.some(
        (value) =>
          typeof value === "string"
      );
    }
  );
}

export function calculateStatistics(
  dataset: Dataset,
  numericColumns: string[]
): NumericStatistics[] {

  return numericColumns.map(
    (column) => {

      const values =
        dataset.rows
          .map(
            (row) => row[column]
          )
          .filter(
            (value): value is number =>
              typeof value === "number"
          );

      const missing =
        dataset.rows.length -
        values.length;

      const q1 =
        percentile(values, 25);

      const q3 =
        percentile(values, 75);

      const iqr =
        q3 - q1;

      const lowerBound =
        q1 - 1.5 * iqr;

      const upperBound =
        q3 + 1.5 * iqr;

      const outliers =
        values.filter(
          (value) =>
            value < lowerBound ||
            value > upperBound
        );

      return {
        column,
        count: values.length,
        missing,
        mean: mean(values),
        median: median(values),
        min: Math.min(...values),
        max: Math.max(...values),
        stdDev:
          standardDeviation(values),
        variance:
          variance(values),
        q1,
        q3,
        iqr,
        outliers
      };
    }
  );
}
