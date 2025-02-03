import { PenColor } from "web-logo-core";

export const rgbToHex = (color: PenColor) => {
  const r = color[0];
  const g = color[1];
  const b = color[2];
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};