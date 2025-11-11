import React, { useState } from 'react';
import type { DetectedIssue } from '../types';
import { generatePatientSummary } from '../services/geminiService';
import { SparklesIcon, AlertTriangleIcon, CheckIcon } from './IconComponents';
import { Spinner } from './Spinner';

interface AIAssistantToolsProps {
  issues: DetectedIssue[];
}

export const AIAssistantTools: React.FC<AIAssistantToolsProps> = ({ issues }) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDraftSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary('');
    try {
      const result = await generatePatientSummary(issues);
      setSummary(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate summary: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error("Failed to copy text:", err);
        alert("Failed to copy text. Please copy it manually.");
      });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
        <SparklesIcon className="h-7 w-7 mr-2" />
        AI Assistant Tools
      </h2>
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h3 className="font-semibold text-indigo-800">Draft Patient-Friendly Summary</h3>
        <p className="text-sm text-indigo-700 mb-4">
          Generate a simple summary of the findings to help explain them to your patient.
        </p>
        <button
          onClick={handleDraftSummary}
          disabled={isLoading}
          className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Drafting...' : 'Generate Draft'}
        </button>

        {isLoading && <div className="mt-4 flex justify-center"><Spinner /></div>}

        {error && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-sm flex items-start">
            <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
                <p className="font-bold text-sm">{error}</p>
            </div>
            </div>
        )}

        {summary && (
            <div className="mt-4 animate-fade-in">
                <textarea
                    value={summary}
                    readOnly
                    rows={6}
                    className="w-full p-3 border border-slate-300 rounded-md bg-white shadow-inner text-slate-900"
                />
                <button
                    onClick={handleCopyToClipboard}
                    className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-green-600 disabled:cursor-default transition-colors"
                    disabled={copied}
                >
                    {copied ? <><CheckIcon className="h-4 w-4" /> Copied!</> : 'Copy to Clipboard'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};