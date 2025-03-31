"use client";

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://euusagykehiyfernbchd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dXNhZ3lrZWhpeWZlcm5iY2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDg1NzEsImV4cCI6MjA1ODk4NDU3MX0.EAonxFcH0pg5TtGT3wNv6ejvgrTdAgAQT4Z3QQ3kWV4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for Hetzner server data
export interface Server {
  id: number;
  name: string;
  status: string;
  created: string;
  public_net: {
    ipv4?: {
      ip: string;
      blocked: boolean;
      dns_ptr: string;
    };
    ipv6?: {
      ip: string;
      blocked: boolean;
      dns_ptr: string;
    };
    floating_ips: any[];
  };
  server_type: {
    id: number;
    name: string;
    description: string;
    cores: number;
    memory: number;
    disk: number;
    prices: {
      location: string;
      price_hourly: {
        net: string;
        gross: string;
      };
      price_monthly: {
        net: string;
        gross: string;
        inr?: string;
      };
    }[];
  };
  datacenter: {
    id: number;
    name: string;
    description: string;
    location: {
      id: number;
      name: string;
      description: string;
      country: string;
      city: string;
      latitude: number;
      longitude: number;
    };
  };
  image: {
    id: number;
    type: string;
    status: string;
    name: string;
    description: string;
    os_flavor: string;
    os_version: string;
  } | null;
  iso: any | null;
  rescue_enabled: boolean;
  locked: boolean;
  backup_window: string | null;
  outgoing_traffic: number;
  ingoing_traffic: number;
  included_traffic: number;
  protection: {
    delete: boolean;
    rebuild: boolean;
  };
  labels: Record<string, string>;
  volumes: any[];
}

export interface ApiSettings {
  apiToken: string;
  projectName: string;
}

// Function to save server data to Supabase
export async function saveServersToSupabase(servers: Server[]): Promise<void> {
  try {
    // First, clear existing data
    await supabase.from('servers').delete().neq('id', 0);
    
    // Then insert new data
    const { data, error } = await supabase
      .from('servers')
      .insert(servers.map(server => ({
        server_id: server.id,
        name: server.name,
        status: server.status,
        created: server.created,
        ipv4: server.public_net.ipv4?.ip || null,
        cores: server.server_type.cores,
        memory: server.server_type.memory,
        disk: server.server_type.disk,
        price_monthly: server.server_type.prices?.[0]?.price_monthly?.gross || null,
        price_monthly_inr: server.server_type.prices?.[0]?.price_monthly?.inr || null,
        os_flavor: server.image?.os_flavor || null,
        os_version: server.image?.os_version || null,
        outgoing_traffic: server.outgoing_traffic,
        ingoing_traffic: server.ingoing_traffic,
        datacenter: server.datacenter.name,
        country: server.datacenter.location.country
      })));
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving servers to Supabase:', error);
    throw error;
  }
}

// Function to fetch servers from Supabase
export async function fetchServersFromSupabase(): Promise<Server[]> {
  try {
    const { data, error } = await supabase
      .from('servers')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Convert Supabase data back to Server format
    return data.map(item => ({
      id: item.server_id,
      name: item.name,
      status: item.status,
      created: item.created,
      public_net: {
        ipv4: item.ipv4 ? {
          ip: item.ipv4,
          blocked: false,
          dns_ptr: ''
        } : undefined,
        floating_ips: []
      },
      server_type: {
        id: 0,
        name: '',
        description: '',
        cores: item.cores,
        memory: item.memory,
        disk: item.disk,
        prices: [{
          location: '',
          price_hourly: {
            net: '',
            gross: ''
          },
          price_monthly: {
            net: '',
            gross: item.price_monthly,
            inr: item.price_monthly_inr
          }
        }]
      },
      datacenter: {
        id: 0,
        name: item.datacenter,
        description: '',
        location: {
          id: 0,
          name: '',
          description: '',
          country: item.country,
          city: '',
          latitude: 0,
          longitude: 0
        }
      },
      image: {
        id: 0,
        type: '',
        status: '',
        name: '',
        description: '',
        os_flavor: item.os_flavor || '',
        os_version: item.os_version || ''
      },
      iso: null,
      rescue_enabled: false,
      locked: false,
      backup_window: null,
      outgoing_traffic: item.outgoing_traffic,
      ingoing_traffic: item.ingoing_traffic,
      included_traffic: 0,
      protection: {
        delete: false,
        rebuild: false
      },
      labels: {},
      volumes: []
    }));
  } catch (error) {
    console.error('Error fetching servers from Supabase:', error);
    throw error;
  }
}

// Function to save API settings to Supabase
export async function saveApiSettingsToSupabase(settings: ApiSettings): Promise<void> {
  try {
    // First, clear existing settings
    await supabase.from('settings').delete().neq('id', 0);
    
    // Then insert new settings
    const { data, error } = await supabase
      .from('settings')
      .insert([{
        api_token: settings.apiToken,
        project_name: settings.projectName
      }]);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving API settings to Supabase:', error);
    throw error;
  }
}

// Function to fetch API settings from Supabase
export async function fetchApiSettingsFromSupabase(): Promise<ApiSettings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      return {
        apiToken: data[0].api_token,
        projectName: data[0].project_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching API settings from Supabase:', error);
    throw error;
  }
}
