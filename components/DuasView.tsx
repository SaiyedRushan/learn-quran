"use client";

import type { DuasContent } from "@/content/types";
import { useLearnedDuaKeys, setDuaLearned } from "@/lib/progress";

function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function DuasView({ duas }: { duas: DuasContent }) {
  const learned = new Set(useLearnedDuaKeys());
  const allDuas = duas.sections.flatMap((s) => s.duas);
  const total = allDuas.length;
  const done = allDuas.filter((d) => learned.has(d.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <div className="sec-progress">
        <span className="sp-label">
          <strong>{done}</strong>/{total} duas learned
        </span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {duas.sections.map((section, si) => (
        <section key={si}>
          <div className="list-heading">{section.title}</div>
          {section.intro && <p className="group-note">{section.intro}</p>}
          <div className="dua-list">
            {section.duas.map((dua, di) => {
              const isDone = learned.has(dua.name);
              return (
                <div className="dua-card" key={di}>
                  <div className="dua-head">
                    <div className="dua-head-main">
                      <div className="dua-name">{dua.name}</div>
                      <div className="dua-when">{dua.when}</div>
                    </div>
                    {dua.repeat && <span className="dua-repeat">{dua.repeat}</span>}
                    <button
                      className={`sec-check ${isDone ? "done" : ""}`}
                      aria-label={isDone ? "Mark dua as not learned" : "Mark dua as learned"}
                      onClick={() => setDuaLearned(dua.name, !isDone)}
                    >
                      ✓
                    </button>
                  </div>
                  <div className="dua-lines">
                    {dua.lines.map((line, li) => (
                      <div className="dua-line" key={li}>
                        <div className="dua-ar" dir="rtl">
                          {line.arabic}
                        </div>
                        <div className="dua-translit">{line.transliteration}</div>
                        <div className="dua-trans">{line.translation}</div>
                      </div>
                    ))}
                  </div>
                  {dua.note && (
                    <div className="dua-note">
                      <Html html={dua.note} />
                    </div>
                  )}
                  <div className="dua-source">{dua.source}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
