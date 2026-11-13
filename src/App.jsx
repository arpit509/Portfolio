import "./App.css";
import "./App.extra.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";

/* Links come from the hyperlinks embedded in the resume PDF */
const LINKS = {
  linkedin: "https://www.linkedin.com/in/arpit-maurya97/",
  github: "https://github.com/arpit509/",
  email: "mailto:mauryaarpit097@gmail.com",
  phone: "tel:+918275613880",
  resume: "https://drive.google.com/file/d/1yelPsWYirca-S0i77QW3HHIxBAOSH3wz/view?usp=sharing",
  resumePreview: "https://drive.google.com/file/d/1yelPsWYirca-S0i77QW3HHIxBAOSH3wz/preview",
  store: "https://assetstore.unity.com/packages/tools/utilities/srecorder-by-holofil-389254",
};

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
);

/* Typing animation hook */
function useTyping(words) {
  const [text, setText] = useState("");
  const state = useRef({ idx: 0, charIdx: 0, deleting: false });
  useEffect(() => {
    let timer;
    function tick() {
      const { idx, charIdx, deleting } = state.current;
      const word = words[idx];
      if (!deleting) {
        setText("// " + word.slice(0, charIdx + 1));
        state.current.charIdx++;
        if (state.current.charIdx === word.length) {
          state.current.deleting = true;
          timer = setTimeout(tick, 2000);
        } else {
          timer = setTimeout(tick, 75);
        }
      } else {
        setText("// " + word.slice(0, charIdx - 1));
        state.current.charIdx--;
        if (state.current.charIdx === 0) {
          state.current.deleting = false;
          state.current.idx = (idx + 1) % words.length;
          timer = setTimeout(tick, 400);
        } else {
          timer = setTimeout(tick, 35);
        }
      }
    }
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line
  return text;
}

/* Observe visibility and set visible=true once element enters viewport */
function useVisible(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* 3D tilt — pass the SAME ref used for visibility so they share one DOM node */
function useTilt(ref) {
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(4px)`;
  }, [ref]);
  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, [ref]);
  return { onMouseMove, onMouseLeave };
}

/* Bioluminescent particle canvas */
function useParticles(canvasRef) {
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, animId;
    const COLS = ["rgba(0,255,224,", "rgba(0,85,255,", "rgba(170,255,0,"];
    class Dot {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * W; this.y = Math.random() * H;
        this.vx = (Math.random() - .5) * .35; this.vy = (Math.random() - .5) * .35;
        this.r = Math.random() * 1.8 + .4; this.a = Math.random() * .3 + .05;
        this.c = COLS[Math.floor(Math.random() * 3)];
        this.life = 0; this.ml = Math.random() * 300 + 200;
      }
      step() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.ml || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.init();
      }
      draw() {
        const p = this.life / this.ml;
        const f = p < .1 ? p * 10 : p > .9 ? (1 - p) * 10 : 1;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + (this.a * f) + ")"; ctx.fill();
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = this.c + (this.a * f * .12) + ")"; ctx.fill();
      }
    }
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    const dots = Array.from({ length: 85 }, () => new Dot());
    function edges() {
      for (let i = 0; i < dots.length; i++)
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(0,255,224,${(1 - d / 110) * .07})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
    }
    function loop() {
      ctx.clearRect(0, 0, W, H);
      const { x: mox, y: moy } = mouseRef.current;
      dots.forEach(d => {
        const dx = d.x - mox, dy = d.y - moy, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { const f = (1 - dist / 120) * .4; d.vx += dx / dist * f; d.vy += dy / dist * f; }
        d.vx *= .995; d.vy *= .995; d.step(); d.draw();
      });
      edges();
      animId = requestAnimationFrame(loop);
    }
    loop();
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [canvasRef]);
}

/* ---------- Content (from resume) ---------- */
const SKILLS = [
  ["🎮", "Game Development", "Unity 3D games with physics, AI, VFX and UI systems, optimized to hold a stable 60 FPS.", "Unity · C#"],
  ["🥽", "AR Development", "Ground detection and auto-fit placement for 3D models, plus an AR-compatible in-app camera recorder.", "AR · Unity · URP"],
  ["👁️", "Computer Vision", "Real-time face detection and tracking with OpenCV at 30+ FPS and under 100 ms latency.", "OpenCV · Tracking"],
  ["🎨", "3D & Graphics", "Modeling, shading, texturing and EEVEE rendering in Blender for games and visualizations.", "Blender · EEVEE"],
  ["🌐", "Web Development", "Responsive, fast front-ends with React.js. Next.js is on my learning list.", "React · HTML5 · CSS3 · Bootstrap"],
  ["💻", "Programming", "Comfortable across scripting, systems and mobile languages, from Python to Flutter's Dart.", "Python · C · C# · Dart"],
  ["🗄️", "Databases", "Schema design, queries and relational data modeling for reliable storage.", "MySQL · SQL"],
  ["🔌", "Hardware / IoT", "Microcontroller programming and sensor integration, bridging hardware with software.", "ESP32 · Sensors"],
  ["🛠️", "Tools & Platforms", "Version control and store releases, from Git workflows to Google Play Console.", "Git · GitHub · Play Console · Android Studio"],
];

const W = { color: "var(--white)" };
const ACHIEVEMENTS = [

  ["Lt. Ratan Tata Best Innovation Idea Award", <>Recognized for an <strong style={W}>outstanding creative solution</strong>.</>, "🏆 Innovation Award"],
  ["National Level Project Competition", <><strong style={W}>1st Runner Up</strong> — organized by IEEE at SKNCOE.</>, "🥈 IEEE · SKNCOE · National"],
  ["State Level Project Competition", <><strong style={W}>1st Runner Up</strong> — competed among top engineering colleges in Maharashtra.</>, "🥈 State Level · Maharashtra", true],
  ["College Hackathon Winner", <>Won both <strong style={W}>Best Code</strong> and <strong style={W}>Best Presentation</strong> awards.</>, "🏆 Best Code · Best Presentation", true],
];

const FILTERS = ["All", "Games", "AR & Vision", "3D", "Web & Data"];
const PROJECTS = [
  { cat: "AR & Vision", title: "SRecorder — AR Camera Recorder", status: "★ FEATURED · PUBLISHED", featured: true,
    desc: "Built for Holofil as a third-party tool for Unity developers and published on the Unity Asset Store: an AR-compatible camera recorder for the URP pipeline. Bridges C# with a native Java layer on Android, delivering a drop-in package with under 5% FPS overhead and zero pipeline-specific rework between projects.",
    tags: ["Unity", "C#", "Java", "URP", "Built-in RP"], link: ["View on Unity Asset Store", LINKS.store] },
  { cat: "Games", title: "RailHolow", status: "IN PROGRESS",
    desc: "A solo-built, linear, systems-driven horror game. I authored the full game design document, then modelled and textured a train car and a modular tunnel section in Blender, optimized for URP texturing in Unity.",
    tags: ["Unity URP", "Blender", "Game Design"], link: ["View Project", "https://drive.google.com/drive/folders/15DuHKE00dm2oE0FXdaO2RjN7p8PNf0yB?usp=sharing"] },
  { cat: "Web & Data", title: "PlaceSense — Placement Predictor", status: "LIVE",
    desc: "A deployed web app that predicts placement outcomes with a Random Forest trained on 10K records. Returns probability, confidence, signal weights and recommendations, with a dataset dashboard and a timed 25-question aptitude test that auto-fills the predictor.",
    tags: ["Python", "Random Forest", "Data Visualization"], link: ["Live Demo", "https://place-sense.vercel.app/"] },
  { cat: "Games", title: "Car Racing Game", status: "DEMO",
    desc: "A 3D racing game with responsive vehicle physics, collision detection, a dynamic follow camera and lap-time tracking at a stable 60 FPS, set in a complete city environment I designed and built.",
    tags: ["Unity 3D", "C#", "Physics Engine"], link: ["Watch Demo", "https://drive.google.com/file/d/1qo-I-NSKWKCK2v9P2erQknymBIMD4hFd/view?usp=sharing"] },
  { cat: "3D", title: "Car VFX Visualization", status: "SAMPLES",
    desc: "A real-time car VFX scene in Blender's EEVEE renderer with custom shader nodes for metallic paint, reflections and motion blur. Tuned for low-end hardware, cutting render times from minutes to seconds per frame.",
    tags: ["Blender", "EEVEE", "Shader Nodes"], link: ["Blender Samples", "https://drive.google.com/drive/folders/1i00FOQAzd9aNgsJBEiACLfexX0ONjkL_?usp=sharing"] },
];

const NAV = [["#about", "About"], ["#skills", "Skills"], ["#achievements", "Wins"], ["#experience", "XP"], ["#education", "Education"], ["#projects", "Work"], ["#resume", "Resume"]];

/* ---------- Components (each owns its hooks) ---------- */
function Stat({ n, suf = "+", label, green }) {
  const [ref, vis] = useVisible(0.3);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!vis) return;
    let raf; const t0 = performance.now();
    const f = (t) => { const p = Math.min(1, (t - t0) / 1200); setV(Math.round(n * p)); if (p < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [vis, n]);
  return (
    <div ref={ref} className="stat-item">
      <span className="stat-n" style={green ? { color: "var(--green)", textShadow: "0 0 20px rgba(170,255,0,.3)" } : undefined}>{v}{suf}</span>
      <div className="stat-l">{label}</div>
    </div>
  );
}

function SkillCard({ s, i }) {
  const [ref, vis] = useVisible();
  const tilt = useTilt(ref);
  return (
    <div ref={ref} className={`sk${vis ? " visible" : ""}`} style={{ transitionDelay: `${(i % 3) * 0.08}s` }} {...tilt}>
      <span className="sk-num">{String(i + 1).padStart(2, "0")}</span>
      <span className="sk-icon">{s[0]}</span>
      <div className="sk-name">{s[1]}</div>
      <div className="sk-desc">{s[2]}</div>
      <span className="sk-tag">{s[3]}</span>
    </div>
  );
}

function AchCard({ a, i }) {
  const [ref, vis] = useVisible();
  return (
    <div ref={ref} className={`ach-card${vis ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.1}s` }}>
      <div className="ach-idx">{String(i + 1).padStart(2, "0")}</div>
      <div className="ach-content">
        <h3>{a[0]}</h3><p>{a[1]}</p>
        <span className={`ach-badge${a[3] ? " ach-badge-cyan" : ""}`}>{a[2]}</span>
      </div>
    </div>
  );
}

function ProjectCard({ p, i, hov }) {
  const [ref, vis] = useVisible();
  const tilt = useTilt(ref);
  return (
    <div ref={ref} className={`pc${p.featured ? " pc-featured" : ""}${vis ? " visible" : ""}`} style={{ transitionDelay: `${(i % 2) * 0.1}s` }} {...tilt}>
      <div className="pc-glow" style={p.featured ? { background: "radial-gradient(circle,rgba(170,255,0,.1),transparent 70%)" } : undefined} />
      <div className="pc-line" />
      <div className="pc-num">{p.cat.toUpperCase()} &nbsp;·&nbsp; {p.status}</div>
      <h3 className={`pc-title${p.featured ? " pc-title-lg" : ""}`}>{p.title}</h3>
      <p className="pc-desc" style={p.featured ? { maxWidth: "640px" } : undefined}>{p.desc}</p>
      <div className="pc-tags">{p.tags.map((t) => <span key={t} className={`pc-tag${p.featured ? " pc-tag-green" : ""}`}>{t}</span>)}</div>
      <div className="pc-actions">
        <a href={p.link[1]} target="_blank" rel="noreferrer" className="pc-link" {...hov}>{p.link[0]} ↗</a>
      </div>
    </div>
  );
}

function App() {
  const canvasRef = useRef(null);
  const curRef = useRef(null);
  const trailRef = useRef(null);
  const logoRef = useRef(null);
  const barRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState("");
  const [filter, setFilter] = useState("All");
  const hov = { onMouseEnter: () => setHovering(true), onMouseLeave: () => setHovering(false) };

  const roleText = useTyping(["Game Developer", "AR Engineer", "Unity Developer", "Computer Vision Dev", "Full-Stack Enthusiast"]);
  useParticles(canvasRef);

  /* Cursor */
  useEffect(() => {
    let mx = 0, my = 0, tx = 0, ty = 0, raf;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (curRef.current) { curRef.current.style.left = mx + "px"; curRef.current.style.top = my + "px"; }
    };
    const anim = () => {
      tx += (mx - tx) * .1; ty += (my - ty) * .1;
      if (trailRef.current) { trailRef.current.style.left = tx + "px"; trailRef.current.style.top = ty + "px"; }
      raf = requestAnimationFrame(anim);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(anim);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  /* Logo glitch */
  useEffect(() => {
    const id = setInterval(() => {
      if (logoRef.current && Math.random() < .04) {
        logoRef.current.style.textShadow = "2px 0 #f0f, -2px 0 #0ff, 0 0 20px #00ffe0";
        setTimeout(() => { if (logoRef.current) logoRef.current.style.textShadow = ""; }, 80);
      }
    }, 600);
    return () => clearInterval(id);
  }, []);

  /* Scroll progress bar */
  useEffect(() => {
    const f = () => {
      const p = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);

  /* Scroll-spy for the nav */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive("#" + e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id], #home").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const [aboutRef, aboutVis] = useVisible();
  const [expRef, expVis] = useVisible();
  const [edu1Ref, edu1Vis] = useVisible();
  const [edu2Ref, edu2Vis] = useVisible();
  const [resumeRef, resumeVis] = useVisible();
  const [connectRef, connectVis] = useVisible();

  const shown = PROJECTS.filter((p) => filter === "All" || p.cat === filter);

  return (
    <>
      <SpeedInsights />
      <div className="progress" ref={barRef} />
      <div ref={curRef} className={`cur${hovering ? " hovered" : ""}`} />
      <div ref={trailRef} className={`cur-trail${hovering ? " hovered" : ""}`} />

      <div className="blobs"><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></div>
      <canvas ref={canvasRef} className="bgc" />

      <div className="soc-bar">
        <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="sb" aria-label="LinkedIn" {...hov}><LinkedInIcon /></a>
        <a href={LINKS.github} target="_blank" rel="noreferrer" className="sb" aria-label="GitHub" {...hov}><GitHubIcon /></a>
        <a href={LINKS.email} className="sb" aria-label="Email" {...hov}><MailIcon /></a>
      </div>
      <div className="mail-bar"><a href={LINKS.email} {...hov}>mauryaarpit097@gmail.com</a></div>

      <nav>
        <a ref={logoRef} className="logo" href="#home">ARPIT<span>.</span></a>
        <ul className="nav-links">
          {NAV.map(([href, label]) => <li key={href}><a href={href} className={active === href ? "active" : ""} {...hov}>{label}</a></li>)}
          <li><a href="#connect" className="nav-cta" {...hov}>Connect</a></li>
        </ul>
      </nav>

      <main>
        <div id="home" className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-tag"><span className="tag-dot" />Open to opportunities &nbsp;·&nbsp; Pune, India</div>
              <h1 className="hero-name">ARPIT<br /><span className="stroke">MAURYA</span></h1>
              <p className="hero-role">{roleText}</p>
              <p className="hero-desc">Computer Engineering student and National Hackathon Winner. I build Unity 3D games, AR experiences and computer vision apps, and I enjoy connecting hardware like the ESP32 to software for immersive, user-centric products.</p>
              <div className="hero-btns">
                <a href={LINKS.resume} target="_blank" rel="noreferrer" className="btn-glow" {...hov}>↓ Resume</a>
                <a href="#projects" className="btn-outline" {...hov}>See my work →</a>
              </div>
            </div>
            <div className="hero-right">
              <div className="ring-wrap">
                <div className="ring r1" /><div className="ring r2" /><div className="ring r3" />
                <div className="ring-core" />
                <span className="ring-label rl1">Unity · C#</span>
                <span className="ring-label rl2">OpenCV · Blender</span>
                <span className="ring-label rl3">AR · ESP32</span>
              </div>
            </div>
          </div>
        </div>

        <section id="about" className="section">
          <div className="eye">About Me</div>
          <h2 className="sec-h">Who I <em>Am</em></h2>
          <div className="about-grid">
            <div ref={aboutRef} className={`fade-up${aboutVis ? " visible" : ""}`}>
              <p className="about-text">
                Hi, I'm <strong>Arpit Maurya</strong> — a Computer Engineering student with hands-on experience in <span className="hl">game development</span> (Unity 3D / C#), <span className="hl">3D visualization</span> (Blender) and cross-platform app development. I'm a National Hackathon Winner and a multiple-time competition podium finisher.<br /><br />
                Right now I'm contributing to real-world projects at <span className="hl">Holofil</span>, from Play Store deployment to computer vision applications. I'm passionate about bridging hardware (ESP32) with software to build immersive, <strong>user-centric</strong> experiences.
              </p>
              <div className="pc-tags" style={{ marginTop: "1.5rem" }}>
                {["Blender Shader & Texturing", "Advanced React.js & Next.js", "ESP32 IoT", "Game AI & Procedural Generation", "AR Development"].map((t) => <span key={t} className="pc-tag">{t}</span>)}
              </div>
              <p className="about-langs">Languages: English (Professional) · Hindi (Native)</p>
            </div>
            <div className="stat-grid">
              <Stat n={5} label="Play Store Releases" />
              <Stat n={3} label="Holographic Games" green />
              <Stat n={5} suf="" label="Awards & Wins" />
              <Stat n={200} label="Teams Outranked" />
            </div>
          </div>
        </section>

        <div className="divider" />

        <section id="skills" className="section">
          <div className="eye">Expertise</div>
          <h2 className="sec-h">What I <em>Build</em></h2>
          <div className="skills-grid">{SKILLS.map((s, i) => <SkillCard key={s[1]} s={s} i={i} />)}</div>
        </section>

        <div className="divider" />

        <section id="achievements" className="section">
          <div className="eye">Recognition</div>
          <h2 className="sec-h">Key <em>Wins</em></h2>
          {ACHIEVEMENTS.map((a, i) => <AchCard key={a[0]} a={a} i={i} />)}
        </section>

        <div className="divider" />

        <section id="experience" className="section">
          <div className="eye">Career</div>
          <h2 className="sec-h">Work <em>Experience</em></h2>
          <div className="exp-wrap">
            <div ref={expRef} className={`exp-item${expVis ? " visible" : ""}`}>
              <div className="exp-period">November 2024 — Present</div>
              <div className="exp-company">Game Developer Intern · Holofil</div>
              <ul className="exp-list">
                <li><strong>Holographic Games:</strong> Developed 3+ interactive Unity 3D / C# games for holographic displays; optimized assets and draw calls to sustain a stable 60 FPS and cut scene load time by ~35%.</li>
                <li><strong>AR Placement System:</strong> Engineered a ground-detection and auto-fit system that snaps any 3D model to real-world surfaces, reducing per-model setup time by ~70% across the team's 20+ model library.</li>
                <li><strong>AR Camera Recorder:</strong> Built an AR-compatible in-app recorder in Unity (C# + Java) for URP and Built-in pipelines from one codebase: ~50% less integration effort, under 5% FPS overhead.</li>
                <li><strong>Computer Vision:</strong> Built a real-time OpenCV face-tracking system that rotates a 3D model to always face the viewer, at 30+ FPS with under 100 ms latency.</li>
                <li><strong>Release Management:</strong> Owned end-to-end Google Play deployments across 5+ releases, with zero rejected submissions.</li>
                <li><strong>Unity Asset Store:</strong> Designed, packaged and published <a href={LINKS.store} target="_blank" rel="noreferrer" className="inline-link" {...hov}>SRecorder ↗</a>, with documentation, the store listing and 5+ marketing creatives.</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="divider" />

        <section id="education" className="section">
          <div className="eye">Education</div>
          <h2 className="sec-h">Where I <em>Study</em></h2>
          <div className="exp-wrap">
            <div ref={edu1Ref} className={`exp-item${edu1Vis ? " visible" : ""}`}>
              <div className="exp-period">2024 — Present</div>
              <div className="exp-company">B.Tech, Computer Engineering · GH Raisoni International Skill Tech University</div>
              <ul className="exp-list"><li>Relevant coursework: Data Structures, OOP, Database Management Systems, Computer Networks, Embedded Systems.</li></ul>
            </div>
            <div ref={edu2Ref} className={`exp-item${edu2Vis ? " visible" : ""}`}>
              <div className="exp-period">2022 — 2023</div>
              <div className="exp-company">Higher Secondary (12th) · Kendriya Vidyalaya No. 1, Pune</div>
              <ul className="exp-list"><li>Science stream with a focus on Physics, Chemistry and Mathematics.</li></ul>
            </div>
          </div>
        </section>

        <div className="divider" />

        <section id="projects" className="section">
          <div className="eye">Portfolio</div>
          <h2 className="sec-h">Selected <em>Work</em></h2>
          <div className="filters" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => <button key={f} role="tab" aria-selected={f === filter} className={f === filter ? "on" : ""} onClick={() => setFilter(f)} {...hov}>{f}</button>)}
          </div>
          <div className="proj-grid">{shown.map((p, i) => <ProjectCard key={p.title} p={p} i={i} hov={hov} />)}</div>
        </section>

        <div className="divider" />

        <section id="resume" className="section">
          <div className="eye">Resume</div>
          <h2 className="sec-h">My <em>Resume</em></h2>
          <div className="res-grid">
            <div ref={resumeRef} className={`res-left fade-up${resumeVis ? " visible" : ""}`}>
              <p>A complete snapshot of my skills, experience, and achievements. View inline or grab a copy.</p>
              <div className="res-btns">
                <a href={LINKS.resume} target="_blank" rel="noreferrer" className="btn-glow" style={{ textAlign: "center" }} {...hov}>↓ Download</a>
                <a href={LINKS.resume} target="_blank" rel="noreferrer" className="btn-outline" style={{ textAlign: "center" }} {...hov}>Open in Drive ↗</a>
              </div>
              <div className="res-link-label">Quick Links</div>
              <div className="res-links">
                <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="rl-a" {...hov}><LinkedInIcon />LinkedIn — arpit-maurya97</a>
                <a href={LINKS.github} target="_blank" rel="noreferrer" className="rl-a" {...hov}><GitHubIcon />GitHub — arpit509</a>
                <a href={LINKS.email} className="rl-a" {...hov}><MailIcon />mauryaarpit097@gmail.com</a>
              </div>
            </div>
            <div className={`res-frame fade-up${resumeVis ? " visible" : ""}`} style={{ transitionDelay: ".15s" }}>
              <iframe src={LINKS.resumePreview} allow="autoplay" title="Arpit Maurya Resume" />
            </div>
          </div>
        </section>

        <div className="divider" />

        <section id="connect" className="section">
          <div className="eye">Get In Touch</div>
          <div ref={connectRef} className={`connect-box fade-up${connectVis ? " visible" : ""}`}>
            <div>
              <h2 className="con-title">Let's build something <em>extraordinary</em></h2>
              <p className="con-sub">Open to game dev and AR roles, internships, and ambitious collaborations. You can also call or message me on +91 82756 13880.</p>
            </div>
            <div className="con-links">
              <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="cl" {...hov}><LinkedInIcon />LinkedIn<span className="cl-arr">↗</span></a>
              <a href={LINKS.email} className="cl" {...hov}><MailIcon />mauryaarpit097@gmail.com<span className="cl-arr">↗</span></a>
              <a href={LINKS.github} target="_blank" rel="noreferrer" className="cl" {...hov}><GitHubIcon />GitHub<span className="cl-arr">↗</span></a>
              <a href={LINKS.phone} className="cl" {...hov}>📞 +91 82756 13880<span className="cl-arr">↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} <span>Arpit Maurya</span> — All rights reserved</p>
        <p className="footer-locale">Pune · India</p>
      </footer>
    </>
  );
}

export default App;