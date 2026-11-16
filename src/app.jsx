import React from "react";
import { createRoot } from "react-dom/client";
import { MetalShader } from "./metal.jsx";

const S = window.SITE;
const ext = { target: "_blank", rel: "noopener" };

// The exact profile picture from the X account.
function Logo({ size, ring }) {
  return (
    <img src="avatar.jpg" alt="Enad Alrougi" width={size} height={size}
      className={"shrink-0 rounded-full bg-[var(--surf)] object-cover " + (ring ? "ring-1 ring-white/30" : "")}
      style={{ width: size, height: size }} />
  );
}

const Arrow = ({ size = 16 }) => (
  <svg className="arrow" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

// Pill buttons with an arrow, like the template's "Let's talk" button.
function Pill({ href, kind = "solid", children, ...rest }) {
  const k = {
    solid: "bg-[var(--btn)] text-white hover:bg-[var(--btn-h)] shine",
    light: "bg-white text-[#0A2F5C] hover:bg-[#E6EEF7] shine",
    glass: "border border-white/35 text-white hover:border-white hover:bg-white/10 backdrop-blur",
    outline: "border border-[var(--border)] text-[var(--navy)] bg-[var(--surf)] hover:border-[var(--navy)]",
  }[kind];
  return (
    <a href={href} {...rest} className={"ix btn arrow-link inline-flex items-center justify-center gap-[10px] py-[12px] ps-[22px] pe-[18px] rounded-full text-[15px] font-semibold " + k}>
      <span>{children}</span><Arrow />
    </a>
  );
}

function Heading({ title, sub, light }) {
  return (
    <div data-reveal className="flex flex-col gap-3">
      <h2 className={"text-[34px] lg:text-[56px] font-bold leading-[1.15] tracking-[-0.02em] " + (light ? "text-white" : "text-[var(--text)]")}>{title}</h2>
      {sub && <p className={"text-[16px] lg:text-[18px] " + (light ? "text-[#C9D6E8]" : "text-[var(--muted)]")}>{sub}</p>}
    </div>
  );
}

function Section({ id, className = "", children }) {
  return (
    <section id={id} className={"w-full py-16 px-5 lg:py-28 lg:px-30 " + className}>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-9 lg:gap-12">{children}</div>
    </section>
  );
}

// Rows of pills that drift sideways, alternating direction (the template's tag wall).
function PillWall({ rows }) {
  return (
    <div data-reveal className="marquee flex flex-col gap-3 -mx-5 lg:mx-0" dir="ltr">
      {rows.map((row, r) => (
        <div key={r} className="overflow-hidden">
          <div className={"track " + (r % 2 ? "rev" : "")} style={{ "--dur": 38 + r * 9 + "s" }}>
            {[0, 1].map(copy => row.map(([text, hot], i) => (
              <span key={copy + "-" + i} aria-hidden={copy === 1 || undefined} dir="auto"
                className={"pill shrink-0 inline-flex items-center gap-2 me-3 py-[12px] px-[22px] rounded-full text-[15px] lg:text-[17px] font-semibold whitespace-nowrap " +
                  (hot ? "bg-[var(--btn)] text-white" : "bg-[var(--soft)] text-[var(--navy)]")}>
                {hot ? <span aria-hidden="true" className="text-[18px] leading-none">+</span> : null}{text}
              </span>
            )))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Horizontal glass carousel: drag with the mouse, swipe, arrow keys or the buttons.
function Carousel({ items, t, render }) {
  const ref = React.useRef(null);
  const rtl = t.dir === "rtl";
  const go = dir => {
    const el = ref.current; if (!el) return;
    const card = el.querySelector("[data-card]");
    const step = card ? card.getBoundingClientRect().width + 20 : 340;
    el.scrollBy({ left: dir * step * (rtl ? -1 : 1), behavior: "smooth" });
  };
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let down = false, sx = 0, sl = 0, moved = false;
    const onDown = e => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; el.classList.add("dragging"); };
    const onMove = e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = sl - dx; };
    const onUp = () => { if (!down) return; down = false; el.classList.remove("dragging"); };
    const onClick = e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);
  React.useEffect(() => { if (ref.current) ref.current.scrollTo({ left: 0 }); }, [items]);
  const onKey = e => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(rtl ? -1 : 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(rtl ? 1 : -1); }
  };
  const btn = "ix btn w-[48px] h-[48px] inline-flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 hover:border-white cursor-pointer backdrop-blur";
  return (
    <div className="flex flex-col gap-6">
      <div ref={ref} tabIndex={0} onKeyDown={onKey} aria-label={t.projectsTitle} role="region"
        className="carousel ix flex flex-row gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-5 lg:scroll-px-30 pb-4 -mx-5 px-5 lg:-mx-30 lg:px-30">
        {items.map((p, i) => <div data-card key={p.repo} className="snap-start shrink-0 w-[84%] sm:w-[360px] flex">{render(p, i)}</div>)}
      </div>
      <div className="flex flex-row items-center justify-between gap-4">
        <span className="text-[13px] text-[#9BB0CC]">{t.dragHint}</span>
        <div className="flex flex-row gap-3">
          <button className={btn} onClick={() => go(-1)} aria-label={t.prev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flip-rtl"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className={btn} onClick={() => go(1)} aria-label={t.next}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flip-rtl"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Portfolio() {
  const [lang, setLang] = React.useState(() => {
    try { return localStorage.getItem("lang") || "ar"; } catch { return "ar"; }
  });
  const [cat, setCat] = React.useState("all");
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"));
  const [overHero, setOverHero] = React.useState(true);
  React.useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
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

  // Scroll: the header switches style once the page rolls over the hero, and the hero text eases away.
  React.useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = window.innerHeight, y = window.scrollY;
      setOverHero(y < h - 72);
      document.documentElement.style.setProperty("--hero-p", Math.min(1, y / h).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

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
  // Pill wall rows: interests highlighted, skills in between.
  const I = t.interests.map(x => [x, 1]), K = t.skills.map(x => [x, 0]);
  const rows = [
    [K[0], I[0], K[1], K[2], I[1], K[3], K[4]],
    [K[5], K[6], I[2], K[7], I[3], K[8], K[9]],
    [K[10], I[4], K[11], K[12], I[5], K[13], K[14], K[15]],
  ].map(r => r.filter(Boolean));

  const head = overHero
    ? "bg-[rgba(5,10,22,.35)] border-white/10 text-white"
    : "bg-[var(--nav)] border-[var(--border)] text-[var(--text)] shadow-[0_10px_30px_-20px_var(--glow)]";
  const iconBtn = "ix icon-btn w-[42px] h-[42px] inline-flex items-center justify-center rounded-full border cursor-pointer " +
    (overHero ? "border-white/25 text-white hover:bg-white/10 hover:border-white" : "border-[var(--border)] text-[var(--navy)] bg-[var(--surf)] hover:border-[var(--navy)]");
  const social = [["X", L.x], ["GitHub", L.github], ["LinkedIn", L.linkedin], ["Medium", L.medium], ["Telegram", L.telegram], ["ORCID", L.orcid]];

  return (
    <div className="relative w-full min-h-dvh flex flex-col bg-[var(--bg)]">
      {/* Floating blurred header */}
      <header className="fixed top-3 inset-x-3 z-30 lg:top-4 lg:inset-x-6">
        <div className={"max-w-[1240px] mx-auto flex flex-row justify-between items-center gap-4 py-[9px] ps-[10px] pe-[10px] lg:ps-4 rounded-full border backdrop-blur-xl transition-[background-color,border-color,color,box-shadow] duration-300 " + head}>
          <a href="#top" className="ix logo-link flex flex-row gap-[10px] items-center rounded-full">
            <Logo size={38} ring />
            <span className="text-[16px] lg:text-[17px] font-bold">{t.name}</span>
          </a>
          <nav className={"hidden lg:flex flex-row gap-7 items-center text-[15px] font-medium " + (overHero ? "text-white/80" : "text-[var(--muted)]")}>
            {Object.entries(t.nav).map(([k, v]) => <a key={k} href={"#" + k} className={"ulink transition-colors " + (overHero ? "hover:text-white" : "hover:text-[var(--navy)]")}>{v}</a>)}
          </nav>
          <div className="flex flex-row gap-2 items-center">
            <button onClick={toggleTheme} aria-label={dark ? t.lightMode : t.darkMode} title={dark ? t.lightMode : t.darkMode} className={iconBtn}>
              {dark
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label="Switch language" className={iconBtn + " text-[14px] font-bold"}>{t.other}</button>
            <span className="hidden lg:inline-flex"><Pill href="#contact" kind={overHero ? "glass" : "solid"}>{t.ctaContact}</Pill></span>
          </div>
        </div>
      </header>

      {/* Hero: sticky, so the rest of the page rolls up over it. */}
      <section id="top" className="hero sticky top-0 z-0 w-full h-dvh min-h-[600px] overflow-hidden bg-[#050A16] text-white">
        <MetalShader className="absolute inset-0 w-full h-full" />
        <div aria-hidden="true" className="hero-shade absolute inset-0 pointer-events-none" />
        <div className="hero-inner relative h-full max-w-[1240px] mx-auto px-5 pt-28 pb-8 flex flex-col justify-end gap-8 lg:px-10 lg:pb-12">
          <div className="flex flex-col gap-5 items-start">
            <span className="py-[7px] px-[14px] rounded-full border border-white/20 bg-white/5 backdrop-blur text-[12px] font-semibold tracking-[0.18em] uppercase text-[#C9D6E8]" dir="ltr">{t.badge}</span>
            <h1 className="metal-text text-[56px] sm:text-[84px] lg:text-[128px] font-bold leading-[1.05] tracking-[-0.03em]">{t.name}</h1>
            <p className="text-[20px] lg:text-[28px] font-semibold text-[#8DB8F2]">{t.role}</p>
            <p className="text-[15px] lg:text-[18px] leading-[1.8] text-[#C9D6E8] max-w-[620px]">{t.heroText}</p>
            <div className="flex flex-row flex-wrap gap-3 pt-1">
              <Pill href="#projects" kind="light">{t.ctaProjects}</Pill>
              <Pill href="#contact" kind="glass">{t.ctaContact}</Pill>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            {t.stats.map(([n, l]) => (
              <div key={l} className="glass flex flex-col gap-1 p-4 rounded-[20px] lg:p-5">
                <span className="self-start text-[24px] lg:text-[32px] font-bold text-white" dir="ltr">{n}</span>
                <span className="text-[13px] lg:text-[14px] text-[#C9D6E8]">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything else slides over the hero as a rounded sheet. */}
      <main className="sheet relative z-10 -mt-8 rounded-t-[32px] lg:rounded-t-[48px] bg-[var(--bg)] shadow-[0_-30px_60px_-20px_rgba(0,0,0,.45)]">
        {/* About */}
        <Section id="about">
          <Heading title={t.aboutTitle} />
          <p data-reveal className="text-[18px] lg:text-[26px] leading-[1.7] font-medium text-[var(--text)] max-w-[980px]">{t.aboutText}</p>
          <div className="flex flex-col gap-4">
            <div data-reveal className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-[14px] font-semibold text-[var(--muted)]">
              <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-[var(--btn)]" />{t.interestsTitle}</span>
              <span className="inline-flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-[var(--soft)] ring-1 ring-[var(--border)]" />{t.skillsTitle}</span>
            </div>
            <PillWall rows={rows} />
          </div>
        </Section>

        {/* Achievements: large filled cards on a grid backdrop */}
        <Section id="achievements" className="grid-bg">
          <Heading title={t.achievementsTitle} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {S.achievements.map((a, i) => {
              const [kind, title, text] = a[lang];
              return (
                <div key={i} data-reveal style={{ "--d": (i % 2) * 90 + "ms" }}
                  className="tile card relative overflow-hidden flex flex-col gap-3 p-7 lg:p-9 min-h-[230px] rounded-[28px] text-white">
                  <span className="tile-num absolute -bottom-6 end-4 text-[120px] lg:text-[150px] font-bold leading-none text-white/10 select-none" dir="ltr" aria-hidden="true">0{i + 1}</span>
                  <div className="flex flex-row justify-between items-start gap-3">
                    <span className="py-1 px-3 rounded-full bg-white/15 text-[12px] font-semibold">{kind}</span>
                    <span className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/30"><Arrow /></span>
                  </div>
                  <h3 className="relative text-[21px] lg:text-[24px] font-bold leading-[1.35]">{title}</h3>
                  <p className="relative text-[14px] lg:text-[15px] leading-[1.75] text-[#D6E2F2] max-w-[520px]">{text}</p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            <div data-reveal className="flex flex-row flex-wrap gap-x-4 gap-y-3 items-center justify-between">
              <h3 className="text-[22px] lg:text-[28px] font-bold">{t.publicationsTitle}</h3>
              <a href={L.orcid} {...ext} className="ix btn arrow-link inline-flex items-center gap-2 py-[9px] px-[16px] rounded-full border border-[var(--border)] bg-[var(--surf)] text-[13px] font-semibold text-[var(--navy)] hover:border-[#A6CE39]">
                <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#A6CE39" /><path fill="#fff" d="M10.6 23.3H8.7V10.1h1.9v13.2zm3-13.2h5.1c4.9 0 7 3.5 7 6.6 0 3.4-2.6 6.6-7 6.6h-5.1V10.1zm1.9 11.5h3c4.3 0 5.2-3.2 5.2-4.9 0-2.7-1.7-4.9-5.3-4.9h-2.9v9.8zM11 7.5c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3.6-1.3 1.3-1.3S11 6.8 11 7.5z" /></svg>
                {t.orcidLabel} <Arrow size={14} />
              </a>
            </div>
            {S.publications.map((p, i) => (
              <a key={i} href={p.url} {...ext} data-reveal style={{ "--d": i * 80 + "ms" }} title={t.readPaper}
                className="row ix arrow-link group relative overflow-hidden flex flex-row gap-4 items-center p-5 lg:p-6 rounded-[22px] bg-[var(--surf)] border border-[var(--border)]">
                <span className="relative shrink-0 py-1 px-2 rounded-[8px] bg-[var(--btn)] text-white text-[11px] font-bold group-hover:bg-white group-hover:text-[#0A2F5C] transition-colors" dir="ltr">IEEE</span>
                <span className="relative flex-1 flex flex-col gap-1">
                  <span className="text-[15px] lg:text-[16px] font-semibold leading-[1.6]" dir="ltr" style={{ fontFamily: "Inter, sans-serif", textAlign: "start" }}>{p.title}</span>
                  <span className="text-[13px] opacity-75" dir="ltr" style={{ textAlign: "start" }}>{p.venue}</span>
                </span>
                <span className="relative hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold">{t.readPaper} <Arrow size={14} /></span>
              </a>
            ))}
          </div>
        </Section>

        {/* Experience: rows that fill with navy on hover */}
        <Section id="experience">
          <Heading title={t.experienceTitle} />
          <ol className="flex flex-col border-t border-[var(--border)]">
            {S.experience.map((x, i) => {
              const [role, text] = x[lang];
              return (
                <li key={i} data-reveal className="row group relative overflow-hidden flex flex-col gap-2 py-7 px-3 border-b border-[var(--border)] lg:flex-row lg:gap-10 lg:px-6 rounded-[4px]">
                  <div className="relative flex flex-col gap-1 lg:w-[280px] lg:shrink-0">
                    <span className="text-[18px] lg:text-[20px] font-bold" dir="ltr" style={{ textAlign: "start" }}>{x.org}</span>
                    <span className="text-[13px] opacity-70" dir="ltr" style={{ textAlign: "start" }}>{x.date}</span>
                  </div>
                  <div className="relative flex flex-col gap-1">
                    <h3 className="text-[17px] lg:text-[19px] font-bold">{role}</h3>
                    <p className="text-[14px] lg:text-[15px] leading-[1.75] opacity-80">{text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div data-reveal className="flex flex-col gap-3 p-7 rounded-[28px] bg-[var(--surf)] border border-[var(--border)]">
              <h3 className="text-[20px] font-bold">{t.educationTitle}</h3>
              {S.education.map((e, i) => (
                <div key={i} className="flex flex-col gap-[2px] py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-[15px] font-semibold">{e[lang]}</span>
                  <span className="text-[13px] text-[var(--muted)]">{e.org} · <span dir="ltr">{e.date}</span></span>
                </div>
              ))}
            </div>
            <div data-reveal style={{ "--d": "100ms" }} className="flex flex-col gap-3 p-7 rounded-[28px] bg-[var(--surf)] border border-[var(--border)]">
              <h3 className="text-[20px] font-bold">{t.certsTitle}</h3>
              <div className="flex flex-row flex-wrap gap-2">
                {S.certifications.map(c => <span key={c} dir="ltr" className="py-[8px] px-[16px] rounded-full bg-[var(--soft)] text-[13px] font-semibold text-[var(--navy)]">{c}</span>)}
              </div>
            </div>
          </div>
        </Section>

        {/* Projects: a dark band with glowing light and a glass carousel */}
        <section id="projects" style={{ background: "var(--band)" }} className="projects relative overflow-hidden w-full py-16 px-5 lg:py-28 lg:px-30 text-white rounded-[32px] lg:rounded-[48px]">
          <div aria-hidden="true" className="glow glow-a" /><div aria-hidden="true" className="glow glow-b" />
          <div className="relative max-w-[1200px] mx-auto flex flex-col gap-9 lg:gap-12">
            <Heading title={t.projectsTitle} sub={t.projectsText} light />
            <div data-reveal className="flex flex-row flex-wrap gap-2">
              {cats.map(c => {
                const label = c === "all" ? t.all : S.categories[c][lang];
                const on = c === cat;
                return (
                  <button key={c} onClick={() => setCat(c)} aria-pressed={on}
                    className={"ix btn py-[8px] px-[16px] rounded-full text-[13px] font-semibold cursor-pointer " +
                      (on ? "bg-white text-[#0A2F5C]" : "border border-white/20 text-[#C9D6E8] hover:border-white hover:text-white")}>
                    {label}
                  </button>
                );
              })}
            </div>
            <Carousel items={shown} t={t} render={p => {
              const [title, text] = p[lang];
              return (
                <article className="glass glass-card flex flex-col gap-3 p-6 lg:p-7 rounded-[26px] w-full">
                  <div className="flex flex-row justify-between items-center gap-3">
                    <span className="py-1 px-[10px] rounded-full bg-white/10 text-[12px] font-semibold text-[#C9D6E8]">{S.categories[p.cat][lang]}</span>
                    <span className="text-[12px] font-medium text-[#9BB0CC]" dir="ltr">{p.lang}</span>
                  </div>
                  <h3 className="text-[20px] font-bold leading-[1.4]">{title}</h3>
                  <p className="text-[14px] leading-[1.75] text-[#C9D6E8] grow">{text}</p>
                  <div className="flex flex-row gap-4 text-[14px] font-semibold text-[#8DB8F2]">
                    <a href={"https://github.com/IDE21/" + p.repo} {...ext} className="ix ulink arrow-link inline-flex items-center gap-1 hover:text-white">{t.code} <Arrow size={14} /></a>
                    {p.demo && <a href={p.demo} {...ext} className="ix ulink arrow-link inline-flex items-center gap-1 hover:text-white">{t.demo} <Arrow size={14} /></a>}
                  </div>
                </article>
              );
            }} />
          </div>
        </section>

        {/* Contact */}
        <Section id="contact" className="grid-bg">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 items-start">
            <div data-reveal className="flex flex-col gap-4">
              <h2 className="text-[44px] lg:text-[80px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--text)]">{t.contactTitle}</h2>
              <p className="text-[16px] lg:text-[19px] leading-[1.75] text-[var(--muted)] max-w-[460px]">{t.contactText}</p>
            </div>
            <div data-reveal style={{ "--d": "100ms" }} className="flex flex-col gap-5 p-6 lg:p-8 rounded-[28px] bg-[var(--surf)] border border-[var(--border)] shadow-[0_30px_60px_-40px_var(--glow)]">
              <a href={"mailto:" + L.email} className="ix arrow-link group flex flex-row items-center justify-between gap-3 p-5 rounded-[20px] bg-[var(--btn)] text-white hover:bg-[var(--btn-h)] transition-colors">
                <span className="flex flex-col gap-1">
                  <span className="text-[13px] text-white/70">Email</span>
                  <span className="text-[16px] sm:text-[19px] font-bold" dir="ltr">{L.email.split("@")[0]}<wbr />@{L.email.split("@")[1]}</span>
                </span>
                <span className="shrink-0 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white text-[#0A2F5C]"><Arrow /></span>
              </a>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3" dir="ltr">
                {social.map(([name, href]) => (
                  <a key={name} href={href} {...ext} className="ix btn arrow-link inline-flex items-center justify-between gap-2 py-[12px] px-[16px] rounded-full border border-[var(--border)] text-[14px] font-semibold text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--soft)]">
                    {name} <Arrow size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <footer className="w-full px-5 pt-12 pb-6 border-t border-[var(--border)] lg:px-30">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-end">
              <div className="flex flex-row gap-4 items-center">
                <Logo size={56} />
                <div className="flex flex-col gap-1">
                  <span className="text-[22px] font-bold">{t.name}</span>
                  <span className="text-[14px] text-[var(--muted)] max-w-[360px]">{t.footerTag}</span>
                </div>
              </div>
              <nav className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-[var(--muted)]">
                {Object.entries(t.nav).map(([k, v]) => <a key={k} href={"#" + k} className="ulink hover:text-[var(--navy)] transition-colors">{v}</a>)}
              </nav>
            </div>
            <div className="flex flex-col-reverse gap-4 items-center justify-between pt-5 border-t border-[var(--border)] sm:flex-row">
              <p className="text-[13px] text-[var(--muted)]">{t.footer}</p>
              <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="ix btn inline-flex items-center gap-2 py-[9px] px-[16px] rounded-full border border-[var(--border)] bg-[var(--surf)] text-[13px] font-semibold text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--soft)]">
                {t.backTop}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Portfolio />);
