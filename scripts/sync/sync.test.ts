import { createVerify, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { Comic } from '../../src/types/Comic';
import { createAssertion, parseServiceAccount, type CellValue } from './google-sheets';
import { describeChanges, validateComics } from './sync-comics';
import { columnLetter, commitMessage, rowsFromValues, SyncError, transformSheet, type SheetRow } from './transform';

const HEADER: CellValue[] = [
  'createdAt', 'updatedAt', 'seriesName', 'issueNumber', 'releaseDate', 'coverImageName', 'coverImageUrl',
  'coverArtist', 'grade', 'purchasePrice', 'purchaseDate', 'currentValue', 'notes', 'signedBy',
  'storageLocation', 'tags', 'isVariant', 'isGraphicNovel', 'isSlabbed', 'id',
];
const NOW = new Date('2026-11-04T12:00:00.000Z');
const EARLIER = '2026-10-01T00:00:00.000Z';

const sheetRow = (rowNumber: number, overrides: Partial<Record<string, CellValue>> = {}): SheetRow => ({
  row_number: rowNumber,
  createdAt: '2025-09-11 10:08:38',
  updatedAt: '',
  seriesName: 'Alien',
  issueNumber: rowNumber,
  releaseDate: '2021-03-24',
  coverImageName: '',
  coverImageUrl: `https://covers.banast.as/alien_${rowNumber}.jpg`,
  coverArtist: '',
  grade: 9.4,
  purchasePrice: 4.99,
  purchaseDate: '2021-03-24',
  currentValue: 6,
  notes: '',
  signedBy: '',
  storageLocation: 'CB-01',
  tags: '',
  isVariant: false,
  isGraphicNovel: false,
  isSlabbed: false,
  id: `comic-${rowNumber - 1}`,
  ...overrides,
});

// The record transformSheet builds from sheetRow(n) when nothing changed.
const record = (rowNumber: number, overrides: Partial<Comic> = {}): Comic => ({
  id: `comic-${rowNumber - 1}`,
  createdAt: '2025-09-11T10:08:38.000Z',
  updatedAt: EARLIER,
  title: 'Alien',
  seriesName: 'Alien',
  issueNumber: rowNumber,
  releaseDate: '2021-03-24',
  coverImageUrl: `https://covers.banast.as/alien_${rowNumber}.jpg`,
  coverArtist: '',
  grade: 9.4,
  purchaseDate: '2021-03-24',
  notes: '',
  signedBy: '',
  storageLocation: 'CB-01',
  tags: [],
  isVariant: false,
  isGraphicNovel: false,
  isSlabbed: false,
  purchasePrice: 4.99,
  currentValue: 6,
  ...overrides,
});

const run = (rows: SheetRow[], current: Comic[]) =>
  transformSheet({ header: HEADER, rows, current, sheetName: 'comics', now: NOW });

describe('transformSheet', () => {
  it('reports no change when the sheet matches comics.json', () => {
    const result = run([sheetRow(2), sheetRow(3)], [record(2), record(3)]);
    expect(result.changed).toBe(false);
    expect(result.comics).toEqual([record(2), record(3)]);
    expect(result.idUpdates).toEqual([]);
    expect(result.stats).toEqual({ total: 2, added: 0, removed: 0, updated: 0, newIds: 0 });
  });

  it('assigns the next ID to rows with a blank, TRUE or FALSE id and writes them to the id column', () => {
    const current = [record(2), record(3)];
    const result = run([
      sheetRow(2), sheetRow(3),
      sheetRow(4, { id: '' }),
      sheetRow(5, { id: false }),
      sheetRow(6, { id: 'TRUE' }),
    ], current);

    expect(result.comics.map((comic) => comic.id)).toEqual(['comic-1', 'comic-2', 'comic-3', 'comic-4', 'comic-5']);
    expect(result.idUpdates).toEqual([
      { range: 'comics!T4', values: [['comic-3']] },
      { range: 'comics!T5', values: [['comic-4']] },
      { range: 'comics!T6', values: [['comic-5']] },
    ]);
    expect(result.stats).toMatchObject({ added: 3, newIds: 3 });
    expect(result.comics[2]).toMatchObject({ createdAt: '2025-09-11T10:08:38.000Z', updatedAt: NOW.toISOString() });
  });

  it('numbers new rows above IDs that only exist in comics.json, so removed IDs are never reused', () => {
    const result = run([sheetRow(2), sheetRow(3, { id: '' })], [record(2), record(41, { id: 'comic-40' })]);
    expect(result.comics.map((comic) => comic.id)).toContain('comic-41');
    expect(result.stats).toMatchObject({ added: 1, removed: 1 });
  });

  it('keeps a sheet ID that comics.json does not have yet, so a retried run does not duplicate it', () => {
    const result = run([sheetRow(2), sheetRow(3)], [record(2)]);
    expect(result.idUpdates).toEqual([]);
    expect(result.stats).toMatchObject({ added: 1, newIds: 0 });
  });

  it('bumps updatedAt only for rows that changed', () => {
    const result = run([sheetRow(2, { grade: 9.8 }), sheetRow(3)], [record(2), record(3)]);
    expect(result.comics[0]).toMatchObject({ grade: 9.8, updatedAt: NOW.toISOString() });
    expect(result.comics[1].updatedAt).toBe(EARLIER);
    expect(result.stats).toMatchObject({ updated: 1 });
    expect(commitMessage(result.stats)).toBe('data: sync comics from sheet (2 total, +0 / -0 / ~1)');
  });

  it('keeps previous dates and grade when the sheet leaves them blank', () => {
    const prev = record(2, { releaseDate: '1990-01-01', purchaseDate: '1990-02-01', grade: 7 });
    const result = run([sheetRow(2, { releaseDate: '', purchaseDate: '', grade: '' })], [prev]);
    expect(result.comics[0]).toMatchObject({ releaseDate: '1990-01-01', purchaseDate: '1990-02-01', grade: 7 });
  });

  it('parses currency text and drops zero or blank prices', () => {
    const result = run([sheetRow(2, { purchasePrice: '$1,250.00', currentValue: 0 })], [record(2)]);
    expect(result.comics[0].purchasePrice).toBe(1250);
    expect(result.comics[0]).not.toHaveProperty('currentValue');
  });

  it('sorts by series name, then issue number', () => {
    const result = run([
      sheetRow(2, { seriesName: 'Batman', issueNumber: 10 }),
      sheetRow(3, { seriesName: 'Alien', issueNumber: 2 }),
      sheetRow(4, { seriesName: 'Batman', issueNumber: 2 }),
    ], [record(2), record(3), record(4)]);
    expect(result.comics.map((comic) => `${comic.seriesName} ${comic.issueNumber}`)).toEqual(['Alien 2', 'Batman 2', 'Batman 10']);
  });

  it('ignores rows without a series name', () => {
    const result = run([sheetRow(2), sheetRow(3, { seriesName: '  ', id: '' })], [record(2)]);
    expect(result.comics).toHaveLength(1);
    expect(result.idUpdates).toEqual([]);
  });

  it.each([
    ['a duplicate id', [sheetRow(2), sheetRow(3, { id: 'comic-1' })], /Duplicate id "comic-1" in sheet row 3/],
    ['a malformed id', [sheetRow(2, { id: 'batman-1' })], /Invalid id "batman-1" in sheet row 2/],
    ['an empty sheet', [], /returned no comics/],
    ['no ids at all', [sheetRow(2, { id: '' })], /Refusing to renumber/],
  ])('refuses %s', (_label, rows, message) => {
    expect(() => run(rows as SheetRow[], [record(2)])).toThrow(message);
  });

  it('refuses to publish when the sheet loses more than 10% of the collection', () => {
    const current = Array.from({ length: 10 }, (_, i) => record(i + 2));
    const rows = Array.from({ length: 8 }, (_, i) => sheetRow(i + 2));
    expect(() => run(rows, current)).toThrow(SyncError);
    expect(() => run(rows, current)).toThrow(/8 comics but comics.json has 10/);
  });

  it('requires an id column header', () => {
    expect(() => transformSheet({ header: HEADER.slice(0, -1), rows: [sheetRow(2)], current: [record(2)], sheetName: 'comics', now: NOW }))
      .toThrow(/no "id" column/);
  });
});

describe('rowsFromValues', () => {
  it('keys cells by header, numbers rows from the sheet, fills trailing blanks and skips empty rows', () => {
    const { rows } = rowsFromValues([
      ['seriesName', 'issueNumber', 'id'],
      ['Alien', 1, 'comic-1'],
      [],
      ['Batman', 2],
    ]);
    expect(rows).toEqual([
      { row_number: 2, seriesName: 'Alien', issueNumber: 1, id: 'comic-1' },
      { row_number: 4, seriesName: 'Batman', issueNumber: 2, id: '' },
    ]);
  });

  it('maps column indexes to A1 letters', () => {
    expect([0, 19, 25, 26, 27, 701, 702].map(columnLetter)).toEqual(['A', 'T', 'Z', 'AA', 'AB', 'ZZ', 'AAA']);
  });
});

describe('validateComics', () => {
  it('names the sheet row and field of an invalid value', () => {
    const bad = record(2, { grade: Number.NaN });
    expect(() => validateComics([record(3), bad], () => 7)).toThrow(/comic-1 \(sheet row 7, Alien #2\): grade/);
  });

  it('accepts valid records', () => {
    expect(() => validateComics([record(2)], () => 2)).not.toThrow();
  });
});

describe('describeChanges', () => {
  it('lists added, removed and edited comics with the changed fields', () => {
    const current = [record(2), record(3)];
    const result = run([sheetRow(2, { notes: 'CGC 9.8 candidate' }), sheetRow(4)], current);
    expect(describeChanges(current, result)).toEqual([
      '+ comic-3 Alien #4',
      '- comic-2 Alien #3',
      '~ comic-1 Alien #2: notes',
    ]);
  });
});

describe('service account auth', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const account = { client_email: 'sync@example.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() };

  it('signs an RS256 JWT for the Sheets scope', () => {
    const assertion = createAssertion(account, 1_000);
    const [header, claims, signature] = assertion.split('.');
    expect(JSON.parse(Buffer.from(header, 'base64url').toString())).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toEqual({
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: 1_000,
      exp: 4_600,
    });
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${header}.${claims}`);
    expect(verifier.verify(publicKey, Buffer.from(signature, 'base64url'))).toBe(true);
  });

  it('explains a missing or malformed credential', () => {
    expect(() => parseServiceAccount(undefined)).toThrow(/GOOGLE_SERVICE_ACCOUNT_JSON is not set/);
    expect(() => parseServiceAccount('{')).toThrow(/not valid JSON/);
    expect(() => parseServiceAccount('{"client_email":"x"}')).toThrow(/client_email and private_key/);
  });
});
