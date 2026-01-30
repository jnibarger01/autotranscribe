import React from 'react';
import { AppState } from '../types';
import { UploadCloud, FileSearch, Languages, FileOutput, CheckCircle } from 'lucide-react';

interface ProcessingStatusProps {
  state: AppState;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state }) => {
  const steps = [
    { id: AppState.UPLOADING, label: 'Ingestion', icon: UploadCloud },
    { id: AppState.EXTRACTING, label: 'OCR Extraction', icon: FileSearch },
    { id: AppState.TRANSLATING, label: 'Gemini Translation', icon: Languages },
    { id: AppState.RECONSTRUCTING, label: 'Reconstruction', icon: FileOutput },
  ];

  const getCurrentStepIndex = () => {
    if (state === AppState.COMPLETE) return 4;
    return steps.findIndex(s => s.id === state);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative flex items-center justify-between">
        {/* Connector Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
        <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive ? 'border-blue-600 bg-white text-blue-600' :
                  isCompleted ? 'border-blue-600 bg-blue-600 text-white' :
                  'border-slate-300 bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {state !== AppState.COMPLETE && state !== AppState.IDLE && (
         <div className="text-center mt-6">
            <p className="text-sm text-slate-500 animate-pulse">Processing... please wait.</p>
         </div>
      )}
    </div>
  );
};

export default ProcessingStatus;