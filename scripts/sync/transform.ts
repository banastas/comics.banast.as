// Google Sheet rows -> src/data/comics.json, with stable IDs and no invented or
// drifting values. Ported from the "Transform Data" node of the n8n workflow that
// ran the import until November 2026; the behavior is intentionally identical.
//
// IDs: each row keeps the ID in its sheet "id" column. Rows without one get the
// next number, which the caller writes back to the sheet, so inserting, deleting
// or re-sorting rows never renumbers comics (permalinks end with the ID number).
//
// Fields the sheet leaves blank keep their previous value from comics.json instead
// of being set to "today"/"now" on every sync; updatedAt only changes when the row
// changed.

import type { Comic } from '../../src/types/Comic.ts';
import type { CellValue } from './google-sheets.ts';

/** Refuse to publish if the sheet suddenly has more than 10% fewer comics. */
export const MIN_KEEP_RATIO = 0.9;

export type SheetRow = Record<string, CellValue> & { row_number: number };

export interface IdWrite {
  row: number;
  id: string;
}

export interface SyncStats {
  total: number;
  added: number;
  removed: number;
  updated: number;
  newIds: number;
}

export interface TransformResult {
  comics: Comic[];
  changed: boolean;
  /** New IDs to write back to the sheet, as A1 ranges in the "id" column. */
  idUpdates: { range: string; values: string[][] }[];
  stats: SyncStats;
}

export interface TransformInput {
  /** The sheet's first row. */
  header: CellValue[];
  /** Data rows keyed by header, with the 1-based sheet row number. */
  rows: SheetRow[];
  /** The current src/data/comics.json. */
  current: Comic[];
  sheetName: string;
  now?: Date;
}

/** Converts a Sheets API values grid (header row first) into keyed rows, like n8n's Google Sheets node. */
export const rowsFromValues = (values: CellValue[][]): { header: CellValue[]; rows: SheetRow[] } => {
  const [header = [], ...body] = values;
  const keys = header.map((cell) => String(cell ?? '').trim());
  const rows: SheetRow[] = [];
  body.forEach((cells, index) => {
    if (!cells.some((cell) => cell !== '' && cell !== null && cell !== undefined)) return;
    const row = { row_number: index + 2 } as SheetRow;
    keys.forEach((key, column) => {
      if (key) row[key] = cells[column] ?? '';
    });
    rows.push(row);
  });
  return { header, rows };
};

const safeString = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

const parseIssueNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  const number = parseFloat(String(value ?? ''));
  return Number.isNaN(number) ? 1 : number;
};

const parseBoolean = (value: unknown) => (
  typeof value === 'boolean' ? value : ['true', 'yes', '1'].includes(String(value ?? '').toLowerCase().trim())
);

const parseCurrency = (value: unknown) => {
  if (typeof value === 'number') return value > 0 ? value : undefined;
  const cleaned = String(value ?? '').replace(/[$,€£¥]/g, '').trim();
  if (cleaned === '' || cleaned === '0') return undefined;
  const number = parseFloat(cleaned);
  return Number.isNaN(number) || number <= 0 ? undefined : number;
};

/** Returns YYYY-MM-DD, or null when blank or invalid (the caller falls back to the previous value). */
const parseDate = (value: unknown) => {
  const text = safeString(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
};

/** Sheet "createdAt" like "2025-09-11 10:08:38", stored as UTC. */
const parseDateTime = (value: unknown) => {
  const text = safeString(value);
  if (!text) return null;
  const date = new Date(text.replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(text) ? '' : 'Z'));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const idNumber = (id: unknown) => Number(String(id || '').match(/^comic-(\d+)$/)?.[1] ?? Number.NaN);

export const columnLetter = (index: number) => {
  let letters = '';
  for (let i = index + 1; i > 0; i = Math.floor((i - 1) / 26)) letters = String.fromCharCode(65 + ((i - 1) % 26)) + letters;
  return letters;
};

export class SyncError extends Error {}

export const transformSheet = ({ header, rows, current, sheetName, now: nowDate = new Date() }: TransformInput): TransformResult => {
  const currentById = new Map(current.map((comic) => [comic.id, comic]));

  const dataRows = rows.filter((row) => safeString(row.seriesName)).map((row) => ({ ...row }));
  if (dataRows.length === 0) {
    throw new SyncError('The sheet returned no comics (empty sheet or renamed "seriesName" header). Nothing published.');
  }
  if (current.length && dataRows.length < current.length * MIN_KEEP_RATIO) {
    throw new SyncError(`The sheet has ${dataRows.length} comics but comics.json has ${current.length} (more than ${Math.round((1 - MIN_KEEP_RATIO) * 100)}% fewer). Refusing to publish; check the sheet.`);
  }

  // ---- IDs ----
  const idColumn = header.findIndex((cell) => String(cell ?? '').trim() === 'id');
  if (idColumn < 0) throw new SyncError('The sheet has no "id" column header. Add one before syncing.');

  // Tools that append rows (e.g. Hermes) can leave a checkbox-style TRUE/FALSE in the id
  // column; treat that as blank so the row gets the next ID instead of failing the sync.
  for (const row of dataRows) {
    if (typeof row.id === 'boolean' || /^(true|false)$/i.test(safeString(row.id))) row.id = '';
  }
  const sheetIds = dataRows.map((row) => safeString(row.id));
  if (current.length && !sheetIds.some(Boolean)) {
    throw new SyncError('No row in the sheet has an id, but comics.json is not empty. Refusing to renumber the collection.');
  }

  const seen = new Set<string>();
  for (const row of dataRows) {
    const id = safeString(row.id);
    if (!id) continue;
    if (!/^comic-\d+$/.test(id)) throw new SyncError(`Invalid id "${id}" in sheet row ${row.row_number} (expected comic-<number>)`);
    if (seen.has(id)) throw new SyncError(`Duplicate id "${id}" in sheet row ${row.row_number}`);
    seen.add(id);
  }

  const idWrites: IdWrite[] = [];
  let next = Math.max(
    0,
    ...sheetIds.map(idNumber).filter(Number.isFinite),
    ...current.map((comic) => idNumber(comic.id)).filter(Number.isFinite),
  ) + 1;
  for (const row of dataRows) {
    if (!safeString(row.id)) {
      row.id = `comic-${next++}`;
      idWrites.push({ row: row.row_number, id: row.id });
    }
  }

  // ---- Build comics ----
  const now = nowDate.toISOString();
  const today = now.split('T')[0];
  const strip = (comic: Partial<Comic>) => JSON.stringify({ ...comic, updatedAt: undefined });

  const comics = dataRows.map((row) => {
    const id = safeString(row.id);
    const prev: Partial<Comic> = currentById.get(id) ?? {};
    const seriesName = safeString(row.seriesName);
    const comic: Comic = {
      id,
      createdAt: parseDateTime(row.createdAt) || prev.createdAt || now,
      updatedAt: prev.updatedAt || now,
      title: safeString(row.title) || seriesName,
      seriesName,
      issueNumber: parseIssueNumber(row.issueNumber),
      releaseDate: parseDate(row.releaseDate) || prev.releaseDate || today,
      coverImageUrl: safeString(row.coverImageUrl || row.coverImageName),
      coverArtist: safeString(row.coverArtist),
      grade: typeof row.grade === 'number' ? row.grade : (safeString(row.grade) ? parseFloat(String(row.grade)) : (prev.grade ?? 8)),
      purchaseDate: parseDate(row.purchaseDate) || prev.purchaseDate || today,
      notes: safeString(row.notes),
      signedBy: safeString(row.signedBy),
      storageLocation: safeString(row.storageLocation),
      tags: [],
      isVariant: parseBoolean(row.isVariant),
      isGraphicNovel: parseBoolean(row.isGraphicNovel),
      isSlabbed: parseBoolean(row.isSlabbed),
    };
    const purchasePrice = parseCurrency(row.purchasePrice);
    const currentValue = parseCurrency(row.currentValue);
    if (purchasePrice !== undefined) comic.purchasePrice = purchasePrice;
    if (currentValue !== undefined) comic.currentValue = currentValue;
    // Only bump updatedAt when something other than updatedAt changed.
    if (!prev.id || strip(prev) !== strip(comic)) comic.updatedAt = now;
    return comic;
  });

  comics.sort((a, b) => (a.seriesName !== b.seriesName ? a.seriesName.localeCompare(b.seriesName) : a.issueNumber - b.issueNumber));

  const nextIds = new Set(comics.map((comic) => comic.id));
  const stats: SyncStats = {
    total: comics.length,
    added: comics.filter((comic) => !currentById.has(comic.id)).length,
    removed: current.filter((comic) => !nextIds.has(comic.id)).length,
    updated: comics.filter((comic) => currentById.has(comic.id) && comic.updatedAt === now).length,
    newIds: idWrites.length,
  };

  return {
    comics,
    changed: JSON.stringify(comics) !== JSON.stringify(current),
    idUpdates: idWrites.map((write) => ({ range: `${sheetName}!${columnLetter(idColumn)}${write.row}`, values: [[write.id]] })),
    stats,
  };
};

export const commitMessage = (stats: SyncStats) =>
  `data: sync comics from sheet (${stats.total} total, +${stats.added} / -${stats.removed} / ~${stats.updated})`;
