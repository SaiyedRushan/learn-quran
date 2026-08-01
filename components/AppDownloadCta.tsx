"use client";

// Store links for the mobile app. Android is on Play's open testing track, so
// its button says "join the test" rather than "download"; iOS renders as a
// disabled "coming soon" chip until APPS.ios is filled in (see lib/site).
//
// Dismissable, and the dismissal sticks — see lib/appPromo for why this hides
// via CSS instead of a storage read at render time.

import { useState } from "react";
import { APPS } from "@/lib/site";
import { dismissAppCta } from "@/lib/appPromo";

function PlayGlyph() {
  return (
    <svg className="store-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.6 1.8a1.5 1.5 0 0 0-.5 1.13v18.14c0 .45.19.86.5 1.13l.1.08 10.16-10.2v-.24L3.7 1.72l-.1.08Zm13.53 6.75-2.6-2.6L4.9 1.06 17.13 8.55Zm0 6.9-2.6 2.6L4.9 22.94l9.63-7.49Zm.9-.55 3.2-1.96c.9-.55.9-1.93 0-2.48l-3.2-1.96-2.83 2.83 2.83 2.83.02-.01Z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg className="store-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.36 12.66c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.79-3.34-1.81-1.42-.15-2.77.84-3.49.84-.72 0-1.83-.82-3.01-.8-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.95 1.16 9.22.77 1.11 1.68 2.36 2.87 2.31 1.15-.05 1.59-.74 2.98-.74 1.39 0 1.78.74 3 .72 1.24-.02 2.02-1.13 2.78-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.4-.92-2.4-3.72ZM14.1 5.9c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.68-1.09 1.77-.95 2.81 1.02.08 2.05-.51 2.68-1.28Z"
      />
    </svg>
  );
}

export default function AppDownloadCta() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  function dismiss() {
    dismissAppCta();
    setHidden(true);
  }

  return (
    <section className="app-cta" aria-labelledby="app-cta-title">
      <button
        className="app-cta-close"
        onClick={dismiss}
        aria-label="Dismiss app download banner"
        title="Dismiss"
      >
        ✕
      </button>
      <div className="app-cta-copy">
        <h2 id="app-cta-title" className="app-cta-title">
          Get the app
        </h2>
        <p className="app-cta-text">
          Everything here — the guides, drills, duas and your progress — in a free,
          ad-free app that works fully offline.
        </p>
      </div>
      <div className="app-cta-buttons">
        <a
          className="store-btn"
          href={APPS.android}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PlayGlyph />
          <span className="store-btn-main">
            <span className="store-btn-sub">Android — open testing</span>
            <span className="store-btn-name">Join on Google Play</span>
          </span>
        </a>

        {APPS.ios ? (
          <a
            className="store-btn"
            href={APPS.ios}
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppleGlyph />
            <span className="store-btn-main">
              <span className="store-btn-sub">Download on the</span>
              <span className="store-btn-name">App Store</span>
            </span>
          </a>
        ) : (
          <span className="store-btn store-btn-soon" aria-disabled="true">
            <AppleGlyph />
            <span className="store-btn-main">
              <span className="store-btn-sub">iOS — in review</span>
              <span className="store-btn-name">Coming soon</span>
            </span>
          </span>
        )}
      </div>
    </section>
  );
}
