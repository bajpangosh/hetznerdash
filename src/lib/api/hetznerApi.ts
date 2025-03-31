/**
 * Hetzner Cloud API Service
 * 
 * This service handles all interactions with the Hetzner Cloud API
 * Documentation: https://docs.hetzner.cloud/
 */

export interface HetznerApiConfig {
  apiToken: string;
  projectName: string;
}

export class HetznerApiService {
  private apiToken: string;
  private baseUrl: string = 'https://api.hetzner.cloud/v1';
  private projectName: string;

  constructor(config: HetznerApiConfig) {
    this.apiToken = config.apiToken;
    this.projectName = config.projectName;
  }

  /**
   * Get all servers from Hetzner Cloud
   * @returns Promise with server data
   */
  async getServers() {
    try {
      const response = await fetch(`${this.baseUrl}/servers`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw error;
    }
  }

  /**
   * Convert EUR to INR
   * @param eurAmount Amount in EUR
   * @returns Amount in INR
   */
  convertEurToInr(eurAmount: number): number {
    // Using a fixed conversion rate for demonstration
    // In a production app, you would use a currency conversion API
    const conversionRate = 90.5; // Example rate: 1 EUR = 90.5 INR
    return eurAmount * conversionRate;
  }

  /**
   * Get project name
   * @returns Project name
   */
  getProjectName(): string {
    return this.projectName;
  }

  /**
   * Update API configuration
   * @param config New API configuration
   */
  updateConfig(config: HetznerApiConfig): void {
    this.apiToken = config.apiToken;
    this.projectName = config.projectName;
  }
}

// Create a singleton instance
let apiService: HetznerApiService | null = null;

/**
 * Initialize the Hetzner API service
 * @param config API configuration
 * @returns HetznerApiService instance
 */
export function initializeApi(config: HetznerApiConfig): HetznerApiService {
  apiService = new HetznerApiService(config);
  return apiService;
}

/**
 * Get the Hetzner API service instance
 * @returns HetznerApiService instance
 */
export function getApiService(): HetznerApiService | null {
  return apiService;
}
