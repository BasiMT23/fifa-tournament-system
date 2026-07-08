⚽ FIFA Tournament Management System
A full-stack platform for organizing FIFA tournaments with bracket prediction and fantasy football mini-games.

✨ Features
🔐 JWT auth with RBAC (Admin / Organizer / Player) + refresh tokens
🏆 Tournament CRUD with 3 formats (knockout, round-robin, hybrid)
🌳 Auto-generated seeded brackets with visualization
🔮 Bracket prediction game with weighted scoring + leaderboard
🎯 Fantasy football with weekly scoring & standings
⚡ Real-time updates via Socket.io (scores, chat, notifications)
💬 Match comments / trash talk system
🔗 Integrations: Zafronix, SportScore, SoFIFA, football-data.org
📊 Player stats & leaderboards
🧰 Extras: Swagger docs, Redis caching, rate limiting, Winston logging, Jest tests, Docker
🛠 Tech Stack
Backend: Node.js, Express, PostgreSQL, Redis, Socket.io, JWT, Joi, Winston, HelmetFrontend: React 18, Vite, Zustand, React Router, Socket.io-client, AxiosInfra: Docker Compose, GitHub Actions (optional CI)

🚀 Quick Start
Prerequisites
Node 18+, PostgreSQL 16, Redis 7 (or just Docker)
1. Clone & install
git clone https://github.com/yourname/fifa-tournament-systemcd fifa-tournament-system
2. Spin up infra with Docker
docker compose up -d db redis
3. Backend
cd backendcp .env.example .env   # edit secretsnpm installnpm run migrate        # runs schema.sqlnpm run dev            # http://localhost:5000
4. Frontend
cd frontendnpm installnpm run dev            # http://localhost:5173
🔑 Environment Variables
See backend/.env.example. Critical ones:

JWT_SECRET, JWT_REFRESH_SECRET — strong random strings
DB_* — Postgres credentials
REDIS_URL — Redis connection string
FOOTBALL_DATA_API_KEY — from https://www.football-data.org/
📂 Project Structure
See tree in repo root — strict MVC: routes → controllers → models/services.

🗄 Database Schema
Full DDL lives at backend/src/db/schema.sql. Run via npm run migrate.

ER overview:

users ──< tournament_participants >── tournamentsusers ──< predictions >── tournamentstournaments ──< matches ──< match_statsusers ──< fantasy_teams ──< fantasy_team_players >── fantasy_playersfantasy_players ──< fantasy_scoringmatches ──< match_comments
📡 API Documentation
Swagger UI available at http://localhost:5000/api/docs once backend is running.

Key Endpoints
Method	Path	Description	Auth
POST	/api/auth/register	Create account	Public
POST	/api/auth/login	Get tokens	Public
POST	/api/auth/refresh	Refresh access token	Public
GET	/api/tournaments	List tournaments	Public
POST	/api/tournaments	Create tournament	Org/Admin
POST	/api/tournaments/:id/bracket	Generate bracket	Org/Admin
GET	/api/tournaments/:id/matches	List matches	Public
POST	/api/matches/:id/score	Report score	Org/Admin
POST	/api/predictions	Submit prediction	Player
GET	/api/predictions/mine/:tournamentId	My predictions only	Player
GET	/api/predictions/:tournamentId/leaderboard	Global leaderboard	Public
POST	/api/fantasy/team	Create fantasy team	Player
POST	/api/fantasy/:tournamentId/players	Add player to roster	Player
GET	/api/fantasy/:tournamentId/standings	Fantasy standings	Public
GET	/api/matches/:id/comments	Get match chat	Public
POST	/api/matches/:id/comments	Post comment	Player
🎯 Beyond Course Scope
✅ Redis caching with graceful in-memory fallback
✅ Swagger/OpenAPI documentation
✅ Jest unit tests for bracket algorithm
✅ Docker Compose for one-command setup
✅ Winston structured logging with file rotation
✅ Email service stub (Nodemailer)
✅ Multer for avatar uploads
✅ Graceful shutdown & rate limiting
📦 Deployment
Render
Create Postgres + Redis add-ons
Create web service from backend/, build command npm install, start npm start
Create static site from frontend/, build npm run build, publish dist/
Heroku
heroku create fifa-tournament-apiheroku addons:create heroku-postgresql:hobby-devheroku addons:create heroku-redis:hobby-devgit push heroku main
🧪 Testing
cd backend && npm test