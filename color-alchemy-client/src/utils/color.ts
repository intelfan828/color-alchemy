// Color utilities for RGB Alchemy

/**
 * Calculate the color distance Δ between two RGB colors (0-255 arrays)
 * Returns a value between 0 and 1
 */
export function colorDistance(a: number[], b: number[]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return (1 / 255) * (1 / 3) * Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Mix multiple RGB color contributions and normalize so no channel exceeds 255
 * Each contribution is an [r, g, b] array
 */
export function mixColors(contributions: number[][]): number[] {
  let r = 0, g = 0, b = 0;
  for (const c of contributions) {
    r += c[0];
    g += c[1];
    b += c[2];
  }
  const maxVal = Math.max(r, g, b, 255);
  const f = 255 / maxVal;
  return [
    Math.round(r * f),
    Math.round(g * f),
    Math.round(b * f),
  ];
}

/**
 * Clamp and round RGB values to [0, 255]
 */
export function normalizeColor(rgb: number[]): number[] {
  return rgb.map(x => Math.max(0, Math.min(255, Math.round(x))));
}

/**
 * Convert [r, g, b] to CSS rgb() string
 */
export function rgbToString(rgb: number[]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
} 