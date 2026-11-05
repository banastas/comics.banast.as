// Syncs the Google Sheet "comics" tab into src/data/comics.json, and the
// optional "series" tab into src/data/series.json.
//
//   node scripts/sync/sync-comics.ts [--dry-run] [--github-output <file>]
//
// Requires GOOGLE_SERVICE_ACCOUNT_JSON (a service-account key with editor access
// to the sheet). New row IDs are written back to the sheet before comics.json is
// saved; a sheet ID missing from comics.json is treated as a new comic, so a run
// that fails after the write-back is safe to repeat.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import type { Comic } from '../../src/types/Comic.ts';
import { comicsSchema } from '../../src/validation/comic-schema.ts';
import { findDataWarnings, formatDataWarnings } from '../data-warnings.mjs';
import { getAccessToken, parseServiceAccount, SheetsClient } from './google-sheets.ts';
import { commitMessage, rowsFromValues, SyncError, transformSheet, type TransformResult } from './transform.ts';
import { SERIES_SHEET_NAME, seriesCommitMessage, transformSeriesSheet } from './series.ts';

export const SPREADSHEET_ID = '1SuoelwhnOaU8MYthyfMC5KsBegYIFO5NoWpa6PMzvRM';
export const SHEET_NAME = 'comics';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dataPath = path.join(rootDir, 'src/data/comics.json');
const seriesPath = path.join(rootDir, 'src/data/series.json');

/** Reads the series tab, or returns null when the sheet has no such tab yet. */
const readSeriesTab = async (sheets: SheetsClient) => {
  try {
    return await sheets.getValues(SERIES_SHEET_NAME);
  } catch (error) {
    if (error instanceof Error && /Unable to parse range/i.test(error.message)) return null;
    throw error;
  }
};

/** Fails with the sheet row and field for any record the site schema rejects. */
export const validateComics = (comics: Comic[], rowFor: (id: string) => number | undefined) => {
  const result = comicsSchema.safeParse(comics);
  if (result.success) return;
  const problems = result.error.issues.slice(0, 20).map((issue) => {
    const [index, field] = issue.path;
    const comic = typeof index === 'number' ? comics[index] : undefined;
    const row = comic ? rowFor(comic.id) : undefined;
    const where = comic ? `${comic.id} (sheet row ${row ?? '?'}, ${comic.seriesName} #${comic.issueNumber})` : 'collection';
    return `- ${where}: ${String(field ?? '')} ${issue.message}`.replace(/: {2}/, ': ');
  });
  throw new SyncError(`The sheet has ${result.error.issues.length} invalid value(s); nothing was written.\n${problems.join('\n')}`);
};

export const describeChanges = (current: Comic[], result: TransformResult): string[] => {
  const before = new Map(current.map((comic) => [comic.id, comic]));
  const after = new Map(result.comics.map((comic) => [comic.id, comic]));
  const label = (comic: Comic) => `${comic.id} ${comic.seriesName} #${comic.issueNumber}`;
  const lines: string[] = [];
  result.comics.filter((comic) => !before.has(comic.id)).forEach((comic) => lines.push(`+ ${label(comic)}`));
  current.filter((comic) => !after.has(comic.id)).forEach((comic) => lines.push(`- ${label(comic)}`));
  result.comics.forEach((comic) => {
    const prev = before.get(comic.id);
    if (!prev) return;
    const fields = (Object.keys({ ...prev, ...comic }) as (keyof Comic)[])
      .filter((key) => key !== 'updatedAt' && JSON.stringify(prev[key]) !== JSON.stringify(comic[key]));
    if (fields.length) lines.push(`~ ${label(comic)}: ${fields.join(', ')}`);
  });
  return lines;
};

const main = async () => {
  const { values: args } = parseArgs({
    options: {
      'dry-run': { type: 'boolean', default: false },
      'github-output': { type: 'string' },
    },
  });
  const dryRun = args['dry-run'] ?? false;

  const current = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as Comic[];
  const account = parseServiceAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const sheets = new SheetsClient(await getAccessToken(account), SPREADSHEET_ID);
  const { header, rows } = rowsFromValues(await sheets.getValues(SHEET_NAME));

  const result = transformSheet({ header, rows, current, sheetName: SHEET_NAME });
  const rowById = new Map<string, number>();
  rows.forEach((row) => { if (typeof row.id === 'string') rowById.set(row.id.trim(), row.row_number); });
  result.idUpdates.forEach((update) => rowById.set(update.values[0][0], Number(update.range.match(/\d+$/)?.[0])));
  validateComics(result.comics, (id) => rowById.get(id));

  const seriesValues = await readSeriesTab(sheets);
  const currentSeries = fs.readFileSync(seriesPath, 'utf8');
  let nextSeries = currentSeries;
  let seriesCount = 0;
  if (seriesValues) {
    const { series, warnings: seriesWarnings } = transformSeriesSheet(
      rowsFromValues(seriesValues).rows,
      new Set(result.comics.map((comic) => comic.seriesName)),
    );
    seriesWarnings.forEach((warning) => console.log(warning));
    seriesCount = Object.keys(series).length;
    nextSeries = `${JSON.stringify(series, null, 2)}\n`;
  } else {
    console.log('No "series" tab in the sheet; series.json left unchanged.');
  }
  const seriesChanged = nextSeries !== currentSeries;

  const message = result.changed
    ? `${commitMessage(result.stats)}${seriesChanged ? ` and ${seriesCount} series` : ''}`
    : seriesCommitMessage(seriesCount);
  console.log(result.changed || seriesChanged ? message : `No changes (${result.stats.total} comics).`);
  if (seriesChanged) console.log(`series.json: ${seriesCount} series with details`);
  describeChanges(current, result).forEach((line) => console.log(line));
  const warnings = formatDataWarnings(findDataWarnings(result.comics));
  if (warnings) console.log(warnings);

  if (dryRun) {
    result.idUpdates.forEach((update) => console.log(`would write ${update.values[0][0]} to ${update.range}`));
    console.log('Dry run: nothing written to the sheet or comics.json.');
  } else {
    if (result.changed) {
      await sheets.batchUpdate(result.idUpdates);
      fs.writeFileSync(dataPath, JSON.stringify(result.comics, null, 2));
    }
    if (seriesChanged) fs.writeFileSync(seriesPath, nextSeries);
  }

  if (args['github-output']) {
    const changed = (result.changed || seriesChanged) && !dryRun;
    fs.appendFileSync(args['github-output'], `changed=${changed}\nmessage=${message}\n`);
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
