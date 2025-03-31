import { Server } from '@/lib/api/types';
import { formatBytes, formatDate } from '@/lib/api/apiClient';

interface ServerCardProps {
  server: Server;
  projectName: string;
  onCopyIp: (ip: string) => void;
}

export default function ServerCard({ server, projectName, onCopyIp }: ServerCardProps) {
  // Get the price in EUR and INR
  const priceMonthly = server.server_type.prices?.[0]?.price_monthly;
  const priceEur = priceMonthly ? priceMonthly.gross : 'N/A';
  const priceInr = priceMonthly?.inr || 'N/A';
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <span>{server.name}</span>
          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            server.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {server.status}
          </span>
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Project: {projectName}</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Hostname</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{server.name}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(server.created)}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Instance ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{server.id}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Public IPv4</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
              <span className="mr-2">{server.public_net.ipv4?.ip || 'N/A'}</span>
              {server.public_net.ipv4?.ip && (
                <button
                  onClick={() => onCopyIp(server.public_net.ipv4.ip)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Copy
                </button>
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Hardware</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="font-medium">Cores:</span> {server.server_type.cores} | 
              <span className="font-medium ml-2">Memory:</span> {server.server_type.memory} GB | 
              <span className="font-medium ml-2">Disk:</span> {server.server_type.disk} GB
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Traffic</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="font-medium">Outgoing:</span> {formatBytes(server.outgoing_traffic || 0)} | 
              <span className="font-medium ml-2">Incoming:</span> {formatBytes(server.ingoing_traffic || 0)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">OS</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {server.image?.os_flavor || 'N/A'} {server.image?.os_version || ''}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Price (Monthly)</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className="font-medium">EUR:</span> €{priceEur} | 
              <span className="font-medium ml-2">INR:</span> ₹{priceInr}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
