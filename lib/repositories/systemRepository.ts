import { query } from '@/lib/db';

export const systemRepository = {
  async logChange(logData: any) {
    const {
      target_type,
      target_id,
      user_id,
      user_name,
      action,
      description,
    } = logData;

    await query(
      `INSERT INTO change_log (
        target_type, target_id, user_id, user_name, action, description
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        target_type,
        target_id,
        user_id,
        user_name,
        action,
        description,
      ]
    );
  }
};
