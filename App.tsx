import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, RefreshCcw } from 'lucide-react';
import ProcessingStatus from './components/ProcessingStatus';
import InvoiceView from './components/InvoiceView';
import CostChart from './components/CostChart';
import { AppState, Invoice } from './types';
import { MOCK_EXTRACTED_INVOICE } from './constants';
import { translateInvoice, extractInvoiceData } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalInvoice, setOriginalInvoice] = useState<Invoice | null>(null);
  const [translatedInvoice, setTranslatedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<'EN' | 'ES'>('EN');

  // Backend pipeline simulation (Extraction -> Translation)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAppState(AppState.UPLOADING);
    
    // 1. Upload
    await new Promise(r => setTimeout(r, 800)); // Simulate network latency
    
    setAppState(AppState.EXTRACTING);
    
    try {
        // 2. Extraction (Gemini Multimodal)
        // If API key is invalid/missing, it falls back to MOCK_EXTRACTED_INVOICE internally
        const extracted = await extractInvoiceData(file);
        setOriginalInvoice(extracted);
        
        setAppState(AppState.TRANSLATING);
        
        // 3. Translation (Gemini)
        const translated = await translateInvoice(extracted);
        setTranslatedInvoice(translated);
        
        setAppState(AppState.RECONSTRUCTING);
        
        // 4. Reconstruction (Visual pause)
        await new Promise(r => setTimeout(r, 800));
        
        setAppState(AppState.COMPLETE);
        setActiveTab('ES'); 
    } catch (err) {
        console.error("Pipeline failed:", err);
        setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setOriginalInvoice(null);
    setTranslatedInvoice(null);
    setActiveTab('EN');
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold font-mono">
              AT
            </div>
            <h1 className="text-lg font-semibold tracking-wide">AutoTranscribe</h1>
          </div>
          <div className="flex items-center gap-4">
             {appState === AppState.COMPLETE && (
                 <button 
                    onClick={handleReset}
                    className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
                 >
                    <RefreshCcw size={16} /> New Invoice
                 </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Intro / Upload Section */}
        {appState === AppState.IDLE && (
          <div className="max-w-xl mx-auto mt-20 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Invoice Translation System</h2>
            <p className="text-slate-600 mb-8">
              Upload an automotive service invoice (PDF/Image) to extract structured data and generate a domain-accurate Spanish translation.
            </p>
            
            <label className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-all hover:border-blue-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-slate-400 mb-4 group-hover:text-blue-500 transition-colors" />
                    <p className="mb-2 text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PDF, PNG, JPG (MAX. 10MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
            </label>
            
            <div className="mt-8 flex gap-4 justify-center text-xs text-slate-400">
                <span className="flex items-center gap-1"><FileText size={14}/> Textract OCR</span>
                <span className="flex items-center gap-1"><FileText size={14}/> Gemini 2.5 Flash</span>
                <span className="flex items-center gap-1"><FileText size={14}/> WeasyPrint Logic</span>
            </div>
          </div>
        )}

        {/* Processing State */}
        {appState !== AppState.IDLE && (
          <div>
            <ProcessingStatus state={appState} />

            {/* Main Content Area (Split View) */}
            {appState === AppState.COMPLETE && originalInvoice && translatedInvoice ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Controls & Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">View Mode</h3>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => setActiveTab('EN')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab === 'EN' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    <span className="w-6 text-center font-mono text-xs opacity-70">EN</span>
                                    Original Invoice
                                </button>
                                <button 
                                    onClick={() => setActiveTab('ES')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab === 'ES' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                >
                                    <span className="w-6 text-center font-mono text-xs opacity-70">ES</span>
                                    Translated Invoice
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <CostChart totals={originalInvoice.totals} />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 uppercase mb-2">Export</h3>
                            <button className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2 rounded-md hover:bg-slate-900 text-sm">
                                <Download size={16} /> Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Right: Invoice Renderer */}
                    <div className="lg:col-span-9">
                        <InvoiceView 
                            invoice={activeTab === 'EN' ? originalInvoice : translatedInvoice} 
                            language={activeTab} 
                        />
                    </div>
                </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;