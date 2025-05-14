import { fetchAPI } from './api.service';

/**
 * Get all quotes
 * @returns List of quotes
 */
export async function getAllQuotes() {
  return fetchAPI('/quotes');
}

/**
 * Get quote details
 * @param quoteId Quote ID
 * @returns Quote details
 */
export async function getQuoteDetails(quoteId: string) {
  return fetchAPI(`/quotes/${quoteId}`);
}

/**
 * Update quote status
 * @param quoteId Quote ID
 * @param status New status
 * @param adminNotes Optional admin notes
 * @returns Updated quote
 */
export async function updateQuoteStatus(quoteId: string, status: string, adminNotes?: string) {
  return fetchAPI(`/quotes/${quoteId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNotes })
  });
}

/**
 * Update quote details including price and notes
 * @param quoteId Quote ID
 * @param estimatedPrice Updated price
 * @param adminNotes Admin notes
 * @returns Updated quote
 */
export async function updateQuoteDetails(quoteId: string, estimatedPrice: number, adminNotes: string) {
  return fetchAPI(`/quotes/${quoteId}/update`, {
    method: 'PATCH',
    body: JSON.stringify({ estimatedPrice, adminNotes })
  });
}
