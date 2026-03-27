export const formatAlt = (ft) => ft == null ? "N/A" : `${ft.toLocaleString()} ft`;
export const formatSpeed = (kmh) => kmh == null ? "N/A" : `${kmh.toLocaleString()} km/h`;
export const formatVRate = (r) => {
  if (!r || Math.abs(r) < 0.5) return "Level";
  return `${r > 0 ? "↑" : "↓"} ${Math.abs(r).toFixed(1)} m/s`;
};
export const vRateColor = (r) => {
  if (!r || Math.abs(r) < 0.5) return "var(--text-secondary)";
  return r > 0 ? "var(--accent-green)" : "var(--accent-red)";
};
export const altBand = (ft) => {
  if (ft > 35000) return { label: "High Altitude", color: "#00d4ff" };
  if (ft > 20000) return { label: "Mid Altitude", color: "#00ff88" };
  if (ft > 5000)  return { label: "Low Altitude",  color: "#ffd23f" };
  return              { label: "Very Low",       color: "#ff6b35" };
};
export const timeSince = (date) => {
  if (!date) return "--";
  const s = Math.round((Date.now() - date) / 1000);
  return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
};
export const formatCoord = (v, type) => {
  if (v == null) return "N/A";
  const abs = Math.abs(v).toFixed(4);
  return type === "lat"
    ? `${abs}° ${v >= 0 ? "N" : "S"}`
    : `${abs}° ${v >= 0 ? "E" : "W"}`;
};
export const flightPhase = (f) => {
  if (f.onGround) return "On Ground";
  if (f.altFeet < 3000) {
    if (f.verticalRate > 2)  return "Takeoff";
    if (f.verticalRate < -2) return "Landing";
    return "Low Altitude";
  }
  if (Math.abs(f.verticalRate) > 2) return f.verticalRate > 0 ? "Climbing" : "Descending";
  return "Cruising";
};
export const headingLabel = (deg) => {
  const d = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return d[Math.round(deg / 22.5) % 16];
};
export const aircraftColor = (f) => {
  if (f.altFeet > 35000) return "#00d4ff";
  if (f.altFeet > 20000) return "#00ff88";
  if (f.altFeet > 5000)  return "#ffd23f";
  return "#ff6b35";
};
