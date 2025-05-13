// Mock data for the dashboard

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  isReturning: boolean
  requestCount: number
  createdAt: Date
}

export type RequestStatus = "pending" | "completed" | "cancelled" | "in-progress"

export type MovingRequest = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupAddress: string
  destinationAddress: string
  requestedDate: Date
  serviceType: "local" | "long-distance" | "commercial" | "residential"
  status: RequestStatus
  notes?: string
  isReturningCustomer: boolean
  createdAt: Date
}

// Generate mock customers
export const customers: Customer[] = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 90210",
    isReturning: true,
    requestCount: 3,
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "c2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 234-5678",
    address: "456 Oak Ave, Somewhere, NY 10001",
    isReturning: false,
    requestCount: 1,
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "c3",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "(555) 345-6789",
    address: "789 Pine St, Nowhere, TX 75001",
    isReturning: true,
    requestCount: 2,
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "c4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "(555) 456-7890",
    address: "101 Maple Dr, Elsewhere, FL 33101",
    isReturning: false,
    requestCount: 1,
    createdAt: new Date("2023-04-05"),
  },
  {
    id: "c5",
    name: "David Wilson",
    email: "david.w@example.com",
    phone: "(555) 567-8901",
    address: "202 Cedar Ln, Anywhere, WA 98101",
    isReturning: false,
    requestCount: 1,
    createdAt: new Date("2023-05-12"),
  },
  {
    id: "c6",
    name: "Jennifer Martinez",
    email: "jennifer.m@example.com",
    phone: "(555) 678-9012",
    address: "303 Birch Rd, Someplace, IL 60601",
    isReturning: true,
    requestCount: 4,
    createdAt: new Date("2023-01-25"),
  },
  {
    id: "c7",
    name: "Robert Taylor",
    email: "robert.t@example.com",
    phone: "(555) 789-0123",
    address: "404 Elm St, Othertown, GA 30301",
    isReturning: false,
    requestCount: 1,
    createdAt: new Date("2023-06-18"),
  },
  {
    id: "c8",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    phone: "(555) 890-1234",
    address: "505 Walnut Ave, Thisplace, CO 80201",
    isReturning: false,
    requestCount: 1,
    createdAt: new Date("2023-07-22"),
  },
]

// Generate mock moving requests
export const movingRequests: MovingRequest[] = [
  {
    id: "r1",
    customerId: "c1",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerPhone: "(555) 123-4567",
    pickupAddress: "123 Main St, Anytown, CA 90210",
    destinationAddress: "789 Broadway, Newtown, CA 90211",
    requestedDate: new Date("2023-08-15"),
    serviceType: "residential",
    status: "completed",
    notes: "Has a piano that requires special handling",
    isReturningCustomer: true,
    createdAt: new Date("2023-07-20"),
  },
  {
    id: "r2",
    customerId: "c2",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    customerPhone: "(555) 234-5678",
    pickupAddress: "456 Oak Ave, Somewhere, NY 10001",
    destinationAddress: "101 Park Ave, Manhattan, NY 10002",
    requestedDate: new Date("2023-09-05"),
    serviceType: "local",
    status: "pending",
    notes: "Needs help with packing services",
    isReturningCustomer: false,
    createdAt: new Date("2023-08-15"),
  },
  {
    id: "r3",
    customerId: "c3",
    customerName: "Michael Brown",
    customerEmail: "michael.b@example.com",
    customerPhone: "(555) 345-6789",
    pickupAddress: "789 Pine St, Nowhere, TX 75001",
    destinationAddress: "555 Main St, Somewhere, CA 90210",
    requestedDate: new Date("2023-09-20"),
    serviceType: "long-distance",
    status: "in-progress",
    notes: "Moving cross-country, needs storage for 2 weeks",
    isReturningCustomer: true,
    createdAt: new Date("2023-08-25"),
  },
  {
    id: "r4",
    customerId: "c4",
    customerName: "Emily Davis",
    customerEmail: "emily.d@example.com",
    customerPhone: "(555) 456-7890",
    pickupAddress: "101 Maple Dr, Elsewhere, FL 33101",
    destinationAddress: "202 Beach Rd, Coastal, FL 33102",
    requestedDate: new Date("2023-10-10"),
    serviceType: "residential",
    status: "pending",
    isReturningCustomer: false,
    createdAt: new Date("2023-09-01"),
  },
  {
    id: "r5",
    customerId: "c1",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerPhone: "(555) 123-4567",
    pickupAddress: "789 Broadway, Newtown, CA 90211",
    destinationAddress: "555 Corporate Blvd, Business, CA 90220",
    requestedDate: new Date("2023-10-25"),
    serviceType: "commercial",
    status: "pending",
    notes: "Office relocation, weekend move preferred",
    isReturningCustomer: true,
    createdAt: new Date("2023-09-15"),
  },
  {
    id: "r6",
    customerId: "c6",
    customerName: "Jennifer Martinez",
    customerEmail: "jennifer.m@example.com",
    customerPhone: "(555) 678-9012",
    pickupAddress: "303 Birch Rd, Someplace, IL 60601",
    destinationAddress: "404 Downtown Ave, Chicago, IL 60602",
    requestedDate: new Date("2023-11-05"),
    serviceType: "local",
    status: "pending",
    isReturningCustomer: true,
    createdAt: new Date("2023-09-20"),
  },
  {
    id: "r7",
    customerId: "c7",
    customerName: "Robert Taylor",
    customerEmail: "robert.t@example.com",
    customerPhone: "(555) 789-0123",
    pickupAddress: "404 Elm St, Othertown, GA 30301",
    destinationAddress: "505 Peachtree St, Atlanta, GA 30302",
    requestedDate: new Date("2023-11-15"),
    serviceType: "residential",
    status: "cancelled",
    notes: "Customer found another service",
    isReturningCustomer: false,
    createdAt: new Date("2023-09-25"),
  },
  {
    id: "r8",
    customerId: "c8",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.a@example.com",
    customerPhone: "(555) 890-1234",
    pickupAddress: "505 Walnut Ave, Thisplace, CO 80201",
    destinationAddress: "606 Mountain View, Denver, CO 80202",
    requestedDate: new Date("2023-11-25"),
    serviceType: "local",
    status: "pending",
    isReturningCustomer: false,
    createdAt: new Date("2023-10-01"),
  },
  {
    id: "r9",
    customerId: "c1",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerPhone: "(555) 123-4567",
    pickupAddress: "555 Corporate Blvd, Business, CA 90220",
    destinationAddress: "777 Residential St, Homeville, CA 90230",
    requestedDate: new Date("2023-12-05"),
    serviceType: "residential",
    status: "pending",
    isReturningCustomer: true,
    createdAt: new Date("2023-10-10"),
  },
  {
    id: "r10",
    customerId: "c3",
    customerName: "Michael Brown",
    customerEmail: "michael.b@example.com",
    customerPhone: "(555) 345-6789",
    pickupAddress: "555 Main St, Somewhere, CA 90210",
    destinationAddress: "888 New Home Ave, Elsewhere, CA 90240",
    requestedDate: new Date("2023-12-15"),
    serviceType: "residential",
    status: "pending",
    isReturningCustomer: true,
    createdAt: new Date("2023-10-15"),
  },
]

// Analytics data
export const analyticsData = {
  totalRequests: movingRequests.length,
  newCustomers: customers.filter((c) => !c.isReturning).length,
  returningCustomers: customers.filter((c) => c.isReturning).length,
  requestsByStatus: {
    pending: movingRequests.filter((r) => r.status === "pending").length,
    completed: movingRequests.filter((r) => r.status === "completed").length,
    cancelled: movingRequests.filter((r) => r.status === "cancelled").length,
    inProgress: movingRequests.filter((r) => r.status === "in-progress").length,
  },
  requestsByType: {
    local: movingRequests.filter((r) => r.serviceType === "local").length,
    longDistance: movingRequests.filter((r) => r.serviceType === "long-distance").length,
    commercial: movingRequests.filter((r) => r.serviceType === "commercial").length,
    residential: movingRequests.filter((r) => r.serviceType === "residential").length,
  },
  // Monthly request data for charts
  monthlyRequests: [
    { name: "Jan", total: 2 },
    { name: "Feb", total: 1 },
    { name: "Mar", total: 1 },
    { name: "Apr", total: 1 },
    { name: "May", total: 1 },
    { name: "Jun", total: 1 },
    { name: "Jul", total: 1 },
    { name: "Aug", total: 2 },
    { name: "Sep", total: 4 },
    { name: "Oct", total: 3 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ],
  // Weekly request data
  weeklyRequests: [
    { name: "Mon", total: 3 },
    { name: "Tue", total: 2 },
    { name: "Wed", total: 4 },
    { name: "Thu", total: 1 },
    { name: "Fri", total: 5 },
    { name: "Sat", total: 2 },
    { name: "Sun", total: 0 },
  ],
}
