import React, { useState, useEffect } from 'react';
import { getDentalIssueInfo } from '../services/geminiService';
import type { WebSource } from '../types';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, BookOpenIcon, CloseIcon } from './IconComponents';

interface AIEducationModuleProps {
  issueName: string;
  onClose: () => void;
}

export const AIEducationModule: React.FC<AIEducationModuleProps> = ({ issueName, onClose }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [sources, setSources] = useState<WebSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { explanation, sources } = await getDentalIssueInfo(issueName);
        setExplanation(explanation);
        setSources(sources);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [issueName]);

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-lg border border-blue-200 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-700 flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2" />
            Learn About: {issueName}
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-start">
          <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold">Could Not Load Information</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {explanation && (
        <div>
          <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
          
          {sources.length > 0 && (
            <div className="pt-4 mt-4 border-t border-blue-200">
              <h4 className="font-semibold text-slate-600">Information Sources from Google:</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                {sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
