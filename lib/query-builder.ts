/**
 * Query builder utilities for dynamic SQL operations
 */

export interface UpdateQueryResult {
  query: string
  values: any[]
}

/**
 * Build a dynamic UPDATE query with field validation
 * Prevents SQL injection by validating field names against allowed list
 * 
 * @param tableName - Name of the table to update
 * @param updates - Object containing field names and values to update
 * @param allowedFields - Array of field names that are allowed to be updated
 * @param idField - Name of the ID field (default: 'id')
 * @param idValue - Value of the ID to identify the row to update
 * @param additionalSets - Additional SET clauses to add (e.g., 'updated_at = NOW()')
 * @returns Object containing the query string and values array for parameterized query
 * 
 * @example
 * const result = buildUpdateQuery(
 *   'tasks',
 *   { title: 'New Title', status: 'completed' },
 *   ['title', 'description', 'status'],
 *   'id',
 *   'task-123'
 * )
 * // result.query: 'UPDATE tasks SET title = $1, status = $2, updated_at = $3 WHERE id = $4 RETURNING *'
 * // result.values: ['New Title', 'completed', '2023-10-17T...', 'task-123']
 */
export function buildUpdateQuery(
  tableName: string,
  updates: Record<string, any>,
  allowedFields: readonly string[],
  idField: string = 'id',
  idValue: any,
  additionalSets?: string[]
): UpdateQueryResult {
  if (!tableName) {
    throw new Error('Table name is required')
  }

  if (!idValue) {
    throw new Error('ID value is required')
  }

  const setClauses: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Build SET clauses for allowed fields only
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = $${paramIndex++}`)
      values.push(value)
    }
  }

  // Check if we have any fields to update before proceeding
  if (setClauses.length === 0) {
    throw new Error('No valid fields to update')
  }

  // Add additional SET clauses if provided
  if (additionalSets && additionalSets.length > 0) {
    for (const clause of additionalSets) {
      setClauses.push(clause.replace('$PARAM', `$${paramIndex++}`))
      // If the clause contains a value placeholder, add current timestamp
      if (clause.includes('$PARAM')) {
        values.push(new Date().toISOString())
      }
    }
  }

  // Always update the updated_at timestamp if not already included
  if (!additionalSets?.some(clause => clause.includes('updated_at')) && 
      !setClauses.some(clause => clause.startsWith('updated_at'))) {
    setClauses.push(`updated_at = $${paramIndex++}`)
    values.push(new Date().toISOString())
  }

  // Add ID value at the end
  values.push(idValue)

  const query = `
    UPDATE ${tableName}
    SET ${setClauses.join(', ')}
    WHERE ${idField} = $${paramIndex}
    RETURNING *
  `.trim()

  return { query, values }
}

/**
 * Build a dynamic INSERT query
 * 
 * @param tableName - Name of the table to insert into
 * @param data - Object containing field names and values to insert
 * @param allowedFields - Optional array of field names that are allowed (all if not provided)
 * @returns Object containing the query string and values array for parameterized query
 */
export function buildInsertQuery(
  tableName: string,
  data: Record<string, any>,
  allowedFields?: readonly string[]
): UpdateQueryResult {
  if (!tableName) {
    throw new Error('Table name is required')
  }

  const fields: string[] = []
  const placeholders: string[] = []
  const values: any[] = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(data)) {
    // If allowedFields is provided, check if field is allowed
    if (!allowedFields || allowedFields.includes(key)) {
      fields.push(key)
      placeholders.push(`$${paramIndex++}`)
      values.push(value)
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields to insert')
  }

  const query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `.trim()

  return { query, values }
}

/**
 * Build a dynamic WHERE clause for SELECT queries
 * 
 * @param filters - Object containing field names and values for filtering
 * @param allowedFields - Array of field names that are allowed for filtering
 * @returns Object containing WHERE clause and values array
 * 
 * @example
 * const result = buildWhereClause(
 *   { status: 'active', priority: 'high' },
 *   ['status', 'priority', 'category']
 * )
 * // result.query: 'WHERE status = $1 AND priority = $2'
 * // result.values: ['active', 'high']
 */
export function buildWhereClause(
  filters: Record<string, any>,
  allowedFields: readonly string[]
): { clause: string; values: any[]; paramStartIndex: number } {
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(filters)) {
    if (allowedFields.includes(key) && value !== undefined && value !== null) {
      conditions.push(`${key} = $${paramIndex++}`)
      values.push(value)
    }
  }

  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  return { clause, values, paramStartIndex: paramIndex }
}
