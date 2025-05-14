"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, CalendarClock, CheckCircle, Clock, Truck, User, X, AlertCircle, MapPin, Phone, Mail, Edit, FileText, Download } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// The DashboardLayout is already provided by the parent layout
import { DataTable } from "@/components/data-table"
import { fetchAPI } from "@/services/api.service"
import { getAllQuotes, updateQuoteStatus, updateQuoteDetails } from "@/services/quote-api.service"
import type { ColumnDef } from "@tanstack/react-table"
import { ExportButtons } from "@/components/export-buttons"
import { ExportCsvButton } from "@/components/export-csv-button"

interface Quote {
  _id: string;
  customer: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    isReturning: boolean;
  };
  fromAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  toAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  movingDate: string;
  deliveryDate: string;
  moveSize: string;
  serviceType: string;
  status: string;
  estimatedPrice: number;
  createdAt: string;
  adminNotes?: string;
}

export default function QuotesPage() {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState<string>("")
  const [newStatus, setNewStatus] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [exportData, setExportData] = useState<any[]>([])
  
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

  // Format address for display
  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  // Load quotes from API
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuotes()
        
        if (response.success) {
          setQuotes(response.data)
        }
      } catch (error) {
        console.error("Error loading quotes:", error)
        toast({
          title: "Error",
          description: "Failed to load quote requests",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadQuotes()
  }, [toast])

  // Prepare export data whenever quotes change
  useEffect(() => {
    if (quotes.length > 0) {
      const data = quotes.map(quote => {
        return {
          ID: quote._id.substring(0, 8) + '...',
          Customer: quote.customer.fullName,
          Email: quote.customer.email,
          Phone: quote.customer.phone,
          FromLocation: `${quote.fromAddress.city}, ${quote.fromAddress.state}`,
          ToLocation: `${quote.toAddress.city}, ${quote.toAddress.state}`,
          MoveSize: formatMoveSize(quote.moveSize),
          MovingDate: new Date(quote.movingDate).toLocaleDateString(),
          DeliveryDate: new Date(quote.deliveryDate).toLocaleDateString(),
          Status: quote.status.charAt(0).toUpperCase() + quote.status.slice(1),
          Price: quote.estimatedPrice ? `$${quote.estimatedPrice.toFixed(2)}` : 'N/A',
          CreatedAt: new Date(quote.createdAt).toLocaleDateString()
        }
      })
      setExportData(data)
    }
  }, [quotes])

  // Handle opening the details dialog
  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote)
    setAdminNotes(quote.adminNotes || "")
    setEstimatedPrice(quote.estimatedPrice ? quote.estimatedPrice.toString() : "")
    setNewStatus(quote.status)
    setShowDetailsDialog(true)
  }

  // Handle updating quote status
  const handleUpdateStatus = async () => {
    if (!selectedQuote) return
    
    setIsUpdating(true)
    
    try {
      // First update price and notes
      if (estimatedPrice !== (selectedQuote.estimatedPrice?.toString() || "") || 
          adminNotes !== (selectedQuote.adminNotes || "")) {
        
        const priceResponse = await updateQuoteDetails(
          selectedQuote._id, 
          parseFloat(estimatedPrice) || 0, 
          adminNotes
        )
        
        if (!priceResponse.success) {
          throw new Error("Failed to update price and notes")
        }
      }
      
      // Then update status if changed
      if (newStatus !== selectedQuote.status) {
        const statusResponse = await updateQuoteStatus(selectedQuote._id, newStatus, adminNotes)
        if (!statusResponse.success) {
          throw new Error("Failed to update status")
        }
      }
      
      // Update quote in local state
      setQuotes(quotes.map(q => 
        q._id === selectedQuote._id
          ? { 
              ...q, 
              status: newStatus, 
              adminNotes: adminNotes,
              estimatedPrice: parseFloat(estimatedPrice) || q.estimatedPrice
            }
          : q
      ))
      
      setShowDetailsDialog(false)
      
      toast({
        title: "Quote Updated",
        description: "Quote details have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating quote:", error)
      toast({
        title: "Update Failed",
        description: "Could not update the quote details.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Define table columns
  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "customer.fullName",
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
        const customer = row.original.customer
        return (
          <div className="flex items-center">
            <span className="font-medium">{customer.fullName}</span>
            {customer.isReturning && (
              <Badge className="ml-2 bg-blue-500 hover:bg-blue-500 text-white">
                Returning
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      cell: ({ row }) => {
        const serviceType = row.original.serviceType
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/20">
            {serviceType === "longDistance" ? "Long Distance" : "Local"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "moveSize",
      header: "Move Size",
      cell: ({ row }) => {
        return formatMoveSize(row.original.moveSize)
      },
    },
    {
      accessorKey: "movingDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center p-0 hover:bg-transparent hover:text-blue-500"
          >
            <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />
            Moving Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return new Date(row.original.movingDate).toLocaleDateString()
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <div className="flex items-center">
            <Badge
              className={`
                ${status === "pending" ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20" : ""}
                ${status === "in-progress" ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20" : ""}
                ${status === "completed" ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : ""}
                ${status === "cancelled" ? "bg-red-500/20 text-red-500 hover:bg-red-500/20" : ""}
              `}
            >
              {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
              {status === "in-progress" && <Truck className="mr-1 h-3 w-3" />}
              {status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
              {status === "cancelled" && <X className="mr-1 h-3 w-3" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "estimatedPrice",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center p-0 hover:bg-transparent hover:text-blue-500"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("estimatedPrice"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)

        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button 
            variant="outline" 
            className="hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500"
            onClick={() => handleViewDetails(row.original)}
          >
            View Details
          </Button>
        )
      },
    },
  ]

  // Count quotes by status
  const countByStatus = (status: string) => {
    return quotes.filter(quote => quote.status === status).length
  }

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Moving Quotes</h2>
            <p className="text-muted-foreground">
              View and manage customer quote requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportCsvButton
              data={exportData}
              fileName="us50-moving-quotes"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Total Quotes</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  quotes.length
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  countByStatus('pending')
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">In Progress</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  countByStatus('in-progress')
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse w-16"></div>
                ) : (
                  countByStatus('completed')
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => setActiveTab("all")}
            variant={activeTab === "all" ? "default" : "outline"}
            className={`flex items-center ${activeTab === "all" ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-500 hover:text-blue-500"}`}
          >
            <FileText className="mr-2 h-4 w-4" />
            All Quotes
            <Badge variant="secondary" className="ml-2">{quotes.length}</Badge>
          </Button>
          
          <Button
            onClick={() => setActiveTab("pending")}
            variant={activeTab === "pending" ? "default" : "outline"}
            className={`flex items-center ${activeTab === "pending" ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-500 hover:text-blue-500"}`}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
            <Badge variant="secondary" className="ml-2">{countByStatus("pending")}</Badge>
          </Button>
          
          <Button
            onClick={() => setActiveTab("in-progress")}
            variant={activeTab === "in-progress" ? "default" : "outline"}
            className={`flex items-center ${activeTab === "in-progress" ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-500 hover:text-blue-500"}`}
          >
            <Truck className="mr-2 h-4 w-4" />
            In Progress
            <Badge variant="secondary" className="ml-2">{countByStatus("in-progress")}</Badge>
          </Button>
          
          <Button
            onClick={() => setActiveTab("completed")}
            variant={activeTab === "completed" ? "default" : "outline"}
            className={`flex items-center ${activeTab === "completed" ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-500 hover:text-blue-500"}`}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
            <Badge variant="secondary" className="ml-2">{countByStatus("completed")}</Badge>
          </Button>
          
          <Button
            onClick={() => setActiveTab("cancelled")}
            variant={activeTab === "cancelled" ? "default" : "outline"}
            className={`flex items-center ${activeTab === "cancelled" ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-500 hover:text-blue-500"}`}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelled
            <Badge variant="secondary" className="ml-2">{countByStatus("cancelled")}</Badge>
          </Button>
        </div>

        {activeTab === "all" && (
          <DataTable
            columns={columns}
            data={quotes}
            searchKey="customer.fullName"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["customer.fullName", "customer.email", "customer.phone"]}
          />
        )}
        
        {activeTab === "pending" && (
          <DataTable
            columns={columns}
            data={quotes.filter(quote => quote.status === 'pending')}
            searchKey="customer.fullName"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["customer.fullName", "customer.email", "customer.phone"]}
          />
        )}
        
        {activeTab === "in-progress" && (
          <DataTable
            columns={columns}
            data={quotes.filter(quote => quote.status === 'in-progress')}
            searchKey="customer.fullName"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["customer.fullName", "customer.email", "customer.phone"]}
          />
        )}
        
        {activeTab === "completed" && (
          <DataTable
            columns={columns}
            data={quotes.filter(quote => quote.status === 'completed')}
            searchKey="customer.fullName"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["customer.fullName", "customer.email", "customer.phone"]}
          />
        )}
        
        {activeTab === "cancelled" && (
          <DataTable
            columns={columns}
            data={quotes.filter(quote => quote.status === 'cancelled')}
            searchKey="customer.fullName"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["customer.fullName", "customer.email", "customer.phone"]}
          />
        )}

        {/* Quote Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {isUpdating && !selectedQuote ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading quote details...</p>
              </div>
            ) : selectedQuote ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                    Quote Request Details
                  </DialogTitle>
                  <DialogDescription>
                    Quote ID: {selectedQuote._id}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <User className="mr-2 h-4 w-4 text-blue-500" />
                        Customer Information
                      </h3>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Name:</span>
                          <span className="text-sm font-semibold">
                            {selectedQuote.customer.fullName}
                            {selectedQuote.customer.isReturning && (
                              <Badge className="ml-2 bg-blue-500 hover:bg-blue-500 text-white">
                                Returning
                              </Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Email:</span>
                          <a href={`mailto:${selectedQuote.customer.email}`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {selectedQuote.customer.email}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Phone:</span>
                          <a href={`tel:${selectedQuote.customer.phone}`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {selectedQuote.customer.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                        Moving Locations
                      </h3>
                      <div className="space-y-3 ml-6">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">From Address:</span>
                          <span className="text-sm font-semibold block">{formatAddress(selectedQuote.fromAddress)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">To Address:</span>
                          <span className="text-sm font-semibold block">{formatAddress(selectedQuote.toAddress)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <Truck className="mr-2 h-4 w-4 text-blue-500" />
                        Move Details
                      </h3>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Service Type:</span>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/20">
                            {selectedQuote.serviceType === "longDistance" ? "Long Distance" : "Local"}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Move Size:</span>
                          <span className="text-sm font-semibold">{formatMoveSize(selectedQuote.moveSize)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Moving Date:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedQuote.movingDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Delivery Date:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedQuote.deliveryDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Estimated Price:</span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            ${selectedQuote.estimatedPrice?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />
                        Request Status
                      </h3>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Current Status:</span>
                          <Badge
                            className={`
                              ${selectedQuote.status === "pending" ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20" : ""}
                              ${selectedQuote.status === "in-progress" ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20" : ""}
                              ${selectedQuote.status === "completed" ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : ""}
                              ${selectedQuote.status === "cancelled" ? "bg-red-500/20 text-red-500 hover:bg-red-500/20" : ""}
                            `}
                          >
                            {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Date Submitted:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedQuote.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-blue-500" />
                      Admin Notes
                    </h3>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this quote request"
                      className="min-h-[100px]"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-blue-500" />
                      Estimated Price ($)
                    </h3>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(e.target.value)}
                      placeholder="Enter estimated price"
                      className="max-w-[200px]"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <Edit className="mr-2 h-4 w-4 text-blue-500" />
                      Update Status
                    </h3>
                    <Select value={newStatus} onValueChange={setNewStatus} disabled={isUpdating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleUpdateStatus} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <span className="mr-2">Updating...</span>
                      </>
                    ) : (
                      "Update Quote"
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
