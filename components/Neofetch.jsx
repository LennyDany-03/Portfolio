"use client";
import { useEffect, useRef, useState } from "react";

const ASCII_LOGO = `
 ██╗     ███████╗███╗   ██╗███╗   ██╗██╗   ██╗
 ██║     ██╔════╝████╗  ██║████╗  ██║╚██╗ ██╔╝
 ██║     █████╗  ██╔██╗ ██║██╔██╗ ██║ ╚████╔╝ 
 ██║     ██╔══╝  ██║╚██╗██║██║╚██╗██║  ╚██╔╝  
 ███████╗███████╗██║ ╚████║██║ ╚████║   ██║   
 ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═══╝   ╚═╝   
`;

const STATS = [
  { label: "Name", value: "Lenny Dany Derek D", color: "#00f5ff" },
  { label: "Age", value: "19", color: "#00f5ff" },
  { label: "Location", value: "Chennai, India 🇮🇳", color: "#00f5ff" },
  { label: "Education", value: "B.Tech CSE @ SRM University", color: "#00f5ff" },
  { label: "Company", value: "Founder @ Ascendry", color: "#00f5ff" },
  { label: "Role", value: "Full-Stack Developer & AI Builder", color: "#00f5ff" },
  { label: "Currently", value: "Building SIMS SmartAssist 🏥", color: "#00ff88" },
  { label: "Mentoring", value: "ArrowDev Club 🎯", color: "#00ff88" },
  { label: "Freelancing", value: "Fiverr · Upwork · Gumroad", color: "#00ff88" },
  { label: "GitHub", value: "github.com/LennyDany-03", color: "#a78bfa" },
  { label: "Instagram", value: "@lenny_dany_3", color: "#a78bfa" },
  { label: "Ambition", value: "Build a real-life Jarvis AI 🤖", color: "#fbbf24" },
];

const SKILLS_PREVIEW = [
  { name: "Next.js", level: 90 },
  { name: "FastAPI", level: 85 },
  { name: "Python", level: 88 },
  { name: "React", level: 90 },
  { name: "AI/ML", level: 75 },
  { name: "Docker", level: 70 },
];

const COLOR_PALETTE = [
  "#050508", "#1a1a2e", "#00f5ff", "#00ff88",
  "#a78bfa", "#fbbf24", "#ff003c", "#ffffff",
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return inView;
}

function SkillBar({ name, level, delay, animate }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(level), delay);
      return () => clearTimeout(t);
    }
  }, [animate, level, delay]);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>
          {name}
        </span>
        <span style={{ fontSize: 11, color: "#00f5ff" }}>{level}%</span>
      </div>
      <div style={{
        height: 3,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, #00f5ff, #a78bfa)",
          borderRadius: 99,
          transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 8px rgba(0,245,255,0.4)",
        }} />
      </div>
    </div>
  );
}

export default function Neofetch() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!inView) return;
    STATS.forEach((_, i) => {
      setTimeout(() => setRevealed((prev) => Math.max(prev, i + 1)), i * 80 + 200);
    });
  }, [inView]);

  return (
    <section
      id="about"
      ref={ref}
      style={{
        minHeight: "100vh",
        backgroundColor: "#050508",
        padding: "100px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      <div style={{ maxWidth: 1000, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Section header */}
        <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#00f5ff", fontSize: 12, letterSpacing: "0.2em" }}>02.</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>———————</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.15em" }}>
            ABOUT_ME
          </span>
        </div>

        {/* Terminal window */}
        <div style={{
          background: "rgba(8, 8, 14, 0.95)",
          border: "1px solid rgba(0,245,255,0.12)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,245,255,0.05), 0 40px 80px rgba(0,0,0,0.6)",
        }}>
          {/* Terminal title bar */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(0,245,255,0.08)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: c }} />
            ))}
            <span style={{
              marginLeft: 12, fontSize: 11,
              color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em",
            }}>
              lenny@ascendry ~ neofetch
            </span>
          </div>

          {/* Content */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }}>
            {/* Left: ASCII + color palette */}
            <div style={{
              padding: "36px 32px",
              borderRight: "1px solid rgba(0,245,255,0.06)",
            }}>
              {/* ASCII Art */}
              <pre style={{
                fontSize: "clamp(4px, 1vw, 8px)",
                lineHeight: 1.2,
                color: "#00f5ff",
                textShadow: "0 0 10px rgba(0,245,255,0.5)",
                margin: "0 0 32px",
                opacity: inView ? 1 : 0,
                transition: "opacity 0.8s ease",
                overflow: "hidden",
              }}>
                {ASCII_LOGO}
              </pre>

              {/* Prompt line */}
              <div style={{
                fontSize: 12, marginBottom: 28, lineHeight: 1.8,
                color: "rgba(255,255,255,0.5)",
              }}>
                <span style={{ color: "#00ff88" }}>lenny</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>@</span>
                <span style={{ color: "#a78bfa" }}>ascendry</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>:~$ </span>
                <span style={{ color: "#fff" }}>neofetch --all</span>
              </div>

              {/* Skill bars */}
              <div style={{
                background: "rgba(0,245,255,0.03)",
                border: "1px solid rgba(0,245,255,0.08)",
                borderRadius: 6,
                padding: "20px",
              }}>
                <div style={{
                  fontSize: 10, letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.25)", marginBottom: 16,
                }}>
                  CORE_MODULES
                </div>
                {SKILLS_PREVIEW.map((s, i) => (
                  <SkillBar
                    key={s.name}
                    {...s}
                    delay={i * 120 + 400}
                    animate={inView}
                  />
                ))}
              </div>

              {/* Color palette */}
              <div style={{ display: "flex", gap: 6, marginTop: 24 }}>
                {COLOR_PALETTE.map((c) => (
                  <div key={c} style={{
                    width: 20, height: 20, borderRadius: 3,
                    backgroundColor: c,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }} />
                ))}
              </div>
            </div>

            {/* Right: Stats */}
            <div style={{ padding: "36px 32px" }}>
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    gap: 0,
                    marginBottom: 10,
                    opacity: revealed > i ? 1 : 0,
                    transform: revealed > i ? "translateX(0)" : "translateX(-8px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    fontSize: 13,
                    lineHeight: "1.7",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{
                    color: stat.color,
                    minWidth: 120,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {stat.label}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.25)", marginRight: 12 }}>:</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", wordBreak: "break-word" }}>
                    {stat.value}
                  </span>
                </div>
              ))}

              {/* Separator */}
              <div style={{
                margin: "24px 0",
                height: 1,
                background: "linear-gradient(90deg, rgba(0,245,255,0.15), transparent)",
              }} />

              {/* Currently open to */}
              <div style={{
                background: "rgba(0,255,136,0.05)",
                border: "1px solid rgba(0,255,136,0.15)",
                borderRadius: 6,
                padding: "16px 20px",
              }}>
                <div style={{
                  fontSize: 10, letterSpacing: "0.2em",
                  color: "#00ff88", marginBottom: 12,
                }}>
                  OPEN_TO
                </div>
                {[
                  "Freelance Projects",
                  "AI Product Collaborations",
                  "Internships & Opportunities",
                  "Open Source Contributions",
                ].map((item) => (
                  <div key={item} style={{
                    fontSize: 12, color: "rgba(255,255,255,0.6)",
                    marginBottom: 6, display: "flex", gap: 8, alignItems: "center",
                  }}>
                    <span style={{ color: "#00ff88", fontSize: 10 }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Hobbies */}
              <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["🎵 Music", "💻 Coding", "🤖 AI Tinkering", "📈 Stock Market"].map((h) => (
                  <span key={h} style={{
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    borderRadius: 4,
                    padding: "4px 12px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                  }}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @media (max-width: 768px) {
          #about .neofetch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}