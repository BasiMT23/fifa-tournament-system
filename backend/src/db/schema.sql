-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(50)  UNIQUE NOT NULL,
  email           VARCHAR(120) UNIQUE NOT NULL,
  password_hash   TEXT         NOT NULL,
  role            VARCHAR(20)  NOT NULL DEFAULT 'player'
                  CHECK (role IN ('admin','organizer','player')),
  avatar_url      TEXT,
  skill_rating    INT          DEFAULT 1000,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============ TOURNAMENTS ============
CREATE TABLE IF NOT EXISTS tournaments (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  format          VARCHAR(20)  NOT NULL
                  CHECK (format IN ('knockout','round_robin','group_knockout')),
  status          VARCHAR(20)  DEFAULT 'draft'
                  CHECK (status IN ('draft','registration','active','completed','cancelled')),
  max_participants INT         NOT NULL,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  organizer_id    INT          REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id              SERIAL PRIMARY KEY,
  tournament_id   INT          REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id         INT          REFERENCES users(id) ON DELETE CASCADE,
  seed            INT,
  group_name      VARCHAR(5),   -- 'A','B', etc. for group stage
  joined_at       TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (tournament_id, user_id)
);

-- ============ MATCHES ============
CREATE TABLE IF NOT EXISTS matches (
  id              SERIAL PRIMARY KEY,
  tournament_id   INT          REFERENCES tournaments(id) ON DELETE CASCADE,
  round           INT          NOT NULL,           -- 1 = R16, 2 = QF, 3 = SF, 4 = Final
  match_number    INT          NOT NULL,            -- slot within round
  participant_a_id INT         REFERENCES users(id),
  participant_b_id INT         REFERENCES users(id),
  score_a         INT,
  score_b         INT,
  winner_id       INT          REFERENCES users(id),
  status          VARCHAR(20)  DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','live','completed','walkover')),
  next_match_id   INT          REFERENCES matches(id),
  scheduled_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  UNIQUE (tournament_id, round, match_number)
);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_next       ON matches(next_match_id);

CREATE TABLE IF NOT EXISTS match_stats (
  id              SERIAL PRIMARY KEY,
  match_id        INT          REFERENCES matches(id) ON DELETE CASCADE,
  user_id         INT          REFERENCES users(id),
  goals           INT          DEFAULT 0,
  assists         INT          DEFAULT 0,
  yellow_cards    INT          DEFAULT 0,
  red_cards       INT          DEFAULT 0,
  minutes_played INT           DEFAULT 0,
  clean_sheet     BOOLEAN      DEFAULT FALSE,
  UNIQUE (match_id, user_id)
);

-- ============ BRACKET PREDICTIONS ============
CREATE TABLE IF NOT EXISTS predictions (
  id              SERIAL PRIMARY KEY,
  user_id         INT          REFERENCES users(id) ON DELETE CASCADE,
  tournament_id   INT          REFERENCES tournaments(id) ON DELETE CASCADE,
  -- Store predicted winner per round-slot so we can score incrementally
  predicted_winner_id INT      REFERENCES users(id),
  round           INT          NOT NULL,
  match_number    INT          NOT NULL,
  points_earned   INT          DEFAULT 0,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, tournament_id, round, match_number)
);
CREATE INDEX idx_predictions_user ON predictions(user_id);

-- ============ FANTASY ============
CREATE TABLE IF NOT EXISTS fantasy_teams (
  id              SERIAL PRIMARY KEY,
  user_id         INT          REFERENCES users(id) ON DELETE CASCADE,
  tournament_id   INT          REFERENCES tournaments(id) ON DELETE CASCADE,
  team_name       VARCHAR(80)  NOT NULL,
  total_points    INT          DEFAULT 0,
  week_points     INT          DEFAULT 0,
  budget          NUMERIC(10,2) DEFAULT 100.0,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, tournament_id)
);

CREATE TABLE IF NOT EXISTS fantasy_players (
  id              SERIAL PRIMARY KEY,
  external_id     VARCHAR(60)  UNIQUE,        -- from SoFIFA/SportScore
  name            VARCHAR(120) NOT NULL,
  position        VARCHAR(3),
  team            VARCHAR(80),
  rating          INT,
  price           NUMERIC(10,2),
  photo_url       TEXT
);

CREATE TABLE IF NOT EXISTS fantasy_team_players (
  id              SERIAL PRIMARY KEY,
  fantasy_team_id INT          REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  fantasy_player_id INT        REFERENCES fantasy_players(id) ON DELETE CASCADE,
  is_captain      BOOLEAN      DEFAULT FALSE,
  acquired_at     TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (fantasy_team_id, fantasy_player_id)
);

CREATE TABLE IF NOT EXISTS fantasy_scoring (
  id              SERIAL PRIMARY KEY,
  fantasy_player_id INT        REFERENCES fantasy_players(id) ON DELETE CASCADE,
  match_external_id VARCHAR(60),
  gameweek        INT,
  points          INT          NOT NULL,
  breakdown       JSONB,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============ SOCIAL ============
CREATE TABLE IF NOT EXISTS match_comments (
  id              SERIAL PRIMARY KEY,
  match_id        INT          REFERENCES matches(id) ON DELETE CASCADE,
  user_id         INT          REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT         NOT NULL,
  is_trash_talk   BOOLEAN      DEFAULT FALSE,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_ratings (
  id              SERIAL PRIMARY KEY,
  rater_id        INT          REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id   INT          REFERENCES users(id) ON DELETE CASCADE,
  match_id        INT          REFERENCES matches(id) ON DELETE CASCADE,
  rating          INT          CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  UNIQUE (rater_id, rated_user_id, match_id)
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
 $$ LANGUAGE plpgsql;

CREATE TRIGGER users_touch_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();