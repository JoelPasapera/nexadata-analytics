import {
  Dataset,
  DatasetAnalysis
} from "../types/dataset.js";

import {
  getNumericColumns,
  getCategoricalColumns,
  calculateStatistics
} from "./statistics.service.js";

import {
  calculateCorrelations
} from "./correlation.service.js";

export function analyzeDataset(
  dataset: Dataset
): DatasetAnalysis {

  const numericColumns =
    getNumericColumns(dataset);

  const categoricalColumns =
    getCategoricalColumns(dataset);

  const statistics =
    calculateStatistics(
      dataset,
      numericColumns
    );

  const correlations =
    calculateCorrelations(
      dataset,
      numericColumns
    );

  const missingValues:
    Record<string, number> = {};

  for (
    const column
    of dataset.headers
  ) {

    missingValues[column] =
      dataset.rows.filter(
        (row) =>
          row[column] === null ||
          row[column] === undefined
      ).length;
  }

  return {
    rows:
      dataset.rows.length,

    columns:
      dataset.headers.length,

    numericColumns,

    categoricalColumns,

    statistics,

    correlations,

    missingValues
  };
}
