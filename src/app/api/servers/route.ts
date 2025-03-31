import { NextRequest, NextResponse } from 'next/server';
import { HetznerApiService, initializeApi } from '@/lib/api/hetznerApi';
import { ServersResponse } from '@/lib/api/types';

/**
 * API route to fetch servers from Hetzner Cloud API
 * 
 * @param req Request object
 * @returns Response with server data
 */
export async function GET(req: NextRequest) {
  try {
    // Get API token and project name from request headers
    const apiToken = req.headers.get('x-api-token');
    const projectName = req.headers.get('x-project-name');
    
    if (!apiToken || !projectName) {
      return NextResponse.json(
        { error: 'API token and project name are required' },
        { status: 401 }
      );
    }
    
    // Initialize API service with provided credentials
    const apiService = initializeApi({
      apiToken,
      projectName
    });
    
    // Fetch servers from Hetzner Cloud API
    const serversData = await apiService.getServers();
    
    // Process server data to include INR pricing
    const processedData: ServersResponse = {
      ...serversData,
      servers: serversData.servers.map((server: any) => {
        // Process pricing data if available
        if (server.server_type && server.server_type.prices && server.server_type.prices.length > 0) {
          server.server_type.prices = server.server_type.prices.map((price: any) => {
            if (price.price_monthly) {
              // Add INR pricing
              const eurPrice = parseFloat(price.price_monthly.gross);
              price.price_monthly.inr = apiService.convertEurToInr(eurPrice).toFixed(2);
            }
            return price;
          });
        }
        return server;
      })
    };
    
    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error('Error in servers API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch server data' },
      { status: 500 }
    );
  }
}
