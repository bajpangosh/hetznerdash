"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { saveApiSettingsToSupabase, fetchApiSettingsFromSupabase } from '@/lib/api/supabaseClient';
import { saveApiSettings, loadApiSettings } from '@/lib/api/settingsStorage';

export default function Settings() {
  const [apiToken, setApiToken] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First try to load from Supabase
    const loadSettings = async () => {
      try {
        const supabaseSettings = await fetchApiSettingsFromSupabase();
        if (supabaseSettings) {
          setApiToken(supabaseSettings.apiToken);
          setProjectName(supabaseSettings.projectName);
          return;
        }
      } catch (error) {
        console.error('Error loading settings from Supabase:', error);
      }
      
      // Fall back to local storage
      const settings = loadApiSettings();
      if (settings) {
        setApiToken(settings.apiToken);
        setProjectName(settings.projectName);
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!apiToken) {
      setError('API token is required');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Save to local storage
      saveApiSettings({
        apiToken,
        projectName
      });
      
      // Save to Supabase
      try {
        await saveApiSettingsToSupabase({
          apiToken,
          projectName
        });
      } catch (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
        // Continue even if Supabase save fails
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout activePage="settings">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">API Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Hetzner Project"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-color focus:border-primary-color"
            />
            <p className="mt-1 text-sm text-gray-500">
              This name will be displayed in the dashboard header.
            </p>
          </div>
          
          <div>
            <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hetzner Cloud API Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                id="apiToken"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Hetzner Cloud API token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-color focus:border-primary-color pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showToken ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              You can generate an API token in the Hetzner Cloud Console under Security &gt; API Tokens.
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div>
              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}
              {saveSuccess && (
                <div className="text-green-600 text-sm">
                  Settings saved successfully!
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-semibold mb-6">Supabase Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value="https://euusagykehiyfernbchd.supabase.co"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase API Key
            </label>
            <input
              type="password"
              value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dXNhZ3lrZWhpeWZlcm5iY2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDg1NzEsImV4cCI6MjA1ODk4NDU3MX0.EAonxFcH0pg5TtGT3wNv6ejvgrTdAgAQT4Z3QQ3kWV4"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
            />
          </div>
          
          <p className="text-sm text-gray-500">
            Supabase is configured to store your Hetzner server data and API settings. This allows for persistent storage and faster loading times.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
