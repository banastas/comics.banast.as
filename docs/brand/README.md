# Brand assets

- `public/favicon.svg` is the source for every icon: a yellow speech balloon with an ink "C" and a red print-offset shadow on an ink tile.
- `docs/brand/og-image.svg` is the source for `public/og-image.jpg` (1200×630). It embeds Barlow Condensed and Inter so it renders with the site's lettering. The artwork sits in the middle 630 px band of a 1200×1200 canvas.

Palette: ink `#0d0c0b`, paper `#f2ede3`, process yellow `#ffc928`, print red `#e8432e` (see `src/styles/global.css`).

## Regenerating on macOS

```bash
qlmanage -t -s 1024 -o /tmp public/favicon.svg
for s in 16 32 192 512; do sips -z $s $s /tmp/favicon.svg.png --out public/icon-$s.png; done
mv public/icon-16.png public/favicon-16x16.png
mv public/icon-32.png public/favicon-32x32.png
# apple-touch-icon.png: render a copy of favicon.svg with the rx="112" corner rounding removed, then sips -z 180 180.

qlmanage -t -s 1200 -o /tmp docs/brand/og-image.svg
sips -c 630 1200 /tmp/og-image.svg.png --out /tmp/og.png
sips -s format jpeg -s formatOptions 86 /tmp/og.png --out public/og-image.jpg
```
