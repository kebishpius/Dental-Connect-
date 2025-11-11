import React, { useState, useRef } from 'react';
import type { AnalysisResult, DetectedIssue, UserRole } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, LightbulbIcon, ClipboardListIcon, BarChartIcon, Volume2Icon, BookOpenIcon, InfoIcon } from './IconComponents';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { AIEducationModule } from './AIEducationModule';


const ConfidenceBadge: React.FC<{ confidence: string; role: UserRole }> = ({ confidence, role }) => {
    if (role === 'patient') {
        const lowerConfidence = confidence.toLowerCase();
        let colorClass = 'bg-slate-100 text-slate-700';
        let Icon = InfoIcon;

        if (lowerConfidence === 'high') {
            colorClass = 'bg-red-100 text-red-800';
            Icon = AlertTriangleIcon;
        } else if (lowerConfidence === 'medium') {
            colorClass = 'bg-yellow-100 text-yellow-800';
            Icon = InfoIcon;
        } else { // Low
            colorClass = 'bg-green-100 text-green-800';
            Icon = CheckCircleIcon;
        }

        return (
            <span className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${colorClass}`}>
                <Icon className="h-4 w-4" />
                {confidence}
            </span>
        );
    } else {
        const score = parseInt(confidence, 10);
        let colorClass = 'bg-slate-200 text-slate-700';
        let progressBarColor = 'bg-slate-500';

        if (score >= 85) {
            colorClass = 'bg-red-100 text-red-700';
            progressBarColor = 'bg-red-500';
        } else if (score >= 60) {
            colorClass = 'bg-yellow-100 text-yellow-800';
            progressBarColor = 'bg-yellow-500';
        }

        return (
            <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${colorClass}`}>{score}% Conf.</span>
                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
                </div>
            </div>
        );
    }
};

const IssueCard: React.FC<{ issue: DetectedIssue; role: UserRole; onLearnMore: (issueName: string) => void }> = ({ issue, role, onLearnMore }) => {
    const cardBorderColor = role === 'dentist' ? 'border-blue-200 hover:border-blue-400' : 'border-slate-200 hover:border-teal-400';
    return (
        <div className={`bg-white p-5 rounded-lg shadow-md border ${cardBorderColor} transition-all duration-300 ease-in-out`}>
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-bold text-slate-800">{issue.name}</h4>
                <ConfidenceBadge confidence={issue.confidence} role={role} />
            </div>
            <p className="text-slate-600 mb-4">{issue.description}</p>
            {role === 'dentist' && issue.location && (
                <div className="text-sm text-slate-500 mb-4">
                    <strong>Location:</strong> {issue.location}
                </div>
            )}
            {role === 'patient' && (
                <div className="flex flex-col sm:flex-row gap-2">
                    {issue.tip && (
                        <div className="flex-1 bg-green-50 border-l-4 border-green-400 text-green-700 p-3 rounded-md flex items-start">
                            <LightbulbIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-semibold">Care Tip:</strong> {issue.tip}
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={() => onLearnMore(issue.name)}
                        className="flex-shrink-0 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                    >
                        <BookOpenIcon className="h-5 w-5" />
                        <span>Learn More</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export const ReportDisplay: React.FC<{ result: AnalysisResult; role: UserRole }> = ({ result, role }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [learningIssue, setLearningIssue] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    // Role-specific text
    const reportTitle = role === 'patient' ? "Your AI Health Snapshot" : "AI Diagnostic Assistance";
    const summaryTitle = role === 'patient' ? "What Our AI Noticed" : "AI Summary";
    const noIssuesTitle = role === 'patient' ? "Great News!" : "No Anomalies Detected";
    const noIssuesMessage = role === 'patient' 
        ? "Our AI analysis did not find any significant potential issues. Remember to maintain good oral hygiene and visit your dentist regularly."
        : "The AI analysis did not flag any significant anomalies in this scan. Please proceed with your standard professional evaluation.";


    const handleReadAloud = async () => {
        if (isSpeaking) {
             if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if(audioContextRef.current) {
                audioContextRef.current.close();
            }
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        setAudioError(null);

        const textToRead = `
            Analysis Summary: ${result.summary}.
            ${result.issues.length > 0 ? 'Detected potential issues:' : 'No major issues were detected.'}
            ${result.issues.map(issue => `${issue.name}. ${issue.description}. ${role === 'patient' && issue.tip ? `Tip: ${issue.tip}` : ''}`).join('. ')}
            Disclaimer: ${result.disclaimer}
        `;

        try {
            const base64Audio = await generateSpeech(textToRead);
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            
            audioSourceRef.current = audioContextRef.current.createBufferSource();
            audioSourceRef.current.buffer = audioBuffer;
            audioSourceRef.current.connect(audioContextRef.current.destination);
            
            audioSourceRef.current.onended = () => {
                setIsSpeaking(false);
                if(audioContextRef.current){
                  audioContextRef.current.close();
                }
            };

            audioSourceRef.current.start();

        } catch (err) {
            setAudioError(err instanceof Error ? err.message : 'Unknown audio error.');
            setIsSpeaking(false);
        }
    };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-600 flex items-center"><ClipboardListIcon className="h-7 w-7 mr-2" /> {reportTitle}</h2>
            {role === 'patient' && (
                <button
                    onClick={handleReadAloud}
                    disabled={isSpeaking}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Volume2Icon className="h-5 w-5"/>
                    <span>{isSpeaking ? 'Speaking...' : 'Read Aloud'}</span>
                </button>
            )}
        </div>
         {audioError && <p className="text-xs text-red-500 mb-2">{audioError}</p>}
        
        <div className="mb-6 bg-slate-50 p-4 rounded-md border">
            <h3 className="font-semibold text-slate-700 flex items-center mb-2"><BarChartIcon className="h-5 w-5 mr-2" /> {summaryTitle}</h3>
            <p className="text-slate-600">{result.summary}</p>
        </div>

        <div className="space-y-4 mb-6">
            {result.issues.length > 0 ? (
                 result.issues.map((issue, index) => <IssueCard key={index} issue={issue} role={role} onLearnMore={setLearningIssue} />)
            ) : (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm flex items-start">
                  <CheckCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">{noIssuesTitle}</h3>
                    <p>{noIssuesMessage}</p>
                  </div>
                </div>
            )}
        </div>

        {learningIssue && (
            <div className="my-6">
                <AIEducationModule issueName={learningIssue} onClose={() => setLearningIssue(null)} />
            </div>
        )}
        
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md">
            <h4 className="font-bold flex items-center"><AlertTriangleIcon className="h-5 w-5 mr-2" /> Disclaimer</h4>
            <p className="text-sm">{result.disclaimer}</p>
        </div>
    </div>
  );
};