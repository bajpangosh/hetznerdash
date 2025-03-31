"use client";

import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
