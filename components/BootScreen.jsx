"use client";
import { useEffect, useState, useRef } from "react";

const BOOT_LINES = [
  { text: "LENNY.SYS v2.0.25 — Initializing...", delay: 0 },
  { text: "Loading kernel modules................. [OK]", delay: 300 },
  { text: "Mounting /dev/brain..................... [OK]", delay: 600 },
  { text: "Starting Ascendry daemon............... [OK]", delay: 900 },
  { text: "Connecting to GitHub (LennyDany-03).... [OK]", delay: 1200 },
  { text: "Loading project registry............... [OK]", delay: 1500 },
  { text: "Calibrating AI subsystems.............. [OK]", delay: 1800 },
  { text: "Spawning creative processes............ [OK]", delay: 2100 },
  { text: "", delay: 2400 },
  { text: ">> All systems operational.", delay: 2600 },
  { text: ">> Welcome. You are now inside LENNY.SYS.", delay: 3000 },
];

const ROLES = [
  "Full-Stack Developer",
  "AI Builder",
  "Founder @ Ascendry",
  "Coding Mentor",
  "Freelancer",
];

function GlitchText({ text }) {
  const [glitched, setGlitched] = useState(false);
  const chars = "!@#$%^&*<>?/\\|[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitched(true);
      setTimeout(() => setGlitched(false), 120);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: glitched ? "0.15em" : "0.08em",
        transition: "letter-spacing 0.1s",
        position: "relative",
        display: "inline-block",
      }}
    >
      {glitched
        ? text
            .split("")
            .map((c, i) =>
              Math.random() > 0.6
                ? chars[Math.floor(Math.random() * chars.length)]
                : c
            )
            .join("")
        : text}
      {glitched && (
        <>
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "2px",
              color: "#ff003c",
              opacity: 0.7,
              clipPath: "polygon(0 30%, 100% 30%, 100% 50%, 0 50%)",
            }}
          >
            {text}
          </span>
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "-2px",
              color: "#00f5ff",
              opacity: 0.7,
              clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)",
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 245, 255, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}

export default function BootScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [bootDone, setBootDone] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState("");
  const [typing, setTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showCTA, setShowCTA] = useState(false);

  // Lock body scroll while BootScreen is loading, unlock when boot completes
  useEffect(() => {
    if (!showCTA) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [showCTA]);

  // Boot lines sequencing
  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        if (i === BOOT_LINES.length - 1) {
          setTimeout(() => setBootDone(true), 600);
        }
      }, line.delay + 500);
    });
  }, []);

  // Role typewriter
  useEffect(() => {
    if (!bootDone) return;
    const role = ROLES[roleIndex];
    let i = 0;
    setDisplayedRole("");
    setTyping(true);
    const typeInterval = setInterval(() => {
      i++;
      setDisplayedRole(role.slice(0, i));
      if (i >= role.length) {
        clearInterval(typeInterval);
        setTyping(false);
        setTimeout(() => {
          let j = role.length;
          const eraseInterval = setInterval(() => {
            j--;
            setDisplayedRole(role.slice(0, j));
            if (j === 0) {
              clearInterval(eraseInterval);
              setRoleIndex((prev) => (prev + 1) % ROLES.length);
            }
          }, 40);
        }, 1800);
      }
    }, 60);
    return () => clearInterval(typeInterval);
  }, [bootDone, roleIndex]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(
      () => setCursorVisible((v) => !v),
      500
    );
    return () => clearInterval(interval);
  }, []);

  // Show CTA
  useEffect(() => {
    if (bootDone) setTimeout(() => setShowCTA(true), 800);
  }, [bootDone]);

  return (
    <section
      style={{
        height: "100vh",
        backgroundColor: "#050508",
        color: "#e0e0e0",
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Particles />

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Corner decorations */}
      {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((corner) => (
        <div
          key={corner}
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            ...(corner.includes("top") ? { top: 24 } : { bottom: 24 }),
            ...(corner.includes("Left") ? { left: 24 } : { right: 24 }),
            borderTop: corner.includes("top")
              ? "1px solid rgba(0,245,255,0.4)"
              : "none",
            borderBottom: corner.includes("bottom")
              ? "1px solid rgba(0,245,255,0.4)"
              : "none",
            borderLeft: corner.includes("Left")
              ? "1px solid rgba(0,245,255,0.4)"
              : "none",
            borderRight: corner.includes("Right")
              ? "1px solid rgba(0,245,255,0.4)"
              : "none",
            zIndex: 2,
          }}
        />
      ))}

      <div
        style={{
          zIndex: 2,
          width: "100%",
          maxWidth: 780,
          padding: "0 24px",
        }}
      >
        {/* Boot terminal */}
        {!bootDone && (
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(0,245,255,0.15)",
              borderRadius: 8,
              padding: "28px 32px",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: c,
                  }}
                />
              ))}
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em",
                }}
              >
                LENNY.SYS — boot
              </span>
            </div>
            {visibleLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: "1.9",
                  color:
                    line.startsWith(">>")
                      ? "#00f5ff"
                      : line.includes("[OK]")
                      ? "#00ff88"
                      : "rgba(255,255,255,0.65)",
                  opacity: 1,
                  animation: "fadeIn 0.2s ease",
                }}
              >
                {line || "\u00A0"}
              </div>
            ))}
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 14,
                backgroundColor: "#00f5ff",
                opacity: cursorVisible ? 1 : 0,
                marginTop: 4,
                verticalAlign: "middle",
              }}
            />
          </div>
        )}

        {/* Hero content after boot */}
        {bootDone && (
          <div
            style={{
              textAlign: "center",
              animation: "fadeInUp 0.8s ease forwards",
            }}
          >
            {/* Status bar */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,245,255,0.06)",
                border: "1px solid rgba(0,245,255,0.2)",
                borderRadius: 999,
                padding: "6px 16px",
                marginBottom: 40,
                fontSize: 11,
                color: "rgba(0,245,255,0.8)",
                letterSpacing: "0.15em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#00ff88",
                  boxShadow: "0 0 8px #00ff88",
                  animation: "pulse 2s infinite",
                }}
              />
              SYSTEM ONLINE — ALL MODULES LOADED
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: "clamp(48px, 8vw, 88px)",
                fontWeight: 900,
                margin: "0 0 8px",
                lineHeight: 1,
                color: "#fff",
                textShadow:
                  "0 0 40px rgba(0,245,255,0.3), 0 0 80px rgba(0,245,255,0.1)",
              }}
            >
              <GlitchText text="LENNY DANY" />
            </h1>

            {/* Role typewriter */}
            <div
              style={{
                fontSize: "clamp(14px, 2vw, 18px)",
                color: "#00f5ff",
                marginBottom: 48,
                height: 28,
                letterSpacing: "0.12em",
              }}
            >
              <span style={{ opacity: 0.5 }}>// </span>
              {displayedRole}
              <span
                style={{
                  opacity: cursorVisible ? 1 : 0,
                  color: "#00f5ff",
                }}
              >
                _
              </span>
            </div>

            {/* CTA buttons */}
            {showCTA && (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  animation: "fadeInUp 0.6s ease forwards",
                }}
              >
                <button
                  onClick={() =>
                    document
                      .getElementById("projects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0,245,255,0.5)",
                    color: "#00f5ff",
                    padding: "12px 28px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    borderRadius: 4,
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(0,245,255,0.08)";
                    e.target.style.boxShadow = "0 0 20px rgba(0,245,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  ./view-projects
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  style={{
                    background: "rgba(0,245,255,0.1)",
                    border: "1px solid rgba(0,245,255,0.6)",
                    color: "#fff",
                    padding: "12px 28px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    borderRadius: 4,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(0,245,255,0.18)";
                    e.target.style.boxShadow = "0 0 24px rgba(0,245,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(0,245,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  ./contact-me
                </button>
              </div>
            )}

            {/* Scroll hint */}
            {showCTA && (
              <div
                style={{
                  marginTop: 64,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  animation: "fadeInUp 1s 0.4s ease both",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "0.2em",
                  }}
                >
                  SCROLL TO EXPLORE
                </span>
                <div
                  style={{
                    width: 1,
                    height: 40,
                    background:
                      "linear-gradient(to bottom, rgba(0,245,255,0.4), transparent)",
                    animation: "scrollPulse 2s infinite",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 8px #00ff88; } 50% { opacity: 0.5; box-shadow: 0 0 4px #00ff88; } }
        @keyframes scrollPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </section>
  );
}