/**
 * Settings storage service
 * 
 * This service handles storing and retrieving API settings
 */

import { HetznerApiConfig } from './hetznerApi';

// Local storage keys
const API_TOKEN_KEY = 'hetzner_api_token';
const PROJECT_NAME_KEY = 'hetzner_project_name';

/**
 * Save API settings to local storage
 * @param config API configuration
 */
export function saveApiSettings(config: HetznerApiConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_TOKEN_KEY, config.apiToken);
    localStorage.setItem(PROJECT_NAME_KEY, config.projectName);
  }
}

/**
 * Load API settings from local storage
 * @returns API configuration or null if not found
 */
export function loadApiSettings(): HetznerApiConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const apiToken = localStorage.getItem(API_TOKEN_KEY);
  const projectName = localStorage.getItem(PROJECT_NAME_KEY);
  
  if (!apiToken || !projectName) {
    return null;
  }
  
  return {
    apiToken,
    projectName
  };
}

/**
 * Check if API settings are configured
 * @returns true if settings are configured
 */
export function hasApiSettings(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!localStorage.getItem(API_TOKEN_KEY) && !!localStorage.getItem(PROJECT_NAME_KEY);
}

/**
 * Clear API settings from local storage
 */
export function clearApiSettings(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_TOKEN_KEY);
    localStorage.removeItem(PROJECT_NAME_KEY);
  }
}
