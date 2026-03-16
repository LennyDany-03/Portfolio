"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Command Registry ────────────────────────────────────────────────────────

const COMMANDS = {
  help: {
    description: "List all available commands",
    run: () => ({
      type: "table",
      data: Object.entries(COMMANDS).map(([cmd, def]) => ({
        cmd: `  ${cmd}`,
        desc: def.description,
      })),
    }),
  },

  whoami: {
    description: "Display system user info",
    run: () => ({
      type: "lines",
      lines: [
        { text: "lenny@ascendry", color: "#00ff88" },
        { text: "─────────────────────────────────────", color: "rgba(255,255,255,0.1)" },
        { text: "Name     : Lenny Dany Derek D", color: "#fff" },
        { text: "Age      : 19", color: "#fff" },
        { text: "Role     : Full-Stack Developer & AI Builder", color: "#fff" },
        { text: "Company  : Ascendry (Founder)", color: "#00f5ff" },
        { text: "Campus   : SRM University Chennai", color: "#fff" },
        { text: "Status   : Open to opportunities", color: "#00ff88" },
      ],
    }),
  },

  ls: {
    description: "List portfolio sections",
    run: (args) => {
      if (args[0] === "./projects") {
        return {
          type: "lines",
          lines: [
            { text: "drwxr-xr-x  SIMS_SmartAssist/", color: "#00f5ff" },
            { text: "drwxr-xr-x  IELTS_AI_Platform/", color: "#00f5ff" },
            { text: "drwxr-xr-x  AI_Banking_Chatbot/", color: "#00f5ff" },
            { text: "drwxr-xr-x  Ascendry/", color: "#00f5ff" },
            { text: "drwxr-xr-x  Flux_Shortener/", color: "#00f5ff" },
            { text: "drwxr-xr-x  AI_Agent_OS/", color: "#a78bfa" },
            { text: "", color: "" },
            { text: "6 projects found. Run `cat ./projects/<name>` for details.", color: "rgba(255,255,255,0.35)" },
          ],
        };
      }
      if (args[0] === "./skills") {
        return {
          type: "lines",
          lines: [
            { text: "-rw-r--r--  next.js react tailwind typescript", color: "#00f5ff" },
            { text: "-rw-r--r--  fastapi python nodejs supabase postgresql", color: "#00ff88" },
            { text: "-rw-r--r--  claude-api groq elevenlabs azure-ai langchain", color: "#a78bfa" },
            { text: "-rw-r--r--  docker git vercel linux figma postman", color: "#fbbf24" },
          ],
        };
      }
      return {
        type: "lines",
        lines: [
          { text: "drwxr-xr-x  ./about", color: "#00f5ff" },
          { text: "drwxr-xr-x  ./experience", color: "#00f5ff" },
          { text: "drwxr-xr-x  ./skills", color: "#00f5ff" },
          { text: "drwxr-xr-x  ./projects", color: "#00f5ff" },
          { text: "drwxr-xr-x  ./contact", color: "#00f5ff" },
          { text: "-rw-r--r--  README.md", color: "rgba(255,255,255,0.4)" },
          { text: "-rw-r--r--  resume.pdf", color: "rgba(255,255,255,0.4)" },
        ],
      };
    },
  },

  cat: {
    description: "cat <file> — Read a file or project details",
    run: (args) => {
      const file = args[0] || "";
      const projectMap = {
        "./projects/SIMS_SmartAssist": [
          { text: "# SIMS SmartAssist", color: "#00f5ff" },
          { text: "AI-powered hospital kiosk/chatbot for SIMS Hospital Chennai.", color: "#fff" },
          { text: "", color: "" },
          { text: "Stack  : Next.js, FastAPI, ElevenLabs, Docker, Python", color: "#a78bfa" },
          { text: "Lang   : EN, Tamil, Hindi, Bengali, Malayalam", color: "#a78bfa" },
          { text: "Status : LIVE on Vercel", color: "#00ff88" },
          { text: "Year   : 2025", color: "rgba(255,255,255,0.4)" },
        ],
        "./projects/IELTS_AI_Platform": [
          { text: "# IELTS AI Platform", color: "#00f5ff" },
          { text: "Full IELTS prep platform — essay feedback, speaking AI, study planner.", color: "#fff" },
          { text: "", color: "" },
          { text: "Stack  : Next.js, Azure AI, FastAPI, Supabase", color: "#a78bfa" },
          { text: "Status : BUILDING", color: "#fbbf24" },
        ],
        "./projects/AI_Agent_OS": [
          { text: "# AI Agent OS", color: "#a78bfa" },
          { text: "Jarvis-inspired LLM-controlled operating system.", color: "#fff" },
          { text: "Natural language OS control, voice commands, device integration.", color: "#fff" },
          { text: "", color: "" },
          { text: "Stack  : Python, LangChain, Electron, Claude API", color: "#a78bfa" },
          { text: "Status : BUILDING — Long-term dream project.", color: "#fbbf24" },
        ],
        "README.md": [
          { text: "# LENNY.SYS — Portfolio", color: "#00f5ff" },
          { text: "", color: "" },
          { text: "Hey, you found the terminal. Nice.", color: "#00ff88" },
          { text: "This is Lenny's hacker-style portfolio.", color: "#fff" },
          { text: "", color: "" },
          { text: "Built with:", color: "rgba(255,255,255,0.4)" },
          { text: "  Next.js · Tailwind · Claude API · JetBrains Mono", color: "#a78bfa" },
          { text: "", color: "" },
          { text: "If you're reading this, you're exactly the kind of person", color: "#fff" },
          { text: "Lenny wants to work with. Run `contact` to reach out.", color: "#00f5ff" },
        ],
      };

      if (projectMap[file]) {
        return { type: "lines", lines: projectMap[file] };
      }

      return {
        type: "lines",
        lines: [{ text: `cat: ${file}: No such file or directory`, color: "#ff6b6b" }],
      };
    },
  },

  goto: {
    description: "goto <section> — Navigate to a portfolio section",
    run: (args) => {
      const section = args[0];
      const sectionMap = {
        about: "about",
        experience: "experience",
        skills: "skills",
        projects: "projects",
        contact: "contact",
        top: null,
        home: null,
      };

      if (section in sectionMap) {
        setTimeout(() => {
          const id = sectionMap[section];
          if (id) {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 300);

        return {
          type: "lines",
          lines: [
            { text: `> Navigating to /${section}...`, color: "#00f5ff" },
            { text: `✓ Jumped to section: ${section}`, color: "#00ff88" },
          ],
        };
      }

      return {
        type: "lines",
        lines: [
          { text: `Unknown section: "${section}"`, color: "#ff6b6b" },
          { text: "Available: about · experience · skills · projects · contact · top", color: "rgba(255,255,255,0.4)" },
        ],
      };
    },
  },

  contact: {
    description: "Open the contact section",
    run: () => {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return {
        type: "lines",
        lines: [
          { text: "> ssh connect@lenny.dev", color: "#00f5ff" },
          { text: "Opening contact terminal...", color: "rgba(255,255,255,0.4)" },
          { text: "✓ Redirecting to /contact", color: "#00ff88" },
        ],
      };
    },
  },

  github: {
    description: "Open Lenny's GitHub profile",
    run: () => {
      setTimeout(() => window.open("https://github.com/LennyDany-03", "_blank"), 300);
      return {
        type: "lines",
        lines: [
          { text: "> Opening github.com/LennyDany-03", color: "#00f5ff" },
          { text: "✓ Launched in new tab.", color: "#00ff88" },
        ],
      };
    },
  },

  skills: {
    description: "Show all skills",
    run: () => ({
      type: "lines",
      lines: [
        { text: "FRONTEND ──────────────────────────────", color: "#00f5ff" },
        { text: "  Next.js [92%]  React [92%]  Tailwind [90%]  TypeScript [72%]", color: "#fff" },
        { text: "", color: "" },
        { text: "BACKEND ───────────────────────────────", color: "#00ff88" },
        { text: "  FastAPI [88%]  Python [88%]  Node.js [74%]  Supabase [80%]", color: "#fff" },
        { text: "", color: "" },
        { text: "AI / ML ───────────────────────────────", color: "#a78bfa" },
        { text: "  Claude API [88%]  Groq [82%]  ElevenLabs [80%]  Azure AI [76%]", color: "#fff" },
        { text: "", color: "" },
        { text: "TOOLS ─────────────────────────────────", color: "#fbbf24" },
        { text: "  Docker [75%]  Git [90%]  Vercel [88%]  Linux [74%]", color: "#fff" },
      ],
    }),
  },

  projects: {
    description: "List all projects",
    run: () => ({
      type: "lines",
      lines: [
        { text: "[LIVE]     SIMS SmartAssist        — AI Hospital Chatbot", color: "#00ff88" },
        { text: "[BUILDING] IELTS AI Platform        — IELTS Prep + AI Feedback", color: "#fbbf24" },
        { text: "[DONE]     AI Banking Chatbot       — Groq-Powered Finance AI", color: "#00f5ff" },
        { text: "[LIVE]     Ascendry                 — Personal SaaS Brand", color: "#00f5ff" },
        { text: "[BUILDING] Flux                     — Smart Link Shortener", color: "#fbbf24" },
        { text: "[BUILDING] AI Agent OS              — Jarvis LLM OS Controller", color: "#a78bfa" },
        { text: "", color: "" },
        { text: "Run `ls ./projects` or `cat ./projects/<name>` for details.", color: "rgba(255,255,255,0.35)" },
      ],
    }),
  },

  experience: {
    description: "Show work experience / timeline",
    run: () => ({
      type: "lines",
      lines: [
        { text: "commit f3a9c21 [HEAD] — Internship: SIMS SmartAssist (2025)", color: "#00f5ff" },
        { text: "commit b72de04        — Founded Ascendry (2024)", color: "#00ff88" },
        { text: "commit c91af57        — AI Banking Chatbot (2024)", color: "#a78bfa" },
        { text: "commit e45bc12        — IELTS AI Platform (2024)", color: "#a78bfa" },
        { text: "commit d38fc99        — Coding Mentor @ ArrowDev (2024)", color: "#fbbf24" },
        { text: "commit a17de38        — Freelancing: Fiverr/Upwork/Gumroad (2024)", color: "#fbbf24" },
        { text: "commit 908ba11        — Hackstronauts 2025 — ML Track", color: "#ff6b6b" },
        { text: "commit 312cd40 [v0.1] — Started SRM University (2023)", color: "#00ff88" },
      ],
    }),
  },

  clear: {
    description: "Clear the terminal",
    run: () => ({ type: "clear" }),
  },

  pwd: {
    description: "Print working directory",
    run: () => ({
      type: "lines",
      lines: [{ text: "/home/lenny/portfolio", color: "#00f5ff" }],
    }),
  },

  date: {
    description: "Print current date",
    run: () => ({
      type: "lines",
      lines: [{ text: new Date().toString(), color: "#00f5ff" }],
    }),
  },

  echo: {
    description: "echo <text> — Echo text back",
    run: (args) => ({
      type: "lines",
      lines: [{ text: args.join(" ") || "", color: "#fff" }],
    }),
  },

  uname: {
    description: "System info",
    run: () => ({
      type: "lines",
      lines: [
        { text: "LENNY.SYS 2.0.25 Next.js-amd64 React/18 GNU/Tailwind", color: "#00f5ff" },
      ],
    }),
  },

  sudo: {
    description: "Nice try.",
    run: () => ({
      type: "lines",
      lines: [
        { text: "sudo: permission denied — lenny trusts no one.", color: "#ff6b6b" },
        { text: "This incident will be reported. (just kidding)", color: "rgba(255,255,255,0.3)" },
      ],
    }),
  },

  hack: {
    description: "???",
    run: () => ({
      type: "matrix",
    }),
  },

  exit: {
    description: "Close the terminal",
    run: () => ({ type: "exit" }),
  },
};

const WELCOME_LINES = [
  { text: "LENNY.SYS Terminal v2.0.25", color: "#00f5ff" },
  { text: "────────────────────────────────────────────────", color: "rgba(255,255,255,0.1)" },
  { text: 'Type `help` to see available commands.', color: "rgba(255,255,255,0.5)" },
  { text: 'Type `goto <section>` to navigate the portfolio.', color: "rgba(255,255,255,0.5)" },
  { text: 'Try `hack` if you dare. 👾', color: "#a78bfa" },
  { text: "", color: "" },
];

// ─── Matrix Rain Effect ──────────────────────────────────────────────────────
function MatrixRain({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.parentElement.offsetWidth;
    const H = canvas.height = 120;
    const cols = Math.floor(W / 14);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコSATORUNIXLENNY01ASCENDRY";

    let frame = 0;
    let animId;

    const draw = () => {
      ctx.fillStyle = "rgba(5,5,8,0.08)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#00ff88";
      ctx.font = "12px 'JetBrains Mono', monospace";

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = y * 14 < H * 0.3 ? "#00f5ff" : "#00ff88";
        ctx.fillText(char, i * 14, y * 14);
        if (y * 14 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });

      frame++;
      if (frame < 120) {
        animId = requestAnimationFrame(draw);
      } else {
        setTimeout(onDone, 200);
      }
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", borderRadius: 4, margin: "4px 0" }}
    />
  );
}

// ─── Main Terminal ───────────────────────────────────────────────────────────
export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(WELCOME_LINES.map((l) => ({ ...l, type: "line" })));
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [matrixActive, setMatrixActive] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Keybind: backtick ` to toggle
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "`") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    const i = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(i);
  }, []);

  const pushLines = useCallback((lines) => {
    setHistory((prev) => [
      ...prev,
      ...lines.map((l) => ({ ...l, type: "line" })),
    ]);
  }, []);

  const runCommand = useCallback((raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    // Echo the command
    setHistory((prev) => [
      ...prev,
      {
        type: "line",
        text: `lenny@ascendry:~$ ${trimmed}`,
        color: "#00f5ff",
      },
    ]);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const def = COMMANDS[cmd];
    if (!def) {
      pushLines([
        { text: `command not found: ${cmd}. Run \`help\` to see available commands.`, color: "#ff6b6b" },
      ]);
      return;
    }

    const result = def.run(args);

    if (result.type === "clear") {
      setHistory([]);
      return;
    }

    if (result.type === "exit") {
      setOpen(false);
      return;
    }

    if (result.type === "matrix") {
      setMatrixActive(true);
      setHistory((prev) => [
        ...prev,
        { type: "line", text: "Initiating matrix sequence...", color: "#00ff88" },
        { type: "matrix" },
      ]);
      return;
    }

    if (result.type === "lines") {
      pushLines(result.lines);
      return;
    }

    if (result.type === "table") {
      const maxLen = Math.max(...result.data.map((r) => r.cmd.length));
      pushLines(
        result.data.map((r) => ({
          text: `${r.cmd.padEnd(maxLen + 2)}  ${r.desc}`,
          color: r.cmd.trim() === "hack" ? "#a78bfa" : "#fff",
        }))
      );
      return;
    }
  }, [pushLines]);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? "" : cmdHistory[newIndex]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const partial = input.split(" ")[0].toLowerCase();
      const match = Object.keys(COMMANDS).find((c) => c.startsWith(partial) && c !== partial);
      if (match) setInput(match);
    }
  };

  return (
    <>
      {/* Hint badge — only shows when closed */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 28,
            left: 28,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(0,245,255,0.15)",
            borderRadius: 6,
            padding: "7px 14px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s",
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,245,255,0.4)";
            e.currentTarget.style.background = "rgba(0,245,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,245,255,0.15)";
            e.currentTarget.style.background = "rgba(0,0,0,0.7)";
          }}
        >
          <span style={{ fontSize: 10, color: "rgba(0,245,255,0.6)", letterSpacing: "0.05em" }}>
            Press
          </span>
          <kbd style={{
            fontSize: 11,
            color: "#00f5ff",
            background: "rgba(0,245,255,0.1)",
            border: "1px solid rgba(0,245,255,0.3)",
            borderRadius: 3,
            padding: "1px 7px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            `
          </kbd>
          <span style={{ fontSize: 10, color: "rgba(0,245,255,0.6)", letterSpacing: "0.05em" }}>
            to open terminal
          </span>
        </div>
      )}

      {/* Terminal window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: 28,
            width: "min(680px, calc(100vw - 56px))",
            maxHeight: "70vh",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            background: "rgba(4,4,7,0.97)",
            border: "1px solid rgba(0,245,255,0.25)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 0 80px rgba(0,245,255,0.1), 0 32px 64px rgba(0,0,0,0.9)",
            backdropFilter: "blur(24px)",
            fontFamily: "'JetBrains Mono', monospace",
            animation: "termSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Title bar */}
          <div style={{
            background: "rgba(0,245,255,0.04)",
            borderBottom: "1px solid rgba(0,245,255,0.1)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            userSelect: "none",
          }}>
            {/* Traffic lights */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{
                width: 12, height: 12, borderRadius: "50%",
                backgroundColor: "#ff5f56", border: "none", cursor: "pointer", padding: 0,
              }}
            />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />

            <span style={{
              marginLeft: 8,
              fontSize: 11,
              color: "rgba(0,245,255,0.6)",
              letterSpacing: "0.12em",
            }}>
              lenny@ascendry:~ — LENNY.SYS Terminal
            </span>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                backgroundColor: "#00ff88",
                boxShadow: "0 0 6px #00ff88",
              }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                ESC to close · ` to toggle
              </span>
            </div>
          </div>

          {/* Output area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px 8px",
            fontSize: 12,
            lineHeight: 1.75,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,245,255,0.15) transparent",
          }}>
            {history.map((entry, i) => {
              if (entry.type === "matrix") {
                return (
                  <MatrixRain
                    key={i}
                    onDone={() => {
                      setMatrixActive(false);
                      setHistory((prev) => [
                        ...prev,
                        { type: "line", text: "Matrix sequence complete. Welcome, Neo.", color: "#00ff88" },
                        { type: "line", text: "", color: "" },
                      ]);
                    }}
                  />
                );
              }
              return (
                <div
                  key={i}
                  style={{
                    color: entry.color || "rgba(255,255,255,0.7)",
                    minHeight: entry.text === "" ? 8 : "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    animation: "lineFadeIn 0.15s ease",
                  }}
                >
                  {entry.text ?? "\u00A0"}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, color: "#00ff88", flexShrink: 0 }}>
              lenny@ascendry:~$
            </span>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="none"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  letterSpacing: "0.04em",
                  caretColor: "transparent",
                  boxSizing: "border-box",
                  paddingRight: 12,
                }}
              />
              {/* Custom blinking cursor */}
              <span style={{
                position: "absolute",
                left: `${input.length}ch`,
                top: 0,
                height: "100%",
                width: 7,
                backgroundColor: "#00f5ff",
                opacity: cursorVisible ? 0.9 : 0,
                transition: "opacity 0.05s",
                pointerEvents: "none",
                borderRadius: 1,
              }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes termSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineFadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </>
  );
}