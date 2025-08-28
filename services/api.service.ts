/**
 * API service for dashboard
 * Handles API requests to the backend
 */

/**
 * Function to login to the admin panel
 * @param email Admin email
 * @param password Admin password
 * @returns Login response with token
 */
export async function loginAdmin(email: string, password: string) {
  const baseUrl = "https://api.allstatesmovers.llc/api";
  const url = `${baseUrl}/admin/login`;

  try {
    console.log(`Attempting to login with email: ${email}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    // Log response status
    console.log(`Login response status: ${response.status}`);
    
    // Parse response
    const data = await response.json();
    console.log('Login response data:', data);

    // Store token if login successful
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      console.log('Token stored successfully');
    } else {
      console.error('Login failed:', data.message || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('Login Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// For temporary development access without login
let devToken: string | null = null;

async function getDevToken() {
  // Use this only for development to avoid login requirement
  if (!devToken) {
    console.log('Getting development token...');
    try {
      // Default admin credentials for development ONLY
      const loginResponse = await loginAdmin('admin@us50transport.com', 'admin123');
      if (loginResponse.success) {
        devToken = loginResponse.token;
        console.log('Development token acquired');
      }
    } catch (error) {
      console.error('Error getting dev token:', error);
    }
  }
  return devToken;
}

/**
 * Base API fetcher function with credentials
 * @param endpoint API endpoint
 * @param options Fetch options
 * @returns Response data
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const baseUrl = "https://api.allstatesmovers.llc/api";
  const url = `${baseUrl}${endpoint}`;

  try {
    // Get token from storage or get dev token
    const token = localStorage.getItem('token') || await getDevToken();
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    // Handle unauthorized access or expired token
    if (response.status === 401) {
      // Remove tokens and try to get a new dev token
      localStorage.removeItem('token');
      devToken = null;
      
      // Try again with a new dev token
      const newToken = await getDevToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
        
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
      
      window.location.href = '/login';
      return { success: false, message: 'Authentication required' };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request error:`, error);
    throw error;
  }
}

/**
 * Get dashboard overview data
 * @returns Dashboard overview data
 */
export async function getDashboardOverview() {
  return fetchAPI('/dashboard/overview');
}

/**
 * Get dashboard trend data
 * @returns Dashboard trend data
 */
export async function getDashboardTrends() {
  return fetchAPI('/dashboard/trends');
}

/**
 * Get all customers
 * @returns List of all customers
 */
export async function getAllCustomers() {
  return fetchAPI('/customers');
}

/**
 * Get customer details
 * @param id Customer ID
 * @returns Customer details and their quotes
 */
export const getCustomerDetails = async (id: string) => {
  return fetchAPI(`/customers/${id}`);
};

/**
 * Update customer notes
 * @param id Customer ID
 * @param notes Customer notes
 * @returns Updated customer
 */
export const updateCustomerNotes = async (id: string, notes: string) => {
  return fetchAPI(`/customers/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
};

/**
 * Create a new customer
 * @param customerData Customer data
 * @returns Created customer
 */
export const createCustomer = async (customerData: any) => {
  return fetchAPI('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
};
