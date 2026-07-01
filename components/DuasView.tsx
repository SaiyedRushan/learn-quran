"use client";

import type { CSSProperties } from "react";
import type { DuasContent } from "@/content/types";
import {
  useAllDuaConfidence,
  setDuaConfidence,
  CONFIDENCE,
  CONFIDENCE_LABELS,
  type ConfidenceLevel,
} from "@/lib/progress";

function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function DuasView({ duas }: { duas: DuasContent }) {
  const conf = useAllDuaConfidence();
  const levelOf = (name: string) => (conf[name] ?? 0) as ConfidenceLevel;

  const allDuas = duas.sections.flatMap((s) => s.duas);
  const total = allDuas.length;
  const solid = allDuas.filter((d) => levelOf(d.name) >= CONFIDENCE.SOLID).length;
  const inProgress = allDuas.filter((d) => {
    const l = levelOf(d.name);
    return l === CONFIDENCE.LEARNING || l === CONFIDENCE.REVIEWING;
  }).length;
  const pct = total ? Math.round((solid / total) * 100) : 0;

  return (
    <>
      <div className="sec-progress">
        <span className="sp-label">
          <strong>{solid}</strong>/{total} duas solid
          {inProgress > 0 && <> · {inProgress} in progress</>}
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
              const level = levelOf(dua.name);
              return (
                <div className="dua-card" key={di}>
                  <div className="dua-head">
                    <div className="dua-head-main">
                      <div className="dua-name">{dua.name}</div>
                      <div className="dua-when">{dua.when}</div>
                    </div>
                    {dua.repeat && <span className="dua-repeat">{dua.repeat}</span>}
                    <div className="sc-conf-wrap">
                      <button
                        className={`sc-conf conf-${level}`}
                        style={{ "--conf-frac": level / 3 } as CSSProperties}
                        aria-label={`Confidence: ${CONFIDENCE_LABELS[level]}. Tap to change.`}
                        title={`Confidence: ${CONFIDENCE_LABELS[level]} — tap to change`}
                        onClick={() =>
                          setDuaConfidence(dua.name, ((level + 1) % 4) as ConfidenceLevel)
                        }
                      >
                        {level === CONFIDENCE.SOLID && (
                          <span className="sc-conf-check">✓</span>
                        )}
                      </button>
                      {level > 0 && (
                        <span className={`sc-conf-label conf-${level}`}>
                          {CONFIDENCE_LABELS[level]}
                        </span>
                      )}
                    </div>
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
                  <div
                    className="dua-source"
                    dangerouslySetInnerHTML={{ __html: dua.source }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
