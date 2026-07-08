⚽ FIFA Tournament Management System
A comprehensive, full-stack platform for organizing FIFA tournaments with automated bracket generation, a bracket prediction game, and a live fantasy football league. Built with the MERN-ish stack (Node.js, Express, React, PostgreSQL) featuring real-time updates via WebSockets.

✨ Key Features
JWT Authentication & RBAC: Secure login with refresh tokens and Role-Based Access Control (admin, organizer, player).
Tournament Management: Create and manage Knockout, Round-Robin, and Hybrid tournaments.
Automated Bracket Generation: Standard seeding algorithm (1v16, 2v15) with automatic winner progression and bye-handling.
Bracket Guessing Game: Users predict knockout outcomes. Earn points with round-by-round weighting (R16=1pt, QF=2pts, SF=4pts, Final=8pts) + upset bonuses.
Fantasy Football Game: Draft real players, earn points based on live performances (goals, assists, clean sheets), and compete on weekly leaderboards.
Real-Time Updates: Live score updates, auto-updating brackets, and a match chat/trash-talk system via Socket.io.
External API Integrations: Caching and rate-limit handling for Zafronix (Historical Data), SportScore (Live Scores), SoFIFA (Player Ratings), and football-data.org.
Production-Ready: Redis caching, Winston logging, Swagger API docs, rate limiting, and Jest tests.
🛠 Tech Stack
Backend: Node.js, Express, PostgreSQL, Redis, Socket.io, JWT, Joi, Winston, Helmet, JestFrontend: React 18, Vite, Zustand, React Router, Socket.io-client, AxiosInfrastructure: Docker, Docker Compose

📂 Project Structure
fifa-tournament-system/├── backend/│   ├── src/│   │   ├── config/            # DB, Env, and Logger setup│   │   ├── controllers/       # Business logic (auth, tournaments, matches, etc.)│   │   ├── middleware/        # Auth, RBAC, Error handling, Rate limiting, Validation│   │   ├── models/            # PostgreSQL queries (query-first pattern)│   │   ├── routes/            # Express route definitions│   │   ├── services/          # Bracket logic, Scoring, APIs, Cron jobs, Emails│   │   ├── sockets/           # Socket.io server setup│   │   ├── utils/             # JWT helpers, API response formatter│   │   ├── db/                # SQL schema│   │   ├── app.js             # Express app config│   │   └── server.js          # HTTP & Socket server entry point│   ├── logs/│   ├── tests/│   ├── .env.example│   └── package.json├── frontend/│   ├── src/│   │   ├── components/        # Reusable UI (Bracket, MatchCard, Navbar, Leaderboard)│   │   ├── pages/             # Route screens (Login, Dashboard, Tournaments, Fantasy)│   │   ├── services/          # Axios instance & Socket client│   │   ├── hooks/             # Custom React hooks (useAuth, useTournament)│   │   ├── utils/             # Helper functions│   │   ├── App.jsx            # Main routing setup│   │   └── main.jsx           # React DOM root│   ├── public/                # Static assets (favicon)│   ├── package.json│   └── vite.config.js         # Vite & Proxy config├── docker-compose.yml└── README.md
🚀 Getting Started
Prerequisites
Node.js v18+
PostgreSQL v14+
Redis v6+ (Optional, falls back to in-memory cache if missing)
Or just use Docker
1. Environment Setup
Copy the example environment files and fill in your credentials:

cd backendcp .env.example .env# Edit .env with your DB credentials, JWT secrets, and API keyscd ../frontendcp .env.example .env# Edit .env if your backend runs on a port other than 5000
2. Database Setup
Create a PostgreSQL database named fifa_tournament and run the schema script:

# Using psqlcreatedb fifa_tournamentpsql -d fifa_tournament -f backend/src/db/schema.sql
3. Installation & Running (Manual)
Backend:

cd backendnpm installnpm run dev   # Starts on http://localhost:5000
Frontend:

cd frontendnpm installnpm run dev   # Starts on http://localhost:5173
4. Using Docker (Recommended)
Spin up the database, Redis, backend, and frontend in one command:

docker-compose up --build
(Note: Ensure your backend/.env points to db and redis as hostnames if using Docker).

🗄 Database Schema
The schema uses a normalized 3NF relational design. The core relationships are:

users join tournaments via tournament_participants.
matches are self-referencing via next_match_id to form a bracket tree.
predictions and fantasy_teams link users to their respective game data.
The complete DDL is available at backend/src/db/schema.sql.

📡 API Endpoints
All endpoints are prefixed with /api. Authentication requires sending a Authorization: Bearer <token> header.

Method	Endpoint	Description	Access
POST	/api/auth/register	Register a new user	Public
POST	/api/auth/login	Login & get JWT tokens	Public
POST	/api/auth/refresh	Refresh access token	Public
GET	/api/tournaments	List all tournaments	Public
POST	/api/tournaments	Create a tournament	Org/Admin
POST	/api/tournaments/:id/bracket	Generate tournament bracket	Org/Admin
GET	/api/tournaments/:id/matches	View tournament bracket/matches	Public
POST	/api/matches/:id/score	Report match score	Org/Admin
POST	/api/predictions	Submit a bracket prediction	Player
GET	/api/predictions/:id/leaderboard	View prediction leaderboard	Public
POST	/api/fantasy/team	Create fantasy team	Player
POST	/api/fantasy/:id/players	Draft player to fantasy team	Player
GET	/api/matches/:id/comments	Get match chat	Public
POST	/api/matches/:id/comments	Post match comment/trash talk	Player
(Full Swagger UI documentation is available at /api/docs when running the backend in development mode).

⚡ Real-Time Events (Socket.io)
The frontend connects to the backend via Socket.io. Key events include:

match:completed: Broadcasts final score and winner.
bracket:update: Triggers frontend refetch of the bracket tree.
comment:new: Pushes new chat messages to all users viewing the match.
fantasy:update: Pushes live point updates to fantasy team owners.
🔗 External API Integrations
This system safely integrates with free APIs by caching responses in Redis and enforcing rate limits:

Zafronix World Cup API: Historical data for bracket guessing (1k req/day limit).
SportScore API: Live match stats for fantasy football auto-scoring.
SoFIFA API: Player attributes and ratings for fantasy drafting.
football-data.org: Major league fixtures and data.
🧪 Testing
Backend tests are written with Jest.

cd backendnpm test
🏗 Deployment
The application is containerized and ready for deployment on Render, Heroku, or AWS.

Frontend: Build static assets (npm run build) and serve via Nginx/Netlify/Vercel.
Backend: Deploy as a Node web service. Ensure Postgres and Redis add-ons are attached.
Ensure environment variables (NODE_ENV=production, DB URLs, etc.) are set in your hosting provider's dashboard.