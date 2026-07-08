import cron from 'node-cron';
import { apiService } from './apiService.js';
import { scoringService } from './scoringService.js';
import { fantasyModel } from '../models/fantasyModel.js';
import { query } from '../config/database.js';
import { emit } from '../sockets/index.js';

// Every 5 minutes during matches
export const startCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const { rows: tracked } = await query(
        `SELECT DISTINCT fs.match_external_id, fs.fantasy_player_id, fp.position
         FROM fantasy_scoring fs
         JOIN fantasy_players fp ON fp.id = fs.fantasy_player_id
         WHERE fs.created_at > NOW() - INTERVAL '3 hours'`
      );
      // In production: iterate, fetch fresh stats, compute delta, apply points
      // emit('fantasy:update', {...});
    } catch (e) { /* logged in scoringService */ }
  });

  // Weekly reset every Monday 00:00
  cron.schedule('0 0 * * 1', async () => {
    await scoringService.weeklyReset();
  });
};