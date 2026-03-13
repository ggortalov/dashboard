# StyleSeat Guardian

StyleSeat's internal test management platform built to support the QA workflows and quality standards of the StyleSeat engineering team. Guardian provides a centralized hub for organizing test suites, authoring test cases, executing test runs, and tracking results — all tailored to how StyleSeat ships software.

## Features

- **Project Management** — Organize testing efforts across StyleSeat projects and initiatives
- **Test Suites & Sections** — Structure test cases into suites with a hierarchical section tree that mirrors product areas
- **Test Cases** — Author cases with type, priority, preconditions, and step-by-step instructions for consistent coverage across the team
- **Test Runs & Execution** — Launch runs from suites, execute cases one by one with status tracking (Passed / Failed / Blocked / Retest / Untested)
- **Dashboard & Charts** — Global and per-project dashboards with doughnut charts for real-time quality visibility
- **User Authentication** — JWT-based auth with registration, login, and avatar upload
- **Responsive Design** — Collapsible sidebar, mobile hamburger menu, DM Sans typography, animated UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Axios, Chart.js, Vite 7 |
| Backend | Flask 3.1, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Limiter |
| Database | SQLite |
| Testing | Vitest, React Testing Library (frontend); pytest (backend) |

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                 # Populate demo data (first time only)
python run.py                  # Starts on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm run dev                    # Starts on http://localhost:5173
```

### Demo Credentials

```
Username: demo
Password: demo123
```

## Project Structure

```
dashboard/
├── backend/                   # Flask REST API (port 5001)
│   ├── app/
│   │   ├── __init__.py        # App factory, extensions, blueprint registration
│   │   ├── models.py          # SQLAlchemy models (User, Project, Suite, Section, TestCase, TestRun, TestResult, ResultHistory)
│   │   └── routes/            # API route blueprints
│   │       ├── auth.py        # Register, login, avatar upload
│   │       ├── projects.py    # Project CRUD + stats
│   │       ├── suites.py      # Suite CRUD (scoped to project)
│   │       ├── sections.py    # Section CRUD (hierarchical tree)
│   │       ├── test_cases.py  # Test case CRUD
│   │       ├── test_runs.py   # Run CRUD + result management
│   │       └── dashboard.py   # Aggregated statistics
│   ├── config.py              # App configuration
│   ├── run.py                 # Entry point
│   ├── seed.py                # Demo data seeder
│   └── requirements.txt
│
├── frontend/                  # React SPA (port 5173)
│   └── src/
│       ├── App.jsx            # Routes and layout
│       ├── context/           # AuthContext (JWT state management)
│       ├── services/          # API service layer (Axios wrappers)
│       ├── components/        # Reusable UI components
│       └── pages/             # Page components
│
└── CLAUDE.md                  # Detailed architecture reference
```

## API Overview

All endpoints (except login/register) require a JWT Bearer token.

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/avatar` |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `GET /api/projects/:id/stats` |
| Suites | `GET/POST /api/projects/:pid/suites`, `GET/PUT/DELETE /api/suites/:id` |
| Sections | `GET/POST /api/suites/:sid/sections`, `PUT/DELETE /api/sections/:id` |
| Test Cases | `GET /api/sections/:sid/cases`, `GET /api/suites/:sid/cases`, `POST/GET/PUT/DELETE /api/cases/:id` |
| Test Runs | `GET/POST /api/projects/:pid/runs`, `GET/PUT/DELETE /api/runs/:id`, `GET /api/runs/:id/results` |
| Results | `GET/PUT /api/results/:id`, `GET /api/results/:id/history` |
| Dashboard | `GET /api/dashboard`, `GET /api/projects/:pid/dashboard` |

## Database Schema

Eight SQLite tables with cascade deletes:

- **users** — credentials + avatar
- **projects** — top-level containers
- **suites** — test suite per project
- **sections** — hierarchical tree within a suite (self-referential `parent_id`)
- **test_cases** — cases with steps stored as JSON
- **test_runs** — run instances linked to a suite
- **test_results** — one result per case per run (Passed/Failed/Blocked/Retest/Untested)
- **result_history** — audit log of every status change

## Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
source venv/bin/activate
pytest
```

## Building for Production

```bash
cd frontend
npm run build        # Output in dist/
```

## Configuration

| Setting | Default | Location |
|---------|---------|----------|
| Backend port | 5001 | `backend/run.py` |
| Frontend dev port | 5173 | Vite default |
| Database | `backend/app.db` (SQLite) | `backend/config.py` |
| JWT token expiry | Configured in `config.py` | `backend/config.py` |
| Avatar upload limit | 2 MB, JPEG/PNG only | `backend/config.py` |
| CORS origins | `localhost:5173`, `127.0.0.1:5173` | `backend/app/__init__.py` |

## License

Internal StyleSeat project. Not for external distribution.