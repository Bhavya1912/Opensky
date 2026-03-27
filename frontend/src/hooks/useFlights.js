import { useState, useEffect, useCallback, useRef } from "react";

const REFRESH_MS = 8000;

export function useFlights(bbox = null) {
  const [flights, setFlights]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const abortRef    = useRef(null);

  const fetchFlights = useCallback(async (background = false) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    if (!background) setLoading(true); else setIsRefreshing(true);
    setError(null);

    try {
      let url = "/api/flights";
      if (bbox) {
        const p = new URLSearchParams(bbox);
        url += `?${p}`;
      }
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setFlights(data.flights || []);
      setTotalCount(data.total || 0);
      setLastUpdate(data.timestamp ? new Date(data.timestamp) : new Date());
      setError(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [bbox]);

  useEffect(() => {
    fetchFlights(false);
    intervalRef.current = setInterval(() => fetchFlights(true), REFRESH_MS);
    return () => {
      clearInterval(intervalRef.current);
      abortRef.current?.abort();
    };
  }, [fetchFlights]);

  return { flights, loading, error, lastUpdate, totalCount, isRefreshing, refresh: () => fetchFlights(false) };
}
