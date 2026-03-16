"use client";
import { useEffect, useRef, useState } from "react";

const SYSTEM_PROMPT = `You are JARVIS — Lenny Dany's personal AI assistant embedded in his portfolio website. You know everything about Lenny and answer visitor questions on his behalf.

About Lenny:
- Full name: Lenny Dany Derek D
- Age: 19, Second-year B.Tech CSE student at SRM University Chennai
- Founder of Ascendry — a personal SaaS company focused on AI-powered digital innovation
- Coding mentor at ArrowDev Club
- Freelancer on Fiverr, Upwork, and Gumroad
- GitHub: github.com/LennyDany-03
- Instagram: @lenny_dany_3

Skills: Next.js, React, FastAPI, Python, Tailwind CSS, Supabase, Docker, Claude API, Groq, ElevenLabs, Azure AI

Key projects:
1. SIMS SmartAssist — AI hospital chatbot/kiosk for SIMS Hospital Chennai. Multilingual (English, Tamil, Hindi, Bengali, Malayalam), FastAPI + Next.js, ElevenLabs TTS, Docker, Vercel.
2. IELTS AI Platform — Full IELTS prep platform with AI essay feedback, speaking practice, Azure AI
3. AI Banking Chatbot — Groq-powered chatbot with FastAPI backend
4. Ascendry — Personal SaaS brand
5. Flux — Smart link shortener
6. AI Agent OS — Jarvis-inspired LLM OS controller (in progress)

Lenny is open to: freelance projects, AI product collaborations, internships, open source.
Long-term dream: Build a real-life Jarvis-style voice AI with full device integration.
Hobbies: Music, coding, AI tinkering, stock market.

Your personality: You are sleek, intelligent, and concise. You speak like a futuristic AI assistant. Keep replies short (2-4 sentences max). You are helpful, warm, and professional. Don't hallucinate details not provided above. If asked about something you don't know, say you'll let Lenny know they asked.`;

const SUGGESTED = [
  "What projects has Lenny built?",
  "What is Ascendry?",
  "Is Lenny available for freelance?",
  "What's his tech stack?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: "#00f5ff",
            animation: "dotBounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function JarvisChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "JARVIS online. I'm Lenny's AI assistant — ask me anything about him, his projects, or how to work with him.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Stop pulse after first open
  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const reply =
        data?.content?.[0]?.text ||
        "Signal lost. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Check your network and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <div style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 1000,
      }}>
        {/* Pulse rings */}
        {pulse && !open && (
          <>
            <div style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "1px solid rgba(0,245,255,0.3)",
              animation: "ringPulse 2s infinite",
            }} />
            <div style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "1px solid rgba(0,245,255,0.15)",
              animation: "ringPulse 2s 0.4s infinite",
            }} />
          </>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: open
              ? "rgba(0,245,255,0.15)"
              : "rgba(0,245,255,0.1)",
            border: "1px solid rgba(0,245,255,0.5)",
            color: "#00f5ff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(0,245,255,0.25)",
            transition: "all 0.2s",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,245,255,0.2)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0,245,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = open
              ? "rgba(0,245,255,0.15)"
              : "rgba(0,245,255,0.1)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.25)";
          }}
        >
          {open ? "✕" : "⬡"}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 92,
          right: 28,
          width: 360,
          maxHeight: 520,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          background: "rgba(5,5,8,0.97)",
          border: "1px solid rgba(0,245,255,0.2)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,245,255,0.1), 0 24px 48px rgba(0,0,0,0.8)",
          backdropFilter: "blur(20px)",
          animation: "chatSlideIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {/* Header */}
          <div style={{
            background: "rgba(0,245,255,0.05)",
            borderBottom: "1px solid rgba(0,245,255,0.1)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            {/* Avatar */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,245,255,0.1)",
              border: "1px solid rgba(0,245,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "#00f5ff",
              flexShrink: 0,
            }}>
              ⬡
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>
                JARVIS
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  backgroundColor: "#00ff88",
                  boxShadow: "0 0 6px #00ff88",
                }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
                  Lenny's AI · ONLINE
                </span>
              </div>
            </div>
            <button
              onClick={() => setMessages([{
                role: "assistant",
                content: "JARVIS online. I'm Lenny's AI assistant — ask me anything about him, his projects, or how to work with him.",
              }])}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.25)",
                fontSize: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
                padding: "4px 8px",
                borderRadius: 3,
              }}
              title="Clear chat"
            >
              CLR
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,245,255,0.2) transparent",
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "msgFadeIn 0.25s ease",
                }}
              >
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user"
                    ? "10px 10px 2px 10px"
                    : "10px 10px 10px 2px",
                  background: msg.role === "user"
                    ? "rgba(0,245,255,0.1)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${msg.role === "user"
                    ? "rgba(0,245,255,0.25)"
                    : "rgba(255,255,255,0.07)"}`,
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: msg.role === "user"
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.75)",
                  letterSpacing: "0.02em",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px 10px 10px 2px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts (only show when few messages) */}
          {messages.length <= 2 && (
            <div style={{
              padding: "0 14px 10px",
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    fontSize: 9,
                    color: "rgba(0,245,255,0.7)",
                    background: "rgba(0,245,255,0.05)",
                    border: "1px solid rgba(0,245,255,0.15)",
                    borderRadius: 3,
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.05em",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(0,245,255,0.1)";
                    e.target.style.borderColor = "rgba(0,245,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(0,245,255,0.05)";
                    e.target.style.borderColor = "rgba(0,245,255,0.15)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 14px",
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                color: "rgba(0,245,255,0.4)",
                pointerEvents: "none",
              }}>
                &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about Lenny..."
                disabled={loading}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0,245,255,0.2)",
                  color: "#fff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  padding: "6px 4px 6px 16px",
                  outline: "none",
                  letterSpacing: "0.04em",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading
                  ? "rgba(0,245,255,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${input.trim() && !loading ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: input.trim() && !loading ? "#00f5ff" : "rgba(255,255,255,0.2)",
                borderRadius: 4,
                padding: "6px 12px",
                cursor: input.trim() && !loading ? "pointer" : "default",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              ↵
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes chatSlideIn { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes msgFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes ringPulse { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }
      `}</style>
    </>
  );
}