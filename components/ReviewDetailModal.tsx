import React from 'react';
import type { PatientAnalysis } from '../types';
import { CloseIcon, ClipboardListIcon } from './IconComponents';
import { ReportDisplay } from './ReportDisplay';

interface ReviewDetailModalProps {
  analysis: PatientAnalysis;
  onClose: () => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ analysis, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl">
          <div className="flex items-center space-x-2">
            <ClipboardListIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Doctor's Review from {analysis.date}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: Image and Notes */}
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <img 
                        src={analysis.imageDataUrl} 
                        alt={`Scan from ${analysis.date}`}
                        className="rounded-lg shadow-md border w-full"
                    />
                </div>
                {analysis.dentistNotes && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h4 className="font-bold text-lg text-slate-800 mb-2">Notes from your Dentist:</h4>
                        <p className="text-slate-600 whitespace-pre-wrap">{analysis.dentistNotes}</p>
                    </div>
                )}
            </div>

            {/* Right Side: Report */}
            <div>
                 <ReportDisplay result={analysis.result} role="patient" />
            </div>
        </div>
      </div>
    </div>
  );
};