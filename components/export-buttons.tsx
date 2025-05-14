"use client"

import { useState } from "react"
import { Download, FileText, Table, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ExportButtonsProps {
  data: any[]
  fileName: string
  exportPdfTitle: string
  exportCsvTitle?: string
}

export function ExportButtons({ data, fileName, exportPdfTitle, exportCsvTitle }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToPdf = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Add title and date
      doc.setFontSize(18)
      doc.setTextColor(13, 71, 161) // Blue color for title
      doc.text(exportPdfTitle, 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
      
      // Add logo or header if necessary
      // doc.addImage(logoBase64, 'PNG', 170, 10, 25, 25)
      
      // Create the table from the data
      if (data.length > 0) {
        // Extract column headers from first row
        const headers = Object.keys(data[0]).map(key => {
          // Convert camelCase to Title Case
          return key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ')
            .replace(/Id\b/g, 'ID')
        })
        
        // Extract values
        const rows = data.map(item => Object.values(item).map(value => {
          // Format values appropriately
          if (value === null || value === undefined) return 'N/A'
          if (typeof value === 'object') return JSON.stringify(value)
          if (typeof value === 'boolean') return value ? 'Yes' : 'No'
          return String(value)
        }))
        
        // Add the table
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 40,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [49, 130, 206], // blue-500
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [240, 245, 255]
          }
        })
        
        // Add footer
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.text(
            `Page ${i} of ${pageCount} - US50 Transport LLC`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          )
        }
      } else {
        // Handle empty data
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text('No data available to export', 14, 50)
      }
      
      // Save the PDF
      doc.save(`${fileName}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCsv = () => {
    setIsExporting(true)
    try {
      // Format the data for CSV
      const formattedData = data.map(item => {
        const newItem: Record<string, any> = {}
        
        // Process each field
        Object.entries(item).forEach(([key, value]) => {
          // Convert camelCase to Title Case for column headers
          const formattedKey = key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ')
            .replace(/Id\b/g, 'ID')
          
          // Format the value
          let formattedValue = value
          if (value === null || value === undefined) formattedValue = ''
          else if (typeof value === 'object') formattedValue = JSON.stringify(value)
          
          newItem[formattedKey] = formattedValue
        })
        
        return newItem
      })
      
      // Generate CSV string with UTF-8 BOM to ensure Excel opens it correctly
      const csv = '\ufeff' + Papa.unparse(formattedData, {
        delimiter: ',',
        header: true,
        skipEmptyLines: true
      })
      
      // Create a more reliable download mechanism
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // Create a link and force download
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.download = `${fileName}.csv`
      
      // Make sure the link is in the DOM
      document.body.appendChild(link)
      
      // Trigger click programmatically
      setTimeout(() => {
        link.click()
        document.body.removeChild(link)
        // Clean up the URL created
        setTimeout(() => URL.revokeObjectURL(url), 100)
      }, 0)
      
      // Show success toast when download starts
      toast({
        title: "CSV Export",
        description: "Your data is being downloaded as CSV",
      })
      
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export data as CSV. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto h-8 gap-1 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500"
                disabled={isExporting || data.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Export data to PDF or CSV</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem 
            onClick={exportToPdf}
            disabled={isExporting}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 text-blue-500" />
            )}
            <span>{isExporting ? "Exporting..." : "Export to PDF"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={exportToCsv}
            disabled={isExporting}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              <Table className="h-4 w-4 text-blue-500" />
            )}
            <span>{isExporting ? "Exporting..." : "Export to CSV"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
