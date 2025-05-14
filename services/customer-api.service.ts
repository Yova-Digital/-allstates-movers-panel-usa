import { fetchAPI } from './api.service';

/**
 * Get all customers
 * @returns List of all customers
 */
export async function getAllCustomers() {
  return fetchAPI('/customers');
}

/**
 * Get customer details
 * @param customerId Customer ID
 * @returns Customer details and quote history
 */
export async function getCustomerDetails(customerId: string) {
  return fetchAPI(`/customers/${customerId}`);
}

/**
 * Update customer notes
 * @param customerId Customer ID
 * @param notes New customer notes
 * @returns Updated customer
 */
export async function updateCustomerNotes(customerId: string, notes: string) {
  return fetchAPI(`/customers/${customerId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes })
  });
}
