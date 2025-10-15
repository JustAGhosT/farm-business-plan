import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CropTemplate } from './cropTemplates'

interface WizardData {
  years: number
  crops: Array<{
    name: string
    percentage: number
  }>
  totalPercentage: number
}

interface CropAnalysis {
  name: string
  percentage: number
  hectares: number
  investment: number
  annualRevenue: number
  annualCosts: number
  annualProfit: number
  roi: number
  paybackYears: number
  waterNeeds: string
  profitability: string
}

/**
 * Generate comprehensive PDF report for wizard analysis
 */
export async function generateWizardPDF(
  wizardData: WizardData,
  totalHectares: number,
  cropTemplates: Map<string, CropTemplate>,
  sessionName?: string
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPos = 20

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage()
      yPos = 20
      return true
    }
    return false
  }

  // ===== COVER PAGE =====
  doc.setFillColor(34, 139, 34) // Green header
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Farm Business Plan', pageWidth / 2, 25, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Multi-Crop Financial Analysis Report', pageWidth / 2, 33, { align: 'center' })

  yPos = 60
  doc.setTextColor(0, 0, 0)

  // Session Info
  if (sessionName) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Project: ${sessionName}`, 20, yPos)
    yPos += 10
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-ZA')}`, 20, yPos)
  yPos += 8
  doc.text(`Planning Period: ${wizardData.years} years`, 20, yPos)
  yPos += 8
  doc.text(`Total Land: ${totalHectares} hectares`, 20, yPos)
  yPos += 8
  doc.text(`Number of Crops: ${wizardData.crops.length}`, 20, yPos)
  yPos += 15

  // ===== EXECUTIVE SUMMARY =====
  checkPageBreak(30)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const summaryText =
    'This report provides a comprehensive financial analysis of a diversified ' +
    `farming operation over a ${wizardData.years}-year period. The analysis includes ` +
    'investment requirements, revenue projections, profitability metrics, and return on investment ' +
    'calculations for each crop in the portfolio.'
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40)
  doc.text(splitSummary, 20, yPos)
  yPos += splitSummary.length * 5 + 10

  // ===== CROP ALLOCATION =====
  checkPageBreak(50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Crop Allocation', 20, yPos)
  yPos += 10

  const allocationData = wizardData.crops.map((crop) => {
    const hectares = (crop.percentage / 100) * totalHectares
    return [crop.name, `${crop.percentage}%`, hectares.toFixed(2)]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Crop', 'Allocation %', 'Hectares']],
    body: allocationData,
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // ===== FINANCIAL ANALYSIS =====
  checkPageBreak(50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Financial Analysis by Crop', 20, yPos)
  yPos += 10

  const analyses: CropAnalysis[] = []
  let totalInvestment = 0
  let totalAnnualRevenue = 0
  let totalAnnualCosts = 0

  wizardData.crops.forEach((crop) => {
    const template = cropTemplates.get(crop.name)
    if (template) {
      const hectares = (crop.percentage / 100) * totalHectares
      const investment = template.initialInvestmentPerHa * hectares
      const cropRevenue = template.baseProduction * template.basePrice
      const cropCosts =
        template.fixedCostsPerHa + template.variableCostPerUnit * template.baseProduction
      const annualRevenue = cropRevenue * hectares
      const annualCosts = cropCosts * hectares
      const annualProfit = annualRevenue - annualCosts
      const roi = investment > 0 ? (annualProfit / investment) * 100 : 0
      const paybackYears = annualProfit > 0 ? investment / annualProfit : 999

      totalInvestment += investment
      totalAnnualRevenue += annualRevenue
      totalAnnualCosts += annualCosts

      analyses.push({
        name: crop.name,
        percentage: crop.percentage,
        hectares,
        investment,
        annualRevenue,
        annualCosts,
        annualProfit,
        roi,
        paybackYears,
        waterNeeds: template.waterNeeds || 'Medium',
        profitability: template.profitability || 'Medium',
      })
    }
  })

  const financialData = analyses.map((a) => [
    a.name,
    `R ${a.investment.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    `R ${a.annualRevenue.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    `R ${a.annualCosts.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    `R ${a.annualProfit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    `${a.roi.toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Crop', 'Investment', 'Annual Revenue', 'Annual Costs', 'Annual Profit', 'ROI']],
    body: financialData,
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // ===== PORTFOLIO SUMMARY =====
  checkPageBreak(60)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Portfolio Summary', 20, yPos)
  yPos += 10

  const totalAnnualProfit = totalAnnualRevenue - totalAnnualCosts
  const portfolioROI = totalInvestment > 0 ? (totalAnnualProfit / totalInvestment) * 100 : 0
  const portfolioPayback = totalAnnualProfit > 0 ? totalInvestment / totalAnnualProfit : 0

  const summaryData = [
    [
      'Total Initial Investment',
      `R ${totalInvestment.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    ],
    [
      'Total Annual Revenue',
      `R ${totalAnnualRevenue.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    ],
    [
      'Total Annual Costs',
      `R ${totalAnnualCosts.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    ],
    [
      'Total Annual Profit',
      `R ${totalAnnualProfit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    ],
    ['Portfolio ROI', `${portfolioROI.toFixed(1)}%`],
    ['Payback Period', `${portfolioPayback.toFixed(1)} years`],
    [
      `${wizardData.years}-Year Net Profit`,
      `R ${(totalAnnualProfit * wizardData.years).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    ],
  ]

  autoTable(doc, {
    startY: yPos,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // ===== MULTI-YEAR PROJECTIONS =====
  doc.addPage()
  yPos = 20

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${wizardData.years}-Year Financial Projections`, 20, yPos)
  yPos += 10

  const yearlyData: any[] = []
  for (let year = 1; year <= wizardData.years; year++) {
    const yearRevenue = totalAnnualRevenue * Math.pow(1.05, year - 1) // 5% growth
    const yearCosts = totalAnnualCosts * Math.pow(1.03, year - 1) // 3% inflation
    const yearProfit = yearRevenue - yearCosts
    const cumulativeProfit =
      yearlyData.reduce((sum, row) => sum + parseFloat(row[3].replace(/[^0-9.-]/g, '')), 0) +
      yearProfit

    yearlyData.push([
      `Year ${year}`,
      `R ${yearRevenue.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      `R ${yearCosts.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      `R ${yearProfit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      `R ${cumulativeProfit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
    ])
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Year', 'Revenue', 'Costs', 'Profit', 'Cumulative Profit']],
    body: yearlyData,
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // ===== CROP DETAILS =====
  checkPageBreak(60)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailed Crop Information', 20, yPos)
  yPos += 10

  analyses.forEach((crop) => {
    checkPageBreak(50)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(crop.name, 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const cropDetails = [
      ['Allocation', `${crop.percentage}% (${crop.hectares.toFixed(2)} ha)`],
      ['Water Needs', crop.waterNeeds],
      ['Profitability Rating', crop.profitability],
      [
        'Initial Investment',
        `R ${crop.investment.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      ],
      [
        'Annual Revenue',
        `R ${crop.annualRevenue.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      ],
      [
        'Annual Costs',
        `R ${crop.annualCosts.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      ],
      [
        'Annual Profit',
        `R ${crop.annualProfit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`,
      ],
      ['ROI', `${crop.roi.toFixed(1)}%`],
      [
        'Payback Period',
        crop.paybackYears < 50 ? `${crop.paybackYears.toFixed(1)} years` : 'Not viable',
      ],
    ]

    autoTable(doc, {
      startY: yPos,
      body: cropDetails,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'left' },
      },
      margin: { left: 30, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  })

  // ===== FOOTER ON EACH PAGE =====
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated by Farm Business Plan Calculator | ${new Date().toLocaleDateString('en-ZA')} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Save the PDF
  const fileName = sessionName
    ? `${sessionName.replace(/[^a-z0-9]/gi, '_')}_analysis.pdf`
    : `farm_analysis_${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(fileName)

  return fileName
}
