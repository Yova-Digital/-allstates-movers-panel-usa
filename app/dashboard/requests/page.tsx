"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import DashboardLayout from "@/components/dashboard-layout"
import { DataTable } from "@/components/data-table"
import { ContactButton } from "@/components/contact-button"
import { StatusBadge } from "@/components/status-badge"
import { CustomerBadge } from "@/components/customer-badge"
import { type MovingRequest, movingRequests } from "@/lib/data"

export default function RequestsPage() {
  const [view, setView] = useState<"table" | "cards">("table")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Filter requests based on selected filters
  const filteredRequests = movingRequests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false
    if (typeFilter !== "all" && request.serviceType !== typeFilter) return false
    return true
  })

  const columns: ColumnDef<MovingRequest>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex flex-col">
            <div className="font-medium">{request.customerName}</div>
            <div className="flex items-center gap-1 mt-1">
              <CustomerBadge isReturning={request.isReturningCustomer} />
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
      accessorKey: "requestedDate",
      header: "Requested Date",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.requestedDate.toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex justify-end">
            <ContactButton email={request.customerEmail} phone={request.customerPhone} name={request.customerName} />
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Moving Requests</h2>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as "table" | "cards")}>
              <TabsList className="grid w-[180px] grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
              </TabsList>
            </Tabs>
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
            searchKey="customerName"
            searchPlaceholder="Search by customer name..."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{request.customerName}</CardTitle>
                    <StatusBadge status={request.status} />
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <div className="capitalize">{request.serviceType.replace("-", " ")} Move</div>
                    {request.isReturningCustomer && <CustomerBadge isReturning={request.isReturningCustomer} />}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Pickup</div>
                        <div className="text-sm text-muted-foreground">{request.pickupAddress}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Destination</div>
                        <div className="text-sm text-muted-foreground">{request.destinationAddress}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">{request.requestedDate.toLocaleDateString()}</div>
                  </div>

                  {request.notes && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Notes: </span>
                      {request.notes}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <ContactButton
                      email={request.customerEmail}
                      phone={request.customerPhone}
                      name={request.customerName}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
