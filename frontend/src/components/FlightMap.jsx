import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { aircraftColor } from "../utils/format";

const CHUNK_SIZE = 250;

function createAircraftIcon(heading, color, isSelected) {
  const size = isSelected ? 28 : 20;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 32 32" width="${size}" height="${size}">
      ${isSelected ? `<circle cx="0" cy="0" r="14" fill="${color}" opacity="0.12" stroke="${color}" stroke-width="0.5"/>` : ""}
      <g transform="rotate(${heading})">
        <path d="M0,-9 L3,-2 L9,1 L9,3 L3,1 L2,7 L4,8 L4,9 L0,8 L-4,9 L-4,8 L-2,7 L-3,1 L-9,3 L-9,1 L-3,-2 Z"
          fill="${color}"
          opacity="${isSelected ? 1 : 0.85}"
          stroke="${isSelected ? "#fff" : "none"}"
          stroke-width="${isSelected ? 0.5 : 0}"
        />
      </g>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function FlightMap({ flights, selectedFlight, onSelectFlight, filters }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const rafRef = useRef(null);
  const [mapBounds, setMapBounds] = useState(null);

  const altitudeFiltered = useMemo(() => {
    return flights.filter((f) => {
      if (filters.altFilter === "high") return f.altFeet > 10000;
      if (filters.altFilter === "low") return f.altFeet <= 10000;
      return true;
    });
  }, [flights, filters.altFilter]);

  const visible = useMemo(() => {
    if (!mapBounds) return altitudeFiltered;

    const paddedBounds = mapBounds.pad(0.25);
    const inView = altitudeFiltered.filter((f) => paddedBounds.contains([f.lat, f.lon]));

    if (selectedFlight && !inView.some((f) => f.icao24 === selectedFlight.icao24)) {
      const selectedInFilter = altitudeFiltered.find((f) => f.icao24 === selectedFlight.icao24);
      if (selectedInFilter) inView.push(selectedInFilter);
    }

    return inView;
  }, [altitudeFiltered, mapBounds, selectedFlight]);

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map(containerRef.current, { center: [20, 0], zoom: 3 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(mapRef.current);

    const syncBounds = () => {
      if (mapRef.current) setMapBounds(mapRef.current.getBounds());
    };

    syncBounds();
    mapRef.current.on("moveend zoomend", syncBounds);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      mapRef.current?.off("moveend zoomend", syncBounds);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers in chunks to avoid blocking the UI thread
  useEffect(() => {
    if (!mapRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const currentIds = new Set(visible.map((f) => f.icao24));

    // Remove stale markers first
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    let index = 0;
    const renderChunk = () => {
      const chunkEnd = Math.min(index + CHUNK_SIZE, visible.length);

      for (; index < chunkEnd; index += 1) {
        const flight = visible[index];
        const isSelected = selectedFlight?.icao24 === flight.icao24;
        const color = aircraftColor(flight);
        const icon = createAircraftIcon(flight.heading, color, isSelected);

        if (markersRef.current[flight.icao24]) {
          markersRef.current[flight.icao24].setLatLng([flight.lat, flight.lon]);
          markersRef.current[flight.icao24].setIcon(icon);
        } else {
          const marker = L.marker([flight.lat, flight.lon], { icon })
            .addTo(mapRef.current)
            .bindTooltip(
              `<span>${flight.callsign || flight.icao24.toUpperCase()}</span>`,
              { className: "aircraft-tooltip", direction: "top", offset: [0, -12] }
            )
            .on("click", () => onSelectFlight(flight));
          markersRef.current[flight.icao24] = marker;
        }
      }

      if (index < visible.length) {
        rafRef.current = requestAnimationFrame(renderChunk);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(renderChunk);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, selectedFlight, onSelectFlight]);

  // Pan to selected
  useEffect(() => {
    if (!mapRef.current || !selectedFlight) return;
    mapRef.current.panTo([selectedFlight.lat, selectedFlight.lon], { animate: true, duration: 0.5 });
  }, [selectedFlight?.icao24]);

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Aircraft count */}
      <div style={{
        position: "absolute", bottom: 30, left: 12, zIndex: 1000,
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)", padding: "6px 12px",
        fontSize: 11, color: "var(--text-secondary)", backdropFilter: "blur(8px)",
      }}>
        <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{visible.length.toLocaleString()}</span> aircraft visible
      </div>

      {/* Altitude legend */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 1000,
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 10,
        backdropFilter: "blur(8px)",
      }}>
        {[
          { color: "#00d4ff", label: "> 35,000 ft" },
          { color: "#00ff88", label: "20–35,000 ft" },
          { color: "#ffd23f", label: "5–20,000 ft" },
          { color: "#ff6b35", label: "< 5,000 ft" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}`, flexShrink: 0 }}/>
            <span style={{ color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
