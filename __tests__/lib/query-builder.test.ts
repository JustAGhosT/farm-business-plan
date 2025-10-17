/**
 * Tests for query builder utilities
 */
import { buildUpdateQuery, buildInsertQuery, buildWhereClause } from '@/lib/query-builder'

describe('Query Builder Functions', () => {
  describe('buildUpdateQuery', () => {
    it('should build basic UPDATE query', () => {
      const result = buildUpdateQuery(
        'tasks',
        { title: 'New Title', status: 'completed' },
        ['title', 'description', 'status'],
        'id',
        'task-123'
      )

      expect(result.query).toContain('UPDATE tasks')
      expect(result.query).toContain('SET')
      expect(result.query).toContain('title = $1')
      expect(result.query).toContain('status = $2')
      expect(result.query).toContain('WHERE id = $')
      expect(result.query).toContain('RETURNING *')
      expect(result.values).toHaveLength(4) // title, status, updated_at, id
      expect(result.values[0]).toBe('New Title')
      expect(result.values[1]).toBe('completed')
      expect(result.values[3]).toBe('task-123')
    })

    it('should filter out disallowed fields', () => {
      const result = buildUpdateQuery(
        'tasks',
        { title: 'New Title', forbidden: 'hacker', status: 'completed' },
        ['title', 'description', 'status'],
        'id',
        'task-123'
      )

      expect(result.query).not.toContain('forbidden')
      expect(result.values).not.toContain('hacker')
    })

    it('should add updated_at timestamp automatically', () => {
      const result = buildUpdateQuery(
        'tasks',
        { title: 'New Title' },
        ['title', 'description'],
        'id',
        'task-123'
      )

      expect(result.query).toContain('updated_at')
      // Check that one of the values is an ISO date string
      const hasTimestamp = result.values.some(
        (val) => typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)
      )
      expect(hasTimestamp).toBe(true)
    })

    it('should handle custom ID field', () => {
      const result = buildUpdateQuery(
        'users',
        { name: 'John' },
        ['name', 'email'],
        'user_id',
        'user-456'
      )

      expect(result.query).toContain('WHERE user_id = $')
      expect(result.values[result.values.length - 1]).toBe('user-456')
    })

    it('should throw error when table name is missing', () => {
      expect(() =>
        buildUpdateQuery('', { title: 'Test' }, ['title'], 'id', '123')
      ).toThrow('Table name is required')
    })

    it('should throw error when ID value is missing', () => {
      expect(() =>
        buildUpdateQuery('tasks', { title: 'Test' }, ['title'], 'id', null)
      ).toThrow('ID value is required')
    })

    it('should throw error when no valid fields to update', () => {
      expect(() =>
        buildUpdateQuery('tasks', { forbidden: 'value' }, ['title'], 'id', '123')
      ).toThrow('No valid fields to update')
    })

    it('should handle additional SET clauses', () => {
      const result = buildUpdateQuery(
        'tasks',
        { title: 'New Title' },
        ['title'],
        'id',
        'task-123',
        ['completed_at = $PARAM']
      )

      expect(result.query).toContain('completed_at')
      expect(result.values).toHaveLength(4) // title, completed_at value, updated_at, id
    })
  })

  describe('buildInsertQuery', () => {
    it('should build basic INSERT query', () => {
      const result = buildInsertQuery('tasks', {
        farm_plan_id: 'farm-1',
        title: 'Plant seeds',
        status: 'pending',
      })

      expect(result.query).toContain('INSERT INTO tasks')
      expect(result.query).toContain('(farm_plan_id, title, status)')
      expect(result.query).toContain('VALUES ($1, $2, $3)')
      expect(result.query).toContain('RETURNING *')
      expect(result.values).toEqual(['farm-1', 'Plant seeds', 'pending'])
    })

    it('should filter fields when allowedFields provided', () => {
      const result = buildInsertQuery(
        'tasks',
        {
          title: 'Test',
          forbidden: 'value',
          status: 'pending',
        },
        ['title', 'status', 'description']
      )

      expect(result.query).not.toContain('forbidden')
      expect(result.values).toEqual(['Test', 'pending'])
    })

    it('should throw error when table name is missing', () => {
      expect(() => buildInsertQuery('', { title: 'Test' })).toThrow('Table name is required')
    })

    it('should throw error when no valid fields to insert', () => {
      expect(() =>
        buildInsertQuery('tasks', { forbidden: 'value' }, ['title'])
      ).toThrow('No valid fields to insert')
    })

    it('should handle all fields when allowedFields not provided', () => {
      const result = buildInsertQuery('tasks', {
        title: 'Test',
        description: 'Description',
        status: 'pending',
      })

      expect(result.values).toHaveLength(3)
      expect(result.query).toContain('title')
      expect(result.query).toContain('description')
      expect(result.query).toContain('status')
    })
  })

  describe('buildWhereClause', () => {
    it('should build basic WHERE clause', () => {
      const result = buildWhereClause(
        { status: 'active', priority: 'high' },
        ['status', 'priority', 'category']
      )

      expect(result.clause).toContain('WHERE')
      expect(result.clause).toContain('status = $1')
      expect(result.clause).toContain('AND')
      expect(result.clause).toContain('priority = $2')
      expect(result.values).toEqual(['active', 'high'])
      expect(result.paramStartIndex).toBe(3)
    })

    it('should filter out disallowed fields', () => {
      const result = buildWhereClause(
        { status: 'active', forbidden: 'hack', priority: 'high' },
        ['status', 'priority']
      )

      expect(result.clause).not.toContain('forbidden')
      expect(result.values).toEqual(['active', 'high'])
    })

    it('should ignore null and undefined values', () => {
      const result = buildWhereClause(
        { status: 'active', priority: null, category: undefined },
        ['status', 'priority', 'category']
      )

      expect(result.clause).toBe('WHERE status = $1')
      expect(result.values).toEqual(['active'])
    })

    it('should return empty clause when no valid filters', () => {
      const result = buildWhereClause({}, ['status', 'priority'])

      expect(result.clause).toBe('')
      expect(result.values).toEqual([])
      expect(result.paramStartIndex).toBe(1)
    })

    it('should return empty clause when all fields filtered out', () => {
      const result = buildWhereClause({ forbidden: 'value' }, ['status', 'priority'])

      expect(result.clause).toBe('')
      expect(result.values).toEqual([])
    })

    it('should handle single filter', () => {
      const result = buildWhereClause({ status: 'active' }, ['status', 'priority'])

      expect(result.clause).toBe('WHERE status = $1')
      expect(result.values).toEqual(['active'])
      expect(result.paramStartIndex).toBe(2)
    })
  })
})
