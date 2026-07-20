"use client";

import Link from "next/link";
import {useEffect, useState} from "react";

const LINKS = [
  {href: "/", label: "Surahs"},
  {href: "/duas/", label: "Duas"},
  {href: "/games/", label: "Games"},
  {href: "/blog/", label: "Blog"},
  {href: "/about/", label: "About"},
  {href: "/contact/", label: "Contact"},
];

export default function PrimaryNav() {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className='nav-desktop' aria-label='Primary'>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className='header-link'>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className='nav-mobile'>
        <button className='icon-btn' aria-label='Menu' aria-haspopup='true' aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? (
            "✕"
          ) : (
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
              <line x1='4' y1='7' x2='20' y2='7' />
              <line x1='4' y1='12' x2='20' y2='12' />
              <line x1='4' y1='17' x2='20' y2='17' />
            </svg>
          )}
        </button>

        {open && (
          <>
            <div className='nav-backdrop' onClick={() => setOpen(false)} role='presentation' />
            <nav className='nav-menu' aria-label='Primary'>
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className='nav-menu-link' onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </>
  );
}
