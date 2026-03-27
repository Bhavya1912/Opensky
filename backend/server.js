require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;

// Cache flight data for 8 seconds
const flightCache = new NodeCache({ stdTTL: 8, checkperiod: 10 });

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET"],
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
app.use("/api/", limiter);

// OpenSky state vector field indices
const F = {
  ICAO24: 0,
  CALLSIGN: 1,
  ORIGIN_COUNTRY: 2,
  TIME_POSITION: 3,
  LAST_CONTACT: 4,
  LONGITUDE: 5,
  LATITUDE: 6,
  BARO_ALTITUDE: 7,
  ON_GROUND: 8,
  VELOCITY: 9,
  TRUE_TRACK: 10,
  VERTICAL_RATE: 11,
  GEO_ALTITUDE: 13,
  SQUAWK: 14,
};

function parseState(state) {
  const lat = state[F.LATITUDE];
  const lon = state[F.LONGITUDE];
  if (lat == null || lon == null) return null;

  const altMeters = state[F.BARO_ALTITUDE] ?? state[F.GEO_ALTITUDE] ?? 0;
  const velocity = state[F.VELOCITY];

  return {
    icao24: state[F.ICAO24],
    callsign: (state[F.CALLSIGN] ?? "").trim() || null,
    country: state[F.ORIGIN_COUNTRY] ?? "Unknown",
    lat,
    lon,
    altFeet: Math.round(altMeters * 3.28084),
    altMeters: Math.round(altMeters),
    speedKmh: velocity != null ? Math.round(velocity * 3.6) : null,
    heading: Math.round(state[F.TRUE_TRACK] ?? 0),
    verticalRate: parseFloat((state[F.VERTICAL_RATE] ?? 0).toFixed(1)),
    onGround: state[F.ON_GROUND] ?? false,
    lastContact: state[F.LAST_CONTACT],
    squawk: state[F.SQUAWK] ?? null,
  };
}

// GET /api/flights
app.get("/api/flights", async (req, res) => {
  const { lamin, lomin, lamax, lomax } = req.query;
  const cacheKey =
    lamin && lomin && lamax && lomax
      ? `bbox_${lamin}_${lomin}_${lamax}_${lomax}`
      : "global";

  const cached = flightCache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const params = {};
    if (lamin) params.lamin = parseFloat(lamin);
    if (lomin) params.lomin = parseFloat(lomin);
    if (lamax) params.lamax = parseFloat(lamax);
    if (lomax) params.lomax = parseFloat(lomax);

    const axiosConfig = { params, timeout: 12000 };
    if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
      axiosConfig.auth = {
        username: process.env.OPENSKY_USERNAME,
        password: process.env.OPENSKY_PASSWORD,
      };
    }

    const { data } = await axios.get(
      "https://opensky-network.org/api/states/all",
      axiosConfig
    );

    if (!data || !data.states) {
      return res.json({ flights: [], timestamp: Date.now(), total: 0 });
    }

    const flights = data.states
      .map(parseState)
      .filter(Boolean)
      .filter((f) => !f.onGround);

    const result = { flights, timestamp: data.time * 1000, total: flights.length, cached: false };
    flightCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error("OpenSky error:", err.message);
    const stale = flightCache.get(cacheKey);
    if (stale) return res.json({ ...stale, stale: true });
    const status = err.response?.status || 500;
    if (status === 429) return res.status(429).json({ error: "OpenSky rate limit reached." });
    res.status(502).json({ error: "Failed to fetch flight data." });
  }
});

// GET /api/flights/:icao24
app.get("/api/flights/:icao24", (req, res) => {
  const { icao24 } = req.params;
  for (const key of flightCache.keys()) {
    const data = flightCache.get(key);
    const match = data?.flights?.find(
      (f) => f.icao24.toLowerCase() === icao24.toLowerCase()
    );
    if (match) return res.json(match);
  }
  res.status(404).json({ error: "Aircraft not found." });
});

// GET /api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()), cache: flightCache.getStats() });
});

app.listen(PORT, () => {
  console.log(`✈  OpenSky Backend running on http://localhost:${PORT}`);
});
