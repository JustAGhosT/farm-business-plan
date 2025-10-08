/**
 * Mock for database module
 */

export const query = jest.fn()
export const testConnection = jest.fn()

// Default successful query result
export const mockQueryResult = {
  rows: [],
  rowCount: 0,
  command: '',
  oid: 0,
  fields: [],
}

export function resetMocks() {
  query.mockReset()
  testConnection.mockReset()
}

export function mockSuccessfulQuery(rows: any[] = []) {
  query.mockResolvedValue({
    ...mockQueryResult,
    rows,
    rowCount: rows.length,
  })
}

export function mockFailedQuery(error: Error) {
  query.mockRejectedValue(error)
}
