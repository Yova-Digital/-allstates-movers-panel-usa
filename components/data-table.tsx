"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  isLoading?: boolean
  searchFields?: string[] // Multiple fields to search across
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  isLoading = false,
  searchFields = [], // Default to empty array
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  
  // Create a custom filter function for both direct and nested properties
  const customFilterFn = (row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true
    
    const searchTerm = filterValue.toLowerCase()
    
    // If additional search fields are provided, check all of them
    if (searchFields && searchFields.length > 0) {
      // First check in custom search fields
      for (const field of searchFields) {
        if (field === 'customer') {
          // Special case for customer objects
          const customer = row.original.customer
          if (customer && typeof customer === 'object') {
            // Check customer name, email and phone
            if (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm)) {
              return true
            }
            if (customer.email && customer.email.toLowerCase().includes(searchTerm)) {
              return true
            }
            if (customer.phone && customer.phone.toLowerCase().includes(searchTerm)) {
              return true
            }
          }
        } else if (field.includes(".")) {
          // Handle nested properties with dot notation
          const parts = field.split(".")
          let value = row.original
          
          // Navigate through the nested objects
          for (const part of parts) {
            if (value && typeof value === 'object') {
              value = value[part]
            } else {
              value = null
              break
            }
          }
          
          if (value && String(value).toLowerCase().includes(searchTerm)) {
            return true
          }
        } else {
          // Direct property search
          const value = row.original[field]
          if (value && String(value).toLowerCase().includes(searchTerm)) {
            return true
          }
        }
      }
      
      return false
    }
    
    // If no searchFields, use the original searchKey logic
    // Handle nested properties with dot notation
    if (searchKey && searchKey.includes(".")) {
      const parts = searchKey.split(".")
      let value = row.original
      
      // Navigate through the nested objects
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part]
        } else {
          value = null
          break
        }
      }
      
      // Check if the value contains the filter value
      return value && String(value).toLowerCase().includes(searchTerm)
    } 
    // Special case for customer object in requests page
    else if (searchKey === "customer") {
      const customer = row.original.customer
      
      // Handle when customer is an object with fullName property
      if (customer && typeof customer === 'object') {
        if (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm)) {
          return true
        }
        if (customer.email && customer.email.toLowerCase().includes(searchTerm)) {
          return true
        }
        if (customer.phone && customer.phone.toLowerCase().includes(searchTerm)) {
          return true
        }
      }
      
      // Otherwise, no match
      return false
    }
    // Handle direct properties
    else if (searchKey) {
      const value = row.original[searchKey]
      return value && String(value).toLowerCase().includes(searchTerm)
    }
    
    return false
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: customFilterFn,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchKey ? globalFilter : undefined,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-2">
        {searchKey && (
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
              disabled={isLoading}
            />
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {Array.from({ length: columns.length }).map((_, cellIndex) => (
                    <TableCell key={`loading-cell-${cellIndex}`}>
                      <div className="h-6 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-full max-w-[120px]"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {isLoading ? (
            <div className="h-5 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-48"></div>
          ) : (
            <span>Showing {table.getFilteredRowModel().rows.length} of {data.length} results</span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={isLoading || !table.getCanPreviousPage()}
            className="hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={isLoading || !table.getCanNextPage()}
            className="hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
