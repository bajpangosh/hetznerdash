import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to check if API settings are valid
 * 
 * @param req Request object
 * @returns Response with validation result
 */
export async function POST(req: NextRequest) {
  try {
    const { apiToken, projectName } = await req.json();
    
    if (!apiToken || !projectName) {
      return NextResponse.json(
        { valid: false, message: 'API token and project name are required' },
        { status: 400 }
      );
    }
    
    // Test the API token by making a request to the Hetzner API
    const response = await fetch('https://api.hetzner.cloud/v1/servers', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return NextResponse.json({ valid: true, message: 'API settings are valid' });
    } else {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          valid: false, 
          message: `API validation failed: ${errorData.error?.message || 'Invalid API token'}` 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error validating API settings:', error);
    return NextResponse.json(
      { valid: false, message: error.message || 'Failed to validate API settings' },
      { status: 500 }
    );
  }
}
