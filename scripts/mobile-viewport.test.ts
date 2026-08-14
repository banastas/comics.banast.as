import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('mobile viewport contracts', () => {
  it('uses the device viewport without disabling user zoom', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const viewport = html.match(/<meta name="viewport" content="([^"]+)"/i)?.[1] || '';

    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
    expect(viewport).not.toMatch(/maximum-scale|user-scalable\s*=\s*no/i);
  });

  it('keeps focusable mobile form controls at Safari-safe text size', () => {
    const css = fs.readFileSync('src/index.css', 'utf8');
    const mobileRule = css.match(/@media \(max-width: 639px\) \{([\s\S]*?)\n\}/)?.[1] || '';

    expect(mobileRule).toContain("input:not([type='checkbox']):not([type='radio'])");
    expect(mobileRule).toContain('select');
    expect(mobileRule).toContain('textarea');
    expect(mobileRule).toMatch(/font-size:\s*1rem\s*!important/);
  });
});
