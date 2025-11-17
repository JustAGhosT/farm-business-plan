/**
 * @jest-environment jsdom
 */

import { useCrudApi } from '@/lib/hooks/useCrudApi'
import { act, renderHook, waitFor } from '@testing-library/react'

// Mock fetch globally
global.fetch = jest.fn()

describe('useCrudApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('GET - fetching items', () => {
    it('should fetch items successfully', async () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockData }),
      })

      const { result } = renderHook(() =>
        useCrudApi<{ id: string; name: string }>({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.items).toEqual(mockData)
      expect(result.current.error).toBe(null)
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
    })

    it('should apply filters to query string', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
          filters: { status: 'active', farm_plan_id: '123' },
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test?status=active&farm_plan_id=123',
        expect.any(Object)
      )
    })

    it('should handle fetch errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.items).toEqual([])
      expect(result.current.error).toBe('Network error')
    })

    it('should handle API error responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false, error: 'Failed to fetch data' }),
      })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.items).toEqual([])
      expect(result.current.error).toBe('Failed to fetch data')
    })

    it('should handle timeout errors', async () => {
      jest.useFakeTimers()

      let abortCalled = false
      ;(global.fetch as jest.Mock).mockImplementation(
        (url: string, options: any) =>
          new Promise((_, reject) => {
            // Simulate abort timeout
            options?.signal?.addEventListener('abort', () => {
              abortCalled = true
              const error = new Error('The operation was aborted')
              error.name = 'AbortError'
              reject(error)
            })
          })
      )

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
          timeout: 1000,
        })
      )

      // Advance timers to trigger the abort
      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve() // Allow promises to settle
      })

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false)
        },
        { timeout: 3000 }
      )

      expect(result.current.error).toContain('timed out')
      expect(abortCalled).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('POST - creating items', () => {
    it('should create an item successfully', async () => {
      const mockData = { id: '1', name: 'New Item' }

      ;(global.fetch as jest.Mock)
        // Initial fetch
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [] }),
        })
        // Create
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: mockData }),
        })
        // Refetch after create
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [mockData] }),
        })

      const { result } = renderHook(() =>
        useCrudApi<{ id?: string; name: string }>({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let createdItem: any
      await act(async () => {
        createdItem = await result.current.create({ name: 'New Item' } as any)
      })

      expect(createdItem).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Item' }),
        })
      )
    })

    it('should handle create errors', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: false, error: 'Validation failed' }),
        })

      const { result } = renderHook(() =>
        useCrudApi<{ id?: string; name: string }>({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let createdItem: any
      await act(async () => {
        createdItem = await result.current.create({ name: 'New Item' })
      })

      expect(createdItem).toBe(null)
      expect(result.current.error).toBe('Validation failed')
    })
  })

  describe('PATCH/PUT - updating items', () => {
    it('should update an item with PATCH', async () => {
      const updatedItem = { id: '1', name: 'Updated Item' }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [{ id: '1', name: 'Item 1' }] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: updatedItem }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [updatedItem] }),
        })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
          updateMethod: 'PATCH',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updated: any
      await act(async () => {
        updated = await result.current.update('1', { name: 'Updated Item' } as any)
      })

      expect(updated).toEqual(updatedItem)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ id: '1', name: 'Updated Item' }),
        })
      )
    })

    it('should update an item with PUT', async () => {
      const updatedItem = { id: '1', name: 'Updated Item' }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [{ id: '1', name: 'Item 1' }] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: updatedItem }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [updatedItem] }),
        })

      const { result } = renderHook(() =>
        useCrudApi<{ id?: string; name: string }>({
          endpoint: '/api/test',
          updateMethod: 'PUT',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updated: any
      await act(async () => {
        updated = await result.current.update('1', { name: 'Updated Item' })
      })

      expect(updated).toEqual(updatedItem)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated Item' }),
        })
      )
    })
  })

  describe('DELETE - removing items', () => {
    it('should delete an item successfully', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [{ id: '1', name: 'Item 1' }] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [] }),
        })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleted: boolean = false
      await act(async () => {
        deleted = await result.current.remove('1')
      })

      expect(deleted).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test?id=1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('should handle delete errors', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: false, error: 'Not found' }),
        })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleted: boolean = true
      await act(async () => {
        deleted = await result.current.remove('999')
      })

      expect(deleted).toBe(false)
      expect(result.current.error).toBe('Not found')
    })
  })

  describe('refetch', () => {
    it('should manually refetch data', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [{ id: '1', name: 'Item 1' }] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ success: true, data: [{ id: '2', name: 'Item 2' }] }),
        })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.items).toHaveLength(1)

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].id).toBe('2')
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false, error: 'Test error' }),
      })

      const { result } = renderHook(() =>
        useCrudApi({
          endpoint: '/api/test',
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('filter memoization', () => {
    it('should not refetch when filters object reference changes but values are the same', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true, data: [] }),
      })

      const { result, rerender } = renderHook(
        ({ filters }) =>
          useCrudApi({
            endpoint: '/api/test',
            filters,
          }),
        {
          initialProps: { filters: { status: 'active' } },
        }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const fetchCallCount = (global.fetch as jest.Mock).mock.calls.length

      // Rerender with new filter object with same values
      rerender({ filters: { status: 'active' } })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should not trigger additional fetch
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(fetchCallCount)
    })
  })
})
