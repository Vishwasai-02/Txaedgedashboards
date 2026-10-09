# TaxEdge Enterprise Dashboard System (Frontend Suite)

Production-ready implementation of the complete **TaxEdge Dashboard system** (Frontend Suite) following the **Advanced Modular Monolith architecture**, fixed folder structure, strict external CSS co-location, strict `< 500 lines` per file, and the official TaxEdge color system.

---

## 1. System Structure

```text
Taxedge dashboard/
├── admin-dashboard/       # React.js Admin Dashboard Application
├── staff-dashboard/       # React.js Staff Dashboard Application (Manager + Agent roles)
└── package.json           # Root convenience scripts
```

---

## 2. Key Architecture Standards Implemented

- **Advanced Modular Monolith:** Divided into independent business modules (`overview`, `employees`, `applications`, `customers`, `revenue`, `reports`, `communication`, `notifications`, `manager`, `agent`).
- **External CSS Co-Location:** Every single component has its matching `.css` file next to its `.jsx` file (e.g. `Button.jsx` + `Button.css`, `AgentPicker.jsx` + `AgentPicker.css`). Zero inline styles (`style={{}}`), zero internal CSS.
- **Strict File Size:** Every non-CSS file (`.jsx`, `.js`) contains strictly fewer than 500 lines.
- **TaxEdge Color Identity:**
  - Primary Navy: `#083B75`
  - Primary Blue: `#0B5ED7`
  - Primary Orange: `#F97316`
  - Background: `#F7F9FC`
  - Surface: `#FFFFFF`
  - Text: `#172033` (Primary), `#64748B` (Secondary), `#94A3B8` (Muted)
  - Semantic: `#16A34A` (Success), `#059669` (Feature Success), `#DC2626` (Error), `#F59E0B` (Warning)
  - Approved Service Header Gradient: `#061933` → `#083B75` → `#0C4A94`
  - Documented Dark Mode support.
- **Application-Centric Tracking:** `Customer → Application (APP-xxx) → Service → Documents → Tasks → Payment → Certificate → Status`.
- **Standalone Frontend Execution:** Pre-configured mock data services allow full interactive functionality out-of-the-box with zero external backend dependencies.

---

## 3. How to Run the Dashboards

### Install Dependencies (if not already installed)
```bash
# In admin-dashboard
cd admin-dashboard && npm install

# In staff-dashboard
cd ../staff-dashboard && npm install
```

### Launch Dashboards

```bash
# From the workspace root:
npm run dev:admin    # Admin Dashboard on http://localhost:3000
npm run dev:staff    # Staff Dashboard on http://localhost:3001
```

---

## 4. Accounts & Credentials for Live Testing

### Admin Dashboard
- **Email:** `admin@taxedge.in`
- **Password:** `Taxedge@2026`
- **Role:** `ADMIN`

### Staff Dashboard
- **Manager Email:** `manager@taxedge.in`
- **Agent Email:** `agent@taxedge.in`
- **Password:** `Staff@2026`
- *Tip:* Use the **"Switch Mode"** button in the Topbar to toggle between Manager and Agent views in real-time.
