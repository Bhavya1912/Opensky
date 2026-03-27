import React from "react";
import { timeSince } from "../utils/format";

export default function Header({ totalCount, lastUpdate, isRefreshing, onFilterChange, filters }) {
  return (
    <header style={{
      height: "var(--header-height)", background: "var(--bg-panel)",
      borderBottom: "1px solid var(--border-subtle)", display: "flex",
      alignItems: "center", padding: "0 20px", gap: "20px", position: "relative", zIndex: 1000,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ position: "relative", width: 28, height: 28 }}>
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28 }}>
            <circle cx="14" cy="14" r="13" stroke="var(--accent-primary)" strokeWidth="1.5" opacity="0.4"/>
            <circle cx="14" cy="14" r="8"  stroke="var(--accent-primary)" strokeWidth="1"   opacity="0.3"/>
            <text x="14" y="18" textAnchor="middle" fontSize="12" fill="var(--accent-primary)">✈</text>
          </svg>
          {isRefreshing && (
            <div style={{
              position: "absolute", top: -2, left: -2, width: 32, height: 32,
              border: "1px solid var(--accent-primary)", borderTopColor: "transparent",
              borderRadius: "50%", animation: "sweep 1s linear infinite",
            }}/>
          )}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, letterSpacing: "0.12em" }}>OPENSKY</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.2em", marginTop: -2 }}>LIVE TRACKER</div>
        </div>
      </div>

      <div style={{ width: 1, height: 30, background: "var(--border-subtle)" }}/>

      {/* Live dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 8px var(--accent-green)", animation: "blink 2s ease-in-out infinite" }}/>
        <span style={{ color: "var(--accent-green)", fontSize: 10, letterSpacing: "0.15em", fontWeight: 700 }}>LIVE</span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        <Stat label="AIRCRAFT" value={totalCount.toLocaleString()} color="var(--accent-primary)"/>
        <Stat label="UPDATED"  value={timeSince(lastUpdate)}/>
        <Stat label="REFRESH"  value="8s"/>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <FilterBtn label="ALL"    active={filters.altFilter === "all"}  onClick={() => onFilterChange("altFilter", "all")}/>
        <FilterBtn label=">FL100" active={filters.altFilter === "high"} onClick={() => onFilterChange("altFilter", "high")}/>
        <FilterBtn label="LOW ALT" active={filters.altFilter === "low"} onClick={() => onFilterChange("altFilter", "low")} color="var(--accent-warm)"/>
      </div>
    </header>
  );
}

function Stat({ label, value, color = "var(--text-secondary)" }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color, fontWeight: 700, letterSpacing: "0.05em" }}>{value}</div>
    </div>
  );
}

function FilterBtn({ label, active, onClick, color = "var(--accent-primary)" }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-mono)",
      border: `1px solid ${active ? color : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-sm)",
      background: active ? `${color}18` : "transparent",
      color: active ? color : "var(--text-muted)",
      fontSize: 10, letterSpacing: "0.12em", fontWeight: active ? 700 : 400,
      transition: "all 0.15s",
    }}>{label}</button>
  );
}
