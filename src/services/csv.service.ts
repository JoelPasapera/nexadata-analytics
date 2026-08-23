import { parse } from "csv-parse/sync";
import {
  Dataset,
  DataValue
} from "../types/dataset.js";

function parseValue(
  value: string
): DataValue {

  const clean =
    value.trim();

  if (
    clean === "" ||
    clean.toLowerCase() === "null" ||
    clean.toLowerCase() === "na" ||
    clean.toLowerCase() === "n/a"
  ) {
    return null;
  }

  const numeric =
    Number(clean);

  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return clean;
}

export function parseCsv(
  csv: string
): Dataset {

  const records =
    parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Record<
      string,
      string
    >[];

  if (records.length === 0) {
    throw new Error(
      "El archivo CSV está vacío."
    );
  }

  const headers =
    Object.keys(records[0]);

  const rows =
    records.map((row) => {

      const parsed:
        Record<string, DataValue> = {};

      for (const header of headers) {
        parsed[header] =
          parseValue(
            row[header] ?? ""
          );
      }

      return parsed;
    });

  return {
    headers,
    rows
  };
}
