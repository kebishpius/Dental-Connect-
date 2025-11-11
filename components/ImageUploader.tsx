import React, { useState, useCallback } from 'react';
import { DentalIcon } from './IconComponents';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEvent = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload, handleDragEvent]);

  const dragClass = isDragging 
    ? 'border-teal-500 bg-teal-50 scale-105 shadow-2xl' 
    : 'border-gray-300 bg-white';

  return (
    <div
      onDragEnter={(e) => handleDragEvent(e, true)}
      onDragLeave={(e) => handleDragEvent(e, false)}
      onDragOver={(e) => handleDragEvent(e, true)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out ${dragClass} h-full flex flex-col justify-center`}
    >
      {isDragging ? (
          <div className="flex flex-col items-center text-teal-600 pointer-events-none">
            <DentalIcon className="h-12 w-12 animate-pulse" />
            <p className="font-bold text-xl mt-4">Drop image to upload!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 pointer-events-none">
            <div className="bg-teal-500 p-3 rounded-full mb-4">
                <DentalIcon className="h-8 w-8 text-white" />
            </div>
            <p className="font-semibold text-lg text-gray-700">Upload Dental Scan</p>
            <p className="text-sm mt-1">
                <span className="font-semibold">Drag & drop</span> a file here or{' '}
                <label htmlFor="file-upload" className="cursor-pointer font-medium text-teal-600 hover:text-teal-500 underline">
                  browse
                </label>
              </p>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />
          </div>
        )
      }
    </div>
  );
};