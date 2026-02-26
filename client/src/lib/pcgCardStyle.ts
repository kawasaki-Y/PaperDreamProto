// Shared PCG card style types, constants, and utilities.
// Used by both Creator.tsx (editing) and PrintPreview.tsx (print) to ensure identical rendering.

export type CardPart =
  | "background"
  | "border"
  | "titleBg"
  | "titleText"
  | "bodyText"
  | "accent"
  | "imageFrame";

export interface CardStyle {
  background: string;
  border: string;
  titleBg: string;
  titleText: string;
  bodyText: string;
  accent: string;
  imageFrame: string;
}

export interface PCGHeaderSettings {
  backgroundColor: string;
  textColor: string;
  borderRadius: "none" | "small" | "medium" | "large";
}

export interface PCGFooterSettings {
  backgroundColor: string;
  textColor: string;
  visible: boolean;
}

export interface PCGDesignSettings {
  textSize: "xs" | "small" | "medium" | "large";
  backgroundColor: string;
  fontFamily: string;
  textColor: string;
  header?: Partial<PCGHeaderSettings>;
  footer?: Partial<PCGFooterSettings>;
  cardStyle?: Partial<CardStyle>;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const defaultCardStyle: CardStyle = {
  background: "#1e3a5f",
  border: "#4a6fa5",
  titleBg: "rgba(0,0,0,0.3)",
  titleText: "#ffffff",
  bodyText: "#ffffff",
  accent: "#f59e0b",
  imageFrame: "rgba(255,255,255,0.1)",
};

export const defaultHeaderSettings: PCGHeaderSettings = {
  backgroundColor: "",
  textColor: "",
  borderRadius: "none",
};

export const defaultFooterSettings: PCGFooterSettings = {
  backgroundColor: "",
  textColor: "",
  visible: true,
};

export const defaultDesign: PCGDesignSettings = {
  textSize: "medium",
  backgroundColor: "#1e3a5f",
  fontFamily: "gothic",
  textColor: "#ffffff",
  header: { ...defaultHeaderSettings },
  footer: { ...defaultFooterSettings },
};

// ── Labels / presets (for editor UI) ─────────────────────────────────────────

export const cardPartLabels: Record<CardPart, string> = {
  background: "背景",
  border: "枠線",
  titleBg: "タイトル背景",
  titleText: "タイトル文字",
  bodyText: "本文文字",
  accent: "アクセント",
  imageFrame: "画像枠",
};

export const swatchPresets: Record<CardPart, string[]> = {
  background: ["#1e3a5f", "#0f172a", "#1c1c1c", "#2d1b4e", "#1a3a2a", "#3b1a1a"],
  border: ["#4a6fa5", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
  titleBg: ["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)", "rgba(255,255,255,0.1)", "rgba(245,158,11,0.3)"],
  titleText: ["#ffffff", "#fbbf24", "#60a5fa", "#34d399", "#f87171"],
  bodyText: ["#ffffff", "#e2e8f0", "#fbbf24", "#94a3b8", "#d1d5db"],
  accent: ["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"],
  imageFrame: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.3)", "rgba(0,0,0,0.3)", "rgba(245,158,11,0.4)"],
};

// ── Font options ──────────────────────────────────────────────────────────────

export const fontOptions = [
  { value: "gothic", label: "ゴシック体", family: "'Rajdhani', sans-serif" },
  { value: "mincho", label: "明朝体", family: "'Libre Baskerville', 'Playfair Display', serif" },
  { value: "rounded", label: "丸ゴシック", family: "'DM Sans', sans-serif" },
  { value: "handwriting", label: "手書き風", family: "'Architects Daughter', cursive" },
  { value: "cinzel", label: "クラシック", family: "'Cinzel', serif" },
  { value: "orbitron", label: "サイバー", family: "'Orbitron', sans-serif" },
];

// ── Utility functions ─────────────────────────────────────────────────────────

export function getResolvedFont(family: string): string {
  const found = fontOptions.find(f => f.value === family);
  return found?.family || "'Rajdhani', sans-serif";
}

export function getTextSizes(size: string): { title: string; body: string; label: string } {
  const sizeMap: Record<string, { title: string; body: string; label: string }> = {
    xs: { title: "14px", body: "10px", label: "8px" },
    small: { title: "16px", body: "12px", label: "9px" },
    medium: { title: "20px", body: "14px", label: "10px" },
    large: { title: "24px", body: "16px", label: "11px" },
  };
  return sizeMap[size] || sizeMap.medium;
}

export function getBorderRadius(size: string): string {
  const map: Record<string, string> = {
    none: "0",
    small: "4px",
    medium: "8px",
    large: "16px",
  };
  return map[size] || "0";
}

/**
 * Merges PCGDesignSettings (legacy bg/text color + header/footer + new cardStyle)
 * into a flat CardStyle used for rendering. Both EditableCardPreview and PCGPrintCard
 * must call this function to guarantee identical output.
 */
export function getCardStyle(design: PCGDesignSettings): CardStyle {
  return {
    ...defaultCardStyle,
    background: design.backgroundColor || defaultCardStyle.background,
    bodyText: design.textColor || defaultCardStyle.bodyText,
    titleText: design.header?.textColor || design.textColor || defaultCardStyle.titleText,
    titleBg: design.header?.backgroundColor || defaultCardStyle.titleBg,
    ...(design.cardStyle || {}),
  };
}
