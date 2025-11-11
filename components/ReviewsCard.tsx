import React from 'react';
import type { PatientAnalysis } from '../types';
import { ClipboardListIcon, CalendarIcon, AlertTriangleIcon } from './IconComponents';

interface ReviewsCardProps {
  reviews: PatientAnalysis[];
  onSelectReview: (review: PatientAnalysis) => void;
  onScheduleAppointment: () => void;
}

export const ReviewsCard: React.FC<ReviewsCardProps> = ({ reviews, onSelectReview, onScheduleAppointment }) => {
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayedReviews = sortedReviews.slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Latest Reviews from Your Doctor</h3>
      </div>
      
      {displayedReviews.length > 0 ? (
        <ul className="space-y-3 flex-1">
          {displayedReviews.map((review, index) => (
            <li key={index} className="p-3 bg-slate-50 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="bg-indigo-100 p-2 rounded-full">
                      <ClipboardListIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Review from {review.fromDoctorName || 'your dentist'}</p>
                    <p className="text-sm text-gray-500">Dated: {review.date}</p>
                  </div>
                </div>
                <button onClick={() => onSelectReview(review)} className="text-sm font-semibold text-blue-600 hover:underline">
                  View Report
                </button>
              </div>
              {review.appointmentRecommended && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-3 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-start">
                        <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold">Your doctor recommends a follow-up appointment.</p>
                    </div>
                    <button 
                        onClick={onScheduleAppointment}
                        className="flex-shrink-0 flex items-center gap-2 bg-amber-500 text-white font-bold px-3 py-1.5 rounded-md text-sm hover:bg-amber-600"
                    >
                        <CalendarIcon className="h-4 w-4" />
                        Schedule Now
                    </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-slate-50 rounded-lg p-4">
            <ClipboardListIcon className="h-10 w-10 mb-2 text-gray-400" />
            <p className="font-semibold">No reviews received yet</p>
            <p className="text-sm">Completed analyses from your doctor will appear here.</p>
        </div>
      )}
    </div>
  );
};