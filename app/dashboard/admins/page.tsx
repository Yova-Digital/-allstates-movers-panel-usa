"use client"

import { useState, useEffect } from "react"
import { User, UserPlus, ShieldAlert, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// The DashboardLayout is already provided by the parent layout
import { fetchAPI } from "@/services/api.service"
import { getCurrentAdmin, hasRole } from "@/services/auth.service"

interface Admin {
  _id: string
  username: string
  email: string
  role: "admin" | "superadmin"
  isActive: boolean
  lastLogin: string
  createdAt: string
}

interface NewAdminData {
  username: string
  email: string
  password: string
  role: string
}

export default function AdminsPage() {
  const { toast } = useToast()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  
  const [newAdmin, setNewAdmin] = useState<NewAdminData>({
    username: "",
    email: "",
    password: "",
    role: "admin"
  })

  useEffect(() => {
    // Check if current user is superadmin and fetch admin list if authorized
    const checkAccessAndFetchData = async () => {
      const hasSuperAdminRole = hasRole("superadmin")
      setIsSuperAdmin(hasSuperAdminRole)
      
      if (hasSuperAdminRole) {
        try {
          const response = await fetchAPI("/admin")
          setAdmins(response.data)
        } catch (error) {
          console.error("Error fetching admins:", error)
          toast({
            title: "Error",
            description: "Failed to load admin accounts",
            variant: "destructive"
          })
        }
      }
      
      setIsLoading(false)
    }

    checkAccessAndFetchData()
  }, [toast])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetchAPI("/admin/register", {
        method: "POST",
        body: JSON.stringify(newAdmin)
      })

      // Add the new admin to the list
      setAdmins([...admins, response.data])
      
      // Reset form and close dialog
      setNewAdmin({
        username: "",
        email: "",
        password: "",
        role: "admin"
      })
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Admin account created successfully",
      })
    } catch (error) {
      console.error("Error creating admin:", error)
      toast({
        title: "Error",
        description: "Failed to create admin account",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const currentAdmin = getCurrentAdmin()
      
      // Prevent deactivating own account
      if (currentAdmin?.id === adminId) {
        toast({
          title: "Error",
          description: "You cannot deactivate your own account",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetchAPI(`/admin/${adminId}/toggle-status`, {
        method: "PATCH"
      })

      // Update admin in local state
      setAdmins(admins.map(admin => 
        admin._id === adminId 
          ? { ...admin, isActive: !currentStatus } 
          : admin
      ))

      toast({
        title: "Success",
        description: `Admin account ${currentStatus ? "deactivated" : "activated"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling admin status:", error)
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive"
      })
    }
  }



  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      ) : !isSuperAdmin ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-500 dark:text-red-400">
              This area is restricted to superadmin users only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              You don't have permission to access the admin management page. This page is only available to superadmin users.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Add a new administrator account for the dashboard. This user will have access to all customer data and quotes.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Strong password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newAdmin.role}
                      onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Admin"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Card>
            <CardHeader>
              <CardTitle>Manage Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300 rounded-full">
                            Superadmin
                          </div>
                          {admin.isActive ? (
                            <div className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-300 rounded-full flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </div>
                          ) : (
                            <div className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-300 rounded-full flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={admin.isActive ? "destructive" : "outline"}
                        onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                      >
                        {admin.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
