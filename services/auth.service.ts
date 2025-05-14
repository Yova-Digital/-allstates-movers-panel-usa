/**
 * Authentication service for dashboard
 * Handles login, logout, and session management
 */

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types
export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  data: Admin;
}

/**
 * Login the admin user
 * @param email Admin email
 * @param password Admin password
 * @returns Admin data and JWT token
 */
export const loginAdmin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store the token in cookie for subsequent requests
    if (typeof window !== 'undefined' && data.token) {
      // Set cookie with HttpOnly and Secure flags for better security
      document.cookie = `us50_admin_token=${data.token}; path=/; max-age=${7*24*60*60}; SameSite=Strict`;
      
      // Still store user data in localStorage for UI needs
      localStorage.setItem('us50_admin_data', JSON.stringify(data.data));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get the current admin user
 * @returns Admin data if logged in, null otherwise
 */
export const getCurrentAdmin = (): Admin | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const adminData = localStorage.getItem('us50_admin_data');
  return adminData ? JSON.parse(adminData) : null;
};

/**
 * Get the authentication token
 * @returns JWT token if logged in, null otherwise
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Read token from cookies
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('us50_admin_token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  return null;
};

/**
 * Check if the user is authenticated
 * @returns true if logged in, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Log out the admin user
 */
export const logoutAdmin = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Remove token from cookies
  document.cookie = 'us50_admin_token=; path=/; max-age=0; SameSite=Strict';
  
  // Also clean up localStorage
  localStorage.removeItem('us50_admin_token'); // For backward compatibility
  localStorage.removeItem('us50_admin_data');
};

/**
 * Check if the admin has a specific role
 * @param role The role to check for
 * @returns true if the admin has the role, false otherwise
 */
export const hasRole = (role: 'admin' | 'superadmin'): boolean => {
  const admin = getCurrentAdmin();
  if (!admin) return false;
  
  if (role === 'admin') {
    // Both admin and superadmin can access admin resources
    return true;
  }
  
  return admin.role === role;
};
