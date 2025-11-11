import React, { useState } from 'react';
import { findDentists } from '../services/geminiService';
import type { WebSource } from '../types';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, MapPinIcon, ArrowUpRightIcon } from './IconComponents';

interface DentistFinderProps {
  issues: string[];
}

export const DentistFinder: React.FC<DentistFinderProps> = ({ issues }) => {
  const [dentists, setDentists] = useState<WebSource[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindDentists = () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setDentists([]);
    setSummary(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await findDentists(issues, { latitude, longitude });
          setSummary(result.response);
          setDentists(result.places);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not find dentists.');
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        <MapPinIcon className="h-6 w-6 mr-2 text-blue-600" />
        Find a Local Professional
      </h2>
      <p className="text-slate-600 mb-2 text-sm">
        Use your location to find recommended dental professionals nearby.
      </p>
      {issues.length > 0 && (
          <p className="text-xs text-slate-500 mb-4">
              Searching for specialists for: <span className="font-semibold">{issues.join(', ')}</span>.
          </p>
      )}
      
      <button
        onClick={handleFindDentists}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? 'Searching...' : 'Find Dentists Near Me'}
      </button>

      {isLoading && <div className="mt-6 flex justify-center"><Spinner /></div>}
      
      {error && (
        <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {hasSearched && !isLoading && !error && (
        <div className="mt-6 border-t pt-4">
          {summary && <div className="text-slate-700 mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: summary.replace(/\* \*(.*?)\* \*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />}
          
          {dentists.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 text-base">Locations Found:</h3>
              <ul className="space-y-2">
                {dentists.map((dentist, index) => (
                  <li key={index}>
                    <a
                      href={dentist.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                    >
                      <p className="font-semibold text-blue-700 text-sm pr-2">{dentist.title}</p>
                      <ArrowUpRightIcon className="h-5 w-5 text-slate-500 flex-shrink-0 group-hover:text-blue-600" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-slate-600 py-6">No specific dentists were found for your area. Try a general search in the chat assistant.</p>
          )}
        </div>
      )}
    </div>
  );
};