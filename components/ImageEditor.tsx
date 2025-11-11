import React, { useState } from 'react';
import { editDentalImage } from '../services/geminiService';
import { Spinner } from './Spinner';
import { MagicWandIcon, AlertTriangleIcon } from './IconComponents';

interface ImageEditorProps {
  imageFile: File;
}

const EXAMPLE_PROMPTS = [
  'Whiten teeth',
  'Sharpen focus on molars',
  'Highlight the gum line',
  'Reduce glare from lighting',
  'Improve overall brightness',
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile }) => {
  const [prompt, setPrompt] = useState('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) {
      setError('Please enter an editing instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
          const editedBase64 = await editDentalImage(base64String, prompt);
          setEditedImageUrl(`data:image/jpeg;base64,${editedBase64}`);
        } else {
          setError('Could not process the original image.');
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read the image file for editing.');
        setIsLoading(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during editing.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
        <MagicWandIcon className="h-7 w-7 mr-2" />
        Edit Image with AI
      </h2>
      <p className="text-slate-600 mb-4">
        Describe the change you want to make. For example, "make the teeth whiter" or "add a retro filter".
      </p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Remove the slight discoloration on the front tooth"
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          rows={3}
          disabled={isLoading}
        />

        <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">Or try an example:</p>
            <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example) => (
                    <button
                        key={example}
                        onClick={() => setPrompt(example)}
                        disabled={isLoading}
                        className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {example}
                    </button>
                ))}
            </div>
        </div>

        <button
          onClick={handleEdit}
          disabled={isLoading || !prompt.trim()}
          className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isLoading ? 'Generating...' : 'Apply Edit'}
        </button>
      </div>

      {isLoading && <div className="mt-6 flex justify-center"><Spinner /></div>}
      
      {error && (
        <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-start">
          <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold">Edit Failed</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {editedImageUrl && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">Edited Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
                <h4 className="text-center font-medium text-slate-600 mb-2">Original</h4>
                <img src={URL.createObjectURL(imageFile)} alt="Original" className="rounded-lg shadow-md border mx-auto" />
            </div>
            <div>
                <h4 className="text-center font-medium text-slate-600 mb-2">Edited</h4>
                <img src={editedImageUrl} alt="Edited result" className="rounded-lg shadow-md border mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
