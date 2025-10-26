// Shared API utilities for consistent API patterns across the application

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface CalculatorResult {
  id: string
  calculator_type: string
  input_data: any
  results: any
  notes?: string
  created_at: string
  farm_plan_name?: string
  crop_name?: string
}

// Generic API client with consistent error handling
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Create default API client instance
export const apiClient = new ApiClient()

// Calculator-specific API functions
export const calculatorApi = {
  // Save calculator result
  async saveResult(
    calculatorType: string,
    inputData: any,
    results: any,
    notes?: string
  ): Promise<ApiResponse<CalculatorResult>> {
    return apiClient.post('/api/calculator-results', {
      calculator_type: calculatorType,
      input_data: inputData,
      results: results,
      notes: notes || '',
    })
  },

  // Fetch calculator results
  async getResults(
    calculatorType?: string,
    params?: PaginationParams
  ): Promise<ApiResponse<CalculatorResult[]>> {
    const queryParams: Record<string, any> = {
      limit: params?.limit || 50,
      ...params,
    }

    if (calculatorType) {
      queryParams.calculator_type = calculatorType
    }

    return apiClient.get('/api/calculator-results', queryParams)
  },

  // Delete calculator result
  async deleteResult(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/calculator-results?id=${id}`)
  },

  // Export results to PDF
  async exportToPDF(results: CalculatorResult[]): Promise<Blob> {
    const response = await fetch('/api/calculator-results/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    })

    if (!response.ok) {
      throw new Error('Failed to export results')
    }

    return response.blob()
  },

  // Export results to CSV
  async exportToCSV(results: CalculatorResult[]): Promise<Blob> {
    const response = await fetch('/api/calculator-results/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    })

    if (!response.ok) {
      throw new Error('Failed to export results')
    }

    return response.blob()
  },
}

// Farm plan API functions
export const farmPlanApi = {
  async create(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/farm-plans', data)
  },

  async getPlans(params?: PaginationParams): Promise<ApiResponse<any[]>> {
    return apiClient.get('/api/farm-plans', params)
  },

  async getPlan(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/farm-plans/${id}`)
  },

  async updatePlan(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/api/farm-plans/${id}`, data)
  },

  async deletePlan(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/farm-plans/${id}`)
  },
}

// Crop suggestions API
export const cropApi = {
  async getSuggestions(province: string, town: string): Promise<ApiResponse<any[]>> {
    return apiClient.get('/api/suggest-crops', { province, town })
  },

  async getTemplates(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/api/crop-templates')
  },
}

// Climate data API
export const climateApi = {
  async saveData(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/climate-data', data)
  },

  async getData(farmPlanId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/climate-data?farm_plan_id=${farmPlanId}`)
  },
}

// AI recommendations API
export const aiApi = {
  async saveRecommendation(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/ai-recommendations', data)
  },

  async getRecommendations(farmPlanId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/api/ai-recommendations?farm_plan_id=${farmPlanId}`)
  },
}

// Utility functions for common API patterns
export const apiUtils = {
  // Handle API errors consistently
  handleError(error: any): string {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.error) return error.error
    return 'An unexpected error occurred'
  },

  // Format currency consistently
  formatCurrency(amount: number, currency = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  },

  // Format percentage consistently
  formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
  },

  // Format date consistently
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-ZA')
  },

  // Format date and time consistently
  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('en-ZA')
  },

  // Download blob as file
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
