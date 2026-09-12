# GitHub repository share image

Output: `github-social-preview.jpg` (1280 × 640, 2:1).
The final card directly composites the three original cover files selected by
the user. Only positioning, perspective, resampling, and export compression are
applied to those covers; their artwork and lettering are not AI-generated.
The typography is retained from the initial built-in image generation design.
The supplied GitHub template informed the dimensions and safe placement.
This is a repository share asset; it does not replace the website's Open Graph image.
The final image is a 1280 × 640 JPEG with a charcoal background, subtle green
and red print texture, and the approved off-white and electric-blue typography.

## Cover sources and composition

Back to front, using the original files downloaded from these URLs:

1. Back: [Alien: King Killer](https://covers.banast.as/Alien-King-Killer_04B.jpg).
2. Middle: [Alien vs. X-Men](https://covers.banast.as/Alien-Vs-X-Men_01E.jpg).
3. Front: [W0rldtr33](https://covers.banast.as/W0rldtr33_22C.jpg).

The front source visibly says “issue 19”; this is preserved as supplied despite
the URL filename. The middle source's printed “NOT FINAL” label is also preserved
where visible. No such label is added to the front cover.

Each original image is mapped directly onto a quadrilateral, with coordinates
listed clockwise from the top-left corner in the 1280 × 640 canvas:

- Back: `(610,162), (877,92), (981,524), (718,596)`.
- Middle: `(715,105), (988,48), (1088,506), (806,565)`.
- Front: `(899,30), (1252,101), (1180,617), (826,545)`.

The composition is rendered at 3× resolution with bicubic perspective sampling,
then reduced with Lanczos sampling and exported as a quality-94 JPEG without
chroma subsampling. The standalone cover source files are not added to the repository.

Source SHA-256 hashes:

```text
back   0d84932e3e5ff697fe0d1ea6319cdc0fc587bc6641c4250018eaab5c87bdb35c
middle 4f640e42a4c6b66257f21e50d97de24045493d725b6b982c83bc3573be02b0b9
front  eff82b4701fa9a28a35a3f415d0e52f009089f8274c5f23988e7650cb7ea301a
```

## Initial generation prompt (superseded artwork)

This prompt records the initial concept only. Its invented covers and cosmic
background were replaced in the final card at the user's request.

Use case: ads-marketing.
Create a finished GitHub repository social preview image for comics.banast.as.
Canvas: exactly 1280 × 640 pixels, landscape 2:1.
The supplied reference is a layout template only: use its aspect ratio and generous approximately 80-pixel safe inset for all essential text. Remove the template's red guides, pink margins, GitHub logo, and all placeholder writing. Do not reproduce its design.
Design a beautifully art-directed, crisp graphic combining the project's dark collection-browser identity with sophisticated comic-book print texture. Background charcoal #0d1117, off-white #e6edf3 typography, electric blue #3b82f6 accents, restrained warm cream and orange within original illustrated panels.
Composition: clear editorial typography on the left approximately 65% of canvas, a striking fan/stack of three original comic books or comic panels on the right approximately 35%. The artwork is original abstract cosmic adventure: an orbital planet, starfield, kinetic architectural shapes, crisp black ink and restrained halftone dots, no recognizable licensed characters or real comic covers. Let decorative art approach the right edge, but keep critical content and most of the stack inside the 80px inset. Use subtle layered shadows and blue edge lighting, no glossy 3D sheen. Plenty of negative space around writing. Feels like a thoughtfully designed developer project card, exceptionally legible at thumbnail size.
Exact text, no other words:
Small top-left eyebrow: "BANASTAS / OPEN SOURCE"
Large bold clean contemporary sans-serif project title, on two lines:
"comics."
"banast.as"
The first line off-white, second line electric blue. Approximately 78px, consistently aligned.
Below the title, smaller off-white subtitle on two lines:
"A home for every issue."
"A comic collection browser."
Small muted bottom-left line: "React  ·  TypeScript  ·  Cloudflare"
No statistics, fake UI, badges, template marks, watermarks, or GitHub logo. The original comic artwork should support, never obscure, the title. Deliver only the completed flat graphic.
