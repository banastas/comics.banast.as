import { isPlaceholderCover } from './cover-placeholders.mjs';

// Non-failing data quality checks for src/data/comics.json. Each warning names
// the affected record IDs so the collection owner can fix them in the source app.

const timestamp = (value) => (typeof value === 'string' && value.trim() !== '' ? new Date(value).getTime() : Number.NaN);
const hasValue = (value) => value !== undefined && value !== null;
const collapse = (value) => value.trim().replace(/\s+/g, ' ');

const groupBy = (items, keyFor) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = keyFor(item);
    if (key === undefined) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return groups;
};

const idsFor = (comics, predicate) => comics.filter(predicate).map((comic) => comic.id);
const idNumber = (id) => Number(String(id).match(/\d+$/)?.[0] ?? Number.NaN);
const compareIds = (a, b) => (idNumber(a) - idNumber(b)) || String(a).localeCompare(String(b));

export const normalizeSeriesName = (name) => collapse(
  name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' '),
);

export const normalizeArtistName = (name) => name
  .split(/\s*(?:&|,|\/|;|\+|\band\b)\s*/i)
  .map((part) => collapse(part).toLowerCase())
  .filter(Boolean)
  .sort()
  .join(' & ');

export const repeatedLeadingWord = (value) => {
  const match = typeof value === 'string' ? value.trim().match(/^([\p{L}\p{N}']+)\s+\1(?=\s|$)/iu) : null;
  return match ? match[1] : undefined;
};

const distinctValues = (comics, field) => [...new Set(comics.map((comic) => comic[field]).filter((value) => typeof value === 'string' && value.trim() !== ''))];

const wordsOf = (name) => name.split(/[^\p{L}\p{N}']+/u).filter(Boolean);

// Finds series that share a leading phrase of two or more words spelled with
// different capitalization, e.g. "Rick And Morty Forever" vs "Rick and Morty".
export const findSeriesCaseConflicts = (names) => {
  const groups = groupBy(names, (name) => {
    const words = wordsOf(name);
    return words.length >= 2 ? words.slice(0, 2).join(' ').toLowerCase() : undefined;
  });
  const conflicts = [];

  groups.forEach((groupNames) => {
    if (groupNames.length < 2) return;
    const tokenLists = groupNames.map(wordsOf);
    let shared = 2;
    while (tokenLists.every((tokens) => tokens.length > shared && tokens[shared].toLowerCase() === tokenLists[0][shared].toLowerCase())) shared += 1;
    const forms = groupBy(groupNames, (name) => wordsOf(name).slice(0, shared).join(' '));
    if (forms.size > 1) conflicts.push(forms);
  });

  return conflicts;
};

const PREORDER_WINDOW_DAYS = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

export const findDataWarnings = (comics) => {
  const warnings = [];
  const add = (rule, message, ids) => {
    if (ids.length > 0) warnings.push({ rule, message, ids: [...new Set(ids)].sort(compareIds) });
  };

  const daysBeforeRelease = (comic) => {
    const purchased = timestamp(comic.purchaseDate);
    const released = timestamp(comic.releaseDate);
    return Number.isFinite(purchased) && Number.isFinite(released) ? (released - purchased) / DAY_MS : 0;
  };
  comics
    .filter((comic) => daysBeforeRelease(comic) > PREORDER_WINDOW_DAYS)
    .forEach((comic) => add(
      'purchase-before-release',
      `purchaseDate ${comic.purchaseDate} is ${Math.round(daysBeforeRelease(comic))} days before releaseDate ${comic.releaseDate}`,
      [comic.id],
    ));
  add(
    'purchase-before-release-preorder',
    `purchaseDate is 1-${PREORDER_WINDOW_DAYS} days before releaseDate (likely preorders; confirm the release dates)`,
    idsFor(comics, (comic) => daysBeforeRelease(comic) > 0 && daysBeforeRelease(comic) <= PREORDER_WINDOW_DAYS),
  );

  ['title', 'seriesName'].forEach((field) => {
    groupBy(comics, (comic) => {
      const word = repeatedLeadingWord(comic[field]);
      return word ? comic[field] : undefined;
    }).forEach((group, value) => add(
      'repeated-leading-word',
      `${field} "${value}" repeats its first word`,
      group.map((comic) => comic.id),
    ));
  });

  const seriesNames = distinctValues(comics, 'seriesName');
  groupBy(seriesNames, normalizeSeriesName).forEach((names) => {
    if (names.length < 2) return;
    add(
      'series-name-variants',
      `series names differ only by case or punctuation: ${names.map((name) => `"${name}"`).join(', ')}`,
      idsFor(comics, (comic) => names.includes(comic.seriesName)),
    );
  });

  findSeriesCaseConflicts(seriesNames).forEach((forms) => {
    const description = [...forms.entries()]
      .map(([form, names]) => `"${form}" (${names.map((name) => `"${name}"`).join(', ')})`)
      .join(' vs ');
    const affected = [...forms.values()].flat();
    add(
      'series-prefix-case',
      `series share a leading phrase with different capitalization: ${description}`,
      idsFor(comics, (comic) => affected.includes(comic.seriesName)),
    );
  });

  groupBy(distinctValues(comics, 'coverArtist'), normalizeArtistName).forEach((names) => {
    if (names.length < 2) return;
    add(
      'cover-artist-variants',
      `cover artist names match after normalizing separators: ${names.map((name) => `"${name}"`).join(', ')}`,
      idsFor(comics, (comic) => names.includes(comic.coverArtist)),
    );
  });

  add(
    'raw-gem-mint-grade',
    'raw (not slabbed) comic graded 9.8 or higher',
    idsFor(comics, (comic) => !comic.isSlabbed && typeof comic.grade === 'number' && comic.grade >= 9.8),
  );

  add(
    'missing-value',
    'record has neither purchasePrice nor currentValue',
    idsFor(comics, (comic) => !hasValue(comic.purchasePrice) && !hasValue(comic.currentValue)),
  );

  groupBy(comics.filter((comic) => isPlaceholderCover(comic.coverImageUrl)), (comic) => comic.coverImageUrl || '(empty)')
    .forEach((group, url) => add('placeholder-cover', `placeholder cover image ${url}`, group.map((comic) => comic.id)));

  groupBy(comics.filter((comic) => !isPlaceholderCover(comic.coverImageUrl)), (comic) => comic.coverImageUrl)
    .forEach((group, url) => {
      const series = new Set(group.map((comic) => normalizeSeriesName(comic.seriesName)));
      if (series.size < 2) return;
      add('shared-cover', `cover image ${url} is shared by ${series.size} different series`, group.map((comic) => comic.id));
    });

  return warnings;
};

export const formatDataWarnings = (warnings) => {
  if (warnings.length === 0) return 'WARNINGS: none';

  const byRule = groupBy(warnings, (warning) => warning.rule);
  const lines = [`WARNINGS (${warnings.length}, non-failing)`];
  byRule.forEach((ruleWarnings, rule) => {
    const recordCount = new Set(ruleWarnings.flatMap((warning) => warning.ids)).size;
    lines.push(`  ${rule}: ${ruleWarnings.length} warning${ruleWarnings.length === 1 ? '' : 's'}, ${recordCount} record${recordCount === 1 ? '' : 's'}`);
    ruleWarnings.forEach((warning) => lines.push(`    - ${warning.message} [${warning.ids.join(', ')}]`));
  });
  return lines.join('\n');
};
