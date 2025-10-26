import { query } from '@/lib/db';

const ALLOWED_UPDATE_FIELDS = Object.freeze([
  'crop_name',
  'crop_variety',
  'planting_area',
  'planting_date',
  'harvest_date',
  'expected_yield',
  'yield_unit',
  'status',
]) as readonly string[];

const ALLOWED_TEMPLATE_UPDATE_FIELDS = Object.freeze([
  'name',
  'description',
  'category',
  'technical_specs',
  'financial_projections',
  'growing_requirements',
  'market_info',
  'is_public',
]) as readonly string[];

export const cropRepository = {
  async getAll() {
    const result = await query('SELECT * FROM crops');
    return result.rows;
  },

  async getSuggestions(province?: string, town?: string) {
    let baseQuery = 'SELECT * FROM crops';
    const whereClauses = [];
    const params = [];
    let paramIndex = 1;

    if (province) {
      whereClauses.push(`province = $${paramIndex++}`);
      params.push(province);
    }

    if (town) {
      whereClauses.push(`town = $${paramIndex++}`);
      params.push(town);
    }

    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    const result = await query(baseQuery, params);
    return result.rows;
  },

  async getAllPlans(farmPlanId?: string, status?: string) {
    let queryText = `
      SELECT
        cp.*,
        fp.name as farm_plan_name,
        COUNT(DISTINCT fd.id) as financial_data_count,
        COUNT(DISTINCT t.id) as task_count
      FROM crop_plans cp
      JOIN farm_plans fp ON cp.farm_plan_id = fp.id
      LEFT JOIN financial_data fd ON cp.id = fd.crop_plan_id
      LEFT JOIN tasks t ON cp.id = t.crop_plan_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (farmPlanId) {
      queryText += ` AND cp.farm_plan_id = $${paramIndex}`;
      params.push(farmPlanId);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND cp.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    queryText += ' GROUP BY cp.id, fp.name ORDER BY cp.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  },

  async createPlan(planData: any) {
    const {
      farm_plan_id,
      crop_name,
      crop_variety,
      planting_area,
      planting_date,
      harvest_date,
      expected_yield,
      yield_unit,
      status,
    } = planData;

    const queryText = `
      INSERT INTO crop_plans (
        farm_plan_id, crop_name, crop_variety, planting_area,
        planting_date, harvest_date, expected_yield, yield_unit, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const params = [
      farm_plan_id,
      crop_name,
      crop_variety || null,
      planting_area,
      planting_date || null,
      harvest_date || null,
      expected_yield || null,
      yield_unit || null,
      status || 'planned',
    ];

    const result = await query(queryText, params);
    return result.rows[0];
  },

  async updatePlan(id: string, updates: any) {
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`);
        params.push(updates[field]);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    params.push(id);
    const queryText = `
      UPDATE crop_plans
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(queryText, params);
    return result.rows[0];
  },

  async deletePlan(id: string) {
    const result = await query('DELETE FROM crop_plans WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },

  async getHistory(farmPlanId: string) {
    const result = await query(
      'SELECT * FROM crop_plans WHERE farm_plan_id = $1 ORDER BY created_at DESC',
      [farmPlanId]
    );
    return result.rows;
  },

  async getAllTemplates(category?: string, isPublic?: string) {
    let queryText = `
      SELECT * FROM crop_templates
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (isPublic !== null && isPublic !== undefined) {
      queryText += ` AND is_public = $${paramIndex}`;
      params.push(isPublic === 'true');
      paramIndex++;
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, params);
    return result.rows;
  },

  async createTemplate(templateData: any) {
    const {
      name,
      description,
      category,
      technical_specs,
      financial_projections,
      growing_requirements,
      market_info,
      is_public,
      created_by,
    } = templateData;

    const queryText = `
      INSERT INTO crop_templates (
        name, description, category, technical_specs,
        financial_projections, growing_requirements, market_info,
        is_public, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const params = [
      name,
      description || null,
      category || null,
      technical_specs ? JSON.stringify(technical_specs) : null,
      financial_projections ? JSON.stringify(financial_projections) : null,
      growing_requirements ? JSON.stringify(growing_requirements) : null,
      market_info ? JSON.stringify(market_info) : null,
      is_public !== undefined ? is_public : true,
      created_by || null,
    ];

    const result = await query(queryText, params);
    return result.rows[0];
  },

  async updateTemplate(id: string, updates: any) {
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const jsonFields = [
      'technical_specs',
      'financial_projections',
      'growing_requirements',
      'market_info',
    ];

    ALLOWED_TEMPLATE_UPDATE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) {
        if (jsonFields.includes(field) && updates[field] !== null) {
          setClauses.push(`${field} = $${paramIndex}`);
          params.push(JSON.stringify(updates[field]));
        } else {
          setClauses.push(`${field} = $${paramIndex}`);
          params.push(updates[field]);
        }
        paramIndex++;
      }
    });

    if (setClauses.length === 0) {
      return null;
    }

    params.push(id);
    const queryText = `
      UPDATE crop_templates
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(queryText, params);
    return result.rows[0];
  },

  async deleteTemplate(id: string) {
    const result = await query('DELETE FROM crop_templates WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
};
