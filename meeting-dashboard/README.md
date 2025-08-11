# Global Operations Dashboard (Meeting-Ready)

Sponsor: VP, India

This is a zero-install, single-page dashboard you can open directly in a browser. It supports editable, drag-and-drop widgets with per-view persistence (department + country/region) using localStorage.

How to use
- Open `index.html` in your browser (Chrome or Edge recommended).
- Pick a Department and Country/Region from the dropdowns.
- Click "Add widget" to insert KPI, Chart, Table, Notes, Risk, or OKR widgets.
- Drag by the handle (↕) to reorder. Click "Save" to persist.
- Click "Meeting mode" for a clean presentation view; "Fullscreen" for the room.
- Click "Reset view" to return to defaults for the selected view.

Notes
- Data is stored locally in your browser. To share layouts globally, connect this UI to a backend (e.g., Prisma + Postgres) or export/import JSON.
- Default content emphasizes India leadership and cross-functional visibility across Manufacturing, Supply Chain, Engineering, HR, and Country Operations.

Roadmap
- Role-based access (viewer/editor) and governance workflows.
- Real charts via a charting library and live data connectors.
- Backend persistence and SSO.