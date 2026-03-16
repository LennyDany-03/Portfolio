"use client";
import { useEffect, useRef, useState } from "react";

const SKILL_CATEGORIES = [
  {
    id: "frontend",
    label: "FRONTEND",
    icon: "⬡",
    color: "#00f5ff",
    skills: [
      { name: "Next.js", level: 92, years: "2yr" },
      { name: "React", level: 92, years: "2yr" },
      { name: "Tailwind CSS", level: 90, years: "2yr" },
      { name: "JavaScript", level: 88, years: "3yr" },
      { name: "TypeScript", level: 72, years: "1yr" },
      { name: "HTML / CSS", level: 95, years: "3yr" },
    ],
  },
  {
    id: "backend",
    label: "BACKEND",
    icon: "⬡",
    color: "#00ff88",
    skills: [
      { name: "FastAPI", level: 88, years: "1.5yr" },
      { name: "Python", level: 88, years: "3yr" },
      { name: "Node.js", level: 74, years: "1yr" },
      { name: "REST APIs", level: 90, years: "2yr" },
      { name: "Supabase", level: 80, years: "1yr" },
      { name: "PostgreSQL", level: 72, years: "1yr" },
    ],
  },
  {
    id: "ai",
    label: "AI / ML",
    icon: "⬡",
    color: "#a78bfa",
    skills: [
      { name: "Claude API", level: 88, years: "1yr" },
      { name: "Groq", level: 82, years: "1yr" },
      { name: "ElevenLabs", level: 80, years: "0.5yr" },
      { name: "Azure AI", level: 76, years: "1yr" },
      { name: "LangChain", level: 68, years: "0.5yr" },
      { name: "RAG Systems", level: 72, years: "1yr" },
    ],
  },
  {
    id: "tools",
    label: "TOOLS",
    icon: "⬡",
    color: "#fbbf24",
    skills: [
      { name: "Docker", level: 75, years: "1yr" },
      { name: "Git / GitHub", level: 90, years: "3yr" },
      { name: "Vercel", level: 88, years: "2yr" },
      { name: "Linux", level: 74, years: "2yr" },
      { name: "Figma", level: 65, years: "1yr" },
      { name: "Postman", level: 82, years: "2yr" },
    ],
  },
];

function useInView(ref, threshold = 0.2) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function RadarChart({ category, animate, size = 180 }) {
  const { skills, color } = category;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 20;
  const n = skills.length;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let frame;
    let start = null;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Skill polygon points
  const polyPoints = skills
    .map((s, i) => {
      const r = (s.level / 100) * maxR * progress;
      const a = angle(i);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {/* Grid */}
      {gridLevels.map((gl) =>
        skills.map((_, i) => {
          const a1 = angle(i);
          const a2 = angle(i + 1);
          const r = gl * maxR;
          return (
            <line
              key={`${gl}-${i}`}
              x1={cx + r * Math.cos(a1)}
              y1={cy + r * Math.sin(a1)}
              x2={cx + r * Math.cos(a2)}
              y2={cy + r * Math.sin(a2)}
              stroke={`${color}18`}
              strokeWidth={0.8}
            />
          );
        })
      )}

      {/* Spokes */}
      {skills.map((_, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(angle(i))}
          y2={cy + maxR * Math.sin(angle(i))}
          stroke={`${color}15`}
          strokeWidth={0.8}
        />
      ))}

      {/* Filled polygon */}
      <polygon
        points={polyPoints}
        fill={`${color}15`}
        stroke={color}
        strokeWidth={1.5}
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />

      {/* Axis labels */}
      {skills.map((s, i) => {
        const a = angle(i);
        const r = maxR + 16;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        return (
          <text
            key={s.name}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            fill={`${color}90`}
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="0.05em"
          >
            {s.name.split(" ")[0].toUpperCase()}
          </text>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.8} />
    </svg>
  );
}

function HUDBar({ skill, color, animate, delay }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setWidth(skill.level), delay);
    return () => clearTimeout(t);
  }, [animate, skill.level, delay]);

  const getLevelLabel = (l) => {
    if (l >= 90) return "EXPERT";
    if (l >= 80) return "ADVANCED";
    if (l >= 70) return "PROFICIENT";
    return "LEARNING";
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 5,
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{skill.name}</span>
          <span style={{
            fontSize: 8,
            color: `${color}`,
            background: `${color}12`,
            border: `1px solid ${color}30`,
            borderRadius: 2,
            padding: "1px 5px",
            letterSpacing: "0.1em",
          }}>
            {getLevelLabel(skill.level)}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{skill.years}</span>
          <span style={{ fontSize: 11, color, fontWeight: 700 }}>{skill.level}%</span>
        </div>
      </div>

      {/* Bar track */}
      <div style={{
        height: 4,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 99,
        overflow: "visible",
        position: "relative",
      }}>
        {/* Tick marks */}
        {[25, 50, 75].map((t) => (
          <div key={t} style={{
            position: "absolute",
            left: `${t}%`,
            top: "50%",
            transform: "translateY(-50%)",
            width: 1,
            height: 8,
            background: "rgba(255,255,255,0.08)",
          }} />
        ))}
        {/* Fill */}
        <div style={{
          height: "100%",
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}90, ${color})`,
          borderRadius: 99,
          transition: "width 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 10px ${color}60`,
          position: "relative",
        }}>
          {/* Moving tip glow */}
          <div style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }} />
        </div>
      </div>
    </div>
  );
}

export default function SkillHUD() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [activeCategory, setActiveCategory] = useState("frontend");

  const active = SKILL_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section
      id="skills"
      ref={ref}
      style={{
        minHeight: "100vh",
        backgroundColor: "#050508",
        padding: "100px 24px",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute",
        bottom: "10%",
        left: "-5%",
        width: 500,
        height: 500,
        background: "radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1000, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Section header */}
        <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#00f5ff", fontSize: 12, letterSpacing: "0.2em" }}>04.</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>———————</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.15em" }}>SKILL_MATRIX</span>
        </div>

        {/* HUD container */}
        <div style={{
          border: "1px solid rgba(0,245,255,0.1)",
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(5,5,8,0.9)",
        }}>
          {/* Top HUD bar */}
          <div style={{
            background: "rgba(0,245,255,0.03)",
            borderBottom: "1px solid rgba(0,245,255,0.08)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "0.2em" }}>
              HUD.SKILL_MATRIX — LENNY.SYS
            </span>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {["SCANNING", "ACTIVE"].map((label, i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    backgroundColor: i === 0 ? "#fbbf24" : "#00ff88",
                    boxShadow: `0 0 6px ${i === 0 ? "#fbbf24" : "#00ff88"}`,
                    animation: "hudPulse 2s infinite",
                    animationDelay: `${i * 0.5}s`,
                  }} />
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  flex: 1,
                  padding: "14px 8px",
                  background: activeCategory === cat.id
                    ? `${cat.color}08`
                    : "transparent",
                  border: "none",
                  borderBottom: activeCategory === cat.id
                    ? `2px solid ${cat.color}`
                    : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.2s",
                }}
              >
                <span style={{
                  fontSize: 16,
                  color: activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.2)",
                  transition: "color 0.2s",
                }}>
                  {cat.icon}
                </span>
                <span style={{
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.25)",
                  transition: "color 0.2s",
                  fontWeight: activeCategory === cat.id ? 700 : 400,
                }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Content grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: 0,
          }}>
            {/* Left: Bars */}
            <div style={{
              padding: "32px 28px",
              borderRight: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{
                fontSize: 10, color: `${active.color}60`,
                letterSpacing: "0.2em", marginBottom: 24,
              }}>
                MODULE: {active.label} — {active.skills.length} SKILLS LOADED
              </div>
              {active.skills.map((skill, i) => (
                <HUDBar
                  key={skill.name}
                  skill={skill}
                  color={active.color}
                  animate={inView}
                  delay={i * 100 + 200}
                />
              ))}

              {/* Average */}
              <div style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
                  MODULE AVG
                </span>
                <span style={{
                  fontSize: 18, fontWeight: 900, color: active.color,
                  textShadow: `0 0 20px ${active.color}`,
                }}>
                  {Math.round(active.skills.reduce((s, sk) => s + sk.level, 0) / active.skills.length)}%
                </span>
              </div>
            </div>

            {/* Right: Radar */}
            <div style={{
              padding: "32px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}>
              <div style={{
                fontSize: 9, letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.2)",
              }}>
                SKILL_RADAR
              </div>
              <RadarChart
                key={activeCategory}
                category={active}
                animate={inView}
                size={180}
              />
              {/* Legend */}
              <div style={{ width: "100%" }}>
                {active.skills.slice(0, 3).map((s) => (
                  <div key={s.name} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10, marginBottom: 5,
                    color: "rgba(255,255,255,0.35)",
                  }}>
                    <span>{s.name}</span>
                    <span style={{ color: active.color }}>{s.level}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom HUD strip */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            padding: "10px 20px",
            display: "flex",
            gap: 24,
          }}>
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 4, height: 4, borderRadius: "50%",
                  backgroundColor: cat.color,
                  boxShadow: `0 0 6px ${cat.color}`,
                }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                  {Math.round(cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length)}%
                </span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes hudPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width:640px) {
          #skills > div > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}