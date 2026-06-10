"use client";

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {useSettings, setSetting, resetSettings, SCALE_MIN, SCALE_MAX, SCALE_STEP, DEFAULTS} from "@/lib/settings";

export default function SettingsControl() {
  const [open, setOpen] = useState(false);
  const settings = useSettings();

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const isDefault = settings.arabicScale === DEFAULTS.arabicScale && settings.englishScale === DEFAULTS.englishScale;

  return (
    <>
      <button className='icon-btn' aria-label='Display settings' title='Display settings' onClick={() => setOpen(true)}>
        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
          <circle cx='12' cy='12' r='3' />
          <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
        </svg>
      </button>

      {open &&
        createPortal(
          <div className='modal-overlay' onClick={() => setOpen(false)} role='presentation'>
            <div className='modal' role='dialog' aria-modal='true' aria-label='Display settings' onClick={(e) => e.stopPropagation()}>
              <div className='modal-head'>
                <span className='modal-title'>Display settings</span>
                <button className='icon-btn' aria-label='Close' onClick={() => setOpen(false)} autoFocus>
                  ✕
                </button>
              </div>
              <div className='modal-sub'>Adjust the reading size of the Arabic text and the English translation. Saved on this device.</div>

              <div className='setting'>
                <div className='setting-row'>
                  <span className='setting-label'>Arabic text</span>
                  <span className='setting-val'>{pct(settings.arabicScale)}</span>
                </div>
                <input
                  className='slider'
                  type='range'
                  min={SCALE_MIN}
                  max={SCALE_MAX}
                  step={SCALE_STEP}
                  value={settings.arabicScale}
                  aria-label='Arabic text size'
                  onChange={(e) => setSetting("arabicScale", Number(e.target.value))}
                />
              </div>

              <div className='setting'>
                <div className='setting-row'>
                  <span className='setting-label'>English text</span>
                  <span className='setting-val'>{pct(settings.englishScale)}</span>
                </div>
                <input
                  className='slider'
                  type='range'
                  min={SCALE_MIN}
                  max={SCALE_MAX}
                  step={SCALE_STEP}
                  value={settings.englishScale}
                  aria-label='English text size'
                  onChange={(e) => setSetting("englishScale", Number(e.target.value))}
                />
              </div>

              <div className='preview' aria-hidden='true'>
                <div className='preview-ar'>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                <div className='preview-en'>In the name of Allah, the Entirely Merciful, the Especially Merciful.</div>
              </div>

              <div className='modal-actions'>
                <button className='btn' onClick={resetSettings} disabled={isDefault}>
                  Reset to default
                </button>
                <button className='btn btn-primary' onClick={() => setOpen(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
