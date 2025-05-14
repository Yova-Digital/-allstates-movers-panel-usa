"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ExportCsvButtonProps {
  data: any[]
  fileName: string
  label?: string
}

export function ExportCsvButton({ data, fileName, label = "Export CSV" }: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToCsv = () => {
    if (data.length === 0) return
    setIsExporting(true)
    
    try {
      // Create CSV content directly
      let csvContent = []
      
      // Create headers from the first item
      const headers = Object.keys(data[0]).map(key => {
        return key.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace(/_/g, ' ')
          .replace(/Id\b/g, 'ID')
      })
      csvContent.push(headers.join(','))
      
      // Add data rows
      data.forEach(item => {
        const row = Object.values(item).map(value => {
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          
          // Properly escape values with commas or quotes
          const valueStr = String(value)
          if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
            return `"${valueStr.replace(/"/g, '""')}"`
          }
          return valueStr
        })
        csvContent.push(row.join(','))
      })
      
      // Create CSV string and download
      const csvString = csvContent.join('\n')
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString)
      
      // Create and trigger download
      const downloadLink = document.createElement('a')
      downloadLink.setAttribute('href', dataUri)
      downloadLink.setAttribute('download', `${fileName}.csv`)
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      
      toast({
        title: "Export Successful",
        description: `Data exported to ${fileName}.csv`
      })
    } catch (error) {
      console.error('CSV Export Error:', error)
      toast({
        title: "Export Failed",
        description: "Could not export CSV. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCsv}
      disabled={isExporting || data.length === 0}
      className="ml-auto h-8 gap-1 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500"
    >
      {isExporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span>{isExporting ? "Exporting..." : label}</span>
    </Button>
  )
}
