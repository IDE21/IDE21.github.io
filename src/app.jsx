import React from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

const S = window.SITE;

// Moving background: rounded rects that drift slowly, echoing the three bars of the logo.
// [x, y, width, height, filled, drift x, drift y, turn (deg), seconds]
const RECTS = [
  [80, 120, 220, 34, 1, 40, 30, 0, 18],
  [80, 180, 150, 34, 1, 30, 30, 0, 18],
  [80, 240, 220, 34, 1, 40, 30, 0, 18],
  [1080, 90, 180, 180, 0, -50, 60, 25, 24],
  [1180, 560, 260, 40, 1, -60, -40, 0, 20],
  [220, 620, 120, 120, 0, 60, -50, -30, 26],
  [640, 40, 90, 90, 1, 30, 70, 45, 22],
  [900, 380, 300, 300, 0, -40, 40, 15, 30],
  [-60, 420, 200, 200, 0, 50, 40, 20, 28],
  [560, 720, 240, 36, 1, -50, -30, 0, 21],
  [1300, 260, 110, 110, 1, -30, 50, -40, 25],
  [400, 300, 60, 60, 0, 40, -40, 90, 19],
];

function MovingBackground() {
  const still = useReducedMotion();
  return (
    <LazyMotion features={domAnimation} strict>
    <svg aria-hidden="true" className="fixed inset-0 -z-10 w-full h-full pointer-events-none" style={{ opacity: "var(--bg-motion)" }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      {RECTS.map(([x, y, w, h, filled, dx, dy, turn, s], i) => (
        <m.rect key={i} x={x} y={y} width={w} height={h} rx={Math.min(w, h) * (filled ? 0.5 : 0.18)}
          fill={filled ? "var(--line)" : "none"} stroke={filled ? "none" : "var(--line)"} strokeWidth={2.5}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={{ opacity: 0 }}
          animate={still
            ? { opacity: filled ? 0.14 : 0.28 }
            : { opacity: filled ? [0.1, 0.24, 0.1] : [0.2, 0.5, 0.2], x: [0, dx * 1.8, 0], y: [0, dy * 1.8, 0], rotate: [0, turn * 1.5 || 8, 0] }}
          transition={still ? { duration: 0.6 } : { duration: s, repeat: Infinity, ease: "easeInOut", delay: -i * 1.7 }} />
      ))}
    </svg>
    </LazyMotion>
  );
}

// The exact profile picture from the X account.
function Logo({ size, ring }) {
  return (
    <img src="avatar.jpg" alt="Enad Alrougi" width={size} height={size}
      className={"shrink-0 rounded-full bg-[var(--surf)] object-cover " + (ring ? "ring-1 ring-[var(--border)]" : "")}
      style={{ width: size, height: size }} />
  );
}

function Btn({ href, kind, children }) {
  const k = kind === "primary"
    ? "bg-[var(--btn)] text-white hover:bg-[var(--btn-h)]"
    : kind === "cta" ? "bg-[var(--cta-btn)] text-[var(--cta-btn-text)] hover:bg-[var(--cta-btn-h)]"
    : "bg-[var(--surf)] text-[var(--navy)] border border-[var(--border)] hover:border-[var(--navy)]";
  return <a href={href} className={"ix btn inline-flex items-center justify-center py-[13px] px-[26px] rounded-[12px] text-[15px] font-semibold " + (kind === "ghost" ? "" : "shine ") + k}>{children}</a>;
}

function Section({ id, title, sub, white, children }) {
  return (
    <section id={id} className={"w-full py-14 px-5 lg:py-24 lg:px-30 " + (white ? "bg-[var(--surf-a)]" : "")}>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-7 lg:gap-9">
        <div data-reveal className="flex flex-col gap-2">
          <h2 className="text-[28px] lg:text-[36px] font-bold text-[var(--text)]">{title}</h2>
          {sub && <p className="text-[16px] text-[var(--muted)]">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Portfolio() {
  const [lang, setLang] = React.useState(() => {
    try { return localStorage.getItem("lang") || "ar"; } catch { return "ar"; }
  });
  const [cat, setCat] = React.useState("all");
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"));
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  React.useEffect(() => {
    // Follow the device setting until the visitor picks a mode.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = e => { let saved = null; try { saved = localStorage.getItem("theme"); } catch {} if (!saved) setDark(e.matches); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const toggleTheme = () => {
    const next = !dark; setDark(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  const t = S.t[lang];
  // Watch every [data-reveal] block; state is kept in data-state so React re-renders don't reset it.
  const seen = React.useRef(null);
  React.useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-on");
    if (!seen.current) {
      seen.current = { set: new WeakSet(), io: new IntersectionObserver(entries => {
        entries.forEach(e => {
          e.target.dataset.state = e.isIntersecting ? "in" : (e.boundingClientRect.top < 0 ? "above" : "below");
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) };
    }
    const { set, io } = seen.current;
    document.querySelectorAll("[data-reveal]").forEach(el => {
      if (!set.has(el)) { set.add(el); io.observe(el); }
    });
  });
  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);
  const L = S.links;
  const shown = S.projects.filter(p => cat === "all" || p.cat === cat);
  const cats = ["all", ...Object.keys(S.categories)];
  const ext = { target: "_blank", rel: "noopener" };

  return (
    <div className="relative isolate w-full min-h-dvh flex flex-col bg-[var(--bg)]">
      <MovingBackground />
      {/* Nav */}
      <header className="sticky top-0 z-10 w-full py-4 px-5 bg-[var(--nav)] backdrop-blur border-b border-[var(--border)] lg:px-30">
        <div className="max-w-[1200px] mx-auto flex flex-row justify-between items-center gap-4">
          <a href="#top" className="ix logo-link flex flex-row gap-[10px] items-center rounded-full">
            <Logo size={40} ring />
            <span className="text-[18px] font-bold">{t.name}</span>
          </a>
          <nav className="hidden lg:flex flex-row gap-7 items-center text-[15px] font-medium text-[var(--muted)]">
            {Object.entries(t.nav).map(([k, v]) => <a key={k} href={"#" + k} className="ulink hover:text-[var(--navy)] transition-colors">{v}</a>)}
          </nav>
          <div className="flex flex-row gap-[10px] items-center">
            <button onClick={toggleTheme} aria-label={dark ? t.lightMode : t.darkMode} title={dark ? t.lightMode : t.darkMode}
              className="ix icon-btn w-[44px] h-[40px] inline-flex items-center justify-center rounded-[10px] border border-[var(--border)] text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--soft)] cursor-pointer bg-[var(--surf)]">
              {dark
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label="Switch language"
              className="ix btn min-w-[44px] h-[40px] px-[14px] rounded-[10px] border border-[var(--border)] text-[14px] font-bold text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--soft)] cursor-pointer bg-[var(--surf)]">
              {t.other}
            </button>
            <span className="hidden lg:inline-flex"><Btn href="#contact" kind="primary">{t.ctaContact}</Btn></span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="w-full pt-12 pb-14 px-5 lg:py-24 lg:px-30">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10 items-center lg:flex-row lg:gap-16">
          <div data-reveal className="w-full flex flex-col gap-5 items-start">
            <span className="py-[7px] px-[14px] rounded-full bg-[var(--soft)] text-[13px] font-semibold text-[var(--navy)]" dir="ltr">{t.badge}</span>
            <h1 className="text-[40px] lg:text-[64px] font-bold leading-[1.25]">{t.name}</h1>
            <p className="text-[20px] lg:text-[26px] font-semibold text-[var(--navy)]">{t.role}</p>
            <p className="text-[16px] lg:text-[18px] leading-[1.8] text-[var(--muted)] max-w-[640px]">{t.heroText}</p>
            <div className="flex flex-row flex-wrap gap-3">
              <Btn href="#projects" kind="primary">{t.ctaProjects}</Btn>
              <Btn href="#contact" kind="ghost">{t.ctaContact}</Btn>
            </div>
          </div>
          <div data-reveal style={{ "--d": "120ms" }} className="hidden lg:flex w-full max-w-[420px] shrink-0 flex-col gap-5 p-10 justify-center items-center rounded-[28px] bg-[linear-gradient(180deg,_#0A2F5C_0%,_#0B1F3A_100%)]" dir="ltr">
            <Logo size={140} />
            <p className="text-[26px] font-bold text-white tracking-wide">ENAD ALROUGI</p>
            <p className="text-[13px] font-medium text-[#AFC3DD] tracking-widest">DATA SCIENCE · RESEARCH · AI</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="w-full px-5 lg:px-30">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {t.stats.map(([n, l], i) => (
            <div key={l} data-reveal style={{ "--d": i * 80 + "ms" }} className="flex flex-col gap-1 p-5 rounded-[18px] bg-[var(--surf)] border border-[var(--border)] lg:p-6">
              <span className="self-start text-[28px] lg:text-[34px] font-bold text-[var(--navy)]" dir="ltr">{n}</span>
              <span className="text-[15px] text-[var(--muted)]">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <Section id="about" title={t.aboutTitle}>
        <p data-reveal className="text-[16px] lg:text-[18px] leading-[1.8] text-[var(--muted)] max-w-[900px]">{t.aboutText}</p>
        <div data-reveal className="flex flex-col gap-3">
          <h3 className="text-[16px] font-bold">{t.interestsTitle}</h3>
          <div className="flex flex-row flex-wrap gap-2">
            {t.interests.map(s => <span key={s} className="py-[8px] px-[16px] rounded-full bg-[var(--soft)] border border-[var(--border)] text-[14px] font-semibold text-[var(--navy)]">{s}</span>)}
          </div>
        </div>
        <div data-reveal className="flex flex-col gap-3">
          <h3 className="text-[16px] font-bold">{t.skillsTitle}</h3>
          <div className="flex flex-row flex-wrap gap-2">
            {t.skills.map(s => <span key={s} className="py-[7px] px-[14px] rounded-full bg-[var(--surf)] border border-[var(--border)] text-[13px] font-medium text-[var(--muted)]">{s}</span>)}
          </div>
        </div>
      </Section>

      {/* Achievements */}
      <Section id="achievements" title={t.achievementsTitle} white>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {S.achievements.map((a, i) => {
            const [kind, title, text] = a[lang];
            return (
              <div key={i} data-reveal style={{ "--d": (i % 4) * 80 + "ms" }} className="flex flex-col gap-2 p-6 rounded-[18px] bg-[var(--bg)]">
                <span className="text-[13px] font-semibold text-[var(--line)]">{kind}</span>
                <h3 className="text-[18px] font-bold leading-[1.4]">{title}</h3>
                <p className="text-[14px] leading-[1.7] text-[var(--muted)]">{text}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 items-center justify-between">
            <h3 className="text-[16px] font-bold">{t.publicationsTitle}</h3>
            <a href={L.orcid} {...ext} className="ix btn arrow-link inline-flex items-center gap-2 py-[7px] px-[14px] rounded-full border border-[var(--border)] bg-[var(--surf)] text-[13px] font-semibold text-[var(--navy)] hover:border-[#A6CE39] hover:bg-[var(--soft)]">
              <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#A6CE39" /><path fill="#fff" d="M10.6 23.3H8.7V10.1h1.9v13.2zm3-13.2h5.1c4.9 0 7 3.5 7 6.6 0 3.4-2.6 6.6-7 6.6h-5.1V10.1zm1.9 11.5h3c4.3 0 5.2-3.2 5.2-4.9 0-2.7-1.7-4.9-5.3-4.9h-2.9v9.8zM11 7.5c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3.6-1.3 1.3-1.3S11 6.8 11 7.5z" /></svg>
              {t.orcidLabel} <span className="arrow">↗</span>
            </a>
          </div>
          {S.publications.map((p, i) => (
            <a key={i} href={p.url} {...ext} data-reveal style={{ "--d": i * 80 + "ms" }} title={t.readPaper}
              className="card ix arrow-link group flex flex-row gap-3 items-start p-5 rounded-[14px] bg-[var(--surf)] border border-[var(--border)]">
              <span className="shrink-0 py-1 px-2 rounded-[6px] bg-[var(--btn)] text-white text-[11px] font-bold" dir="ltr">IEEE</span>
              <span className="flex-1 flex flex-col gap-2">
                <span className="text-[15px] font-semibold leading-[1.6] text-[var(--text)] group-hover:text-[var(--navy)] transition-colors" dir="ltr" style={{ fontFamily: "Inter, sans-serif" }}>{p.title}</span>
                <span className="flex flex-row flex-wrap gap-x-3 gap-y-1 items-center text-[13px] text-[var(--muted)]">
                  <span dir="ltr">{p.venue}</span>
                  <span className="font-semibold text-[var(--line)]">{t.readPaper} <span className="arrow">↗</span></span>
                </span>
              </span>
            </a>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section id="experience" title={t.experienceTitle}>
        <ol className="flex flex-col gap-4">
          {S.experience.map((x, i) => {
            const [role, text] = x[lang];
            return (
              <li key={i} data-reveal className="relative flex flex-col gap-2 p-6 rounded-[18px] bg-[var(--surf)] border border-[var(--border)] lg:flex-row lg:gap-8">
                <div className="flex flex-col gap-1 lg:w-[260px] lg:shrink-0">
                  <span className="text-[15px] font-bold text-[var(--navy)]" dir="ltr" style={{ textAlign: "start" }}>{x.org}</span>
                  <span className="text-[13px] text-[var(--muted)]" dir="ltr" style={{ textAlign: "start" }}>{x.date}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[17px] font-bold">{role}</h3>
                  <p className="text-[14px] leading-[1.75] text-[var(--muted)]">{text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div data-reveal className="flex flex-col gap-3 p-6 rounded-[18px] bg-[var(--surf)] border border-[var(--border)]">
            <h3 className="text-[18px] font-bold">{t.educationTitle}</h3>
            {S.education.map((e, i) => (
              <div key={i} className="flex flex-col gap-[2px] py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-[15px] font-semibold">{e[lang]}</span>
                <span className="text-[13px] text-[var(--muted)]">{e.org} · <span dir="ltr">{e.date}</span></span>
              </div>
            ))}
          </div>
          <div data-reveal style={{ "--d": "100ms" }} className="flex flex-col gap-3 p-6 rounded-[18px] bg-[var(--surf)] border border-[var(--border)]">
            <h3 className="text-[18px] font-bold">{t.certsTitle}</h3>
            <div className="flex flex-row flex-wrap gap-2">
              {S.certifications.map(c => <span key={c} dir="ltr" className="py-[7px] px-[14px] rounded-full bg-[var(--soft)] text-[13px] font-semibold text-[var(--navy)]">{c}</span>)}
            </div>
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section id="projects" title={t.projectsTitle} sub={t.projectsText}>
        <div data-reveal className="flex flex-row flex-wrap gap-2">
          {cats.map(c => {
            const label = c === "all" ? t.all : S.categories[c][lang];
            const on = c === cat;
            return (
              <button key={c} onClick={() => setCat(c)}
                aria-pressed={on} className={"ix btn py-[7px] px-[14px] rounded-full text-[13px] font-medium cursor-pointer " +
                  (on ? "bg-[var(--btn)] text-white" : "bg-[var(--surf)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--navy)] hover:text-[var(--navy)]")}>
                {label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => {
            const [title, text] = p[lang];
            return (
              <article key={p.repo} data-reveal style={{ "--d": (i % 3) * 80 + "ms" }} className="card flex flex-col gap-3 p-6 rounded-[18px] bg-[var(--surf)] border border-[var(--border)]">
                <div className="flex flex-row justify-between items-center gap-3">
                  <span className="py-1 px-[10px] rounded-full bg-[var(--soft)] text-[12px] font-semibold text-[var(--navy)]">{S.categories[p.cat][lang]}</span>
                  <span className="text-[12px] font-medium text-[var(--muted)]" dir="ltr">{p.lang}</span>
                </div>
                <h3 className="text-[19px] font-bold leading-[1.4]">{title}</h3>
                <p className="text-[14px] leading-[1.75] text-[var(--muted)] grow">{text}</p>
                <div className="flex flex-row gap-4 text-[14px] font-semibold text-[var(--line)]">
                  <a href={"https://github.com/IDE21/" + p.repo} {...ext} className="ix ulink arrow-link">{t.code} <span className="arrow">↗</span></a>
                  {p.demo && <a href={p.demo} {...ext} className="ix ulink arrow-link">{t.demo} <span className="arrow">↗</span></a>}
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Contact */}
      <section id="contact" className="w-full px-5 pb-14 lg:px-30 lg:pb-24">
        <div data-reveal style={{ background: "var(--cta-bg)" }} className="max-w-[1200px] mx-auto flex flex-col gap-[18px] py-10 px-6 items-center text-center rounded-[28px] border border-[var(--cta-border)] shadow-[0_24px_60px_-30px_var(--glow)] lg:p-16">
          <h2 className="text-[30px] lg:text-[44px] font-bold text-[var(--cta-title)]">{t.contactTitle}</h2>
          <p className="text-[16px] lg:text-[18px] text-[var(--cta-text)] max-w-[560px]">{t.contactText}</p>
          <Btn href={"mailto:" + L.email} kind="cta"><span dir="ltr">{L.email}</span></Btn>
          <div className="flex flex-row flex-wrap justify-center gap-5 text-[14px] font-semibold text-[var(--cta-text)]" dir="ltr">
            <a href={L.x} {...ext} className="ix ulink hover:text-[var(--cta-title)] transition-colors">X</a>
            <a href={L.github} {...ext} className="ix ulink hover:text-[var(--cta-title)] transition-colors">GitHub</a>
            <a href={L.linkedin} {...ext} className="ix ulink hover:text-[var(--cta-title)] transition-colors">LinkedIn</a>
            <a href={L.medium} {...ext} className="ix ulink hover:text-[var(--cta-title)] transition-colors">Medium</a>
            <a href={L.telegram} {...ext} className="ix ulink hover:text-[var(--cta-title)] transition-colors">Telegram</a>
            <a href={L.orcid} {...ext} className="ix ulink hover:text-[var(--cta-title)] transition-colors">ORCID</a>
          </div>
        </div>
      </section>

      <footer className="mt-auto w-full py-5 px-5 bg-[var(--surf)] border-t border-[var(--border)] lg:px-30">
        <div className="max-w-[1200px] mx-auto flex flex-col-reverse gap-4 items-center justify-between sm:flex-row">
          <p className="text-[13px] text-[var(--muted)]">{t.footer}</p>
          <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="ix btn inline-flex items-center gap-2 py-[9px] px-[16px] rounded-full border border-[var(--border)] bg-[var(--surf)] text-[13px] font-semibold text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--soft)]">
            {t.backTop}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Portfolio />);
