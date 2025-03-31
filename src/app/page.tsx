"use client";

import { useState, useEffect } from 'react';
import { fetchServersFromSupabase, saveServersToSupabase } from '@/lib/api/supabaseClient';
import { fetchServers } from '@/lib/api/apiClient';
import { loadApiSettings } from '@/lib/api/settingsStorage';
import DashboardLayout from '@/components/DashboardLayout';
import { formatBytes, formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const [servers, setServers] = useState([]);
  const [filteredServers, setFilteredServers] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedIp, setCopiedIp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currencyDisplay, setCurrencyDisplay] = useState('EUR');
  const [selectedRows, setSelectedRows] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadServers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to load from Supabase
        let supabaseServers = [];
        try {
          supabaseServers = await fetchServersFromSupabase();
          if (supabaseServers && supabaseServers.length > 0) {
            setServers(supabaseServers);
            setFilteredServers(supabaseServers);
            setLoading(false);
          }
        } catch (supabaseError) {
          console.error('Error loading from Supabase, falling back to API:', supabaseError);
        }
        
        // If no data in Supabase or error occurred, fetch from Hetzner API
        if (supabaseServers.length === 0) {
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
          
          // Save to Supabase
          try {
            await saveServersToSupabase(data.servers);
          } catch (saveError) {
            console.error('Error saving to Supabase:', saveError);
          }
        }
      } catch (error) {
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
    setCurrentPage(1); // Reset to first page when filtering
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
  
  const handleCopyIp = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleSort = (field) => {
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
  
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedServers.map(server => server.id));
    }
    setAllSelected(!allSelected);
  };
  
  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedServers = filteredServers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServers.length / itemsPerPage);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const refreshData = async () => {
    setLoading(true);
    try {
      const settings = loadApiSettings();
      
      if (!settings) {
        setError('API settings not configured. Please go to Settings page.');
        setLoading(false);
        return;
      }
      
      const data = await fetchServers(settings.apiToken, settings.projectName);
      setServers(data.servers);
      setFilteredServers(data.servers);
      
      // Save to Supabase
      try {
        await saveServersToSupabase(data.servers);
      } catch (saveError) {
        console.error('Error saving to Supabase:', saveError);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activePage="dashboard">
      <div className="filter-section">
        <div className="flex flex-col md:flex-row justify-between w-full gap-4">
          <div className="flex-1">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select className="filter-select">
                <option value="all">All</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Currency</label>
              <select 
                className="filter-select"
                value={currencyDisplay}
                onChange={(e) => setCurrencyDisplay(e.target.value)}
              >
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </select>
            </div>
            
            <button 
              className="btn btn-primary self-end"
              onClick={refreshData}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Search'}
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="card p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
        </div>
      ) : error ? (
        <div className="card p-6 bg-red-50">
          <div className="text-red-700">
            <p>{error}</p>
            {error.includes('settings') && (
              <Link href="/settings" className="mt-4 btn btn-primary">
                Go to Settings
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Server Summary</h2>
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <button className="btn btn-primary">
                  Dispatch Selected ({selectedRows.length})
                </button>
              )}
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button className="px-3 py-1 bg-white hover:bg-gray-50 border-r border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="px-3 py-1 bg-white hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {filteredServers.length === 0 ? (
            <div className="card p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">No servers found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? 'No servers match your search criteria.' : 'No servers were found in your Hetzner Cloud account.'}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input 
                          type="checkbox" 
                          checked={allSelected}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                        />
                      </th>
                      <th 
                        className="cursor-pointer"
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
                      <th 
                        className="cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Server Name</span>
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
                        className="cursor-pointer"
                        onClick={() => handleSort('created')}
                      >
                        <div className="flex items-center">
                          <span>Date</span>
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
                      <th>Status</th>
                      <th>IPv4</th>
                      <th 
                        className="cursor-pointer"
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
                      <th>OS</th>
                      <th 
                        className="cursor-pointer"
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServers.map((server, idx) => {
                      // Get the price in EUR and INR
                      const priceMonthly = server.server_type.prices?.[0]?.price_monthly;
                      const priceEur = priceMonthly ? priceMonthly.gross : 'N/A';
                      const priceInr = priceMonthly?.inr || 'N/A';
                      
                      return (
                        <tr key={server.id}>
                          <td className="checkbox-cell">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.includes(server.id)}
                              onChange={() => handleSelectRow(server.id)}
                              className="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                            />
                          </td>
                          <td>{server.id}</td>
                          <td>
                            <div className="font-medium text-gray-900">{server.name}</div>
                          </td>
                          <td>{formatDate(server.created)}</td>
                          <td>
                            <span className={`status-badge ${server.status === 'running' ? 'status-active' : 'status-pending'}`}>
                              {server.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center">
                              <span className="mr-2">{server.public_net.ipv4?.ip || 'N/A'}</span>
                              {server.public_net.ipv4?.ip && (
                                <button
                                  onClick={() => handleCopyIp(server.public_net.ipv4.ip)}
                                  className="text-primary-color hover:text-primary-hover"
                                  title="Copy IP address"
                                >
                                  {copiedIp === server.public_net.ipv4.ip ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                                    </svg>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div>{server.server_type.cores} Cores</div>
                              <div>{server.server_type.memory} GB RAM</div>
                              <div>{server.server_type.disk} GB Disk</div>
                            </div>
                          </td>
                          <td>
                            {server.image?.os_flavor || 'N/A'} {server.image?.os_version || ''}
                          </td>
                          <td>
                            {currencyDisplay === 'EUR' 
                              ? formatCurrency(priceEur, 'EUR')
                              : formatCurrency(priceInr, 'INR')
                            }
                          </td>
                          <td>
                            <button className="text-gray-400 hover:text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="pagination">
                <div className="pagination-info">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredServers.length)} of {filteredServers.length} entries
                </div>
                <div className="pagination-controls">
                  <button 
                    className="pagination-button"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button 
                        key={pageNum}
                        className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    className="pagination-button"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
