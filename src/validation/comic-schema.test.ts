import { describe, expect, it } from 'vitest';
import comics from '../data/comics.json';
import { parseComics } from './comic-schema';

describe('comic data schema', () => {
  it('accepts the current nightly-synced comics.json payload', () => {
    const parsed = parseComics(comics);

    expect(parsed).toHaveLength(805);
  });
});
