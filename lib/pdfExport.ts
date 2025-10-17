// cSpell:ignore autotable financials halign exceljs
import { CropPlan, CropTemplate, ExportOptions, FarmPlan, Scenario } from '@/types'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PDFExportData {
  farmPlan?: FarmPlan
  scenarios?: Scenario[]
  cropTemplates?: CropTemplate[]
}

/**
 * Export farm plan data to PDF
 */
export async function exportToPDF(data: PDFExportData, options: ExportOptions): Promise<Blob> {
  const doc = new jsPDF()
  let yPosition = 20

  // Add title
  doc.setFontSize(20)
  doc.text('Farm Plan Report', 20, yPosition)
  yPosition += 15

  // Add farm plan details if available
  if (data.farmPlan && options.sections.includes('basic-info')) {
    yPosition = addFarmPlanSection(doc, data.farmPlan, yPosition)
  }

  // Add crop details if available
  if (
    data.farmPlan?.crops &&
    data.farmPlan.crops.length > 0 &&
    options.sections.includes('crops')
  ) {
    yPosition = addCropsSection(doc, data.farmPlan.crops, yPosition)
  }

  // Add scenarios if available
  if (data.scenarios && data.scenarios.length > 0 && options.sections.includes('scenarios')) {
    yPosition = addScenariosSection(doc, data.scenarios, data.cropTemplates || [], yPosition)
  }

  // Add financial summary if requested
  if (
    options.includeFinancials &&
    data.farmPlan?.crops &&
    options.sections.includes('financials')
  ) {
    yPosition = addFinancialSection(doc, data.farmPlan.crops, yPosition)
  }

  return doc.output('blob')
}

/**
 * Add farm plan basic information section
 */
function addFarmPlanSection(doc: jsPDF, plan: FarmPlan, yPos: number): number {
  doc.setFontSize(16)
  doc.text('Farm Information', 20, yPos)
  yPos += 10

  doc.setFontSize(12)
  const info = [
    `Name: ${plan.name}`,
    `Location: ${plan.location}`,
    `Size: ${plan.farmSize} hectares`,
    `Created: ${new Date(plan.createdAt).toLocaleDateString()}`,
  ]

  info.forEach((line) => {
    doc.text(line, 20, yPos)
    yPos += 7
  })

  return yPos + 10
}

/**
 * Add crops section with table
 */
function addCropsSection(doc: jsPDF, crops: CropPlan[], yPos: number): number {
  doc.setFontSize(16)
  doc.text('Crop Plans', 20, yPos)
  yPos += 10

  const tableData = crops.map((crop) => [
    crop.cropName,
    crop.variety || '-',
    `${crop.plantingArea} ha`,
    `${crop.expectedYield} ${crop.yieldUnit}`,
    crop.status,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Crop', 'Variety', 'Area', 'Expected Yield', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
  })

  return (doc as any).lastAutoTable.finalY + 15
}

/**
 * Add scenarios comparison section
 */
function addScenariosSection(
  doc: jsPDF,
  scenarios: Scenario[],
  cropTemplates: CropTemplate[],
  yPos: number
): number {
  doc.setFontSize(16)
  doc.text('Scenarios Analysis', 20, yPos)
  yPos += 10

  scenarios.forEach((scenario, index) => {
    if (index > 0) yPos += 10

    doc.setFontSize(14)
    doc.text(`${scenario.name}`, 20, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.text(scenario.description, 20, yPos)
    yPos += 7

    // Calculate scenario metrics
    const metrics = calculateScenarioMetrics(scenario, cropTemplates)

    const metricsData = [
      ['Investment', formatCurrency(metrics.totalInvestment)],
      ['Revenue', formatCurrency(metrics.totalRevenue)],
      ['Costs', formatCurrency(metrics.totalCosts)],
      ['Net Profit', formatCurrency(metrics.netProfit)],
      ['ROI', `${metrics.roi.toFixed(1)}%`],
    ]

    autoTable(doc, {
      startY: yPos,
      body: metricsData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 50 },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 5
  })

  return yPos + 10
}

/**
 * Calculate metrics for a scenario
 */
function calculateScenarioMetrics(scenario: Scenario, cropTemplates: CropTemplate[]) {
  let totalInvestment = 0
  let totalRevenue = 0
  let totalCosts = 0

  scenario.crops.forEach((crop) => {
    const template = cropTemplates.find((t) => t.id === crop.id)
    if (template) {
      const area = crop.plantingArea || 1
      totalInvestment += (template.investment || 0) * area
      totalRevenue += (template.revenuePerHectare || 0) * area
      totalCosts += (template.costsPerHectare || 0) * area
    }
  })

  const netProfit = totalRevenue - totalCosts - totalInvestment
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0

  return {
    totalInvestment,
    totalRevenue,
    totalCosts,
    netProfit,
    roi,
  }
}

/**
 * Add financial summary section
 */
function addFinancialSection(doc: jsPDF, crops: CropPlan[], yPos: number): number {
  doc.setFontSize(16)
  doc.text('Financial Summary', 20, yPos)
  yPos += 10

  let totalInvestment = 0
  let totalRevenue = 0

  const financialData = crops.map((crop) => {
    const investment = crop.financials.initialInvestment
    const revenue =
      crop.financials.projectedRevenue.length > 0
        ? crop.financials.projectedRevenue[0].totalRevenue
        : 0

    totalInvestment += investment
    totalRevenue += revenue

    return [
      crop.cropName,
      formatCurrency(investment),
      formatCurrency(revenue),
      formatCurrency(revenue - investment),
    ]
  })

  // Add totals row
  financialData.push([
    'TOTAL',
    formatCurrency(totalInvestment),
    formatCurrency(totalRevenue),
    formatCurrency(totalRevenue - totalInvestment),
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Crop', 'Investment', 'Revenue', 'Net Profit']],
    body: financialData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    footStyles: { fontStyle: 'bold' },
  })

  return (doc as any).lastAutoTable.finalY + 15
}

/**
 * Format currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Export data to Excel format
 */
export async function exportToExcel(data: PDFExportData, options: ExportOptions): Promise<Blob> {
  // Placeholder for Excel export functionality
  // Would require a library like xlsx or exceljs
  throw new Error('Excel export not yet implemented')
}

/**
 * Export data to CSV format
 */
export async function exportToCSV(data: PDFExportData, options: ExportOptions): Promise<Blob> {
  let csvContent = ''

  if (data.farmPlan && options.sections.includes('crops')) {
    csvContent += 'Crop,Variety,Area (ha),Expected Yield,Status\n'
    data.farmPlan.crops.forEach((crop) => {
      csvContent += `${crop.cropName},${crop.variety || '-'},${crop.plantingArea},${crop.expectedYield} ${crop.yieldUnit},${crop.status}\n`
    })
  }

  return new Blob([csvContent], { type: 'text/csv' })
}
