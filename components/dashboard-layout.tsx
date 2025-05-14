"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronUp, LayoutDashboard, LogOut, Menu, Settings, Truck, Users, X, FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      label: "Requests",
      icon: Truck,
      href: "/dashboard/requests",
      active: pathname === "/dashboard/requests",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/dashboard/customers",
      active: pathname === "/dashboard/customers",
    },
    {
      label: "Quotes",
      icon: FileText,
      href: "/dashboard/quotes",
      active: pathname === "/dashboard/quotes",
    },
  ]

  return (
    <div className="h-screen">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 text-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-24 border-b border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-blue-500" />
              <span className="font-bold text-xl">US50 Transport</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col px-0 overflow-auto space-y-3 py-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-x-3 text-base font-medium px-4 py-3 transition-colors w-full",
                  route.active
                    ? "bg-blue-800 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  <div className="flex items-center gap-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">Admin User</span>
                      <span className="text-xs text-muted-foreground">admin@us50transport.com</span>
                    </div>
                    <ChevronUp className="h-4 w-4 ml-auto" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="md:pl-80 h-full w-full">
        <nav className="h-16 px-2 border-b flex items-center bg-card md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center justify-center flex-1">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">US50 Transport</span>
            </Link>
          </div>
        </nav>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-full max-w-[280px] border-0 bg-gray-900 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-blue-500" />
                  <span className="font-bold text-lg">US50 Transport</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 flex flex-col overflow-auto space-y-3 py-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-x-3 text-base font-medium px-4 py-3 transition-colors w-full",
                      route.active
                        ? "bg-blue-800 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="flex items-center gap-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Admin User</span>
                    <span className="text-xs text-muted-foreground">admin@us50transport.com</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>

        </Sheet>
        <main className="h-[calc(100vh-4rem)] md:h-screen w-full overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
