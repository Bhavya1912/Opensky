# ✈ OpenSky Flight Tracker

A production-ready, real-time flight tracking application built on 100% free and open data sources.

**Live aircraft positions · 8-second refresh · Zero cost**

---

## Architecture

```
Browser (React + Leaflet)
        │  /api/*
        ▼
Node.js / Express Backend
  · 8s cache (NodeCache)
  · Rate limiter
  · Data normalisation
        │  HTTPS
        ▼
OpenSky Network REST API
https://opensky-network.org/api/states/all
```

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18 + Vite         |
| Map       | Leaflet + react-leaflet |
| Tiles     | OpenStreetMap (free)    |
| Backend   | Node.js + Express       |
| Cache     | node-cache (in-memory)  |
| Data      | OpenSky Network (free)  |
| Deploy    | Vercel + Render (free)  |

---

## Project Structure

```
opensky-flight-tracker/
├── backend/
│   ├── server.js           # Express proxy, cache, normalisation
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── FlightMap.jsx
│       │   ├── FlightPanel.jsx
│       │   └── StatusComponents.jsx
│       ├── hooks/
│       │   └── useFlights.js
│       └── utils/
│           └── format.js
├── docker-compose.yml
├── render.yaml
├── package.json
└── README.md
```

---

## Quick Start

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

Open http://localhost:5173

### Option B — Manual

```bash
# Install dependencies
npm install
npm run install:all

# Configure backend
cp backend/.env.example backend/.env

# Start both servers
npm run dev
```

- Frontend: http://localhost:5173  
- Backend:  http://localhost:3001

---

## API Endpoints

| Method | Path                  | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | /api/flights          | All airborne flights               |
| GET    | /api/flights/:icao24  | Single aircraft from cache         |
| GET    | /api/health           | Health check + cache stats         |

### Optional bounding box query params

```
GET /api/flights?lamin=8&lomin=68&lamax=37&lomax=97
```

| Region   | lamin | lomin | lamax | lomax |
|----------|-------|-------|-------|-------|
| India    | 8     | 68    | 37    | 97    |
| Europe   | 35    | -10   | 71    | 40    |
| USA      | 24    | -125  | 49    | -66   |

---

## Deployment (Free Tier)

### Backend → Render.com

1. Push repo to GitHub
2. New Web Service on Render → connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Set env var `FRONTEND_URL` to your Vercel URL

Or use `render.yaml` (Blueprint deploy).

### Frontend → Vercel

1. Import repo on Vercel
2. Root directory: `frontend`
3. Edit `vercel.json` → replace backend URL with your Render URL
4. Deploy

---

## OpenSky Credentials (Optional)

Unauthenticated calls: ~1 request per 10 seconds globally.  
Free account gives 4000 API credits/day — register at https://opensky-network.org

Add to `backend/.env`:
```
OPENSKY_USERNAME=your_username
OPENSKY_PASSWORD=your_password
```

---

## License

MIT
