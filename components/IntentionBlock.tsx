"use client";

// The intention block — the first thing on the home page. The reader writes
// their own "why" (their niyyah and reasons for learning) so it greets them
// every time they return. Persisted locally via the intention text store.

import { useEffect, useRef, useState } from "react";
import { useIntention, setIntention } from "@/lib/progress";

const PLACEHOLDER =
  "Why am I learning this? What do I hope it changes in me?";

export default function IntentionBlock() {
  const saved = useIntention();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEditing() {
    setDraft(saved);
    setEditing(true);
  }

  function save() {
    setIntention(draft);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  useEffect(() => {
    if (editing) {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [editing]);

  if (editing) {
    return (
      <section className="intention intention-editing">
        <label className="intention-label" htmlFor="intention-input">
          My intention
        </label>
        <textarea
          id="intention-input"
          ref={textareaRef}
          className="intention-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={3}
        />
        <div className="intention-actions">
          <button type="button" className="intention-btn primary" onClick={save}>
            Save
          </button>
          <button type="button" className="intention-btn" onClick={cancel}>
            Cancel
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="intention">
      <div className="intention-head">
        <span className="intention-label">My intention</span>
        <button type="button" className="intention-edit" onClick={startEditing}>
          {saved ? "Edit" : "Write"}
        </button>
      </div>
      {saved ? (
        <p className="intention-text">{saved}</p>
      ) : (
        <button type="button" className="intention-empty" onClick={startEditing}>
          {PLACEHOLDER}
        </button>
      )}
    </section>
  );
}
