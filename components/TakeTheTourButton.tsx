"use client";

import {openTour} from "@/lib/onboarding";

export default function TakeTheTourButton() {
  return (
    <button type="button" className="contact-btn" onClick={openTour}>
      🧭 Take the tour
    </button>
  );
}
