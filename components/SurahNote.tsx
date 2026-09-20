"use client";

// The reader's own note on one surah, shown at the foot of its guide. Free
// text, saved to this device only (lib/progress note store) — no backend.

import {useEffect, useRef, useState} from "react";
import {useNote, setNote} from "@/lib/progress";

const PLACEHOLDER =
  "What do you want to remember about this surah? A verse that stayed with you, a word you keep forgetting, the line you always trip on.";

export default function SurahNote({slug, surahName}: {slug: string; surahName: string}) {
  const saved = useNote(slug);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEditing() {
    setDraft(saved);
    setConfirmingDelete(false);
    setEditing(true);
  }

  function save() {
    setNote(slug, draft);
    setEditing(false);
  }

  function deleteNote() {
    setNote(slug, "");
    setConfirmingDelete(false);
    setEditing(false);
  }

  useEffect(() => {
    if (!editing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  if (editing) {
    return (
      <section className='mynote mynote-editing'>
        <label className='mynote-label' htmlFor={`note-${slug}`}>
          My note on {surahName}
        </label>
        <textarea
          id={`note-${slug}`}
          ref={textareaRef}
          className='mynote-input'
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={5}
        />
        {confirmingDelete ? (
          <div className='mynote-confirm'>
            <span className='mynote-confirm-text'>
              Delete this note? You can&rsquo;t get it back.
            </span>
            <div className='mynote-actions'>
              <button type='button' className='mynote-btn danger' onClick={deleteNote}>
                Delete note
              </button>
              <button
                type='button'
                className='mynote-btn'
                onClick={() => setConfirmingDelete(false)}
              >
                Keep it
              </button>
            </div>
          </div>
        ) : (
          <div className='mynote-actions'>
            <button type='button' className='mynote-btn primary' onClick={save}>
              Save note
            </button>
            <button type='button' className='mynote-btn' onClick={() => setEditing(false)}>
              Cancel
            </button>
            {saved && (
              <button
                type='button'
                className='mynote-btn mynote-delete'
                onClick={() => setConfirmingDelete(true)}
              >
                Delete note
              </button>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className='mynote'>
      <div className='mynote-head'>
        <span className='mynote-label'>My note on {surahName}</span>
        {saved && (
          <button type='button' className='mynote-edit' onClick={startEditing}>
            Edit note
          </button>
        )}
      </div>
      {saved ? (
        <p className='mynote-text'>{saved}</p>
      ) : (
        <>
          <p className='mynote-hint'>
            Write anything you want to remember about this surah. It is saved on this device and
            nobody else can see it.
          </p>
          <button type='button' className='mynote-add' onClick={startEditing}>
            Write a note
          </button>
        </>
      )}
    </section>
  );
}
