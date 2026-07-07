import { query } from '../config/database.js';
import { logger } from '../config/logger.js';


function standardSeedSlots(n) {
  // n must be power of 2
  let rounds = Math.log2(n);
  let slots = [1, 2];
  for (let r = 1; r < rounds; r++) {
    const next = new Array(slots.length * 2);
    const total = slots.length * 2 + 1;
    for (let i = 0; i < slots.length; i++) {
      next[2 * i]     = slots[i];
      next[2 * i + 1] = total - slots[i];
    }
    slots = next;
  }
  return slots;
}

function nextPow2(n) { return Math.pow(2, Math.ceil(Math.log2(n))); }

export const bracketService = {
 
  async generate(tournament, participants) {
    if (tournament.format === 'round_robin') {
      return this._generateRoundRobin(tournament, participants);
    }

    // Sort by skill_rating desc so seed 1 is strongest
    const sorted = [...participants].sort((a, b) => b.skill_rating - a.skill_rating);

    const n = nextPow2(sorted.length);
    const slots = standardSeedSlots(n);

    // Map seed -> participant (or null for bye)
    const seedMap = {};
    sorted.forEach((p, i) => { seedMap[i + 1] = p; });

    const rounds = Math.log2(n);
    const created = [];

    // Use a transaction — bracket creation must be atomic
    const client = await (await import('../config/database.js')).default.connect();
    try {
      await client.query('BEGIN');

      // Create all empty match slots first
      const matchIds = {}; // matchIds[round][matchNumber] = id
      for (let r = 1; r <= rounds; r++) {
        const matchesInRound = n / Math.pow(2, r);
        matchIds[r] = {};
        for (let m = 1; m <= matchesInRound; m++) {
          const { rows } = await client.query(
            `INSERT INTO matches (tournament_id, round, match_number, status)
             VALUES ($1,$2,$3,'scheduled') RETURNING id`,
            [tournament.id, r, m]
          );
          matchIds[r][m] = rows[0].id;
        }
      }

      // Wire next_match_id pointers
      for (let r = 1; r < rounds; r++) {
        for (let m = 1; m <= n / Math.pow(2, r); m++) {
          const nextMatchNumber = Math.ceil(m / 2);
          await client.query(
            'UPDATE matches SET next_match_id = $1 WHERE id = $2',
            [matchIds[r + 1][nextMatchNumber], matchIds[r][m]]
          );
        }
      }

      // Fill round 1 with seeded participants
      const r1Ids = matchIds[1];
      let mCounter = 1;
      for (let i = 0; i < slots.length; i += 2) {
        const a = seedMap[slots[i]];
        const b = seedMap[slots[i + 1]];
        const matchId = r1Ids[mCounter];
        if (a && !b) {
          // Bye — auto-advance
          await client.query(
            'UPDATE matches SET participant_a_id=$1, winner_id=$2, status=$3 WHERE id=$4',
            [a.user_id, a.user_id, 'walkover', matchId]
          );
          // advance to next round
          const next = await client.query('SELECT next_match_id FROM matches WHERE id=$1', [matchId]);
          if (next.rows[0].next_match_id) {
            const nextSlot = next.rows[0].next_match_id;
            const slotCol = (mCounter % 2 === 1) ? 'participant_a_id' : 'participant_b_id';
            await client.query(`UPDATE matches SET ${slotCol}=$1 WHERE id=$2`, [a.user_id, nextSlot]);
          }
        } else if (a && b) {
          await client.query(
            'UPDATE matches SET participant_a_id=$1, participant_b_id=$2 WHERE id=$3',
            [a.user_id, b.user_id, matchId]
          );
        }
        mCounter++;
      }

      await client.query('UPDATE tournaments SET status=$1 WHERE id=$2', ['active', tournament.id]);
      await client.query('COMMIT');

      const { rows } = await query('SELECT * FROM matches WHERE tournament_id=$1 ORDER BY round,match_number', [tournament.id]);
      logger.info(`Bracket generated for tournament ${tournament.id} (${rows.length} matches)`);
      return rows;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  
  async _generateRoundRobin(tournament, participants) {
    const n = participants.length;
    const rounds = n % 2 === 0 ? n - 1 : n;
    const arr = [...participants];
    if (n % 2 === 1) arr.push(null); // bye

    const fixtures = [];
    const total = arr.length;
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < total / 2; i++) {
        const a = arr[i], b = arr[total - 1 - i];
        if (a && b) fixtures.push({ round: r + 1, a, b });
      }
      // rotate (keep arr[0] fixed)
      arr.splice(1, 0, arr.pop());
    }

    const client = await (await import('../config/database.js')).default.connect();
    try {
      await client.query('BEGIN');
      for (const f of fixtures) {
        await client.query(
          `INSERT INTO matches (tournament_id, round, match_number, participant_a_id, participant_b_id, status)
           VALUES ($1,$2,$3,$4,$5,'scheduled')`,
          [tournament.id, f.round, fixtures.indexOf(f) + 1, f.a.user_id, f.b.user_id]
        );
      }
      await client.query('UPDATE tournaments SET status=$1 WHERE id=$2', ['active', tournament.id]);
      await client.query('COMMIT');
      const { rows } = await query('SELECT * FROM matches WHERE tournament_id=$1', [tournament.id]);
      return rows;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally { client.release(); }
  },

  
  async getBracketTree(tournamentId) {
    const { rows } = await query(
      'SELECT * FROM matches WHERE tournament_id=$1 ORDER BY round, match_number',
      [tournamentId]
    );
    const byRound = {};
    rows.forEach(m => { (byRound[m.round] ||= []).push(m); });
    return { rounds: Object.keys(byRound).map(k => byRound[k]) };
  },
};