import { Font } from "@react-pdf/renderer";
// Vite's `?url` import gives us a hashed, bundled URL for this font file —
// the same pattern used for the pdf.js worker — so it's precached for
// offline use and never depends on a network font CDN.
import notoSansGeorgianUrl from "@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-400-normal.woff2?url";

/**
 * PDF's built-in "standard" fonts (Helvetica, Times, Courier) only cover
 * Latin script — Georgian text silently fails to render with them. Noto
 * Sans Georgian's "georgian" subset also covers the Latin block, digits,
 * and common punctuation, so registering it once as the single app-wide
 * PDF font correctly renders Georgian, English, numbers, and currency
 * codes together on the same invoice.
 *
 * Side-effect import this module (see templateRegistry.ts) once, before
 * any PDF is rendered.
 */
Font.register({
  family: "NotoSansGeorgian",
  src: notoSansGeorgianUrl
});

export const PDF_FONT_FAMILY = "NotoSansGeorgian";
