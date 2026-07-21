"use client";

// Plays a subtle click sound for every interactive control in the app via a
// single document-level listener, rather than wiring a handler into each
// component. Runs in the capture phase so it still fires for controls inside
// dialogs and menus that stopPropagation on the bubble phase. Toggled by the
// `clickSound` display setting.

import {useEffect} from "react";
import {useSettings} from "@/lib/settings";
import {playClick, preloadClick, setClickVolume} from "@/lib/clickSound";

// What counts as a "clickable" control. Covers native buttons and links plus
// the ARIA roles we use for toggles/tabs. Text inputs, sliders, and the modal
// backdrops (role="presentation") are intentionally excluded.
const SELECTOR = 'button, a[href], [role="button"], [role="switch"], [role="tab"], [role="menuitem"], summary';

export default function ClickSounds() {
  const {clickSound, soundVolume} = useSettings();

  // Keep the play path's loudness in sync with the setting, independent of the
  // on/off toggle below.
  useEffect(() => {
    setClickVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    if (!clickSound) return;
    preloadClick();

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return; // primary button only
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      const el = target.closest(SELECTOR);
      if (!el) return;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      playClick();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [clickSound]);

  return null;
}
