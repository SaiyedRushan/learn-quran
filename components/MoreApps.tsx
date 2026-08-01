// Cross-promo for the sibling apps (see FAMILY in lib/site). Home page only —
// interior pages get the compact one-line list in the footer instead, so a
// surah guide isn't tailed by a wall of other products.

import { FAMILY } from "@/lib/site";

export default function MoreApps() {
  return (
    <section className="more-apps" aria-labelledby="more-apps-title">
      <h2 id="more-apps-title" className="more-apps-title">
        More apps
      </h2>
      <p className="more-apps-intro">
        A small family of free, private tools for everyday Muslim life. No
        accounts, no ads, no tracking — take whatever helps.
      </p>
      <div className="more-apps-list">
        {FAMILY.map((app) => (
          <a
            key={app.url}
            className="more-app"
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="more-app-icon" aria-hidden="true">
              {app.icon}
            </span>
            <span className="more-app-main">
              <span className="more-app-name">{app.name}</span>
              <span className="more-app-platform">{app.platform}</span>
              <span className="more-app-blurb">{app.blurb}</span>
            </span>
            <span className="more-app-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
