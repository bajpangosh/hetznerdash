"use client";

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  onCopy?: (text: string) => void;
}

export default function CopyButton({ text, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) onCopy(text);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded 
        ${copied 
          ? 'text-green-700 bg-green-100 hover:bg-green-200' 
          : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
