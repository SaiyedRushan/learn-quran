"use client";

import {useState} from "react";

// Static-site friendly: FormSubmit relays the message to my inbox — no backend,
// no database, nothing stored here. The address is already public on the About page.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/rushan52@gmail.com";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactView() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setError("");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {Accept: "application/json"},
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong sending your message. You can also email me directly at rushan52@gmail.com.");
    }
  }

  if (status === "sent") {
    return (
      <div className='contact-success' role='status'>
        <div className='cs-icon' aria-hidden='true'>
          ✅
        </div>
        <div className='cs-title'>Message sent — jazakAllahu khayran!</div>
        <p className='cs-text'>
          Thank you for reaching out. I read every message and I'll get back to you as soon as I can.
        </p>
        <button type='button' className='contact-btn' onClick={() => setStatus("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className='contact-form' onSubmit={handleSubmit}>
      {/* FormSubmit configuration */}
      <input type='hidden' name='_subject' value='New message from Learn Quran' />
      <input type='hidden' name='_template' value='table' />
      <input type='hidden' name='_captcha' value='false' />
      {/* Honeypot: bots fill this in, humans never see it. */}
      <input type='text' name='_honey' tabIndex={-1} autoComplete='off' className='contact-honey' aria-hidden='true' />

      <div className='field-row'>
        <label className='field'>
          <span className='field-label'>Your name</span>
          <input className='field-input' type='text' name='name' placeholder='Optional' autoComplete='name' />
        </label>
        <label className='field'>
          <span className='field-label'>
            Email <span className='field-hint'>(so I can reply)</span>
          </span>
          <input className='field-input' type='email' name='email' placeholder='you@example.com' autoComplete='email' required />
        </label>
      </div>

      <label className='field'>
        <span className='field-label'>What's on your mind?</span>
        <textarea
          className='field-input'
          name='message'
          rows={6}
          required
          placeholder="Found a bug, have an idea, didn't like something, or just want to say salaam — anything at all."
        />
      </label>

      {status === "error" && (
        <div className='field-error' role='alert'>
          {error}
        </div>
      )}

      <div className='contact-row' style={{marginTop: 4}}>
        <button type='submit' className='contact-btn primary' disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "✉️ Send message"}
        </button>
        <a className='contact-btn' href='mailto:rushan52@gmail.com?subject=Learn%20Quran'>
          Or email me directly
        </a>
      </div>
    </form>
  );
}
