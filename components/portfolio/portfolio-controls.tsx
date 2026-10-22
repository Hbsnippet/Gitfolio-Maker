"use client";

import { Check, ChevronDown, Copy, Moon, Share2, Sun } from "lucide-react";
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
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const shareRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);

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

  // Share popup: an outside click/tap or Escape dismisses it. Escape also hands
  // focus back to the Share button; an outside click is left to move focus
  // wherever the user actually clicked.
  useEffect(() => {
    if (!shareOpen) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!shareRef.current?.contains(event.target as Node)) {
        setShareOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setShareOpen(false);
      shareBtnRef.current?.focus();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [shareOpen]);

  // Land focus on "Copy link" when the popup opens, so the keyboard flow is
  // Share → Enter → Enter → Escape.
  useEffect(() => {
    if (shareOpen) copyBtnRef.current?.focus();
  }, [shareOpen]);

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

  function toggleShare() {
    setFeedback(null);
    if (!shareOpen) setShareUrl(portfolioUrl());
    setShareOpen((value) => !value);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Link copied!");
    } catch {
      // No clipboard API (insecure context) or permission denied: report the
      // failure rather than claiming success.
      setFeedback("Could not copy link");
    }
  }

  const activeMeta = PRESET_META[preset];

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div ref={rootRef} className="sm:relative" onKeyDown={onRootKeyDown}>
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
            // Below `sm` the header can wrap and the trigger sits anywhere along
            // the row, so anchoring the menu to the trigger pushed it past the
            // right edge on mid-size phones. Instead the menu is placed against
            // the header's content box (the nav is its containing block), left
            // aligned with the page gutters like the Share popup. From `sm` up
            // the wrapper is the containing block again and the menu keeps its
            // original trigger-anchored position.
            className="absolute left-6 top-[calc(100%_-_1rem)] z-20 w-[min(280px,calc(100vw_-_3rem))] origin-top-left animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-xl border border-pf-border bg-pf-card p-1 shadow-xl shadow-black/5 sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-60 sm:origin-top-right"
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
                    <span className="block whitespace-normal text-sm text-pf-fg">
                      {meta.label}
                    </span>
                    <span className="block whitespace-normal text-xs text-pf-muted">
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

      {/* One Share control: it opens the copy-link popup. The popup is positioned
          against the header's content box (the nav is its containing block)
          rather than against this button, so it stays inside the viewport when
          the toolbar wraps onto a second row on narrow screens. */}
      <div ref={shareRef}>
        <button
          ref={shareBtnRef}
          type="button"
          onClick={toggleShare}
          aria-haspopup="dialog"
          aria-expanded={shareOpen}
          aria-label="Share"
          className="pf-btn pf-btn-primary"
        >
          <Share2 aria-hidden className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {shareOpen && (
          <div
            role="dialog"
            aria-label="Share portfolio"
            className="absolute right-6 top-[calc(100%_-_1rem)] z-20 w-[calc(100vw_-_3rem)] origin-top-right animate-in fade-in-0 zoom-in-95 rounded-xl border border-pf-border bg-pf-card p-4 shadow-xl shadow-black/5 sm:w-[min(300px,calc(100vw_-_3rem))]"
          >
            <p className="text-sm font-semibold text-pf-fg">Share portfolio</p>
            <p className="mt-2 break-all rounded-lg border border-pf-border bg-pf-card-soft px-2.5 py-2 font-mono text-xs leading-relaxed text-pf-muted">
              {shareUrl}
            </p>
            <button
              ref={copyBtnRef}
              type="button"
              onClick={copyShareLink}
              className="pf-btn pf-btn-primary mt-3 w-full"
            >
              <Copy aria-hidden className="h-4 w-4" />
              Copy link
            </button>
            <span
              role="status"
              aria-live="polite"
              className="mt-2 block min-h-4 text-xs text-pf-muted"
            >
              {feedback ?? ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
