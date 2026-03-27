import React from "react";
import {
  formatAlt, formatSpeed, formatVRate, vRateColor,
  altBand, formatCoord, flightPhase, headingLabel, aircraftColor,
} from "../utils/format";

export default function FlightPanel({ selected, onClose }) {
  if (!selected) return <EmptyPanel />;

  const phase = flightPhase(selected);
  const band  = altBand(selected.altFeet);
  const color = aircraftColor(selected);

  return (
    <div style={{
      width: "var(--panel-width)", background: "var(--bg-panel)",
      borderLeft: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column",
      animation: "slide-in 0.25s ease-out", position: "relative", overflow: "hidden",
    }}>
      {/* Scanline */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2, pointerEvents: "none", zIndex: 0,
        background: `linear-gradient(90deg, transparent, ${color}33, transparent)`,
        animation: "scanline 3s linear infinite",
      }}/>

      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-subtle)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: 4 }}>SELECTED AIRCRAFT</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "0.05em", lineHeight: 1, color: selected.callsign ? "var(--text-primary)" : "var(--text-muted)" }}>
              {selected.callsign || "NO CALLSIGN"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{selected.icao24.toUpperCase()}</div>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <Badge label={phase}       color={color} />
          <Badge label={band.label}  color={band.color} />
          {selected.country && <Badge label={selected.country} color="var(--text-muted)" border />}
        </div>
      </div>

      {/* Compass */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 16 }}>
        <Compass heading={selected.heading} color={color} />
        <div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.15em" }}>HEADING</div>
          <div style={{ fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800, color }}>{selected.heading}°</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{headingLabel(selected.heading)}</div>
        </div>
      </div>

      {/* Data */}
      <div style={{ padding: "12px 16px", flex: 1, overflowY: "auto" }}>
        <Section title="TELEMETRY">
          <DataRow label="ALTITUDE"     value={formatAlt(selected.altFeet)}   sub={`${selected.altMeters?.toLocaleString()} m`} color={band.color} bar={Math.min(100,(selected.altFeet/45000)*100)} barColor={band.color} />
          <DataRow label="GROUND SPEED" value={formatSpeed(selected.speedKmh)} bar={Math.min(100,((selected.speedKmh||0)/1000)*100)} barColor="var(--accent-primary)" />
          <DataRow label="VERTICAL RATE" value={formatVRate(selected.verticalRate)} color={vRateColor(selected.verticalRate)} />
        </Section>

        <Section title="POSITION">
          <DataRow label="LATITUDE"  value={formatCoord(selected.lat, "lat")} mono />
          <DataRow label="LONGITUDE" value={formatCoord(selected.lon, "lon")} mono />
          {selected.squawk && <DataRow label="SQUAWK" value={selected.squawk} mono />}
        </Section>

        <Section title="IDENTIFICATION">
          <DataRow label="ICAO24"   value={selected.icao24.toUpperCase()} mono />
          <DataRow label="CALLSIGN" value={selected.callsign || "—"} mono />
          <DataRow label="COUNTRY"  value={selected.country} />
          {selected.lastContact && (
            <DataRow label="LAST CONTACT" value={new Date(selected.lastContact * 1000).toLocaleTimeString()} />
          )}
        </Section>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: 10, color: "var(--text-muted)" }}>
        <a href={`https://www.flightradar24.com/${selected.callsign || selected.icao24}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-secondary)", textDecoration: "none" }}>
          ↗ FlightRadar24
        </a>
        &nbsp;·&nbsp;
        <a href={`https://opensky-network.org/aircraft-profile?icao24=${selected.icao24}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-secondary)", textDecoration: "none" }}>
          OpenSky Profile
        </a>
      </div>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div style={{
      width: "var(--panel-width)", background: "var(--bg-panel)",
      borderLeft: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16, padding: 24,
    }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
          <circle cx="40" cy="40" r="38" stroke="var(--border-active)" strokeWidth="1" fill="none"/>
          <circle cx="40" cy="40" r="25" stroke="var(--border-subtle)" strokeWidth="0.5" fill="none"/>
          <circle cx="40" cy="40" r="12" stroke="var(--border-subtle)" strokeWidth="0.5" fill="none"/>
          <line x1="40" y1="2"  x2="40" y2="78" stroke="var(--border-subtle)" strokeWidth="0.5"/>
          <line x1="2"  y1="40" x2="78" y2="40" stroke="var(--border-subtle)" strokeWidth="0.5"/>
        </svg>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "conic-gradient(from 0deg, transparent 270deg, rgba(0,212,255,0.3) 360deg)",
          borderRadius: "50%", animation: "sweep 3s linear infinite",
        }}/>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-secondary)", letterSpacing: "0.1em", marginBottom: 6 }}>SELECT AN AIRCRAFT</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7 }}>Click any aircraft on the<br/>map to view telemetry data</div>
      </div>
    </div>
  );
}

function CloseBtn({ onClose }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClose} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: "none", cursor: "pointer", width: 28, height: 28, fontSize: 14,
      borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${hover ? "var(--accent-red)" : "var(--border-subtle)"}`,
      color: hover ? "var(--accent-red)" : "var(--text-muted)", transition: "all 0.15s",
    }}>×</button>
  );
}

function Badge({ label, color, border }) {
  return (
    <span style={{
      fontSize: 9, padding: "2px 7px", borderRadius: 2, letterSpacing: "0.12em", fontWeight: 700,
      background: border ? "transparent" : `${color}18`,
      border: `1px solid ${border ? "var(--border-subtle)" : `${color}40`}`,
      color: border ? "var(--text-muted)" : color,
    }}>{label.toUpperCase()}</span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.25em", marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid var(--border-subtle)" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function DataRow({ label, value, sub, color, bar, barColor }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: color || "var(--text-primary)" }}>{value}</span>
      </div>
      {bar != null && (
        <div style={{ height: 2, background: "var(--border-subtle)", borderRadius: 1, marginTop: 4 }}>
          <div style={{ height: "100%", width: `${bar}%`, background: barColor || "var(--accent-primary)", borderRadius: 1, transition: "width 0.5s ease" }}/>
        </div>
      )}
      {sub && <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Compass({ heading, color }) {
  return (
    <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
      <svg viewBox="0 0 60 60" style={{ width: 60, height: 60 }}>
        <circle cx="30" cy="30" r="28" stroke="var(--border-subtle)"  strokeWidth="1"   fill="none"/>
        <circle cx="30" cy="30" r="20" stroke="var(--border-active)"  strokeWidth="0.5" fill="none"/>
        {["N","E","S","W"].map((d, i) => (
          <text key={d}
            x={30 + 22 * Math.sin(i * Math.PI / 2)}
            y={30 - 22 * Math.cos(i * Math.PI / 2) + 4}
            textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="monospace"
            fill={d === "N" ? color : "var(--text-muted)"}
          >{d}</text>
        ))}
        <g transform={`rotate(${heading}, 30, 30)`}>
          <polygon points="30,8 27,30 30,26 33,30" fill={color} opacity="0.9"/>
          <polygon points="30,52 27,30 30,34 33,30" fill="var(--text-muted)" opacity="0.5"/>
        </g>
        <circle cx="30" cy="30" r="3" fill="var(--bg-panel)" stroke={color} strokeWidth="1"/>
      </svg>
    </div>
  );
}
