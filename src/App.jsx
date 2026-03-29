import "./App.css";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"

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

/* Main App */
function App() {
  const canvasRef = useRef(null);
  const curRef = useRef(null);
  const trailRef = useRef(null);
  const logoRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const hov = { onMouseEnter: () => setHovering(true), onMouseLeave: () => setHovering(false) };

  const roleText = useTyping(["Game Developer", "AR Engineer", "Web Developer", "Flutter Dev", "Unity Expert"]);
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

  /* Visibility refs */
  const [aboutRef, aboutVis] = useVisible();
  const [statsRef, statsVis] = useVisible();
  const [skillsRef, skillsVis] = useVisible();
  const [ach1Ref, ach1Vis] = useVisible();
  const [ach2Ref, ach2Vis] = useVisible();
  const [ach3Ref, ach3Vis] = useVisible();
  const [exp1Ref, exp1Vis] = useVisible();
  const [resumeRef, resumeVis] = useVisible();
  const [connectRef, connectVis] = useVisible();

  /* Project cards: each needs ONE ref shared by visibility observer + tilt */
  const [proj1Ref, proj1Vis] = useVisible();
  const [proj2Ref, proj2Vis] = useVisible();
  const [proj3Ref, proj3Vis] = useVisible();
  const tiltP1 = useTilt(proj1Ref);
  const tiltP2 = useTilt(proj2Ref);
  const tiltP3 = useTilt(proj3Ref);

  /* Skill cards: same pattern */
  const skillVisRefs = [useVisible(), useVisible(), useVisible(), useVisible(), useVisible(), useVisible()];
  const skillTilts = skillVisRefs.map(([ref]) => useTilt(ref)); // eslint-disable-line

  const skills = [
    { num: "01", icon: "🎮", name: "Game Development", desc: "Designing captivating 2D/3D games with Unity, multiplayer platformers and interactive AR experiences.", tag: "Unity · C#" },
    { num: "02", icon: "🌐", name: "Web Development", desc: "Building responsive websites with modern frameworks ensuring seamless performance and intuitive design.", tag: "React · JS · HTML/CSS" },
    { num: "03", icon: "📱", name: "Flutter Dev", desc: "Creating cross-platform mobile apps with smooth UI and seamless experiences using Flutter and Dart.", tag: "Flutter · Dart" },
    { num: "04", icon: "🐍", name: "Python", desc: "Automating tasks, building efficient tools, and developing data-driven solutions for smarter workflows.", tag: "Python · Automation" },
    { num: "05", icon: "🗄️", name: "MySQL", desc: "Designing and managing efficient, scalable databases for secure data storage and optimization.", tag: "MySQL · SQL" },
    { num: "06", icon: "🎨", name: "Blender 3D", desc: "Creating 3D assets, animations, and environments for games and interactive projects.", tag: "Blender · 3D Modeling" },
  ];

  return (
    <>
      <SpeedInsights />
      {/* Cursor */}
      <div ref={curRef} className={`cur${hovering ? " hovered" : ""}`} />
      <div ref={trailRef} className={`cur-trail${hovering ? " hovered" : ""}`} />

      {/* Background */}
      <div className="blobs">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
      </div>
      <canvas ref={canvasRef} className="bgc" />

      {/* Social sidebars */}
      <div className="soc-bar">
        <a href="https://www.linkedin.com/in/arpit-maurya-19322620b/" target="_blank" rel="noreferrer" className="sb" {...hov}><LinkedInIcon /></a>
        <a href="https://github.com/arpit509" target="_blank" rel="noreferrer" className="sb" {...hov}><GitHubIcon /></a>
        <a href="mailto:mauryaarpit097@gmail.com" className="sb" {...hov}><MailIcon /></a>
      </div>
      <div className="mail-bar">
        <a href="mailto:mauryaarpit097@gmail.com" {...hov}>mauryaarpit097@gmail.com</a>
      </div>

      {/* Nav */}
      <nav>
        <a ref={logoRef} className="logo" href="#home">ARPIT<span>.</span></a>
        <ul className="nav-links">
          {[["#about","About"],["#skills","Skills"],["#achievements","Wins"],["#experience","XP"],["#projects","Work"],["#resume","Resume"]].map(([href, label]) => (
            <li key={href}><a href={href} {...hov}>{label}</a></li>
          ))}
          <li><a href="#connect" className="nav-cta" {...hov}>Connect</a></li>
        </ul>
      </nav>

      <main>

        {/* HERO */}
        <div id="home" className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-tag"><span className="tag-dot" />Available for work &nbsp;·&nbsp; Pune, India</div>
              <h1 className="hero-name">ARPIT<br /><span className="stroke">MAURYA</span></h1>
              <p className="hero-role">{roleText}</p>
              <p className="hero-desc">Crafting immersive AR/3D games with Unity and building high-performance web &amp; mobile apps. I turn complex ideas into elegant, interactive realities.</p>
              <div className="hero-btns">
                <a href="https://drive.google.com/file/d/1bFqidWA6_jGlD7R0fne9ftU4IJznTHjq/view?usp=drive_link" target="_blank" rel="noreferrer" className="btn-glow" {...hov}>↓ Resume</a>
                <a href="mailto:mauryaarpit097@gmail.com" className="btn-outline" {...hov}>Say Hello →</a>
              </div>
            </div>
            <div className="hero-right">
              <div className="ring-wrap">
                <div className="ring r1" /><div className="ring r2" /><div className="ring r3" />
                <div className="ring-core" />
                <span className="ring-label rl1">Unity · C#</span>
                <span className="ring-label rl2">React · Flutter</span>
                <span className="ring-label rl3">AR Foundation</span>
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <section id="about" className="section">
          <div className="eye">About Me</div>
          <h2 className="sec-h">Who I <em>Am</em></h2>
          <div className="about-grid">
            <div ref={aboutRef} className={`fade-up${aboutVis ? " visible" : ""}`}>
              <p className="about-text">
                Hi, I'm <strong>Arpit Maurya</strong> — a developer passionate about the frontier of interactive technology. I specialize in building immersive <span className="hl">AR/3D game experiences</span> with Unity and crafting fast, beautiful apps with React and Flutter.<br /><br />
                I believe great software is as much about <strong>feel</strong> as function. Currently building interactive AR games at <span className="hl">Holofil</span>.
              </p>
            </div>
            <div ref={statsRef} className={`fade-up${statsVis ? " visible" : ""}`} style={{ transitionDelay: ".15s" }}>
              <div className="stat-grid">
                <div className="stat-item"><span className="stat-n">3+</span><div className="stat-l">Years Coding</div></div>
                <div className="stat-item"><span className="stat-n" style={{ color: "var(--green)", textShadow: "0 0 20px rgba(170,255,0,.3)" }}>5+</span><div className="stat-l">Projects Built</div></div>
                <div className="stat-item"><span className="stat-n">3</span><div className="stat-l">Awards Won</div></div>
                <div className="stat-item"><span className="stat-n">6+</span><div className="stat-l">Tech Skills</div></div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* SKILLS */}
        <section id="skills" className="section">
          <div className="eye">Expertise</div>
          <h2 className="sec-h">What I <em>Build</em></h2>
          <div ref={skillsRef} className="skills-grid">
            {skills.map((s, i) => {
              const [ref, vis] = skillVisRefs[i];
              const tilt = skillTilts[i];
              return (
                <div
                  key={s.num}
                  ref={ref}
                  className={`sk${vis ? " visible" : ""}`}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                  {...tilt}
                >
                  <span className="sk-num">{s.num}</span>
                  <span className="sk-icon">{s.icon}</span>
                  <div className="sk-name">{s.name}</div>
                  <div className="sk-desc">{s.desc}</div>
                  <span className="sk-tag">{s.tag}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="divider" />

        {/* ACHIEVEMENTS */}
        <section id="achievements" className="section">
          <div className="eye">Recognition</div>
          <h2 className="sec-h">Key <em>Wins</em></h2>
          <div ref={ach1Ref} className={`ach-card${ach1Vis ? " visible" : ""}`}>
            <div className="ach-idx">01</div>
            <div className="ach-content">
              <h3>National Hackathon Winner</h3>
              <p>Techathon 2025 — Awarded the prestigious <strong style={{ color: "var(--white)" }}>Ratan Tata Best Innovative Minds Award</strong> for outstanding innovation at the national level competition.</p>
              <span className="ach-badge">🏆 Techathon 2025</span>
            </div>
          </div>
          <div ref={ach2Ref} className={`ach-card${ach2Vis ? " visible" : ""}`} style={{ transitionDelay: ".15s" }}>
            <div className="ach-idx">02</div>
            <div className="ach-content">
              <h3>National Level Project Winner</h3>
              <p>IEEE Convene — <strong style={{ color: "var(--white)" }}>Singhad Institute</strong> — Won at the national level project competition organized by IEEE, recognized for technical excellence.</p>
              <span className="ach-badge">🥇 IEEE Convene · National</span>
            </div>
          </div>
          <div ref={ach3Ref} className={`ach-card${ach3Vis ? " visible" : ""}`} style={{ transitionDelay: ".3s" }}>
            <div className="ach-idx">03</div>
            <div className="ach-content">
              <h3>State Level Project Winner</h3>
              <p><strong style={{ color: "var(--white)" }}>Rajgad Institute</strong> — Secured top position at the state level project competition, demonstrating outstanding technical innovation.</p>
              <span className="ach-badge ach-badge-cyan">🥈 State Level · Rajgad</span>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* EXPERIENCE */}
        <section id="experience" className="section">
          <div className="eye">Career</div>
          <h2 className="sec-h">Work <em>Experience</em></h2>
          <div className="exp-wrap">
            <div ref={exp1Ref} className={`exp-item${exp1Vis ? " visible" : ""}`}>
              <div className="exp-period">November 2024 — Present</div>
              <div className="exp-company">Holofil</div>
              <ul className="exp-list">
                <li>Building interactive games on Unity using C# for AR holographic displays</li>
                <li>Optimized gameplay mechanics for enhanced user engagement and performance</li>
                <li>Addressed technical challenges including performance tuning and bug fixes across AR hardware</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* PROJECTS */}
        <section id="projects" className="section">
          <div className="eye">Portfolio</div>
          <h2 className="sec-h">Selected <em>Work</em></h2>
          <div className="proj-grid">

            <div ref={proj1Ref} className={`pc${proj1Vis ? " visible" : ""}`} {...tiltP1}>
              <div className="pc-glow" /><div className="pc-line" />
              <div className="pc-num">PROJECT / 01 / 2024</div>
              <h3 className="pc-title">Random Image App</h3>
              <div className="pc-period">August — September 2024</div>
              <p className="pc-desc">Web application to display random images via REST API with responsive design and optimized performance for seamless user experiences.</p>
              <div className="pc-tags">
                {["HTML","CSS","JavaScript","REST API","React"].map(t => <span key={t} className="pc-tag">{t}</span>)}
              </div>
            </div>

            <div ref={proj2Ref} className={`pc${proj2Vis ? " visible" : ""}`} style={{ transitionDelay: ".1s" }} {...tiltP2}>
              <div className="pc-glow" /><div className="pc-line" />
              <div className="pc-num">PROJECT / 02 / 2025</div>
              <h3 className="pc-title">Ambulance Nav App</h3>
              <div className="pc-period">January — February 2025</div>
              <p className="pc-desc">Mobile app helping ambulance drivers navigate traffic with real-time route optimization. Supports offline navigation waypoints without internet.</p>
              <div className="pc-tags">
                {["Flutter","Dart","Mapbox API","Offline"].map(t => <span key={t} className="pc-tag">{t}</span>)}
              </div>
            </div>

            <div ref={proj3Ref} className={`pc pc-featured${proj3Vis ? " visible" : ""}`} style={{ transitionDelay: ".2s" }} {...tiltP3}>
              <div className="pc-glow" style={{ background: "radial-gradient(circle,rgba(170,255,0,.1),transparent 70%)" }} />
              <div className="pc-line" />
              <div className="pc-num">PROJECT / 03 / 2025 &nbsp;·&nbsp; ★ FEATURED</div>
              <h3 className="pc-title pc-title-lg">AR Model Placement App</h3>
              <div className="pc-period pc-period-green">2025</div>
              <p className="pc-desc" style={{ maxWidth: "640px" }}>Built a full AR application using Unity and AR Foundation that detects real-world surfaces and lets users load, place, and interact with 3D models in augmented reality. Supports dynamic model loading, gesture-based manipulation, and real-time lighting integration.</p>
              <div className="pc-tags">
                {["Unity","AR Foundation","C#","ARCore / ARKit","3D Models"].map(t => <span key={t} className="pc-tag pc-tag-green">{t}</span>)}
              </div>
            </div>

          </div>
        </section>

        <div className="divider" />

        {/* RESUME */}
        <section id="resume" className="section">
          <div className="eye">Resume</div>
          <h2 className="sec-h">My <em>Resume</em></h2>
          <div className="res-grid">
            <div ref={resumeRef} className={`res-left fade-up${resumeVis ? " visible" : ""}`}>
              <p>A complete snapshot of my skills, experience, and achievements. View inline or grab a copy.</p>
              <div className="res-btns">
                <a href="https://drive.google.com/file/d/1bFqidWA6_jGlD7R0fne9ftU4IJznTHjq/view?usp=drive_link" target="_blank" rel="noreferrer" className="btn-glow" style={{ textAlign: "center" }} {...hov}>↓ Download</a>
                <a href="https://drive.google.com/file/d/1bFqidWA6_jGlD7R0fne9ftU4IJznTHjq/view?usp=drive_link" target="_blank" rel="noreferrer" className="btn-outline" style={{ textAlign: "center" }} {...hov}>Open in Drive ↗</a>
              </div>
              <div className="res-link-label">Quick Links</div>
              <div className="res-links">
                <a href="https://www.linkedin.com/in/arpit-maurya-19322620b/" target="_blank" rel="noreferrer" className="rl-a" {...hov}><LinkedInIcon />LinkedIn — arpit-maurya</a>
                <a href="https://github.com/arpit509" target="_blank" rel="noreferrer" className="rl-a" {...hov}><GitHubIcon />GitHub — arpit509</a>
                <a href="mailto:mauryaarpit097@gmail.com" className="rl-a" {...hov}><MailIcon />mauryaarpit097@gmail.com</a>
              </div>
            </div>
            <div className={`res-frame fade-up${resumeVis ? " visible" : ""}`} style={{ transitionDelay: ".15s" }}>
              <iframe src="https://drive.google.com/file/d/1bFqidWA6_jGlD7R0fne9ftU4IJznTHjq/preview" allow="autoplay" title="Arpit Maurya Resume" />
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* CONNECT */}
        <section id="connect" className="section">
          <div className="eye">Get In Touch</div>
          <div ref={connectRef} className={`connect-box fade-up${connectVis ? " visible" : ""}`}>
            <div>
              <h2 className="con-title">Let's build something <em>extraordinary</em></h2>
              <p className="con-sub">Open to game dev roles, web projects, AR collaborations, and ambitious ideas. I respond within 24 hours.</p>
            </div>
            <div className="con-links">
              <a href="https://www.linkedin.com/in/arpit-maurya-19322620b/" target="_blank" rel="noreferrer" className="cl" {...hov}><LinkedInIcon />LinkedIn<span className="cl-arr">↗</span></a>
              <a href="mailto:mauryaarpit097@gmail.com" className="cl" {...hov}><MailIcon />mauryaarpit097@gmail.com<span className="cl-arr">↗</span></a>
              <a href="https://github.com/arpit509" target="_blank" rel="noreferrer" className="cl" {...hov}><GitHubIcon />GitHub<span className="cl-arr">↗</span></a>
            </div>
          </div>
        </section>

      </main>

      <footer>
        <p>© 2025 <span>Arpit Maurya</span> — All rights reserved</p>
        <p className="footer-locale">Pune · India</p>
      </footer>
    </>
  );
}

export default App;
