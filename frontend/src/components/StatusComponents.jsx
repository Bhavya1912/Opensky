import React from "react";

export function LoadingScreen() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 9999,
      background: "var(--bg-primary)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
    }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg viewBox="0 0 100 100" style={{ width: 100, height: 100 }}>
          <circle cx="50" cy="50" r="46" stroke="var(--border-active)" strokeWidth="1" fill="none"/>
          <circle cx="50" cy="50" r="30" stroke="var(--border-subtle)" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="15" stroke="var(--border-subtle)" strokeWidth="0.5" fill="none"/>
          {[0,45,90,135,180,225,270,315].map((a) => (
            <line key={a} x1="50" y1="50"
              x2={50 + 46 * Math.sin(a * Math.PI / 180)}
              y2={50 - 46 * Math.cos(a * Math.PI / 180)}
              stroke="var(--border-subtle)" strokeWidth="0.3"
            />
          ))}
        </svg>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "conic-gradient(from 0deg, transparent 270deg, rgba(0,212,255,0.4) 360deg)",
          borderRadius: "50%", animation: "sweep 1.5s linear infinite",
        }}/>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 20 }}>✈</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "0.15em" }}>INITIALIZING</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.2em", marginTop: 4 }}>FETCHING LIVE FLIGHT DATA</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent-primary)",
            animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)",
      zIndex: 2000, animation: "fade-up 0.2s ease-out", maxWidth: 400,
      background: "var(--bg-card)", border: "1px solid var(--accent-red)",
      borderRadius: "var(--radius-md)", padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 4px 20px rgba(255,59,92,0.2)",
    }}>
      <div style={{ fontSize: 16 }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-red)", letterSpacing: "0.1em" }}>CONNECTION ERROR</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{message}</div>
      </div>
      <button onClick={onRetry} style={{
        padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-mono)",
        background: "transparent", border: "1px solid var(--accent-red)",
        color: "var(--accent-red)", borderRadius: "var(--radius-sm)",
        fontSize: 10, letterSpacing: "0.1em",
      }}>RETRY</button>
    </div>
  );
}
