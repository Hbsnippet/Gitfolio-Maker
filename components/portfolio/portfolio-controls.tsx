"use client";

import { Check, ChevronDown, Link2, Moon, Share2, Sun } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  applyPortfolioPrefs,
  getPortfolioSnapshot,
  parsePortfolioSnapshot,
  PF_SERVER_SNAPSHOT,
  PORTFOLIO_PRESETS,
  PRESET_META,
  subscribePortfolioPrefs,
  type PortfolioMode,
  type PortfolioPreset,
} from "@/lib/portfolio-theme";

function portfolioUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function PortfolioControls() {
  const snapshot = useSyncExternalStore(
    subscribePortfolioPrefs,
    getPortfolioSnapshot,
    () => PF_SERVER_SNAPSHOT
  );
  const { preset, mode } = parsePortfolioSnapshot(snapshot);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Clear transient share/copy feedback.
  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  // Move focus into the menu (onto the active preset) when it opens.
  useEffect(() => {
    if (!open) return;
    const activeIndex = PORTFOLIO_PRESETS.indexOf(preset);
    const target = itemRefs.current[activeIndex >= 0 ? activeIndex : 0];
    target?.focus();
  }, [open, preset]);

  // Close when clicking/tapping outside the control.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  function selectPreset(next: PortfolioPreset) {
    applyPortfolioPrefs(next, mode);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onRootKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const items = itemRefs.current.filter(
        (el): el is HTMLButtonElement => el !== null
      );
      if (items.length === 0) return;
      const currentIndex = items.indexOf(
        document.activeElement as HTMLButtonElement
      );
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        (currentIndex + delta + items.length) % items.length || 0;
      items[nextIndex]?.focus();
    }
  }

  function toggleMode() {
    const next: PortfolioMode = mode === "dark" ? "light" : "dark";
    applyPortfolioPrefs(preset, next);
  }

  async function copyLink() {
    const url = portfolioUrl();
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Link copied");
    } catch {
      setFeedback("Could not copy link");
    }
  }

  async function handleShare() {
    const url = portfolioUrl();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        // User dismissed the sheet or share failed; fall through to copy.
      }
    }

    await copyLink();
  }

  const activeMeta = PRESET_META[preset];

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div ref={rootRef} className="relative" onKeyDown={onRootKeyDown}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Choose a visual theme"
          className="pf-icon-btn w-auto gap-2 px-3 text-pf-fg"
        >
          <span
            aria-hidden
            className="pf-swatch shrink-0"
            style={{ background: activeMeta.swatch }}
          />
          <span className="text-sm">{activeMeta.label}</span>
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Visual theme"
            className="absolute right-0 z-20 mt-2 w-60 origin-top-right animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-xl border border-pf-border bg-pf-card p-1 shadow-xl shadow-black/5"
          >
            {PORTFOLIO_PRESETS.map((id, index) => {
              const meta = PRESET_META[id];
              const active = preset === id;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => selectPreset(id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition motion-reduce:transition-none ${
                    active ? "bg-pf-card-soft" : "hover:bg-pf-card-soft"
                  }`}
                >
                  <span
                    aria-hidden
                    className="pf-swatch shrink-0"
                    style={{ background: meta.swatch }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-pf-fg">
                      {meta.label}
                    </span>
                    <span className="block truncate text-xs text-pf-muted">
                      {meta.description}
                    </span>
                  </span>
                  {active && (
                    <Check aria-hidden className="h-4 w-4 shrink-0 text-pf-accent" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggleMode}
        aria-pressed={mode === "dark"}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="pf-icon-btn"
      >
        {mode === "dark" ? (
          <Sun aria-hidden className="h-4 w-4" />
        ) : (
          <Moon aria-hidden className="h-4 w-4" />
        )}
      </button>

      <button type="button" onClick={handleShare} className="pf-btn pf-btn-primary">
        <Share2 aria-hidden className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link to this portfolio"
        className="pf-icon-btn"
      >
        <Link2 aria-hidden className="h-4 w-4" />
      </button>

      <span
        role="status"
        aria-live="polite"
        className="sr-only sm:not-sr-only sm:text-xs sm:text-pf-muted"
      >
        {feedback ?? ""}
      </span>
    </div>
  );
}
