// Core business plan types
export interface FarmPlan {
  id: string
  name: string
  location: string
  farmSize: number // in hectares
  crops: CropPlan[]
  createdAt: Date
  updatedAt: Date
}

export interface CropPlan {
  id: string
  cropName: string
  variety?: string
  plantingArea: number // in hectares or square meters
  plantingDate?: Date
  harvestDate?: Date
  expectedYield: number
  yieldUnit: string
  financials: CropFinancials
  technicalSpecs: TechnicalSpecifications
  status: 'planned' | 'planted' | 'growing' | 'harvested'
}

export interface CropFinancials {
  initialInvestment: number
  operatingCosts: OperatingCosts
  projectedRevenue: RevenueProjection[]
  breakEvenPoint?: number // in months or harvest cycles
}

export interface OperatingCosts {
  fixed: FixedCosts
  variable: VariableCosts
  totalMonthly: number
  totalAnnual: number
}

export interface FixedCosts {
  utilities: number
  labor: number
  maintenance: number
  insurance: number
  other: { [key: string]: number }
}

export interface VariableCosts {
  seeds: number
  fertilizer: number
  pesticides: number
  water: number
  packaging: number
  other: { [key: string]: number }
}

export interface RevenueProjection {
  year: number
  expectedProduction: number
  pricePerUnit: number
  totalRevenue: number
  netProfit: number
}

export interface TechnicalSpecifications {
  soilType?: string
  phLevel?: number
  irrigationType?: string
  waterRequirement?: number // liters per day/week
  spacing?: string
  supportStructure?: string
  notes?: string
}

// Dashboard and operations types
export interface Task {
  id: string
  title: string
  description: string
  cropId?: string
  dueDate: Date
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
}

export interface Activity {
  id: string
  date: Date
  type: 'planting' | 'irrigation' | 'fertilization' | 'pest-control' | 'harvest' | 'maintenance' | 'other'
  cropId?: string
  description: string
  cost?: number
  notes?: string
}

// Financial calculator types
export interface InvestmentCalculation {
  totalInvestment: number
  fundingSources: FundingSource[]
  roi: number // percentage
  paybackPeriod: number // in months
}

export interface FundingSource {
  name: string
  amount: number
  percentage: number
  terms?: string
}

export interface BreakEvenAnalysis {
  fixedCosts: number
  variableCostPerUnit: number
  pricePerUnit: number
  breakEvenUnits: number
  breakEvenRevenue: number
}

// Template library types
export interface CropTemplate {
  id: string
  name: string
  category: 'fruits' | 'vegetables' | 'grains' | 'herbs' | 'forage' | 'other'
  description: string
  growingPeriod: number // in days
  waterRequirements: 'low' | 'medium' | 'high'
  sunRequirements: 'full-sun' | 'partial-shade' | 'shade'
  temperatureRange: {
    min: number
    max: number
  }
  commonVarieties: string[]
  typicalYield: {
    amount: number
    unit: string
    perArea: string
  }
  averagePricePerUnit?: number
  technicalNotes?: string
}

// Market analysis types
export interface MarketAnalysis {
  cropName: string
  localDemand: 'low' | 'medium' | 'high'
  competition: 'low' | 'medium' | 'high'
  averagePrice: number
  priceUnit: string
  seasonality?: string
  targetCustomers: string[]
  distributionChannels: string[]
}

// Risk assessment types
export interface RiskAssessment {
  id: string
  category: 'weather' | 'market' | 'pests' | 'financial' | 'operational' | 'regulatory'
  description: string
  likelihood: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string
  status: 'identified' | 'mitigated' | 'monitoring'
}

// Form data types
export interface PlanFormData {
  basicInfo: {
    farmName: string
    location: string
    farmSize: number
    ownerName: string
    contactInfo: string
  }
  climateData: {
    averageTemp: { summer: number; winter: number }
    rainfall: number
    frostRisk: boolean
    growingSeasonLength: number
  }
  soilData: {
    type: string
    phLevel: number
    drainage: 'poor' | 'moderate' | 'good'
    fertility: 'low' | 'medium' | 'high'
  }
  waterResources: {
    source: string
    availability: 'limited' | 'adequate' | 'abundant'
    quality: 'poor' | 'good' | 'excellent'
  }
}

// Export/PDF types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  sections: string[]
  includeCharts: boolean
  includeFinancials: boolean
}
