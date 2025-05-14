import { CalendarClock, Truck, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  BarChart,
  ResponsiveContainer,
} from "@/components/ui/chart"

import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { analyticsData, movingRequests } from "@/lib/data"

export default function DashboardPage() {
  const recentRequests = [...movingRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Requests"
                value={analyticsData.totalRequests}
                icon={Truck}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="New Customers"
                value={analyticsData.newCustomers}
                icon={Users}
                trend={{ value: 5, isPositive: true }}
              />
              <StatCard
                title="Returning Customers"
                value={analyticsData.returningCustomers}
                icon={Users}
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Pending Requests"
                value={analyticsData.requestsByStatus.pending}
                icon={CalendarClock}
                trend={{ value: 3, isPositive: false }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Monthly Requests</CardTitle>
                  <CardDescription>Number of moving requests per month</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={analyticsData.monthlyRequests}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    />
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Request Types</CardTitle>
                  <CardDescription>Distribution of request types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: "Residential", value: analyticsData.requestsByType.residential },
                        { name: "Commercial", value: analyticsData.requestsByType.commercial },
                        { name: "Long Dist.", value: analyticsData.requestsByType.longDistance },
                        { name: "Local", value: analyticsData.requestsByType.local },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    />
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Trends</CardTitle>
                  <CardDescription>Request distribution by day of week</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={analyticsData.weeklyRequests}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    />
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Breakdown</CardTitle>
                  <CardDescription>New vs returning customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={[
                        { name: "New", value: analyticsData.newCustomers },
                        { name: "Returning", value: analyticsData.returningCustomers },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    />
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth</CardTitle>
                <CardDescription>Request volume over the past year</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={analyticsData.monthlyRequests}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
