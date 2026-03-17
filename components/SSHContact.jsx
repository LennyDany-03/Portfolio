"use client";
import { useEffect, useRef, useState } from "react";

const SOCIAL_LINKS = [
  { label: "GitHub", handle: "LennyDany-03", href: "https://github.com/LennyDany-03", color: "#fff", icon: "⬡" },
  { label: "Instagram", handle: "@lenny_dany_3", href: "https://instagram.com/lenny_dany_3", color: "#a78bfa", icon: "◈" },
  { label: "Fiverr", handle: "lennydany", href: "https://fiverr.com", color: "#00ff88", icon: "◆" },
  { label: "Upwork", handle: "Lenny Dany", href: "https://upwork.com", color: "#00f5ff", icon: "◇" },
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

export default function SSHContact() {
  const ref = useRef(null);
  const inView = useInView(ref);

  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [focused, setFocused] = useState(null);
  const [status, setStatus] = useState("idle");
  const [outputLines, setOutputLines] = useState([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const outputRef = useRef(null);

  useEffect(() => {
    const i = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const lines = [
      { text: "> ssh connect@lenny.dev", color: "#00f5ff", delay: 200 },
      { text: "Connecting to lenny.dev...", color: "rgba(255,255,255,0.4)", delay: 500 },
      { text: "Host key fingerprint: SHA256:a9x3...", color: "rgba(255,255,255,0.25)", delay: 900 },
      { text: "Authentication: public key [OK]", color: "#00ff88", delay: 1200 },
      { text: "Welcome to LENNY.SYS — Collaboration Port", color: "#fff", delay: 1500 },
      { text: "", delay: 1700 },
      { text: "Fill out the form below to send a packet.", color: "rgba(255,255,255,0.35)", delay: 1900 },
    ];
    lines.forEach(({ text, color, delay }) => {
      setTimeout(() => {
        setOutputLines((prev) => [...prev, { text, color }]);
      }, delay);
    });
  }, [inView]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputLines]);

  const handleSubmit = async () => {
    if (!formState.name || !formState.email || !formState.message) return;

    setStatus("sending");
    setOutputLines((prev) => [
      ...prev,
      { text: "", color: "" },
      { text: `> send --to=lenny@ascendry.dev --from="${formState.email}"`, color: "#00f5ff" },
      { text: "Encrypting payload...", color: "rgba(255,255,255,0.4)" },
    ]);

    await new Promise((r) => setTimeout(r, 1800));

    setStatus("success");
    setOutputLines((prev) => [
      ...prev,
      { text: "Packet delivered successfully. [200 OK]", color: "#00ff88" },
      { text: `> Message from ${formState.name} received.`, color: "#00ff88" },
      { text: "I'll respond within 24–48 hours.", color: "rgba(255,255,255,0.4)" },
    ]);
    setFormState({ name: "", email: "", subject: "", message: "" });
  };

  const inputStyle = (field) => ({
    width: "100%",
    background: focused === field ? "rgba(0,245,255,0.04)" : "transparent",
    border: "none",
    borderBottom: `1px solid ${focused === field ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.1)"}`,
    color: "#fff",
    fontFamily: "var(--font-mono)",
    fontSize: "clamp(11px, 2vw, 13px)",
    padding: "10px 4px",
    outline: "none",
    transition: "all 0.2s",
    letterSpacing: "0.04em",
    boxSizing: "border-box",
  });

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        minHeight: "100vh",
        backgroundColor: "#050508",
        padding: "100px 24px",
        display: "flex",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute",
        bottom: 0,
        right: "10%",
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 900, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Section header */}
        <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#00f5ff", fontSize: 12, letterSpacing: "0.2em" }}>06.</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>———————</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.15em" }}>CONTACT</span>
        </div>

        <div
          className="grid-responsive"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {/* Left: Terminal output + Social */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Terminal output */}
            <div style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(0,245,255,0.1)",
              borderRadius: 8,
              overflow: "hidden",
              flex: 1,
            }}>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
                ))}
                <span style={{
                  marginLeft: 8, fontSize: 10,
                  color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em",
                }}>
                  terminal — ssh
                </span>
              </div>

              <div
                ref={outputRef}
                style={{
                  padding: "20px",
                  minHeight: 200,
                  maxHeight: 280,
                  overflowY: "auto",
                  fontSize: "clamp(10px, 2vw, 12px)",
                  lineHeight: 1.8,
                }}
              >
                {outputLines.map((line, i) => (
                  <div key={i} style={{
                    color: line.color || "transparent",
                    minHeight: line.text ? "auto" : 8,
                    opacity: 1,
                    animation: "lineReveal 0.2s ease",
                  }}>
                    {line.text || "\u00A0"}
                  </div>
                ))}
                {status === "idle" && (
                  <span style={{
                    display: "inline-block",
                    width: 7,
                    height: 13,
                    backgroundColor: "#00f5ff",
                    opacity: cursorVisible ? 1 : 0,
                    verticalAlign: "middle",
                    marginTop: 2,
                  }} />
                )}
              </div>
            </div>

            {/* Social links */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "20px",
            }}>
              <div style={{
                fontSize: 9, letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.2)", marginBottom: 16,
              }}>
                FIND_ME_AT
              </div>
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.paddingLeft = "8px";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.paddingLeft = "0";
                  }}
                >
                  <span style={{ color: link.color, fontSize: 12 }}>{link.icon}</span>
                  <span style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255,255,255,0.4)", minWidth: 80 }}>
                    {link.label}
                  </span>
                  <span style={{ fontSize: "clamp(9px, 2vw, 11px)", color: link.color }}>{link.handle}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(0,245,255,0.1)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <div style={{
              background: "rgba(0,245,255,0.04)",
              borderBottom: "1px solid rgba(0,245,255,0.08)",
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}>
              <span style={{ fontSize: "clamp(8px, 1.5vw, 10px)", color: "rgba(0,245,255,0.7)", letterSpacing: "0.15em" }}>
                COMPOSE_PACKET
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  backgroundColor: status === "success" ? "#00ff88" : "#00f5ff",
                  boxShadow: `0 0 6px ${status === "success" ? "#00ff88" : "#00f5ff"}`,
                  animation: "hudPulse 2s infinite",
                }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                  {status === "sending" ? "TRANSMITTING" : status === "success" ? "SENT" : "READY"}
                </span>
              </div>
            </div>

            <div style={{ padding: "clamp(16px, 3vw, 24px) 20px" }}>
              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 9, letterSpacing: "0.2em",
                  color: focused === "name" ? "#00f5ff" : "rgba(255,255,255,0.25)",
                  marginBottom: 6, transition: "color 0.2s",
                }}>
                  --name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  placeholder="Your name"
                  style={inputStyle("name")}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 9, letterSpacing: "0.2em",
                  color: focused === "email" ? "#00f5ff" : "rgba(255,255,255,0.25)",
                  marginBottom: 6, transition: "color 0.2s",
                }}>
                  --email
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="your@email.com"
                  style={inputStyle("email")}
                />
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 9, letterSpacing: "0.2em",
                  color: focused === "subject" ? "#00f5ff" : "rgba(255,255,255,0.25)",
                  marginBottom: 6, transition: "color 0.2s",
                }}>
                  --subject
                </label>
                <input
                  type="text"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused(null)}
                  placeholder="What's this about?"
                  style={inputStyle("subject")}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: "block",
                  fontSize: 9, letterSpacing: "0.2em",
                  color: focused === "message" ? "#00f5ff" : "rgba(255,255,255,0.25)",
                  marginBottom: 6, transition: "color 0.2s",
                }}>
                  --message
                </label>
                <textarea
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  placeholder="Your message..."
                  style={{
                    ...inputStyle("message"),
                    resize: "none",
                    borderBottom: `1px solid ${focused === "message" ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                  }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={status === "sending" || status === "success"}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: status === "success"
                    ? "rgba(0,255,136,0.1)"
                    : "rgba(0,245,255,0.08)",
                  border: `1px solid ${status === "success" ? "rgba(0,255,136,0.4)" : "rgba(0,245,255,0.4)"}`,
                  color: status === "success" ? "#00ff88" : "#00f5ff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(10px, 2vw, 12px)",
                  letterSpacing: "0.15em",
                  borderRadius: 4,
                  cursor: status === "sending" || status === "success" ? "default" : "pointer",
                  transition: "all 0.2s",
                  opacity: status === "sending" ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (status === "idle") {
                    e.target.style.background = "rgba(0,245,255,0.14)";
                    e.target.style.boxShadow = "0 0 20px rgba(0,245,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(0,245,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {status === "sending"
                  ? "[ Transmitting... ]"
                  : status === "success"
                  ? "[ Packet Delivered ✓ ]"
                  : "[ Establish Connection ]"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 60,
          textAlign: "center",
          fontSize: "clamp(9px, 2vw, 11px)",
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.1em",
          padding: "24px 0",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ marginBottom: 12 }}>
            Built with{" "}
            <span style={{ color: "#00f5ff" }}>Next.js</span> ·{" "}
            <span style={{ color: "#a78bfa" }}>Custom CSS</span> ·{" "}
            <span style={{ color: "#00ff88" }}>Claude API</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.1)" }}>
            © {new Date().getFullYear()} Lenny Dany Derek D — All rights reserved
          </div>
        </div>
      </div>
    </section>
  );
}