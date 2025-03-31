/**
 * API client for frontend to interact with backend API
 */

import { ServersResponse } from './types';

/**
 * Fetch servers from the backend API
 * @param apiToken Hetzner API token
 * @param projectName Project name
 * @returns Promise with server data
 */
export async function fetchServers(apiToken: string, projectName: string): Promise<ServersResponse> {
  try {
    const response = await fetch('/api/servers', {
      headers: {
        'x-api-token': apiToken,
        'x-project-name': projectName,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching servers:', error);
    throw error;
  }
}

/**
 * Validate API settings
 * @param apiToken Hetzner API token
 * @param projectName Project name
 * @returns Promise with validation result
 */
export async function validateApiSettings(apiToken: string, projectName: string): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiToken, projectName }),
    });

    return await response.json();
  } catch (error: any) {
    console.error('Error validating API settings:', error);
    return { valid: false, message: error.message || 'Failed to validate API settings' };
  }
}

/**
 * Format bytes to human-readable format
 * @param bytes Bytes to format
 * @returns Formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date to human-readable format
 * @param dateString Date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}
