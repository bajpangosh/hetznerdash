"use client";

import { useState, useEffect } from 'react';
import { Server } from '@/lib/api/types';
import { fetchServers } from '@/lib/api/apiClient';
import { loadApiSettings } from '@/lib/api/settingsStorage';
import ServerCard from '@/components/ServerCard';
import Card from '@/components/Card';
import Link from 'next/link';

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

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
      } catch (error: any) {
        console.error('Error loading servers:', error);
        setError(error.message || 'Failed to load server data');
      } finally {
        setLoading(false);
      }
    };
    
    loadServers();
  }, []);
  
  const handleCopyIp = (ip: string) => {
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {projectName ? `${projectName} Dashboard` : 'Hetzner Cloud Dashboard'}
        </h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {loading ? (
          <Card>
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          </Card>
        ) : error ? (
          <Card className="bg-red-50">
            <div className="text-red-700">
              <p>{error}</p>
              {error.includes('settings') && (
                <Link href="/settings" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Go to Settings
                </Link>
              )}
            </div>
          </Card>
        ) : servers.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No servers found</h3>
              <p className="mt-2 text-sm text-gray-500">
                No servers were found in your Hetzner Cloud account.
              </p>
            </div>
          </Card>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Servers ({servers.length})
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Refresh
              </button>
            </div>
            
            {servers.map((server) => (
              <ServerCard 
                key={server.id} 
                server={server} 
                projectName={projectName}
                onCopyIp={handleCopyIp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
