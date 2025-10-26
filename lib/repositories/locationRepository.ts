import { query } from '@/lib/db';

interface Province {
  id: string;
  name: string;
}

interface Town {
  id: string;
  name: string;
  province_id: string;
}

export const locationRepository = {
  async getProvinces(limit: number, offset: number) {
    const { rows } = await query<Province>(
      'SELECT id, name FROM provinces ORDER BY name LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  },

  async getTowns() {
    const { rows } = await query<Town>(
      'SELECT id, name, province_id FROM towns ORDER BY name'
    );
    return rows;
  }
};
