import { query } from '@/lib/db';

export const communicationRepository = {
  async createNotification(notificationData: any) {
    const {
      user_id,
      type,
      title,
      message,
      priority,
      context_type,
      context_id,
      action_url,
    } = notificationData;

    await query(
      `INSERT INTO notifications (
        user_id, type, title, message, priority, context_type, context_id, action_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        user_id,
        type,
        title,
        message,
        priority || 'medium',
        context_type,
        context_id,
        action_url,
      ]
    );
  }
};
