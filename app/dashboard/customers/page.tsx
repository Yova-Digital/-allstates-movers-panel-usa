"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import DashboardLayout from "@/components/dashboard-layout"
import { DataTable } from "@/components/data-table"
import { type Customer, customers } from "@/lib/data"

export default function CustomersPage() {
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex flex-col">
            <div className="font-medium">{customer.name}</div>
            {customer.isReturning && (
              <Badge variant="outline" className="mt-1 w-fit bg-purple-500/20 text-purple-500 hover:bg-purple-500/20">
                Returning Customer
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
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.email}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.phone}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "requestCount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Requests
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="text-center font-medium">{row.original.requestCount}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Customer Since",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.createdAt.toLocaleDateString()}
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <Button>Add New Customer</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.filter((c) => !c.isReturning).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returning Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.filter((c) => c.isReturning).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Requests per Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(customers.reduce((acc, customer) => acc + customer.requestCount, 0) / customers.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable columns={columns} data={customers} searchKey="name" searchPlaceholder="Search customers..." />
      </div>
    </DashboardLayout>
  )
}
