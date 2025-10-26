import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const userRepository = {
  async findByEmail(email: string) {
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async create(userData: any) {
    const { name, email, password } = userData;
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, auth_provider)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, 'user', 'credentials']
    );
    return result.rows[0];
  }
};
