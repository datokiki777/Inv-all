import { Font } from "@react-pdf/renderer";
// Vite's `?url` import gives us a hashed, bundled URL for this font file —
// the same pattern used for the pdf.js worker — so it's precached for
// offline use and never depends on a network font CDN.
import notoSansGeorgianUrl from "./assets/NotoSansGeorgian-Regular.ttf?url";

/**
 * PDF's built-in "standard" fonts (Helvetica, Times, Courier) only cover
 * Latin script — Georgian text silently fails to render with them.
 *
 * This specific font file is a static (non-variable) instance extracted
 * from Google's official Noto Sans Georgian variable font
 * (google/fonts, ofl/notosansgeorgian). It's used instead of the
 * @fontsource "georgian" subset because that subset ONLY contains the
 * Georgian Unicode block (U+10A0-10FF) and nothing else — no Latin
 * letters, no digits, no punctuation, no currency symbols. Since every
 * real invoice mixes Georgian with Latin names/emails, digits, and
 * currency signs (including ₾), a Georgian-only subset silently drops
 * every non-Georgian character. This file covers Georgian + Latin +
 * common symbols + ₾/€ in one font, confirmed by rendering to an actual
 * rasterized PDF page and inspecting the pixels.
 *
 * Side-effect import this module (see templateRegistry.ts) once, before
 * any PDF is rendered.
 */
Font.register({
  family: "NotoSansGeorgian",
  src: notoSansGeorgianUrl
});

export const PDF_FONT_FAMILY = "NotoSansGeorgian";
