# Hetzner Dashboard - User Guide

## Overview
The Hetzner Dashboard is a web application that allows you to monitor your Hetzner Cloud servers. It displays detailed information about your servers including hardware specifications, network information, pricing, and operating system details.

## Getting Started

### Prerequisites
- Node.js and npm installed
- A valid Hetzner Cloud API token

### Installation
1. Clone or download the application
2. Navigate to the application directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Access the application at http://localhost:3000

### Configuration
Before you can view your server information, you need to configure the application with your Hetzner Cloud API token:

1. Navigate to the Settings page
2. Enter a project name (this will be displayed on the dashboard)
3. Enter your Hetzner Cloud API token
   - You can generate an API token in the Hetzner Cloud Console under Security > API Tokens
4. Click "Save Settings"

## Features

### Dashboard
The dashboard displays a list of all your Hetzner Cloud servers with the following information:
- Hostname
- Creation date
- Instance ID
- Public IPv4 address (with copy functionality)
- Hardware specifications (cores, memory, disk)
- Network traffic (outgoing and incoming)
- Operating system information
- Pricing information in both EUR and INR

### Settings
The settings page allows you to configure:
- Project name
- Hetzner Cloud API token

## Deployment
For production deployment:
1. Build the application:
   ```
   npm run build
   ```
2. Start the production server:
   ```
   npm start
   ```

## Troubleshooting
- If you see "API settings not configured" message, go to the Settings page and enter your API token
- If you encounter errors when fetching server data, verify that your API token is valid and has the necessary permissions
- For any other issues, check the browser console for error messages

## Security Considerations
- Your API token is stored in the browser's local storage
- Never share your API token with others
- Consider using a token with read-only permissions for security
