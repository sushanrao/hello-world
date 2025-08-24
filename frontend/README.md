# Edge to Cloud Frontend

A React + Vite web UI for submitting RPOC parameters from an edge device to a gateway API and embedding a Grafana dashboard for visualization.

## Prerequisites
- Node 18+ (Node 20 recommended)
- A running edge gateway API exposing `POST /api/edge/rpoc`
- A reachable Grafana instance and dashboard URL

## Quick start
```bash
# 1) Configure environment
cp .env.example .env
# edit .env to set VITE_API_BASE_URL and VITE_GRAFANA_URL

# 2) Install deps and run
npm install
npm run dev
# open http://localhost:5173
```

## Build
```bash
npm run build
npm run preview
```

## Docker
```bash
# build image
docker build -t edge-frontend:latest .
# run container
docker run --rm -p 8080:80 \
  -e VITE_API_BASE_URL=http://host.docker.internal:8081 \
  -e VITE_GRAFANA_URL=http://host.docker.internal:3000/d/uid/example?orgId=1 \
  edge-frontend:latest
```

Note: Vite inlines envs at build-time. If you need to change URLs at runtime behind nginx, consider templating `index.html` in the container or proxying requests at a gateway layer.

## Grafana embed tips
- Use a dashboard share link with `kiosk` or `fullscreen` parameters as needed
- If Grafana requires auth, configure anonymous access for the dashboard or place the frontend behind the same SSO/proxy as Grafana
- To filter by device, encode variables in `VITE_GRAFANA_URL`, e.g. `var-device=edge-001`