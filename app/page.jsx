"use client";
import { useEffect, useRef, useState } from "react";

import BootScreen from "@/components/BootScreen";
import Neofetch from "@/components/Neofetch";
import GitLog from "@/components/GitLog";
import SkillHUD from "@/components/SkillHUD";
import ProjectGrid from "@/components/ProjectGrid";
import SSHContact from "@/components/SSHContact";
import JarvisChat from "@/components/JarvisChat";
import Terminal from "@/components/Terminal";

// ─── Nav config ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "about",      label: "about",      index: "02" },
  { id: "experience", label: "experience", index: "03" },
  { id: "skills",     label: "skills",     index: "04" },
  { id: "projects",   label: "projects",   index: "05" },
  { id: "contact",    label: "contact",    index: "06" },
];

// ─── Scroll progress bar ─────────────────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 9999,
      background: "rgba(0,245,255,0.06)",
    }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        background: "linear-gradient(90deg, #00f5ff, #a78bfa)",
        boxShadow: "0 0 8px rgba(0,245,255,0.6)",
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Active section detection
      const sections = NAV_ITEMS.map((n) => ({
        id: n.id,
        el: document.getElementById(n.id),
      })).filter((s) => s.el);

      let current = "";
      sections.forEach(({ id, el }) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45) current = id;
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled
          ? "rgba(5,5,8,0.92)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid rgba(0,245,255,0.08)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.3s ease",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 0,
          }}
        >
          <span style={{
            fontSize: 16,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.08em",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            LENNY
          </span>
          <span style={{
            fontSize: 11,
            color: "#00f5ff",
            background: "rgba(0,245,255,0.08)",
            border: "1px solid rgba(0,245,255,0.2)",
            borderRadius: 3,
            padding: "1px 7px",
            letterSpacing: "0.12em",
          }}>
            .SYS
          </span>
        </button>

        {/* Desktop nav links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
          className="desktop-nav"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
                color: activeSection === item.id
                  ? "#00f5ff"
                  : "rgba(255,255,255,0.4)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id)
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id)
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              <span style={{
                fontSize: 9,
                color: activeSection === item.id
                  ? "rgba(0,245,255,0.6)"
                  : "rgba(255,255,255,0.2)",
              }}>
                {item.index}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href="https://github.com/LennyDany-03"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
              padding: "5px 10px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            ⬡ GitHub
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="mobile-menu-btn"
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              padding: "5px 8px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              display: "none",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: 60,
          left: 0,
          right: 0,
          zIndex: 899,
          background: "rgba(5,5,8,0.97)",
          borderBottom: "1px solid rgba(0,245,255,0.1)",
          padding: "16px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontFamily: "'JetBrains Mono', monospace",
          backdropFilter: "blur(20px)",
          animation: "mobileMenuIn 0.2s ease",
        }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 0",
                textAlign: "left",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                color: activeSection === item.id ? "#00f5ff" : "rgba(255,255,255,0.5)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                letterSpacing: "0.12em",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ color: "rgba(0,245,255,0.4)", fontSize: 10 }}>{item.index}.</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @keyframes mobileMenuIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
}

// ─── Section divider ─────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.08), transparent)",
      margin: "0 48px",
    }} />
  );
}

// ─── Back to top button ──────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: 28,
        right: 92,
        zIndex: 998,
        background: "rgba(0,0,0,0.7)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: "8px 12px",
        cursor: "pointer",
        color: "rgba(255,255,255,0.4)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.1em",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s",
        animation: "fadeIn 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#00f5ff";
        e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.4)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      ↑ top
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background-color: #050508;
          color: #e0e0e0;
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          cursor: default;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,0.4); }

        /* Custom cursor crosshair dot */
        body { cursor: none; }
        a, button { cursor: none; }

        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* Custom cursor */}
      <CustomCursor />

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main style={{ backgroundColor: "#050508" }}>

        {/* 01 — Hero / Boot */}
        <section id="hero">
          <BootScreen />
        </section>

        <Divider />

        {/* 02 — About / Neofetch */}
        <Neofetch />

        <Divider />

        {/* 03 — Experience / Git Log */}
        <GitLog />

        <Divider />

        {/* 04 — Skills / HUD */}
        <SkillHUD />

        <Divider />

        {/* 05 — Projects */}
        <ProjectGrid />

        <Divider />

        {/* 06 — Contact / SSH */}
        <SSHContact />

      </main>

      {/* Floating overlays — rendered outside main flow */}
      <JarvisChat />   {/* Bottom-right AI chat */}
      <Terminal />     {/* Bottom-left hidden terminal — press ` */}
      <BackToTop />    {/* Bottom-right ↑ top */}
    </>
  );
}

// ─── Custom cursor ───────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    let animId;
    const animateRing = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;
      }
      animId = requestAnimationFrame(animateRing);
    };
    animId = requestAnimationFrame(animateRing);

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const onHoverIn = (e) => {
      if (e.target.matches("a, button, [role='button']")) setHovering(true);
    };
    const onHoverOut = (e) => {
      if (e.target.matches("a, button, [role='button']")) setHovering(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onHoverIn);
    document.addEventListener("mouseout", onHoverOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onHoverIn);
      document.removeEventListener("mouseout", onHoverOut);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: clicking ? "#00ff88" : "#00f5ff",
          boxShadow: `0 0 8px ${clicking ? "#00ff88" : "#00f5ff"}`,
          pointerEvents: "none",
          zIndex: 99999,
          transition: "background-color 0.1s, box-shadow 0.1s",
          willChange: "transform",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `1px solid ${hovering ? "rgba(0,245,255,0.7)" : "rgba(0,245,255,0.3)"}`,
          transform: hovering ? "scale(1.4)" : "scale(1)",
          pointerEvents: "none",
          zIndex: 99998,
          transition: "border-color 0.15s, width 0.15s, height 0.15s",
          willChange: "transform",
        }}
      />
    </>
  );
}