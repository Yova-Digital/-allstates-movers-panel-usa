import { fetchAPI } from './api.service';

/**
 * Get all moving requests
 * @returns List of requests
 */
export async function getAllRequests() {
  return fetchAPI('/quotes');
}

/**
 * Get request details
 * @param requestId Request ID
 * @returns Request details
 */
export async function getRequestDetails(requestId: string) {
  return fetchAPI(`/quotes/${requestId}`);
}

/**
 * Create new request
 * @param requestData Request data
 * @returns Created request
 */
export async function createRequest(requestData: any) {
  return fetchAPI('/quotes', {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
}

/**
 * Update request status
 * @param requestId Request ID
 * @param status New status
 * @param notes Optional notes
 * @returns Updated request
 */
export async function updateRequestStatus(requestId: string, status: string, notes?: string) {
  return fetchAPI(`/quotes/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNotes: notes })
  });
}
