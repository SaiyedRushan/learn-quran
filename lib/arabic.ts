// Which Arabic string to render for a given script setting.
//
// "uthmani" and "amiri" are the SAME verified Uthmani text (ayah.arabic) shown
// in different typefaces — only the CSS font swaps. "indopak" is a genuinely
// different orthography stored separately (ayah.arabicIndopak), so the string
// itself changes. Every Arabic render surface routes through this so the choice
// stays consistent (and falls back to Uthmani if an IndoPak string is missing).

import type {ArabicFont} from "@/lib/settings";

export function pickArabic(v: {arabic: string; arabicIndopak?: string}, font: ArabicFont): string {
  return font === "indopak" && v.arabicIndopak ? v.arabicIndopak : v.arabic;
}
