export const PORTFOLIO_PRESETS = [
  "editorial",
  "mono",
  "sketchbook",
] as const;

export type PortfolioPreset = (typeof PORTFOLIO_PRESETS)[number];
export type PortfolioMode = "light" | "dark";

export const DEFAULT_PRESET: PortfolioPreset = "editorial";
export const DEFAULT_MODE: PortfolioMode = "light";

export const PF_THEME_KEY = "gitfolio:portfolio-theme";
export const PF_MODE_KEY = "gitfolio:portfolio-mode";
export const PF_CHANGE_EVENT = "gitfolio:portfolio-prefs-change";

export const PRESET_META: Record<
  PortfolioPreset,
  { label: string; description: string; swatch: string }
> = {
  editorial: {
    label: "Editorial",
    description: "Warm & refined",
    swatch: "linear-gradient(135deg, #FBF8F2 0%, #C78368 100%)",
  },
  mono: {
    label: "Mono",
    description: "Minimal & technical",
    swatch: "linear-gradient(135deg, #FFFFFF 0%, #0A0A0A 100%)",
  },
  sketchbook: {
    label: "Sketchbook",
    description: "Hand-crafted & warm",
    swatch: "linear-gradient(135deg, #F6F1E7 0%, #8A7A4F 100%)",
  },
};

export function isPortfolioPreset(value: string | null): value is PortfolioPreset {
  return value !== null && (PORTFOLIO_PRESETS as readonly string[]).includes(value);
}

export function isPortfolioMode(value: string | null): value is PortfolioMode {
  return value === "light" || value === "dark";
}

/** Read persisted preferences, falling back to defaults. Safe on the server. */
export function readPortfolioPrefs(): {
  preset: PortfolioPreset;
  mode: PortfolioMode;
} {
  if (typeof window === "undefined") {
    return { preset: DEFAULT_PRESET, mode: DEFAULT_MODE };
  }

  try {
    const preset = window.localStorage.getItem(PF_THEME_KEY);
    const mode = window.localStorage.getItem(PF_MODE_KEY);
    return {
      preset: isPortfolioPreset(preset) ? preset : DEFAULT_PRESET,
      mode: isPortfolioMode(mode) ? mode : DEFAULT_MODE,
    };
  } catch {
    return { preset: DEFAULT_PRESET, mode: DEFAULT_MODE };
  }
}

/** Apply a preset + mode to the document root and persist it. Client-only. */
export function applyPortfolioPrefs(preset: PortfolioPreset, mode: PortfolioMode) {
  const root = document.documentElement;
  root.dataset.pfTheme = preset;
  root.dataset.pfMode = mode;

  try {
    window.localStorage.setItem(PF_THEME_KEY, preset);
    window.localStorage.setItem(PF_MODE_KEY, mode);
  } catch {
    // Storage may be unavailable (private mode); theme still applies for the session.
  }

  window.dispatchEvent(new Event(PF_CHANGE_EVENT));
}

/** Snapshot of the currently applied prefs, as a stable string. Client-only. */
export function getPortfolioSnapshot(): string {
  const root = document.documentElement;
  const preset = isPortfolioPreset(root.dataset.pfTheme ?? null)
    ? root.dataset.pfTheme
    : DEFAULT_PRESET;
  const mode = isPortfolioMode(root.dataset.pfMode ?? null)
    ? root.dataset.pfMode
    : DEFAULT_MODE;
  return `${preset}|${mode}`;
}

export const PF_SERVER_SNAPSHOT = `${DEFAULT_PRESET}|${DEFAULT_MODE}`;

export function parsePortfolioSnapshot(snapshot: string): {
  preset: PortfolioPreset;
  mode: PortfolioMode;
} {
  const parts = snapshot.split("|");
  const presetCandidate: string | null = parts[0] ?? null;
  const modeCandidate: string | null = parts[1] ?? null;
  return {
    preset: isPortfolioPreset(presetCandidate) ? presetCandidate : DEFAULT_PRESET,
    mode: isPortfolioMode(modeCandidate) ? modeCandidate : DEFAULT_MODE,
  };
}

/** Subscribe to pref changes (same-tab dispatch + cross-tab storage). Client-only. */
export function subscribePortfolioPrefs(onChange: () => void): () => void {
  window.addEventListener(PF_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PF_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
