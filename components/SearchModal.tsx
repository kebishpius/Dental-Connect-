import React, { useState, useEffect } from 'react';
import { generalSearch } from '../services/geminiService';
import type { WebSource } from '../types';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, SearchIcon, CloseIcon } from './IconComponents';

interface SearchModalProps {
  query: string;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ query, onClose }) => {
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<WebSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setIsLoading(true);
      setError(null);
      try {
        const { response, sources } = await generalSearch(query);
        setResult(response);
        setSources(sources);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <SearchIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800 truncate">Search Result for: "{query}"</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-start">
              <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Search Failed</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div>
              <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
              
              {sources.length > 0 && (
                <div className="pt-4 mt-6 border-t">
                  <h4 className="font-semibold text-slate-600">Sources from Google:</h4>
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
      </div>
    </div>
  );
};
