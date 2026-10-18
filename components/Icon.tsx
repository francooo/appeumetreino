import React from "react";
import { SvgXml } from "react-native-svg";

// Gerado a partir de assets/images/meutreinador_assetsv2/icons (viewBox 24x24, traco em currentColor).
// "refresh" nao existe no pacote e foi desenhado no mesmo estilo.
const ICONS = {
  "activity": "<path d=\"M3 12h4l3-8 4 16 3-8h4\"/>",
  "aim": "<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3\"/>",
  "arrow-left": "<path d=\"M19 12H5M12 19l-7-7 7-7\"/>",
  "arrow-right": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
  "bars": "<path d=\"M4 20v-5M10 20V9M16 20V4M22 20v-9\"/>",
  "bell": "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4\"/>",
  "bolt": "<path d=\"m13 2-3 8H5l6 12 3-9h5z\"/>",
  "calendar": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M16 3v4M8 3v4M3 10h18\"/>",
  "camera": "<path d=\"M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>",
  "check": "<path d=\"m5 12 4 4L19 6\"/>",
  "check-circle": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 12 2.5 2.5L16 9\"/>",
  "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>",
  "dumbbell": "<path d=\"M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12\"/>",
  "edit": "<path d=\"m4 16-.8 4.8L8 20l11.5-11.5a2.1 2.1 0 0 0-3-3zM14.5 7.5l3 3\"/>",
  "email": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 7 9 6 9-6\"/>",
  "eye": "<path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "eye-off": "<path d=\"M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8\"/><path d=\"M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-4 4.7M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.8-.5\"/>",
  "flash": "<path d=\"m13 2-3 8H5l6 12 3-9h5z\"/>",
  "gallery": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"8.5\" cy=\"9\" r=\"1.5\"/><path d=\"m21 15-5-5L5 20\"/>",
  "google-g": "<path d=\"M20.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h4.8a4.1 4.1 0 0 1-1.8 2.7v2.3h3c1.7-1.6 2.5-4 2.5-6.8zM12 21c2.4 0 4.4-.8 5.9-2.1l-3-2.3c-.8.5-1.8.9-2.9.9-2.2 0-4-1.5-4.7-3.5h-3v2.4A9 9 0 0 0 12 21zM7.3 14a5.4 5.4 0 0 1 0-3.5V8h-3a9 9 0 0 0 0 8.5zM12 7.1c1.3 0 2.4.4 3.3 1.3l2.6-2.6A8.7 8.7 0 0 0 12 3a9 9 0 0 0-7.7 5l3 2.4c.7-2 2.5-3.3 4.7-3.3z\"/>",
  "home": "<path d=\"m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5M12 8h.01\"/>",
  "leaf": "<path d=\"M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16zM4 21c3-5 7-8 12-11\"/>",
  "lightbulb": "<path d=\"M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-.8.6-1 1.4-1 2H9c0-.6-.2-1.4-1-2z\"/>",
  "list": "<path d=\"M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01\"/>",
  "lock": "<rect x=\"4\" y=\"10\" width=\"16\" height=\"11\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3M12 14v3\"/>",
  "logout": "<path d=\"M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7\"/>",
  "play": "<path d=\"m8 5 12 7-12 7z\"/>",
  "plus": "<path d=\"M12 5v14M5 12h14\"/>",
  "refresh": "<path d=\"M21 12a9 9 0 1 1-2.64-6.36L21 8\"/><path d=\"M21 3v5h-5\"/>",
  "rotate-camera": "<path d=\"M20 7V3l-3 3a8 8 0 0 0-13 4M4 17v4l3-3a8 8 0 0 0 13-4\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "run": "<circle cx=\"15\" cy=\"4\" r=\"2\"/><path d=\"m12 8-3 4 4 2 2 5M9 12l-4 1M13 8l4 2 3 0M9 16l-3 5\"/>",
  "scan": "<path d=\"M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3\"/>",
  "shield": "<path d=\"M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z\"/><path d=\"m9 12 2 2 4-4\"/>",
  "shield-check": "<path d=\"M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z\"/><path d=\"m9 12 2 2 4-4\"/>",
  "skip": "<path d=\"M5 5l10 7-10 7zM19 5v14\"/>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41\"/>",
  "trend-up": "<path d=\"m3 17 6-6 4 4 8-9M15 6h6v6\"/>",
  "trophy": "<path d=\"M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4\"/>",
  "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>",
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 24, color, strokeWidth = 1.8 }: IconProps) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name].replace(/currentColor/g, color)}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}
