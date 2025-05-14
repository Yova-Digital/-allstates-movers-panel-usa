// Mock data for API services when backend server is not available

// Mock Customers
export const mockCustomers = [
  {
    _id: "c1001",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    isReturning: true,
    requestCount: 3,
    lastRequest: new Date(2025, 4, 10).toISOString(),
    notes: "Prefers communication via email",
    createdAt: new Date(2025, 2, 15).toISOString()
  },
  {
    _id: "c1002",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555-987-6543",
    isReturning: false,
    requestCount: 1,
    lastRequest: new Date(2025, 4, 12).toISOString(),
    notes: "",
    createdAt: new Date(2025, 4, 12).toISOString()
  },
  {
    _id: "c1003",
    fullName: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "555-456-7890",
    isReturning: true,
    requestCount: 2,
    lastRequest: new Date(2025, 4, 8).toISOString(),
    notes: "Has pets that need special care during moving",
    createdAt: new Date(2025, 3, 22).toISOString()
  }
];

// Mock Requests
export const mockRequests = [
  {
    _id: "r2001",
    customer: mockCustomers[0],
    fromAddress: {
      street: "123 Main St",
      city: "Boston",
      state: "MA",
      zipCode: "02108"
    },
    toAddress: {
      street: "456 Park Ave",
      city: "Cambridge",
      state: "MA",
      zipCode: "02142"
    },
    serviceType: "local",
    moveSize: "2bedroom",
    requestedDate: new Date(2025, 4, 10).toISOString(),
    movingDate: new Date(2025, 5, 15).toISOString(),
    specialInstructions: "Have a piano that needs special care",
    status: "pending",
    notes: "Customer requested morning service",
    createdAt: new Date(2025, 4, 5).toISOString(),
    updatedAt: new Date(2025, 4, 5).toISOString()
  },
  {
    _id: "r2002",
    customer: mockCustomers[1],
    fromAddress: {
      street: "789 Washington St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    toAddress: {
      street: "321 Broadway",
      city: "Boston",
      state: "MA",
      zipCode: "02116"
    },
    serviceType: "long-distance",
    moveSize: "1bedroom",
    requestedDate: new Date(2025, 4, 12).toISOString(),
    movingDate: new Date(2025, 5, 20).toISOString(),
    status: "in-progress",
    notes: "",
    createdAt: new Date(2025, 4, 12).toISOString(),
    updatedAt: new Date(2025, 4, 14).toISOString()
  },
  {
    _id: "r2003",
    customer: mockCustomers[2],
    fromAddress: {
      street: "555 Oak St",
      city: "Chicago",
      state: "IL",
      zipCode: "60611"
    },
    toAddress: {
      street: "777 Maple Ave",
      city: "Boston",
      state: "MA",
      zipCode: "02215"
    },
    serviceType: "long-distance",
    moveSize: "3bedroom",
    requestedDate: new Date(2025, 4, 8).toISOString(),
    movingDate: new Date(2025, 5, 10).toISOString(),
    specialInstructions: "Need help with packing services",
    status: "completed",
    notes: "Feedback: Great service!",
    createdAt: new Date(2025, 4, 2).toISOString(),
    updatedAt: new Date(2025, 5, 11).toISOString()
  }
];

// Mock Quotes
export const mockQuotes = [
  {
    _id: "q3001",
    customer: mockCustomers[0],
    fromAddress: {
      street: "123 Main St",
      city: "Boston",
      state: "MA",
      zipCode: "02108"
    },
    toAddress: {
      street: "456 Park Ave",
      city: "Cambridge",
      state: "MA",
      zipCode: "02142"
    },
    movingDate: new Date(2025, 5, 15).toISOString(),
    deliveryDate: new Date(2025, 5, 16).toISOString(),
    moveSize: "2bedroom",
    serviceType: "local",
    status: "pending",
    estimatedPrice: 1200,
    createdAt: new Date(2025, 4, 5).toISOString(),
    adminNotes: "Standard pricing applied"
  },
  {
    _id: "q3002",
    customer: mockCustomers[1],
    fromAddress: {
      street: "789 Washington St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    toAddress: {
      street: "321 Broadway",
      city: "Boston",
      state: "MA",
      zipCode: "02116"
    },
    movingDate: new Date(2025, 5, 20).toISOString(),
    deliveryDate: new Date(2025, 5, 22).toISOString(),
    moveSize: "1bedroom",
    serviceType: "longDistance",
    status: "in-progress",
    estimatedPrice: 2500,
    createdAt: new Date(2025, 4, 12).toISOString(),
    adminNotes: "Long distance rate applied with discount"
  },
  {
    _id: "q3003",
    customer: mockCustomers[2],
    fromAddress: {
      street: "555 Oak St",
      city: "Chicago",
      state: "IL",
      zipCode: "60611"
    },
    toAddress: {
      street: "777 Maple Ave",
      city: "Boston",
      state: "MA",
      zipCode: "02215"
    },
    movingDate: new Date(2025, 5, 10).toISOString(),
    deliveryDate: new Date(2025, 5, 13).toISOString(),
    moveSize: "3bedroom",
    serviceType: "longDistance",
    status: "completed",
    estimatedPrice: 3600,
    createdAt: new Date(2025, 4, 2).toISOString(),
    adminNotes: "Standard long distance rate"
  }
];
