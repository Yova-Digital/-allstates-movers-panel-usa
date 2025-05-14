"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, MapPin, Loader2, File, Edit, Trash2, User, Truck, Mail, Phone, FileText, CalendarClock, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// The DashboardLayout is already provided by the parent layout
import { DataTable } from "@/components/data-table"
import { ContactButton } from "@/components/contact-button"
import { StatusBadge } from "@/components/status-badge"
import { CustomerBadge } from "@/components/customer-badge"
import { ExportButtons } from "@/components/export-buttons"
import { ExportCsvButton } from "@/components/export-csv-button"
import { getAllRequests, getRequestDetails, updateRequestStatus } from "@/services/request-api.service"
import { fetchAPI } from "@/services/api.service"

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  isReturning: boolean;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface MovingRequest {
  _id: string;
  customer: string | Customer; // Can be either the ID or the populated customer object
  fromAddress: Address;
  toAddress: Address;
  fromZip: string;
  toZip: string;
  serviceType: string;
  moveSize: string;
  movingDate: string;
  deliveryDate: string;
  specialInstructions: string;
  status: string;
  emailSent: boolean;
  estimatedPrice: number;
  adminNotes: string;
  handledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function RequestsPage() {
  const { toast } = useToast()
  const [view, setView] = useState<"table" | "cards">("table")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<MovingRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<MovingRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [requestNotes, setRequestNotes] = useState("")
  const [newStatus, setNewStatus] = useState("") 
  const [isUpdating, setIsUpdating] = useState(false)
  const [exportData, setExportData] = useState<any[]>([])
  
  // Customer data cache to avoid multiple API calls
  const [customerCache, setCustomerCache] = useState<Record<string, Customer>>({})

  // Helper function to get customer data
  const getCustomer = async (customerId: string): Promise<Customer> => {
    // If we already have the customer in cache, return it
    if (customerCache[customerId]) {
      return customerCache[customerId];
    }
    
    // Otherwise fetch from API
    try {
      const response = await fetchAPI(`/customers/${customerId}`);
      if (response.success) {
        const customer = response.data;
        // Update cache
        setCustomerCache(prev => ({ ...prev, [customerId]: customer }));
        return customer;
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
    
    // Return a default customer if we can't get data
    return {
      _id: customerId,
      fullName: "Unknown Customer",
      email: "unknown@email.com",
      phone: "000-000-0000",
      isReturning: false
    };
  };
  
  // Helper function to check if customer is an id or object and get the right data
  const getCustomerData = (request: MovingRequest) => {
    if (typeof request.customer === 'string') {
      // Return customer from cache if available, otherwise try to fetch it
      return customerCache[request.customer] || {
        _id: request.customer,
        fullName: "Loading...",
        email: "",
        phone: "",
        isReturning: false
      };
    } else {
      // Customer data is already populated
      return request.customer;
    }
  };

  // Load requests from API
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true)
        const response = await getAllRequests()
        
        if (response.success) {
          setRequests(response.data)
          
          // Prefetch customer data for all requests
          const uniqueCustomerIds = new Set<string>();
          
          response.data.forEach((request: MovingRequest) => {
            if (typeof request.customer === 'string') {
              uniqueCustomerIds.add(request.customer);
            }
          });
          
          // Fetch customer data for each unique ID
          uniqueCustomerIds.forEach(async customerId => {
            await getCustomer(customerId);
          });
        }
      } catch (error) {
        console.error("Error loading requests:", error)
        toast({
          title: "Error",
          description: "Failed to load moving requests",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [toast])

  // Prepare export data whenever requests change
  useEffect(() => {
    if (requests.length > 0) {
      const data = requests.map(request => {
        const customerData = getCustomerData(request);
        return {
          ID: request._id.substring(0, 8) + '...',
          Customer: customerData.fullName,
          Email: customerData.email,
          Phone: customerData.phone,
          FromLocation: `${request.fromAddress.city}, ${request.fromAddress.state}`,
          ToLocation: `${request.toAddress.city}, ${request.toAddress.state}`,
          MoveSize: formatMoveSize(request.moveSize),
          ServiceType: formatServiceType(request.serviceType),
          MovingDate: new Date(request.movingDate).toLocaleDateString(),
          DeliveryDate: new Date(request.deliveryDate).toLocaleDateString(),
          Status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
          Price: request.estimatedPrice ? `$${request.estimatedPrice.toFixed(2)}` : 'N/A',
          CreatedAt: new Date(request.createdAt).toLocaleDateString()
        }
      })
      setExportData(data)
    }
  }, [requests]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter requests based on selected filters
  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false
    if (typeFilter !== "all" && request.serviceType !== typeFilter) return false
    return true
  })

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
  
  // Format service type for display
  const formatServiceType = (type: string) => {
    const typeMappings: Record<string, string> = {
      'local': 'Local',
      'long-distance': 'Long Distance',
      'commercial': 'Commercial',
      'residential': 'Residential'
    };
    
    return typeMappings[type] || type;
  };

  // Handle viewing request details
  const handleViewRequest = async (requestId: string) => {
    try {
      // Show loading state and open dialog immediately
      setSelectedRequest(null)
      setShowDetailsDialog(true)
      setIsUpdating(true)
      
      const response = await getRequestDetails(requestId)
      
      if (response.success) {
        const request = response.data
        setSelectedRequest(request)
        setRequestNotes(request.adminNotes || '')
        setNewStatus(request.status)
        
        // If the customer is just an ID, fetch the customer data
        if (typeof request.customer === 'string') {
          await getCustomer(request.customer)
        }
      } else {
        throw new Error('Failed to fetch request details')
      }
    } catch (error) {
      console.error("Error loading request details:", error)
      toast({
        title: "Error",
        description: "Failed to load request details",
        variant: "destructive"
      })
      // Close dialog on error
      setShowDetailsDialog(false)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle updating request status and notes
  const handleUpdateRequest = async () => {
    if (!selectedRequest) return
    
    setIsUpdating(true)
    
    try {
      const response = await updateRequestStatus(selectedRequest._id, newStatus, requestNotes)
      
      if (response.success) {
        // Update request in local state
        setRequests(requests.map(r => 
          r._id === selectedRequest._id
            ? { ...r, status: newStatus, notes: requestNotes }
            : r
        ))
        
        setShowDetailsDialog(false)
        
        toast({
          title: "Success",
          description: "Request updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating request:", error)
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const columns: ColumnDef<MovingRequest>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const request = row.original
        const customer = getCustomerData(request)
        return (
          <div className="flex flex-col">
            <div className="font-medium">{customer.fullName}</div>
            <div className="flex items-center gap-1 mt-1">
              <CustomerBadge isReturning={customer.isReturning} />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "serviceType",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Service Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const serviceType = row.original.serviceType
        return <div className="capitalize">{serviceType.replace("-", " ")}</div>
      },
    },
    {
      accessorKey: "movingDate",
      header: "Moving Date",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {new Date(row.original.movingDate).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status as "pending" | "in-progress" | "completed" | "cancelled"} />
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original
        const customer = getCustomerData(request)
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewRequest(request._id)}
              className="flex items-center hover:bg-blue-50 hover:text-blue-500"
            >
              <File className="mr-2 h-4 w-4" />
              View Details
            </Button>
            <ContactButton email={customer.email} phone={customer.phone} name={customer.fullName} />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Moving Requests</h2>
            <p className="text-muted-foreground">
              Manage and process customer moving requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportCsvButton
              data={exportData}
              fileName="us50-moving-requests"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="long-distance">Long Distance</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto">
            <Button>Add New Request</Button>
          </div>
        </div>

        {view === "table" ? (
          <DataTable
            columns={columns}
            data={filteredRequests}
            searchKey="customer"
            searchPlaceholder="Search by name, email or phone..."
            isLoading={isLoading}
            searchFields={["customer"]}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => {
              const customer = getCustomerData(request);
              return (
              <Card key={request._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customer.fullName}</CardTitle>
                    <StatusBadge status={request.status as "pending" | "in-progress" | "completed" | "cancelled"} />
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <div className="capitalize">{formatServiceType(request.serviceType)} Move</div>
                    {customer.isReturning && <CustomerBadge isReturning={customer.isReturning} />}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Pickup</div>
                        <div className="text-sm text-muted-foreground">
                          {request.fromAddress.street}, {request.fromAddress.city}, {request.fromAddress.state} {request.fromAddress.zipCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Destination</div>
                        <div className="text-sm text-muted-foreground">
                          {request.toAddress.street}, {request.toAddress.city}, {request.toAddress.state} {request.toAddress.zipCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">{new Date(request.movingDate).toLocaleDateString()}</div>
                  </div>

                  {request.adminNotes && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Notes: </span>
                      {request.adminNotes}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRequest(request._id)}
                      className="flex items-center hover:bg-blue-50 hover:text-blue-500"
                    >
                      <File className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <ContactButton
                      email={customer.email}
                      phone={customer.phone}
                      name={customer.fullName}
                    />
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
        
        {/* Request Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {isUpdating && !selectedRequest ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading request details...</p>
              </div>
            ) : selectedRequest ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center">
                    <Truck className="mr-2 h-5 w-5 text-blue-500" />
                    Moving Request Details
                  </DialogTitle>
                  <DialogDescription>
                    Request ID: {selectedRequest._id}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <User className="mr-2 h-4 w-4 text-blue-500" />
                        Customer Information
                      </h3>
                      {(() => {
                        const customer = getCustomerData(selectedRequest);
                        return (
                          <div className="space-y-2 ml-6">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Name:</span>
                              <span className="text-sm font-semibold">
                                {customer.fullName}
                                {customer.isReturning && (
                                  <Badge className="ml-2 bg-blue-500 hover:bg-blue-500 text-white">
                                    Returning Customer
                                  </Badge>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Email:</span>
                              <a href={`mailto:${customer.email}`} className="text-sm text-blue-500 hover:underline flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {customer.email}
                              </a>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">Phone:</span>
                              <a href={`tel:${customer.phone}`} className="text-sm text-blue-500 hover:underline flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {customer.phone}
                              </a>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                        Moving Locations
                      </h3>
                      <div className="space-y-3 ml-6">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Origin Address:</span>
                          <span className="text-sm font-semibold block">
                            {selectedRequest.fromAddress.street}, {selectedRequest.fromAddress.city}, {selectedRequest.fromAddress.state} {selectedRequest.fromAddress.zipCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Destination Address:</span>
                          <span className="text-sm font-semibold block">
                            {selectedRequest.toAddress.street}, {selectedRequest.toAddress.city}, {selectedRequest.toAddress.state} {selectedRequest.toAddress.zipCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center mb-2">
                        <Truck className="mr-2 h-4 w-4 text-blue-500" />
                        Moving Details
                      </h3>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Service Type:</span>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/20">
                            {selectedRequest.serviceType === "longDistance" ? "Long Distance" : "Local Moving"}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Move Size:</span>
                          <span className="text-sm font-semibold">{formatMoveSize(selectedRequest.moveSize)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Request Date:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedRequest.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Moving Date:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedRequest.movingDate).toLocaleDateString()}
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
                          <StatusBadge status={selectedRequest.status as "pending" | "in-progress" | "completed" | "cancelled"} />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Submission Date:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedRequest.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedRequest.specialInstructions && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Special Instructions:</span>
                            <span className="text-sm block">{selectedRequest.specialInstructions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-blue-500" />
                      Notes
                    </h3>
                    <Textarea
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      placeholder="Add notes about this request"
                      className="min-h-[100px]"
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
                  <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleUpdateRequest} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Request"
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
