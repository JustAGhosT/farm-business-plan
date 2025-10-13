// Common crop templates for South African farming
// Based on typical values for Bela Bela, Limpopo Province region

export interface CropTemplate {
  name: string
  description: string
  typicalPercentage: number
  baseProduction: number // kg per hectare at 100% allocation
  basePrice: number // ZAR per kg
  growthRate: number // % annual production increase
  priceInflation: number // % annual price increase
  fixedCostsPerHa: number // ZAR per hectare per year
  variableCostPerUnit: number // ZAR per kg
  initialInvestmentPerHa: number // ZAR per hectare
  landPrep: number // ZAR per hectare
  infrastructure: number // ZAR per hectare
  equipment: number // ZAR per hectare
  initialInputs: number // ZAR per hectare
  workingCapital: number // ZAR per hectare
  maturityYears: number // years to full production
  region: string
  season: string
  waterNeeds: 'low' | 'medium' | 'high'
  profitability: 'low' | 'medium' | 'high'
}

export const CROP_TEMPLATES: CropTemplate[] = [
  {
    name: 'Dragon Fruit',
    description: 'High-value exotic fruit with wall-farming potential',
    typicalPercentage: 30,
    baseProduction: 12000, // kg per hectare
    basePrice: 65, // R65/kg
    growthRate: 15, // 15% annual increase as plants mature
    priceInflation: 3,
    fixedCostsPerHa: 45000,
    variableCostPerUnit: 18,
    initialInvestmentPerHa: 180000,
    landPrep: 25000,
    infrastructure: 85000, // Trellis systems
    equipment: 35000,
    initialInputs: 20000,
    workingCapital: 15000,
    maturityYears: 3,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Dec-Mar)',
    waterNeeds: 'medium',
    profitability: 'high',
  },
  {
    name: 'Moringa',
    description: 'Superfood crop with high nutritional value',
    typicalPercentage: 25,
    baseProduction: 8000, // kg per hectare (leaf harvest)
    basePrice: 45, // R45/kg dried leaves
    growthRate: 10,
    priceInflation: 5,
    fixedCostsPerHa: 28000,
    variableCostPerUnit: 12,
    initialInvestmentPerHa: 95000,
    landPrep: 18000,
    infrastructure: 35000,
    equipment: 22000,
    initialInputs: 12000,
    workingCapital: 8000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Year-round',
    waterNeeds: 'low',
    profitability: 'high',
  },
  {
    name: 'Lucerne (Alfalfa)',
    description: 'High-value forage crop with multiple annual harvests',
    typicalPercentage: 20,
    baseProduction: 18000, // kg per hectare (hay)
    basePrice: 3.5, // R3.50/kg
    growthRate: 5,
    priceInflation: 4,
    fixedCostsPerHa: 35000,
    variableCostPerUnit: 0.8,
    initialInvestmentPerHa: 75000,
    landPrep: 22000,
    infrastructure: 28000,
    equipment: 18000,
    initialInputs: 5000,
    workingCapital: 2000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Multiple cuts per year',
    waterNeeds: 'high',
    profitability: 'medium',
  },
  {
    name: 'Tomatoes',
    description: 'Popular vegetable crop for local and export markets',
    typicalPercentage: 15,
    baseProduction: 60000, // kg per hectare
    basePrice: 12, // R12/kg
    growthRate: 3,
    priceInflation: 6,
    fixedCostsPerHa: 85000,
    variableCostPerUnit: 3.5,
    initialInvestmentPerHa: 120000,
    landPrep: 20000,
    infrastructure: 55000, // Greenhouse/tunnels
    equipment: 25000,
    initialInputs: 15000,
    workingCapital: 5000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Year-round with tunnels',
    waterNeeds: 'high',
    profitability: 'medium',
  },
  {
    name: 'Maize',
    description: 'Staple grain crop for local consumption and animal feed',
    typicalPercentage: 25,
    baseProduction: 6000, // kg per hectare
    basePrice: 3.8, // R3.80/kg
    growthRate: 2,
    priceInflation: 5,
    fixedCostsPerHa: 15000,
    variableCostPerUnit: 0.9,
    initialInvestmentPerHa: 35000,
    landPrep: 8000,
    infrastructure: 12000,
    equipment: 10000,
    initialInputs: 4000,
    workingCapital: 1000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Oct-Mar)',
    waterNeeds: 'medium',
    profitability: 'low',
  },
  {
    name: 'Butternut Squash',
    description: 'Hardy vegetable with good storage potential',
    typicalPercentage: 20,
    baseProduction: 35000, // kg per hectare
    basePrice: 8, // R8/kg
    growthRate: 4,
    priceInflation: 5,
    fixedCostsPerHa: 38000,
    variableCostPerUnit: 2.2,
    initialInvestmentPerHa: 65000,
    landPrep: 15000,
    infrastructure: 22000,
    equipment: 18000,
    initialInputs: 8000,
    workingCapital: 2000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Nov-Apr)',
    waterNeeds: 'medium',
    profitability: 'medium',
  },
  {
    name: 'Citrus (Oranges)',
    description: 'Perennial fruit crop with consistent demand',
    typicalPercentage: 30,
    baseProduction: 25000, // kg per hectare
    basePrice: 6.5, // R6.50/kg
    growthRate: 8,
    priceInflation: 4,
    fixedCostsPerHa: 55000,
    variableCostPerUnit: 1.8,
    initialInvestmentPerHa: 145000,
    landPrep: 28000,
    infrastructure: 62000,
    equipment: 32000,
    initialInputs: 18000,
    workingCapital: 5000,
    maturityYears: 4,
    region: 'Bela Bela, Limpopo',
    season: 'Winter harvest (Jun-Aug)',
    waterNeeds: 'high',
    profitability: 'medium',
  },
]

// Helper function to get crops by profitability
export function getCropsByProfitability(level: 'low' | 'medium' | 'high'): CropTemplate[] {
  return CROP_TEMPLATES.filter((crop) => crop.profitability === level)
}

// Helper function to get crops by water needs
export function getCropsByWaterNeeds(level: 'low' | 'medium' | 'high'): CropTemplate[] {
  return CROP_TEMPLATES.filter((crop) => crop.waterNeeds === level)
}

// Get a balanced portfolio recommendation
export function getBalancedPortfolio(): CropTemplate[] {
  return [
    CROP_TEMPLATES[0], // Dragon Fruit - 30%
    CROP_TEMPLATES[1], // Moringa - 25%
    CROP_TEMPLATES[2], // Lucerne - 20%
    CROP_TEMPLATES[3], // Tomatoes - 15%
    CROP_TEMPLATES[5], // Butternut - 10%
  ]
}

// Get low water portfolio
export function getLowWaterPortfolio(): CropTemplate[] {
  return [
    CROP_TEMPLATES[1], // Moringa - 40%
    CROP_TEMPLATES[4], // Maize - 35%
    CROP_TEMPLATES[5], // Butternut - 25%
  ]
}

// Get high profit portfolio
export function getHighProfitPortfolio(): CropTemplate[] {
  return [
    CROP_TEMPLATES[0], // Dragon Fruit - 50%
    CROP_TEMPLATES[1], // Moringa - 50%
  ]
}
