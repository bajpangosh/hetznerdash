/**
 * Server types and interfaces for Hetzner Cloud API
 */

export interface Server {
  id: number;
  name: string;
  status: string;
  created: string;
  server_type: {
    id: number;
    name: string;
    description: string;
    cores: number;
    memory: number;
    disk: number;
    prices: {
      location: string;
      price_monthly: {
        net: string;
        gross: string;
      };
    }[];
  };
  public_net: {
    ipv4: {
      ip: string;
      blocked: boolean;
      dns_ptr: string;
    };
    ipv6: {
      ip: string;
      blocked: boolean;
      dns_ptr: string[];
    };
    floating_ips: number[];
  };
  private_net: any[];
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
  };
  outgoing_traffic: number;
  ingoing_traffic: number;
}

export interface ServersResponse {
  servers: Server[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      previous_page: number | null;
      next_page: number | null;
      last_page: number;
      total_entries: number;
    };
  };
}
