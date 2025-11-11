import React from 'react';
import type { AnalysisResult } from '../types';
import { ReportDisplay } from './ReportDisplay';
import { ImageEditor } from './ImageEditor';
import { DentistFinder } from './DentistFinder';

interface AnalysisViewProps {
    analysis: AnalysisResult;
    imageFile: File;
    onBackToDashboard: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, imageFile, onBackToDashboard }) => {
    // The new dashboard is patient-centric, so we hardcode the role here
    const role = 'patient'; 

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            <button onClick={onBackToDashboard} className="font-semibold text-blue-600 hover:text-blue-700">
                &larr; Back to Dashboard
            </button>

            <div className="bg-white p-6 rounded-lg shadow-xl">
                <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Analyzed dental scan" 
                    className="rounded-lg shadow-lg border mx-auto max-w-lg w-full"
                />
            </div>
            
            <ReportDisplay result={analysis} role={role} />

            {role === 'patient' && (
                <DentistFinder issues={analysis.issues.map(i => i.name)} />
            )}

            <ImageEditor imageFile={imageFile} />
        </div>
    );
};
