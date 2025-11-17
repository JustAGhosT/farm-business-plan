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
  {
    name: 'Sorghum',
    description: 'Drought-resistant grain crop ideal for dry conditions',
    typicalPercentage: 25,
    baseProduction: 3500, // kg per hectare
    basePrice: 4.2, // R4.20/kg
    growthRate: 2,
    priceInflation: 4,
    fixedCostsPerHa: 12000,
    variableCostPerUnit: 1.0,
    initialInvestmentPerHa: 28000,
    landPrep: 7000,
    infrastructure: 8000,
    equipment: 9000,
    initialInputs: 3000,
    workingCapital: 1000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Nov-Apr)',
    waterNeeds: 'low',
    profitability: 'low',
  },
  {
    name: 'Groundnuts (Peanuts)',
    description: 'High-protein legume with nitrogen-fixing properties',
    typicalPercentage: 20,
    baseProduction: 2500, // kg per hectare
    basePrice: 18, // R18/kg
    growthRate: 3,
    priceInflation: 5,
    fixedCostsPerHa: 24000,
    variableCostPerUnit: 5.5,
    initialInvestmentPerHa: 48000,
    landPrep: 12000,
    infrastructure: 15000,
    equipment: 14000,
    initialInputs: 5000,
    workingCapital: 2000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Oct-Mar)',
    waterNeeds: 'low',
    profitability: 'high',
  },
  {
    name: 'Sunflower',
    description: 'Drought-tolerant oilseed crop with multiple uses',
    typicalPercentage: 20,
    baseProduction: 2000, // kg per hectare
    basePrice: 7.5, // R7.50/kg
    growthRate: 2,
    priceInflation: 4,
    fixedCostsPerHa: 16000,
    variableCostPerUnit: 2.0,
    initialInvestmentPerHa: 32000,
    landPrep: 8000,
    infrastructure: 10000,
    equipment: 10000,
    initialInputs: 3000,
    workingCapital: 1000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Nov-Mar)',
    waterNeeds: 'low',
    profitability: 'medium',
  },
  {
    name: 'Dry Beans',
    description: 'Protein-rich legume crop with stable market demand',
    typicalPercentage: 15,
    baseProduction: 1800, // kg per hectare
    basePrice: 12, // R12/kg
    growthRate: 2,
    priceInflation: 5,
    fixedCostsPerHa: 20000,
    variableCostPerUnit: 3.5,
    initialInvestmentPerHa: 38000,
    landPrep: 10000,
    infrastructure: 12000,
    equipment: 11000,
    initialInputs: 4000,
    workingCapital: 1000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Oct-Feb)',
    waterNeeds: 'medium',
    profitability: 'low',
  },
  {
    name: 'Sweet Potato',
    description: 'Nutritious root crop with high yield potential',
    typicalPercentage: 20,
    baseProduction: 25000, // kg per hectare
    basePrice: 7, // R7/kg
    growthRate: 4,
    priceInflation: 5,
    fixedCostsPerHa: 32000,
    variableCostPerUnit: 1.8,
    initialInvestmentPerHa: 55000,
    landPrep: 14000,
    infrastructure: 18000,
    equipment: 15000,
    initialInputs: 6000,
    workingCapital: 2000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Sep-Mar)',
    waterNeeds: 'low',
    profitability: 'medium',
  },
  {
    name: 'Cabbage',
    description: 'Cool-season vegetable with multiple plantings per year',
    typicalPercentage: 15,
    baseProduction: 40000, // kg per hectare
    basePrice: 6, // R6/kg
    growthRate: 3,
    priceInflation: 6,
    fixedCostsPerHa: 42000,
    variableCostPerUnit: 1.5,
    initialInvestmentPerHa: 68000,
    landPrep: 16000,
    infrastructure: 24000,
    equipment: 18000,
    initialInputs: 8000,
    workingCapital: 2000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Cool season (Apr-Aug)',
    waterNeeds: 'medium',
    profitability: 'low',
  },
  {
    name: 'Onions',
    description: 'High-demand vegetable crop with good storage potential',
    typicalPercentage: 20,
    baseProduction: 45000, // kg per hectare
    basePrice: 8.5, // R8.50/kg
    growthRate: 3,
    priceInflation: 6,
    fixedCostsPerHa: 55000,
    variableCostPerUnit: 2.0,
    initialInvestmentPerHa: 82000,
    landPrep: 18000,
    infrastructure: 28000,
    equipment: 22000,
    initialInputs: 11000,
    workingCapital: 3000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Winter (May-Sep)',
    waterNeeds: 'high',
    profitability: 'medium',
  },
  {
    name: 'Peppers (Sweet & Chili)',
    description: 'High-value specialty crop for fresh and processed markets',
    typicalPercentage: 15,
    baseProduction: 35000, // kg per hectare
    basePrice: 22, // R22/kg (mixed average)
    growthRate: 4,
    priceInflation: 5,
    fixedCostsPerHa: 68000,
    variableCostPerUnit: 5.5,
    initialInvestmentPerHa: 105000,
    landPrep: 20000,
    infrastructure: 45000, // Tunnels/shade
    equipment: 24000,
    initialInputs: 12000,
    workingCapital: 4000,
    maturityYears: 1,
    region: 'Bela Bela, Limpopo',
    season: 'Year-round with tunnels',
    waterNeeds: 'high',
    profitability: 'high',
  },
  {
    name: 'Avocado',
    description: 'Premium fruit crop with growing global demand',
    typicalPercentage: 25,
    baseProduction: 12000, // kg per hectare (mature trees)
    basePrice: 35, // R35/kg
    growthRate: 12, // As trees mature
    priceInflation: 4,
    fixedCostsPerHa: 62000,
    variableCostPerUnit: 8.0,
    initialInvestmentPerHa: 195000,
    landPrep: 32000,
    infrastructure: 75000,
    equipment: 48000,
    initialInputs: 30000,
    workingCapital: 10000,
    maturityYears: 5,
    region: 'Bela Bela, Limpopo',
    season: 'Year-round harvest',
    waterNeeds: 'medium',
    profitability: 'high',
  },
  {
    name: 'Mango',
    description: 'Tropical fruit well-suited to warm Limpopo climate',
    typicalPercentage: 30,
    baseProduction: 15000, // kg per hectare (mature trees)
    basePrice: 18, // R18/kg
    growthRate: 10, // As trees mature
    priceInflation: 4,
    fixedCostsPerHa: 48000,
    variableCostPerUnit: 4.5,
    initialInvestmentPerHa: 165000,
    landPrep: 28000,
    infrastructure: 68000,
    equipment: 42000,
    initialInputs: 20000,
    workingCapital: 7000,
    maturityYears: 4,
    region: 'Bela Bela, Limpopo',
    season: 'Summer (Nov-Feb)',
    waterNeeds: 'medium',
    profitability: 'high',
  },
  {
    name: 'Pecan Nuts',
    description: 'Long-term perennial investment with premium market',
    typicalPercentage: 35,
    baseProduction: 3500, // kg per hectare (mature trees)
    basePrice: 145, // R145/kg (shelled)
    growthRate: 15, // As trees mature
    priceInflation: 3,
    fixedCostsPerHa: 72000,
    variableCostPerUnit: 38,
    initialInvestmentPerHa: 285000,
    landPrep: 38000,
    infrastructure: 125000,
    equipment: 75000,
    initialInputs: 35000,
    workingCapital: 12000,
    maturityYears: 7,
    region: 'Bela Bela, Limpopo',
    season: 'Autumn harvest (Apr-Jun)',
    waterNeeds: 'low',
    profitability: 'high',
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
