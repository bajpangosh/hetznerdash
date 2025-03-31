"use client";

import { useState, useEffect } from 'react';
import { Server } from '@/lib/api/types';
import { fetchServers } from '@/lib/api/apiClient';
import { loadApiSettings } from '@/lib/api/settingsStorage';
import Link from 'next/link';
import { formatBytes, formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [filteredServers, setFilteredServers] = useState<Server[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currencyDisplay, setCurrencyDisplay] = useState<'EUR' | 'INR'>('EUR');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if viewport is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadServers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const settings = loadApiSettings();
        
        if (!settings) {
          setError('API settings not configured. Please go to Settings page.');
          setLoading(false);
          return;
        }
        
        setProjectName(settings.projectName);
        
        const data = await fetchServers(settings.apiToken, settings.projectName);
        setServers(data.servers);
        setFilteredServers(data.servers);
      } catch (error: any) {
        console.error('Error loading servers:', error);
        setError(error.message || 'Failed to load server data');
      } finally {
        setLoading(false);
      }
    };
    
    loadServers();
  }, []);
  
  useEffect(() => {
    // Filter servers based on search query
    if (searchQuery.trim() === '') {
      setFilteredServers(servers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = servers.filter(server => 
        server.name.toLowerCase().includes(query) ||
        server.id.toString().includes(query) ||
        server.public_net.ipv4?.ip.includes(query) ||
        server.image?.os_flavor.toLowerCase().includes(query)
      );
      setFilteredServers(filtered);
    }
  }, [searchQuery, servers]);

  useEffect(() => {
    // Sort servers based on sort field and direction
    const sorted = [...filteredServers].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'created':
          valueA = new Date(a.created).getTime();
          valueB = new Date(b.created).getTime();
          break;
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'cores':
          valueA = a.server_type.cores;
          valueB = b.server_type.cores;
          break;
        case 'memory':
          valueA = a.server_type.memory;
          valueB = b.server_type.memory;
          break;
        case 'disk':
          valueA = a.server_type.disk;
          valueB = b.server_type.disk;
          break;
        case 'price':
          valueA = parseFloat(a.server_type.prices?.[0]?.price_monthly?.gross || '0');
          valueB = parseFloat(b.server_type.prices?.[0]?.price_monthly?.gross || '0');
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredServers(sorted);
  }, [sortField, sortDirection]);
  
  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleCurrency = () => {
    setCurrencyDisplay(currencyDisplay === 'EUR' ? 'INR' : 'EUR');
  };

  // Mobile card view for each server
  const renderMobileCard = (server: Server) => {
    // Get the price in EUR and INR
    const priceMonthly = server.server_type.prices?.[0]?.price_monthly;
    const priceEur = priceMonthly ? priceMonthly.gross : 'N/A';
    const priceInr = priceMonthly?.inr || 'N/A';
    
    return (
      <div key={server.id} className="card-view bg-white dark:bg-gray-800 shadow mb-4 rounded-lg overflow-hidden">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white">{server.name}</div>
            <div className={`text-xs ${getStatusColor(server.status)}`}>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {server.status}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="card-row">
            <div className="card-label">Created</div>
            <div className="card-value">{formatDate(server.created)}</div>
          </div>
          <div className="card-row">
            <div className="card-label">Instance ID</div>
            <div className="card-value">{server.id}</div>
          </div>
          <div className="card-row">
            <div className="card-label">IPv4</div>
            <div className="card-value flex items-center justify-end">
              <span className="mr-2">{server.public_net.ipv4?.ip || 'N/A'}</span>
              {server.public_net.ipv4?.ip && (
                <button
                  onClick={() => handleCopyIp(server.public_net.ipv4.ip)}
                  className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  title="Copy IP address"
                >
                  {copiedIp === server.public_net.ipv4.ip ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="card-row">
            <div className="card-label">Hardware</div>
            <div className="card-value">
              <div>{server.server_type.cores} Cores</div>
              <div>{server.server_type.memory} GB RAM</div>
              <div>{server.server_type.disk} GB Disk</div>
            </div>
          </div>
          <div className="card-row">
            <div className="card-label">Traffic</div>
            <div className="card-value">
              <div>In: {formatBytes(server.ingoing_traffic || 0)}</div>
              <div>Out: {formatBytes(server.outgoing_traffic || 0)}</div>
            </div>
          </div>
          <div className="card-row">
            <div className="card-label">OS</div>
            <div className="card-value">
              {server.image?.os_flavor || 'N/A'} {server.image?.os_version || ''}
            </div>
          </div>
          <div className="card-row">
            <div className="card-label">Price</div>
            <div className="card-value">
              {currencyDisplay === 'EUR' 
                ? formatCurrency(priceEur, 'EUR')
                : formatCurrency(priceInr, 'INR')
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {projectName ? `${projectName} Dashboard` : 'Hetzner Cloud Dashboard'}
        </h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-red-700 dark:text-red-200">
                <p>{error}</p>
                {error.includes('settings') && (
                  <Link href="/settings" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                    Go to Settings
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Servers ({filteredServers.length})
                </h2>
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={toggleCurrency}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                  {currencyDisplay === 'EUR' ? 'Show INR' : 'Show EUR'}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {filteredServers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No servers found</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No servers match your search criteria.' : 'No servers were found in your Hetzner Cloud account.'}
                  </p>
                </div>
              </div>
            ) : isMobile ? (
              // Mobile card view
              <div className="space-y-4">
                {filteredServers.map(server => renderMobileCard(server))}
              </div>
            ) : (
              // Desktop modern table view
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="responsive-table">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            <span>Hostname</span>
                            {sortField === 'name' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('created')}
                        >
                          <div className="flex items-center">
                            <span>Created</span>
                            {sortField === 'created' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center">
                            <span>ID</span>
                            {sortField === 'id' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          IPv4
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('cores')}
                        >
                          <div className="flex items-center">
                            <span>Hardware</span>
                            {(sortField === 'cores' || sortField === 'memory' || sortField === 'disk') && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Traffic
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          OS
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('price')}
                        >
                          <div className="flex items-center">
                            <span>Price</span>
                            {sortField === 'price' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServers.map((server, idx) => {
                        // Get the price in EUR and INR
                        const priceMonthly = server.server_type.prices?.[0]?.price_monthly;
                        const priceEur = priceMonthly ? priceMonthly.gross : 'N/A';
                        const priceInr = priceMonthly?.inr || 'N/A';
                        
                        return (
                          <tr 
                            key={server.id} 
                            className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{server.name}</div>
                                  <div className={`text-xs ${getStatusColor(server.status)}`}>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                      {server.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">{formatDate(server.created)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">{server.id}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white mr-2">{server.public_net.ipv4?.ip || 'N/A'}</span>
                                {server.public_net.ipv4?.ip && (
                                  <button
                                    onClick={() => handleCopyIp(server.public_net.ipv4.ip)}
                                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    title="Copy IP address"
                                  >
                                    {copiedIp === server.public_net.ipv4.ip ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                                      </svg>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                <div className="flex flex-col">
                                  <span className="font-medium">{server.server_type.cores} Cores</span>
                                  <span>{server.server_type.memory} GB RAM</span>
                                  <span>{server.server_type.disk} GB Disk</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                <div>In: {formatBytes(server.ingoing_traffic || 0)}</div>
                                <div>Out: {formatBytes(server.outgoing_traffic || 0)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {server.image?.os_flavor || 'N/A'} {server.image?.os_version || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {currencyDisplay === 'EUR' 
                                  ? formatCurrency(priceEur, 'EUR')
                                  : formatCurrency(priceInr, 'INR')
                                }
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
