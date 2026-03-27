import React, { useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import FlightMap from "./components/FlightMap.jsx";
import FlightPanel from "./components/FlightPanel.jsx";
import { LoadingScreen, ErrorBanner } from "./components/StatusComponents.jsx";
import { useFlights } from "./hooks/useFlights.js";

export default function App() {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filters, setFilters] = useState({ altFilter: "all" });

  const { flights, loading, error, lastUpdate, totalCount, isRefreshing, refresh } = useFlights();

  const handleSelectFlight = useCallback((flight) => {
    setSelectedFlight((prev) => (prev?.icao24 === flight.icao24 ? null : flight));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header
        totalCount={totalCount}
        lastUpdate={lastUpdate}
        isRefreshing={isRefreshing}
        onFilterChange={handleFilterChange}
        filters={filters}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {loading && <LoadingScreen />}
        {error && !loading && <ErrorBanner message={error} onRetry={refresh} />}
        <FlightMap
          flights={flights}
          selectedFlight={selectedFlight}
          onSelectFlight={handleSelectFlight}
          filters={filters}
        />
        <FlightPanel
          selected={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      </div>
    </div>
  );
}
