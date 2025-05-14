"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, Mail, Phone, User, FileText, Edit, Loader2, FileCheck, History, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// The DashboardLayout is already provided by the parent layout
import { DataTable } from "@/components/data-table"
import { fetchAPI } from "@/services/api.service"
import { getAllCustomers, getCustomerDetails, updateCustomerNotes } from "@/services/customer-api.service"
import { ExportButtons } from "@/components/export-buttons"
import { ExportCsvButton } from "@/components/export-csv-button"

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  isReturning: boolean;
  requestCount: number;
  lastRequest: string;
  notes: string;
  createdAt: string;
}

interface CustomerQuote {
  _id: string;
  fromAddress: {
    city: string;
    state: string;
  };
  toAddress: {
    city: string;
    state: string;
  };
  movingDate: string;
  moveSize: string;
  serviceType: string;
  status: string;
  estimatedPrice: number;
  createdAt: string;
}

export default function CustomersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerQuotes, setCustomerQuotes] = useState<CustomerQuote[]>([])
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [customerNotes, setCustomerNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [exportData, setExportData] = useState<any[]>([])
  
  // Load customers from API
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true)
        const response = await getAllCustomers()
        
        if (response.success) {
          setCustomers(response.data)
        }
      } catch (error) {
        console.error("Error loading customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomers()
  }, [toast])
  
  // Prepare export data whenever customers change
  useEffect(() => {
    if (customers.length > 0) {
      const data = customers.map(customer => {
        return {
          ID: customer._id.substring(0, 8) + '...',
          Name: customer.fullName,
          Email: customer.email,
          Phone: customer.phone,
          Status: customer.isReturning ? 'Returning Customer' : 'New Customer',
          RequestCount: customer.requestCount || 0,
          LastRequest: customer.lastRequest ? new Date(customer.lastRequest).toLocaleDateString() : 'N/A',
          JoinedOn: new Date(customer.createdAt).toLocaleDateString()
        }
      })
      setExportData(data)
    }
  }, [customers])

  // Handle viewing customer details
  const handleViewCustomer = async (customerId: string) => {
    try {
      // Show loading state and open dialog immediately
      setSelectedCustomer(null)
      setCustomerQuotes([])
      setShowDetailsDialog(true)
      setIsUpdating(true)
      
      const response = await getCustomerDetails(customerId)
      
      if (response.success) {
        setSelectedCustomer(response.data.customer)
        setCustomerQuotes(response.data.quotes || [])
        setCustomerNotes(response.data.customer.notes || '')
      } else {
        throw new Error('Failed to fetch customer details')
      }
    } catch (error) {
      console.error("Error loading customer details:", error)
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive"
      })
      // Close dialog on error
      setShowDetailsDialog(false)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle updating customer notes
  const handleUpdateNotes = async () => {
    if (!selectedCustomer) return
    
    setIsUpdating(true)
    
    try {
      const response = await updateCustomerNotes(selectedCustomer._id, customerNotes)
      
      if (response.success) {
        // Update customer in local state
        setCustomers(customers.map(c => 
          c._id === selectedCustomer._id
            ? { ...c, notes: customerNotes }
            : c
        ))
        
        setShowDetailsDialog(false)
        
        toast({
          title: "Success",
          description: "Customer notes updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating customer notes:", error)
      toast({
        title: "Error",
        description: "Failed to update customer notes",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Format move size for display
  const formatMoveSize = (moveSize: string) => {
    const sizeMappings: Record<string, string> = {
      'studio': 'Studio',
      '1bedroom': '1 Bedroom',
      '2bedroom': '2 Bedroom',
      '3bedroom': '3 Bedroom',
      '4bedroom': '4+ Bedroom',
      'office_small': 'Small Office',
      'office_large': 'Large Office',
      'other': 'Other'
    };
    
    return sizeMappings[moveSize] || moveSize;
  };

  // Define table columns
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center p-0 hover:bg-transparent hover:text-blue-500"
          >
            <User className="mr-2 h-4 w-4 text-blue-500" />
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex items-center">
            <span className="font-medium">{customer.fullName}</span>
            {customer.isReturning && (
              <Badge className="ml-2 bg-blue-500 hover:bg-blue-500">
                Returning
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.email
        return (
          <a href={`mailto:${email}`} className="text-blue-500 hover:underline flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            {email}
          </a>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone
        return (
          <a href={`tel:${phone}`} className="text-blue-500 hover:underline flex items-center">
            <Phone className="mr-2 h-4 w-4" />
            {phone}
          </a>
        )
      },
    },
    {
      accessorKey: "requestCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center p-0 hover:bg-transparent hover:text-blue-500"
          >
            <FileText className="mr-2 h-4 w-4 text-blue-500" />
            Requests
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return row.original.requestCount
      },
    },
    {
      accessorKey: "lastRequest",
      header: "Last Activity",
      cell: ({ row }) => {
        const lastRequest = row.original.lastRequest ? new Date(row.original.lastRequest).toLocaleDateString() : 'Never'
        return (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
            {lastRequest}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewCustomer(row.original._id)}
            className="flex items-center hover:bg-blue-50 hover:text-blue-500"
          >
            <FileCheck className="mr-2 h-4 w-4" />
            View Details
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">
              View and manage customer information
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportCsvButton
              data={exportData}
              fileName="us50-customers"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  customers.length
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Returning Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  customers.filter(c => c.isReturning).length
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Total Quote Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  customers.reduce((total, customer) => total + customer.requestCount, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Customer Management</h2>
          <DataTable
            columns={columns}
            data={customers}
            searchKey="fullName"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["fullName", "email", "phone"]}
          />
        </div>
        
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {isUpdating && !selectedCustomer ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading customer details...</p>
              </div>
            ) : selectedCustomer ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-500" />
                    {selectedCustomer.fullName}
                    {selectedCustomer.isReturning && (
                      <Badge className="ml-2 bg-blue-500 hover:bg-blue-500">
                        Returning Customer
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Customer details and quote history
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium flex items-center mb-4">
                        <User className="mr-2 h-4 w-4 text-blue-500" />
                        Customer Information
                      </h3>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Name:</span>
                          <span className="text-sm font-semibold">
                            {selectedCustomer.fullName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Email:</span>
                          <a href={`mailto:${selectedCustomer.email}`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {selectedCustomer.email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Phone:</span>
                          <a href={`tel:${selectedCustomer.phone}`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {selectedCustomer.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Customer Since:</span>
                          <span className="text-sm font-semibold flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Total Requests:</span>
                          <span className="text-sm font-semibold">{selectedCustomer.requestCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center mb-4">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        Customer Notes
                      </h3>
                      <Textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Add notes about this customer"
                        className="min-h-[120px]"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium flex items-center mb-4">
                        <History className="mr-2 h-4 w-4 text-blue-500" />
                        Quote History
                      </h3>
                      <div className="space-y-3 mt-4">
                        {customerQuotes.length > 0 ? (
                          customerQuotes.map((quote) => (
                            <div key={quote._id} className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(quote.createdAt).toLocaleDateString()}
                                  </span>
                                  <div className="font-medium">
                                    {quote.fromAddress.city}, {quote.fromAddress.state} to {quote.toAddress.city}, {quote.toAddress.state}
                                  </div>
                                </div>
                                <Badge
                                  className={`
                                    ${quote.status === "pending" ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20" : ""}
                                    ${quote.status === "in-progress" ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20" : ""}
                                    ${quote.status === "completed" ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : ""}
                                    ${quote.status === "cancelled" ? "bg-red-500/20 text-red-500 hover:bg-red-500/20" : ""}
                                  `}
                                >
                                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">Moving:</span>
                                <span>{new Date(quote.movingDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">Size:</span>
                                <span>{formatMoveSize(quote.moveSize)}</span>
                              </div>
                              <div className="flex items-center text-sm mt-1">
                                <span className="font-medium mr-2">Price:</span>
                                <span className="text-green-600 dark:text-green-400 font-bold">
                                  ${quote.estimatedPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No quote history available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleUpdateNotes} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
