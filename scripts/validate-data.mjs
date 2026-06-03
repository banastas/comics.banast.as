import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../src/data/comics.json');

const requiredStringFields = [
  'id',
  'title',
  'seriesName',
  'releaseDate',
  'coverImageUrl',
  'coverArtist',
  'purchaseDate',
  'notes',
  'signedBy',
  'storageLocation',
  'createdAt',
  'updatedAt',
];

const requiredBooleanFields = ['isSlabbed', 'isVariant', 'isGraphicNovel'];
const requiredNumberFields = ['issueNumber', 'grade'];
const optionalNumberFields = ['purchasePrice', 'currentValue'];
const dateFields = ['releaseDate', 'purchaseDate', 'createdAt', 'updatedAt'];

const createComicSlug = (comic) => {
  const seriesSlug = comic.seriesName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const idMatch = comic.id.match(/\d+$/);
  const idSuffix = idMatch ? `-${idMatch[0]}` : '';
  return `${seriesSlug}-issue-${comic.issueNumber}${comic.isVariant ? '-variant' : ''}${idSuffix}`;
};

const fail = (messages) => {
  console.error(`Data validation failed for ${dataPath}`);
  messages.slice(0, 50).forEach((message) => console.error(`- ${message}`));
  if (messages.length > 50) {
    console.error(`- ...and ${messages.length - 50} more`);
  }
  process.exitCode = 1;
};

const raw = fs.readFileSync(dataPath, 'utf8');
const comics = JSON.parse(raw);
const errors = [];

if (!Array.isArray(comics)) {
  fail(['src/data/comics.json must be a JSON array']);
} else {
  const ids = new Set();
  const slugs = new Map();

  comics.forEach((comic, index) => {
    const label = comic && typeof comic === 'object' && 'id' in comic ? comic.id : `item at index ${index}`;

    if (!comic || typeof comic !== 'object' || Array.isArray(comic)) {
      errors.push(`${label} must be an object`);
      return;
    }

    requiredStringFields.forEach((field) => {
      if (typeof comic[field] !== 'string') {
        errors.push(`${label}.${field} must be a string`);
      }
    });

    requiredNumberFields.forEach((field) => {
      if (typeof comic[field] !== 'number' || !Number.isFinite(comic[field])) {
        errors.push(`${label}.${field} must be a finite number`);
      }
    });

    optionalNumberFields.forEach((field) => {
      if (comic[field] !== undefined && (typeof comic[field] !== 'number' || !Number.isFinite(comic[field]))) {
        errors.push(`${label}.${field} must be a finite number when present`);
      }
    });

    requiredBooleanFields.forEach((field) => {
      if (typeof comic[field] !== 'boolean') {
        errors.push(`${label}.${field} must be a boolean`);
      }
    });

    if (!Array.isArray(comic.tags) || comic.tags.some((tag) => typeof tag !== 'string')) {
      errors.push(`${label}.tags must be an array of strings`);
    }

    if (typeof comic.grade === 'number' && (comic.grade < 0.5 || comic.grade > 10)) {
      errors.push(`${label}.grade must be between 0.5 and 10`);
    }

    dateFields.forEach((field) => {
      if (typeof comic[field] === 'string' && Number.isNaN(new Date(comic[field]).getTime())) {
        errors.push(`${label}.${field} must be a valid date`);
      }
    });

    if (typeof comic.id === 'string') {
      if (ids.has(comic.id)) {
        errors.push(`${label}.id is duplicated`);
      }
      ids.add(comic.id);
    }

    if (
      typeof comic.id === 'string' &&
      typeof comic.seriesName === 'string' &&
      typeof comic.issueNumber === 'number' &&
      typeof comic.isVariant === 'boolean'
    ) {
      const slug = createComicSlug(comic);
      const existing = slugs.get(slug);
      if (existing) {
        errors.push(`${label} slug duplicates ${existing}: ${slug}`);
      }
      slugs.set(slug, comic.id);
    }
  });

  if (errors.length > 0) {
    fail(errors);
  } else {
    console.log(`Data validation passed: ${comics.length} comics, ${ids.size} unique IDs, ${slugs.size} unique slugs`);
  }
}
