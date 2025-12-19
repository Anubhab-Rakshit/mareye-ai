// @ts-ignore - jsPDF types
import jsPDF from 'jspdf'
// @ts-ignore - autoTable plugin (side-effect import to extend jsPDF prototype)
import 'jspdf-autotable'
// @ts-ignore - autoTable function import (fallback)
import autoTable from 'jspdf-autotable'

interface AnalyticsData {
  analysisName: string
  reportData: any
  graphs: Record<string, string>
  timestamp?: string
}

interface EnhancementResult {
  originalFileName?: string
  metrics?: {
    psnr?: number
    ssim?: number
    uiqm_original?: number
    uiqm_enhanced?: number
    uiqm_improvement?: number
    processingTime?: number
  }
}

export async function generateAnalyticsPDF(
  analytics: AnalyticsData,
  result: EnhancementResult
): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Helper function to use autoTable (supports both function and method syntax)
    const useAutoTable = (options: any) => {
      if (typeof (doc as any).autoTable === 'function') {
        // Use method syntax if available (side-effect import worked)
        (doc as any).autoTable(options)
      } else if (typeof autoTable === 'function') {
        // Use function syntax (default import)
        (autoTable as any)(doc, options)
      } else {
        throw new Error('autoTable is not available. Please ensure jspdf-autotable is properly installed.')
      }
    }
    
    // Helper to get lastAutoTable finalY
    const getLastAutoTableFinalY = (): number => {
      if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY !== undefined) {
        return (doc as any).lastAutoTable.finalY
      }
      throw new Error('lastAutoTable is not available. autoTable may not have been called successfully.')
    }
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - 20) {
        doc.addPage()
        yPosition = 20
      }
    }

    // Helper function to get base64 without data URL prefix
    const getBase64Data = (base64String: string): string => {
      if (!base64String) return ''
      if (base64String.includes(',')) {
        return base64String.split(',')[1]
      }
      return base64String
    }

    // Helper function to add image from base64 (synchronous version)
    const addImageFromBase64 = (base64Data: string, width: number, height: number, title: string) => {
      try {
        checkPageBreak(height + 30)
        
        // Add title
        doc.setFontSize(12)
        doc.setTextColor(0, 150, 255)
        doc.text(title, pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 8

        // Clean base64 data
        const cleanBase64 = getBase64Data(base64Data)
        if (!cleanBase64) {
          throw new Error('Empty base64 data')
        }

        // Add image directly
        doc.addImage(cleanBase64, 'PNG', (pageWidth - width) / 2, yPosition, width, height, undefined, 'FAST')
        yPosition += height + 10
      } catch (error) {
        console.error(`Error adding image ${title}:`, error)
        checkPageBreak(20)
        doc.setFontSize(10)
        doc.setTextColor(255, 0, 0)
        doc.text(`Error loading image: ${title}`, 10, yPosition)
        yPosition += 10
      }
    }

    // Title Page
    doc.setFontSize(24)
    doc.setTextColor(0, 150, 255)
    doc.text('MarEye CNN Enhancement', pageWidth / 2, 40, { align: 'center' })
    
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text('Comprehensive Analytics Report', pageWidth / 2, 55, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    const analysisName = analytics.analysisName || 'Unknown Analysis'
    doc.text(`Analysis: ${analysisName}`, pageWidth / 2, 70, { align: 'center' })
    
    if (analytics.timestamp) {
      try {
        doc.text(`Generated: ${new Date(analytics.timestamp).toLocaleString()}`, pageWidth / 2, 78, { align: 'center' })
      } catch (e) {
        doc.text(`Generated: ${analytics.timestamp}`, pageWidth / 2, 78, { align: 'center' })
      }
    }

    yPosition = 100

    // Executive Summary
    checkPageBreak(60)
    doc.setFontSize(16)
    doc.setTextColor(0, 150, 255)
    doc.text('Executive Summary', 10, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    if (result.metrics) {
      const metrics = [
        ['Metric', 'Value'],
        ['PSNR', `${result.metrics.psnr?.toFixed(2) || 'N/A'} dB`],
        ['SSIM', `${result.metrics.ssim?.toFixed(3) || 'N/A'}`],
        ['UIQM Original', `${result.metrics.uiqm_original?.toFixed(2) || 'N/A'}`],
        ['UIQM Enhanced', `${result.metrics.uiqm_enhanced?.toFixed(2) || 'N/A'}`],
        ['UIQM Improvement', `${result.metrics.uiqm_improvement?.toFixed(2) || 'N/A'}`],
        ['Processing Time', `${result.metrics.processingTime?.toFixed(2) || 'N/A'}s`],
      ]

      useAutoTable({
        startY: yPosition,
        head: [metrics[0]],
        body: metrics.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [0, 150, 255], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      })

      yPosition = getLastAutoTableFinalY() + 15
    }

    // Quality Assessment
    if (analytics.reportData?.quality_assessment) {
      checkPageBreak(50)
      doc.setFontSize(16)
      doc.setTextColor(0, 150, 255)
      doc.text('Quality Assessment', 10, yPosition)
      yPosition += 10

      const quality = analytics.reportData.quality_assessment
      const qualityData = [
        ['Assessment Type', 'Result'],
        ['PSNR Quality', quality.psnr_quality || 'N/A'],
        ['SSIM Quality', quality.ssim_quality || 'N/A'],
        ['UIQM Quality', quality.uiqm_quality || 'N/A'],
        ['Overall Assessment', quality.overall_assessment || 'N/A'],
      ]

      useAutoTable({
        startY: yPosition,
        head: [qualityData[0]],
        body: qualityData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [0, 200, 100], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      })

      yPosition = getLastAutoTableFinalY() + 15
    }

    // Add all graphs with fixed dimensions
    const graphTitles: Record<string, string> = {
      quality_dashboard: 'Quality Dashboard - Comprehensive Overview',
      basic_metrics: 'Basic Enhancement Metrics',
      color_analysis: 'Color Analysis',
      texture_edge_analysis: 'Texture & Edge Analysis',
      histogram_analysis: 'Histogram Analysis',
      brightness_contrast_analysis: 'Brightness & Contrast Analysis',
    }

    const graphOrder = [
      'quality_dashboard',
      'basic_metrics',
      'color_analysis',
      'texture_edge_analysis',
      'histogram_analysis',
      'brightness_contrast_analysis',
    ]

    for (const graphKey of graphOrder) {
      if (analytics.graphs && analytics.graphs[graphKey]) {
        try {
          // Use fixed dimensions for all graphs to avoid image loading issues
          const graphWidth = 180 // mm
          const graphHeight = 100 // mm
          
          addImageFromBase64(
            analytics.graphs[graphKey],
            graphWidth,
            graphHeight,
            graphTitles[graphKey] || graphKey
          )
        } catch (error) {
          console.error(`Error processing graph ${graphKey}:`, error)
          checkPageBreak(20)
          doc.setFontSize(10)
          doc.setTextColor(255, 0, 0)
          doc.text(`Error loading graph: ${graphTitles[graphKey] || graphKey}`, 10, yPosition)
          yPosition += 10
        }
      }
    }

    // Detailed Metrics Section
    if (analytics.reportData?.basic_metrics) {
      checkPageBreak(40)
      doc.setFontSize(16)
      doc.setTextColor(0, 150, 255)
      doc.text('Detailed Metrics', 10, yPosition)
      yPosition += 10

      const basic = analytics.reportData.basic_metrics
      const detailedMetrics = [
        ['Metric', 'Value'],
        ['PSNR', `${basic.psnr?.toFixed(4) || 'N/A'} dB`],
        ['SSIM', `${basic.ssim?.toFixed(4) || 'N/A'}`],
        ['UIQM Original', `${basic.uiqm_original?.toFixed(4) || 'N/A'}`],
        ['UIQM Enhanced', `${basic.uiqm_enhanced?.toFixed(4) || 'N/A'}`],
        ['UIQM Improvement', `${basic.uiqm_improvement?.toFixed(4) || 'N/A'}`],
      ]

      useAutoTable({
        startY: yPosition,
        head: [detailedMetrics[0]],
        body: detailedMetrics.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      })

      yPosition = getLastAutoTableFinalY() + 15
    }

    // Advanced Analysis Summary
    if (analytics.reportData?.advanced_analysis) {
      checkPageBreak(80)
      doc.setFontSize(16)
      doc.setTextColor(0, 150, 255)
      doc.text('Advanced Analysis Summary', 10, yPosition)
      yPosition += 10

      const advanced = analytics.reportData.advanced_analysis

      // Color Analysis
      if (advanced.color_analysis) {
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Color Analysis:', 10, yPosition)
        yPosition += 8

        const colorData = [
          ['Property', 'Original', 'Enhanced', 'Improvement'],
          [
            'Colorfulness',
            String(advanced.color_analysis.colorfulness_original?.toFixed(2) || 'N/A'),
            String(advanced.color_analysis.colorfulness_enhanced?.toFixed(2) || 'N/A'),
            String((advanced.color_analysis.colorfulness_improvement || 0).toFixed(2)),
          ],
          [
            'Unique Colors',
            String(advanced.color_analysis.unique_colors_original?.toLocaleString() || 'N/A'),
            String(advanced.color_analysis.unique_colors_enhanced?.toLocaleString() || 'N/A'),
            '-',
          ],
        ]

        useAutoTable({
          startY: yPosition,
          head: [colorData[0]],
          body: colorData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [200, 100, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
        })

        yPosition = getLastAutoTableFinalY() + 10
      }

      // Texture Analysis
      if (advanced.texture_analysis) {
        checkPageBreak(30)
        doc.setFontSize(12)
        doc.text('Texture Analysis:', 10, yPosition)
        yPosition += 8

        const textureData = [
          ['Property', 'Original', 'Enhanced', 'Improvement'],
          [
            'Texture Variance',
            String(advanced.texture_analysis.texture_variance_original?.toFixed(2) || 'N/A'),
            String(advanced.texture_analysis.texture_variance_enhanced?.toFixed(2) || 'N/A'),
            String((advanced.texture_analysis.texture_improvement || 0).toFixed(2)),
          ],
          [
            'Gradient Magnitude',
            String(advanced.texture_analysis.gradient_magnitude_original?.toFixed(2) || 'N/A'),
            String(advanced.texture_analysis.gradient_magnitude_enhanced?.toFixed(2) || 'N/A'),
            String((advanced.texture_analysis.gradient_improvement || 0).toFixed(2)),
          ],
        ]

        useAutoTable({
          startY: yPosition,
          head: [textureData[0]],
          body: textureData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [150, 0, 200], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
        })

        yPosition = getLastAutoTableFinalY() + 10
      }

      // Brightness & Contrast
      if (advanced.brightness_contrast) {
        checkPageBreak(30)
        doc.setFontSize(12)
        doc.text('Brightness & Contrast:', 10, yPosition)
        yPosition += 8

        const bcData = [
          ['Property', 'Original', 'Enhanced', 'Change'],
          [
            'Brightness',
            String(advanced.brightness_contrast.brightness_original?.toFixed(2) || 'N/A'),
            String(advanced.brightness_contrast.brightness_enhanced?.toFixed(2) || 'N/A'),
            String((advanced.brightness_contrast.brightness_change || 0).toFixed(2)),
          ],
          [
            'Contrast',
            String(advanced.brightness_contrast.contrast_original?.toFixed(2) || 'N/A'),
            String(advanced.brightness_contrast.contrast_enhanced?.toFixed(2) || 'N/A'),
            String((advanced.brightness_contrast.contrast_change || 0).toFixed(2)),
          ],
          [
            'Dynamic Range',
            String(advanced.brightness_contrast.dynamic_range_original?.toFixed(2) || 'N/A'),
            String(advanced.brightness_contrast.dynamic_range_enhanced?.toFixed(2) || 'N/A'),
            String((advanced.brightness_contrast.dynamic_range_change || 0).toFixed(2)),
          ],
        ]

        useAutoTable({
          startY: yPosition,
          head: [bcData[0]],
          body: bcData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [0, 200, 150], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
        })

        yPosition = getLastAutoTableFinalY() + 10
      }
    }

    // Footer on last page
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${totalPages} - MarEye CNN Enhancement Analytics`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save PDF
    const fileName = `${analysisName.replace(/[^a-z0-9]/gi, '_')}_report.pdf`
    doc.save(fileName)
  } catch (error) {
    console.error('PDF Generation Error:', error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
