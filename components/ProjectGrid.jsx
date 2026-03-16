"use client";
import { useEffect, useRef, useState } from "react";

const PROJECTS = [
  {
    id: "sims",
    name: "SIMS SmartAssist",
    tagline: "AI Hospital Kiosk & Chatbot",
    description:
      "AI-powered hospital kiosk and chatbot built for SIMS Hospital Chennai. Multilingual support across 5 languages, ElevenLabs TTS, Docker containerized, live on Vercel.",
    stack: ["Next.js", "FastAPI", "ElevenLabs", "Docker", "Python"],
    category: ["ai", "fullstack"],
    status: "live",
    year: "2025",
    github: "https://github.com/LennyDany-03",
    live: "#",
    highlight: true,
    color: "#00f5ff",
    file: "sims_smartassist.py",
  },
  {
    id: "ielts",
    name: "IELTS AI Platform",
    tagline: "Full IELTS Prep with AI Feedback",
    description:
      "Complete IELTS preparation platform with AI essay feedback, speaking practice, and study planner. Built with Microsoft Azure AI, Next.js, and Supabase.",
    stack: ["Next.js", "Azure AI", "FastAPI", "Supabase"],
    category: ["ai", "fullstack"],
    status: "building",
    year: "2024",
    github: "https://github.com/LennyDany-03",
    live: null,
    highlight: true,
    color: "#a78bfa",
    file: "ielts_platform.tsx",
  },
  {
    id: "chatbot",
    name: "AI Banking Chatbot",
    tagline: "Groq-Powered Financial Assistant",
    description:
      "Full-stack AI chatbot with Groq backbone and banking sector system prompt. FastAPI backend, streaming responses, Tailwind CSS frontend.",
    stack: ["Groq", "FastAPI", "Next.js", "Tailwind"],
    category: ["ai", "fullstack"],
    status: "complete",
    year: "2024",
    github: "https://github.com/LennyDany-03",
    live: null,
    highlight: false,
    color: "#00ff88",
    file: "banking_bot.py",
  },
  {
    id: "ascendry",
    name: "Ascendry",
    tagline: "Personal SaaS Brand & Products",
    description:
      "My personal SaaS company focused on AI-powered digital innovation. Umbrella for all products, client projects, and freelance work.",
    stack: ["Next.js", "Supabase", "Stripe", "Claude API"],
    category: ["fullstack", "saas"],
    status: "live",
    year: "2024",
    github: "https://github.com/LennyDany-03",
    live: "#",
    highlight: false,
    color: "#fbbf24",
    file: "ascendry_main.tsx",
  },
  {
    id: "flux",
    name: "Flux",
    tagline: "Smart Link Shortener",
    description:
      "AI-enhanced link shortener with analytics dashboard, custom aliases, and QR code generation.",
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: ["fullstack", "saas"],
    status: "building",
    year: "2024",
    github: "https://github.com/LennyDany-03",
    live: null,
    highlight: false,
    color: "#ff6b6b",
    file: "flux_shortener.tsx",
  },
  {
    id: "jarvis",
    name: "AI Agent OS",
    tagline: "Jarvis-Inspired LLM OS Controller",
    description:
      "LLM-controlled operating system inspired by Jarvis. Natural language OS control, voice commands, and device integration layer.",
    stack: ["Python", "LangChain", "Electron", "Claude API"],
    category: ["ai"],
    status: "building",
    year: "2024",
    github: "https://github.com/LennyDany-03",
    live: null,
    highlight: true,
    color: "#a78bfa",
    file: "agent_os.py",
  },
];

const FILTERS = [
  { id: "all", label: "--all" },
  { id: "ai", label: "--ai" },
  { id: "fullstack", label: "--fullstack" },
  { id: "saas", label: "--saas" },
];

const STATUS_CONFIG = {
  live: { label: "LIVE", color: "#00ff88" },
  building: { label: "BUILDING", color: "#fbbf24" },
  complete: { label: "COMPLETE", color: "#00f5ff" },
};

function useInView(ref, threshold = 0.1) {
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

function ProjectCard({ project, index, animate }) {
  const [hovered, setHovered] = useState(false);
  const [catOutput, setCatOutput] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setVisible(true), index * 80 + 100);
      return () => clearTimeout(t);
    }
  }, [animate, index]);

  useEffect(() => {
    if (hovered) {
      const lines = [
        `$ cat ${project.file}`,
        ``,
        `# ${project.name}`,
        `# ${project.tagline}`,
        ``,
        project.description,
        ``,
        `stack: [${project.stack.join(", ")}]`,
        `status: ${project.status.toUpperCase()}`,
        `year: ${project.year}`,
      ];
      let i = 0;
      setCatOutput("");
      const interval = setInterval(() => {
        if (i < lines.length) {
          setCatOutput((prev) => prev + (i > 0 ? "\n" : "") + lines[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }
  }, [hovered, project]);

  const status = STATUS_CONFIG[project.status];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        position: "relative",
        cursor: "pointer",
        borderRadius: 8,
        overflow: "hidden",
        border: hovered
          ? `1px solid ${project.color}40`
          : "1px solid rgba(255,255,255,0.06)",
        background: hovered
          ? `${project.color}05`
          : "rgba(255,255,255,0.015)",
        transition: "all 0.3s ease, opacity 0.5s ease, transform 0.5s ease",
        boxShadow: hovered ? `0 0 30px ${project.color}15` : "none",
      }}
    >
      {/* Highlight badge */}
      {project.highlight && (
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          fontSize: 8,
          color: project.color,
          background: `${project.color}12`,
          border: `1px solid ${project.color}30`,
          borderRadius: 3,
          padding: "2px 7px",
          letterSpacing: "0.15em",
          zIndex: 2,
        }}>
          FEATURED
        </div>
      )}

      {/* Default view */}
      <div style={{
        padding: "24px",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.2s ease",
        position: hovered ? "absolute" : "relative",
        width: "100%",
        pointerEvents: hovered ? "none" : "all",
      }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            backgroundColor: status.color,
            boxShadow: `0 0 8px ${status.color}`,
          }} />
          <span style={{ fontSize: 9, color: status.color, letterSpacing: "0.15em" }}>
            {status.label}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            {project.year}
          </span>
        </div>

        <div style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 6,
          letterSpacing: "0.02em",
        }}>
          {project.name}
        </div>
        <div style={{
          fontSize: 11,
          color: project.color,
          marginBottom: 16,
          letterSpacing: "0.05em",
        }}>
          {project.tagline}
        </div>

        {/* Stack tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {project.stack.map((s) => (
            <span key={s} style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 3,
              padding: "3px 8px",
              letterSpacing: "0.06em",
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Terminal overlay on hover */}
      {hovered && (
        <div style={{
          padding: "20px",
          minHeight: 220,
          animation: "termFadeIn 0.2s ease",
        }}>
          <pre style={{
            fontSize: 10,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.65)",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ color: project.color }}>{catOutput.split("\n")[0]}</span>
            {"\n"}
            {catOutput.split("\n").slice(1).map((line, i) => (
              <span key={i} style={{
                color: line.startsWith("#")
                  ? project.color
                  : line.startsWith("stack") || line.startsWith("status") || line.startsWith("year")
                  ? "#a78bfa"
                  : "rgba(255,255,255,0.55)",
              }}>
                {line}{"\n"}
              </span>
            ))}
          </pre>

          {/* Links */}
          <div style={{
            display: "flex",
            gap: 10,
            marginTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 12,
          }}>
            <a href={project.github} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 10,
              color: project.color,
              textDecoration: "none",
              letterSpacing: "0.1em",
              border: `1px solid ${project.color}30`,
              borderRadius: 3,
              padding: "4px 12px",
              transition: "all 0.2s",
            }}>
              → GitHub
            </a>
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 10,
                color: "#00ff88",
                textDecoration: "none",
                letterSpacing: "0.1em",
                border: "1px solid rgba(0,255,136,0.3)",
                borderRadius: 3,
                padding: "4px 12px",
              }}>
                ↗ Live
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectGrid() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category.includes(activeFilter));

  return (
    <section
      id="projects"
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
      <div style={{ maxWidth: 1000, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Section header */}
        <div style={{ marginBottom: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#00f5ff", fontSize: 12, letterSpacing: "0.2em" }}>05.</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>———————</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.15em" }}>PROJECTS</span>
        </div>

        {/* Filter bar */}
        <div style={{
          display: "flex",
          gap: 8,
          marginBottom: 36,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginRight: 4 }}>
            $ ls ./projects
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                background: activeFilter === f.id
                  ? "rgba(0,245,255,0.1)"
                  : "transparent",
                border: activeFilter === f.id
                  ? "1px solid rgba(0,245,255,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: activeFilter === f.id ? "#00f5ff" : "rgba(255,255,255,0.35)",
                padding: "6px 14px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.1em",
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
          }}>
            {filtered.length} results
          </span>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              animate={inView}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 36,
          textAlign: "center",
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
        }}>
          <a href="https://github.com/LennyDany-03" target="_blank" rel="noopener noreferrer"
            style={{ color: "#00f5ff", textDecoration: "none" }}>
            → View all on GitHub
          </a>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes termFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </section>
  );
}