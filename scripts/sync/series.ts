// Google Sheet "series" tab -> src/data/series.json.
//
// Columns: seriesName (required, exactly as on the comics tab), publisher,
// volume, startYear. Blank cells are omitted. Rows naming a series that has no
// comics are skipped with a warning, so a typo never blocks the comic sync.

import type { SeriesMetadata } from '../../src/validation/comic-schema.ts';
import { SyncError, type SheetRow } from './transform.ts';

export const SERIES_SHEET_NAME = 'series';

export interface SeriesSyncResult {
  series: SeriesMetadata;
  warnings: string[];
}

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

const integer = (value: unknown, row: number, column: string, min: number, max: number): number | undefined => {
  const raw = text(value);
  if (!raw) return undefined;
  const number = Number(raw);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new SyncError(`Series sheet row ${row}: ${column} "${raw}" must be a whole number from ${min} to ${max}`);
  }
  return number;
};

export const transformSeriesSheet = (rows: SheetRow[], seriesNames: Set<string>): SeriesSyncResult => {
  const series: SeriesMetadata = {};
  const warnings: string[] = [];
  const seen = new Map<string, number>();

  rows.forEach((row) => {
    const name = text(row.seriesName);
    if (!name) return;
    const earlier = seen.get(name);
    if (earlier) throw new SyncError(`Series sheet rows ${earlier} and ${row.row_number} both describe "${name}"`);
    seen.set(name, row.row_number);

    if (!seriesNames.has(name)) {
      warnings.push(`Series sheet row ${row.row_number}: "${name}" has no comics in the collection; skipped`);
      return;
    }

    const details = {
      publisher: text(row.publisher) || undefined,
      volume: integer(row.volume, row.row_number, 'volume', 1, 1000),
      startYear: integer(row.startYear, row.row_number, 'startYear', 1900, 2100),
    };
    const filled = Object.fromEntries(Object.entries(details).filter(([, value]) => value !== undefined));
    if (Object.keys(filled).length > 0) series[name] = filled;
  });

  // Stable key order keeps diffs readable.
  const sorted = Object.fromEntries(Object.entries(series).sort(([a], [b]) => a.localeCompare(b)));
  return { series: sorted, warnings };
};

export const seriesCommitMessage = (count: number) => `data: sync series details from sheet (${count} series)`;
