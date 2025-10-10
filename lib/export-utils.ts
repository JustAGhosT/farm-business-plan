import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface CalculatorResult {
  id: string
  calculator_type: string
  input_data: any
  results: any
  notes?: string
  created_at: string
  farm_plan_name?: string
  crop_name?: string
}

export const exportToPDF = (results: CalculatorResult[], title: string = 'Calculator Results') => {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 20)

  // Add generation date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

  let yPosition = 40

  results.forEach((result, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // Section header
    doc.setFontSize(14)
    doc.text(
      `${index + 1}. ${result.calculator_type.toUpperCase()} - ${new Date(result.created_at).toLocaleDateString()}`,
      14,
      yPosition
    )
    yPosition += 8

    if (result.notes) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Notes: ${result.notes}`, 14, yPosition)
      doc.setTextColor(0, 0, 0)
      yPosition += 6
    }

    // Prepare table data
    const tableData: any[] = []

    // Add input data
    doc.setFontSize(11)
    doc.text('Input Parameters:', 14, yPosition)
    yPosition += 6

    Object.entries(result.input_data).forEach(([key, value]) => {
      tableData.push([formatKey(key), formatValue(value)])
    })

    // Add results
    tableData.push(['', '']) // Empty row separator
    tableData.push(['RESULTS', ''])
    tableData.push(['', '']) // Empty row separator

    Object.entries(result.results).forEach(([key, value]) => {
      tableData.push([formatKey(key), formatValue(value)])
    })

    // Create table
    autoTable(doc, {
      startY: yPosition,
      head: [['Parameter', 'Value']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14 },
      styles: { fontSize: 9 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  })

  // Save the PDF
  doc.save(`calculator-results-${Date.now()}.pdf`)
}

export const exportToCSV = (results: CalculatorResult[]) => {
  const headers = ['Date', 'Calculator Type', 'Notes', 'Input Data', 'Results']

  const rows = results.map((result) => [
    new Date(result.created_at).toLocaleString(),
    result.calculator_type,
    result.notes || '',
    JSON.stringify(result.input_data),
    JSON.stringify(result.results),
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `calculator-results-${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportSingleCalculatorToPDF = (result: CalculatorResult) => {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text(`${result.calculator_type.toUpperCase()} Calculator Report`, 14, 20)

  // Date
  doc.setFontSize(11)
  doc.text(`Date: ${new Date(result.created_at).toLocaleString()}`, 14, 30)

  // Notes
  if (result.notes) {
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(`Notes: ${result.notes}`, 14, 38)
    doc.setTextColor(0, 0, 0)
  }

  // Farm and Crop info
  let yPos = result.notes ? 46 : 38
  if (result.farm_plan_name) {
    doc.text(`Farm: ${result.farm_plan_name}`, 14, yPos)
    yPos += 6
  }
  if (result.crop_name) {
    doc.text(`Crop: ${result.crop_name}`, 14, yPos)
    yPos += 6
  }

  yPos += 5

  // Input Parameters Section
  doc.setFontSize(14)
  doc.text('Input Parameters', 14, yPos)
  yPos += 8

  const inputData: any[] = []
  Object.entries(result.input_data).forEach(([key, value]) => {
    inputData.push([formatKey(key), formatValue(value)])
  })

  autoTable(doc, {
    startY: yPos,
    body: inputData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14 },
    styles: { fontSize: 10 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // Results Section
  doc.setFontSize(14)
  doc.text('Calculation Results', 14, yPos)
  yPos += 8

  const resultsData: any[] = []
  Object.entries(result.results).forEach(([key, value]) => {
    resultsData.push([formatKey(key), formatValue(value)])
  })

  autoTable(doc, {
    startY: yPos,
    body: resultsData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14 },
    styles: { fontSize: 11, fontStyle: 'bold' },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pageCount} | Farm Business Plan © ${new Date().getFullYear()}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`${result.calculator_type}-report-${Date.now()}.pdf`)
}

// Helper functions
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    // Check if it's currency (common patterns)
    if (Math.abs(value) > 1000) {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
      }).format(value)
    }
    return value.toFixed(2)
  }
  return String(value)
}
