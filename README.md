# Agri-Biotech Management and Farmer Advisory System (MERN)

A role-based platform connecting admins, agricultural experts / field officers and farmers: crop varieties, disease surveillance, field observations, biotechnology recommendations, farmer problem reports and advisories.

## Tech stack
MongoDB + Mongoose · Express.js · React 18 (Vite, React Router, Context API, Axios, Recharts) · Node.js · JWT · bcryptjs · Multer · plain responsive CSS.

## Architecture
React SPA (`client`, port 5173) → Vite proxy `/api` and `/uploads` → Express REST API (`server`, port 5000) → MongoDB.
The server uses a generic CRUD controller (`controllers/crudFactory.js`) configured per resource in `routes/resources.js` (roles, search fields, filters, ownership scopes). The client mirrors this with a reusable `ResourcePage` + `ResourceForm`.

## Folder structure
```
agri-biotech-system/
├── client/src/{components,pages,layouts,context,services,hooks,utils}, App.jsx, main.jsx
├── server/{config,controllers,middleware,models,routes,services,uploads,utils}, server.js
├── .env.example  .gitignore  package.json  README.md
```

## Setup
1. Install Node.js 18+ and MongoDB Community (running on `mongodb://127.0.0.1:27017`) — or create a free MongoDB Atlas cluster and put its URI in `MONGO_URI`.
2. `server/.env` is already provided (copy of `.env.example`). Variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `CLIENT_URL`. **Change `JWT_SECRET` for any real deployment.**
3. From the project root:
```bash
npm run setup      # installs root, server and client dependencies
npm run seed       # loads sample data (clears existing data!)
npm run dev        # starts API (5000) and React app (5173) together
```
Run separately if you prefer: `npm run server` and `npm run client`.
Open **http://localhost:5173**. API health check: http://localhost:5000/api/health

Production-style: `npm run build` then `npm start` — Express serves `client/dist` at http://localhost:5000.

## Demo credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@agri.com | Admin@123 |
| Expert | expert1@agri.com / expert2@agri.com | Expert@123 |
| Farmer | farmer1@agri.com / farmer2@agri.com / farmer3@agri.com | Farmer@123 |

## Features
- Register / login / logout, JWT persisted in localStorage, bcrypt hashing, protected routes, role-based API authorization and role-specific dashboards (cards, charts, lists from real DB data).
- Crop varieties, disease surveillance (with stats and charts), field observations (GPS capture), recommendations, advisories (Pending / In Progress / Resolved), farmer problems.
- Experts review farmer problems and click **Advise** to create an advisory; the problem status becomes *Advisory Issued*.
- Image upload (JPG/PNG/WEBP, ≤5 MB, ≤5 files, random server-side filenames).
- Global search (navbar) and per-module search, filters, date ranges and pagination.

## Permissions
| Resource | Admin | Expert | Farmer |
|---|---|---|---|
| Users | full | – | – |
| Crops, Diseases, Recommendations | full | full | read |
| Observations | full | full | – |
| Advisories | full | full | read own |
| Problems | read/update/delete | read/update + advise | create, read/edit(while Open)/delete own |

Self-registration allows the *farmer* and *expert* roles only; admin accounts are created by seed or by an admin.

## API (all under `/api`, `Authorization: Bearer <token>`)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET|POST /users`, `GET|PUT|DELETE /users/:id`, `GET /users/farmers`
- `GET|POST /crops`, `GET|PUT|DELETE /crops/:id` — same pattern for `/diseases`, `/observations`, `/recommendations`, `/advisories`, `/problems`
- List query params: `q`, `page`, `limit`, plus filters (`category`, `season`, `crop`, `severity`, `status`, `location`, `priority`, `plantHealth`, `method`, `from`, `to`)
- `GET /dashboard`, `GET /dashboard/diseases`, `GET /search?q=`
- Create/update on crops, diseases, observations, problems accept `multipart/form-data` with `images`.

## Notes
- `bcryptjs` (pure JS bcrypt) is used instead of native `bcrypt` to avoid Windows build problems.
- Crop / variety are stored as text on other modules (with crop-name suggestions from the catalogue).
- Recommendations are presented as agricultural guidance, not guaranteed outcomes.

## Future enhancements
Email/SMS notifications, map view of disease reports, refresh tokens, rate limiting, PDF reports, multilingual UI, offline field forms, automated tests.
