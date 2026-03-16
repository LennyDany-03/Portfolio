"use client";
import { useEffect, useRef, useState } from "react";

const COMMITS = [
  {
    hash: "f3a9c21",
    branch: "main",
    date: "2025 — Present",
    tag: "HEAD",
    title: "Internship: Built SIMS SmartAssist",
    description:
      "AI-powered hospital kiosk/chatbot for SIMS Hospital Chennai. Multilingual (EN, Tamil, Hindi, Bengali, Malayalam), ElevenLabs TTS, FastAPI + Next.js, Docker containerized, live on Vercel.",
    stack: ["FastAPI", "Next.js", "ElevenLabs", "Docker", "Vercel"],
    type: "feat",
    color: "#00f5ff",
  },
  {
    hash: "b72de04",
    branch: "main",
    date: "2024 — Present",
    tag: "origin",
    title: "Founded Ascendry — AI-Powered SaaS Company",
    description:
      "Launched personal SaaS company focused on AI-powered digital innovation. Managing multiple products and client projects under one brand.",
    stack: ["Next.js", "Supabase", "Stripe", "Claude API"],
    type: "init",
    color: "#00ff88",
  },
  {
    hash: "c91af57",
    branch: "dev",
    date: "2024",
    tag: null,
    title: "Built Full-Stack AI Banking Chatbot",
    description:
      "Groq-powered chatbot with FastAPI backend and Next.js frontend. Banking sector system prompt, Tailwind CSS, streaming responses.",
    stack: ["Groq", "FastAPI", "Next.js", "Tailwind"],
    type: "feat",
    color: "#a78bfa",
  },
  {
    hash: "e45bc12",
    branch: "dev",
    date: "2024",
    tag: null,
    title: "IELTS AI Platform — Azure + Supabase",
    description:
      "Full IELTS prep platform with essay feedback AI, speaking practice, and study planner. Built using Microsoft Azure AI and Next.js.",
    stack: ["Azure AI", "Next.js", "FastAPI", "Supabase"],
    type: "feat",
    color: "#a78bfa",
  },
  {
    hash: "d38fc99",
    branch: "mentor",
    date: "2024 — Present",
    tag: null,
    title: "Coding Mentor @ ArrowDev Club",
    description:
      "Mentoring students in full-stack development, teaching React, Next.js, and backend fundamentals.",
    stack: ["React", "Next.js", "Teaching"],
    type: "docs",
    color: "#fbbf24",
  },
  {
    hash: "a17de38",
    branch: "freelance",
    date: "2024 — Present",
    tag: null,
    title: "Freelancing — Fiverr, Upwork, Gumroad",
    description:
      "Active freelancer building web apps, AI tools, and digital products for clients worldwide.",
    stack: ["Fiverr", "Upwork", "Gumroad"],
    type: "chore",
    color: "#fbbf24",
  },
  {
    hash: "908ba11",
    branch: "hackathon",
    date: "2024",
    tag: null,
    title: "Hackstronauts 2025 — ML Track",
    description:
      "Built Personalized Learning Pathways ML solution. Competed under tight deadline with full working demo.",
    stack: ["Python", "ML", "React"],
    type: "fix",
    color: "#ff6b6b",
  },
  {
    hash: "312cd40",
    branch: "origin",
    date: "2023",
    tag: "v0.1",
    title: "Started B.Tech CSE @ SRM University Chennai",
    description:
      "Enrolled in Computer Science Engineering. Immediately began building side projects beyond the curriculum.",
    stack: ["C", "Python", "DSA"],
    type: "init",
    color: "#00ff88",
  },
];

const TYPE_COLORS = {
  feat: "#00f5ff",
  init: "#00ff88",
  fix: "#ff6b6b",
  docs: "#fbbf24",
  chore: "#a78bfa",
};

function useInView(ref, threshold = 0.15) {
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

function CommitCard({ commit, index, animate }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setVisible(true), index * 120 + 100);
      return () => clearTimeout(t);
    }
  }, [animate, index]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-16px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        display: "flex",
        gap: 0,
        position: "relative",
      }}
    >
      {/* Git graph line */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 20,
        flexShrink: 0,
        width: 20,
      }}>
        {/* Dot */}
        <div style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: commit.color,
          boxShadow: `0 0 12px ${commit.color}88`,
          flexShrink: 0,
          marginTop: 14,
          zIndex: 1,
          position: "relative",
        }} />
        {/* Line */}
        {index < COMMITS.length - 1 && (
          <div style={{
            width: 1,
            flex: 1,
            background: `linear-gradient(to bottom, ${commit.color}40, rgba(255,255,255,0.05))`,
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Card */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          flex: 1,
          marginBottom: 16,
          background: expanded
            ? "rgba(0,245,255,0.04)"
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${expanded ? commit.color + "30" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8,
          padding: "16px 20px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!expanded) {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.borderColor = commit.color + "25";
          }
        }}
        onMouseLeave={(e) => {
          if (!expanded) {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }
        }}
      >
        {/* Top row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 8,
        }}>
          {/* Commit type badge */}
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: TYPE_COLORS[commit.type] || "#fff",
            background: `${TYPE_COLORS[commit.type]}15`,
            border: `1px solid ${TYPE_COLORS[commit.type]}30`,
            borderRadius: 3,
            padding: "2px 8px",
          }}>
            {commit.type.toUpperCase()}
          </span>

          {/* Hash */}
          <span style={{
            fontSize: 11,
            color: "#fbbf24",
            letterSpacing: "0.05em",
            fontFamily: "monospace",
          }}>
            {commit.hash}
          </span>

          {/* Branch */}
          <span style={{
            fontSize: 10,
            color: "#a78bfa",
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: 3,
            padding: "2px 8px",
          }}>
            ⎇ {commit.branch}
          </span>

          {/* Tag */}
          {commit.tag && (
            <span style={{
              fontSize: 10,
              color: "#00ff88",
              background: "rgba(0,255,136,0.08)",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: 3,
              padding: "2px 8px",
            }}>
              🏷 {commit.tag}
            </span>
          )}

          {/* Date — pushed right */}
          <span style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
          }}>
            {commit.date}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          marginBottom: expanded ? 12 : 0,
          letterSpacing: "0.02em",
        }}>
          {commit.title}
        </div>

        {/* Expanded content */}
        {expanded && (
          <div style={{ animation: "expandIn 0.25s ease" }}>
            <p style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              margin: "0 0 14px",
            }}>
              {commit.description}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {commit.stack.map((s) => (
                <span key={s} style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 3,
                  padding: "3px 10px",
                  letterSpacing: "0.05em",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expand hint */}
        {!expanded && (
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.15)",
            marginTop: 4,
            letterSpacing: "0.1em",
          }}>
            click to expand ›
          </div>
        )}
      </div>
    </div>
  );
}

export default function GitLog() {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section
      id="experience"
      ref={ref}
      style={{
        minHeight: "100vh",
        backgroundColor: "#050508",
        padding: "100px 24px",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute",
        top: "20%",
        right: "-10%",
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 760, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Section header */}
        <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#00f5ff", fontSize: 12, letterSpacing: "0.2em" }}>03.</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>———————</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.15em" }}>
            EXPERIENCE
          </span>
        </div>

        {/* Git command header */}
        <div style={{
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(0,245,255,0.1)",
          borderRadius: "8px 8px 0 0",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(0,245,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
            ))}
          </div>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.12em",
          }}>
            git log --oneline --graph --all --author="Lenny"
          </span>
          <span style={{
            fontSize: 10, color: "#00ff88",
            background: "rgba(0,255,136,0.08)",
            border: "1px solid rgba(0,255,136,0.15)",
            borderRadius: 3, padding: "2px 8px",
          }}>
            {COMMITS.length} commits
          </span>
        </div>

        {/* Log body */}
        <div style={{
          background: "rgba(5,5,8,0.95)",
          border: "1px solid rgba(0,245,255,0.08)",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: "28px 24px 20px",
        }}>
          {COMMITS.map((commit, i) => (
            <CommitCard
              key={commit.hash}
              commit={commit}
              index={i}
              animate={inView}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 16,
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          letterSpacing: "0.1em",
        }}>
          <span style={{ color: "#00f5ff" }}>{COMMITS.length}</span> commits on{" "}
          <span style={{ color: "#a78bfa" }}>lenny/main</span> •{" "}
          <span style={{ color: "#00ff88" }}>actively pushing</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes expandIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
}