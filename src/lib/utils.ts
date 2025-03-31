import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human-readable format
 * @param bytes Bytes to format
 * @returns Formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date to human-readable format
 * @param dateString Date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Convert EUR to INR
 * @param eurAmount Amount in EUR
 * @returns Amount in INR
 */
export function convertEurToInr(eurAmount: number): number {
  // Using a fixed conversion rate for demonstration
  // In a production app, you would use a currency conversion API
  const conversionRate = 90.5; // Example rate: 1 EUR = 90.5 INR
  return eurAmount * conversionRate;
}

/**
 * Format currency with symbol
 * @param amount Amount to format
 * @param currency Currency code (EUR or INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currency: 'EUR' | 'INR'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'N/A';
  }
  
  const symbols = {
    EUR: '€',
    INR: '₹'
  };
  
  return `${symbols[currency]}${numAmount.toFixed(2)}`;
}

/**
 * Get status color based on server status
 * @param status Server status
 * @returns Tailwind CSS color class
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'stopped':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'starting':
    case 'stopping':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

/**
 * Get OS icon based on OS flavor
 * @param osFlavor OS flavor
 * @returns Icon class
 */
export function getOsIcon(osFlavor: string): string {
  switch (osFlavor?.toLowerCase()) {
    case 'ubuntu':
      return 'ubuntu';
    case 'debian':
      return 'debian';
    case 'centos':
      return 'centos';
    case 'fedora':
      return 'fedora';
    case 'windows':
      return 'windows';
    default:
      return 'linux';
  }
}
