import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Setup transporter (uses env vars if in production, otherwise falls back to Ethereal for dev)
const transporter = nodemailer.createTransport({
  host: env.smtpHost || 'smtp.ethereal.email',
  port: env.smtpPort || 587,
  auth: {
    user: env.smtpUser || 'test@ethereal.email',
    pass: env.smtpPass || 'testpassword'
  }
});

export const emailService = {
  async sendWelcomeEmail(user) {
    try {
      const info = await transporter.sendMail({
        from: '"FIFA Tournament System" <no-reply@fifasys.com>',
        to: user.email,
        subject: 'Welcome to the Tournament System!',
        text: `Hi ${user.username}, welcome to the platform. Start predicting brackets now!`,
        html: `<b>Hi ${user.username}</b>, welcome to the platform. Start predicting brackets now!`
      });
      logger.info(`Email sent: ${info.messageId}`);
    } catch (err) {
      logger.error(`Email send failed: ${err.message}`);
    }
  },
  
  async sendMatchNotification(user, matchDetails) {
    // Implementation for match starting soon...
  }
};