
import React, { useState, useEffect } from 'react';
import { extractFinancials } from './services/geminiService';
import { ExtractionResult, StatementType, ReportingBasis } from './types';
import FinancialTable from './components/FinancialTable';

// Removed conflicting local declaration of aistudio as it is provided by the platform environment.

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatementType>(StatementType.PL);
  const [reportingBasis, setReportingBasis] = useState<ReportingBasis>(ReportingBasis.CONSOLIDATED);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // Check if key is in env OR if platform has a key selected
    const envKey = process.env.API_KEY;
    if (!envKey || envKey === 'undefined') {
      // Use type assertion to access the platform-provided aistudio object
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
        const platformHasKey = await aiStudio.hasSelectedApiKey();
        setHasKey(platformHasKey);
      } else {
        setHasKey(false);
      }
    } else {
      setHasKey(true);
    }
  };

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
      await aiStudio.openSelectKey();
      // Assume success as per platform guidelines to avoid potential race conditions
      setHasKey(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      
      const base64Data = await fileDataPromise;
      const data = await extractFinancials(base64Data, file.type, reportingBasis);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // If the error indicates a missing entity, reset key state
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API Key verification failed. Please re-select your key.");
      } else {
        setError(err.message || "Failed to analyze the document. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderActiveStatement = () => {
    if (!result) return null;
    return <FinancialTable data={result[activeTab]} />;
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-200 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <i className="fas fa-key text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">API Key Required</h2>
          <p className="text-slate-600 mb-8">
            To use FinAnalyzer AI, you need to select a Gemini API key. Please use a key from a paid GCP project.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
            >
              <i className="fas fa-external-link-alt mr-2"></i> Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-slate-400 hover:text-indigo-600 transition-colors"
            >
              Learn more about billing & quotas
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">FinAnalyzer AI</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Powered by Gemini 3</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Intro Section */}
        {!result && !loading && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Turn complex reports into clear data
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Upload an annual report or financial statement and our AI will extract professional tables instantly.
            </p>
          </div>
        )}

        {/* Configuration & Upload Area */}
        {!result && (
          <div className={`max-w-xl mx-auto space-y-6 transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Statement Basis Selector */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex space-x-1">
              <button
                onClick={() => setReportingBasis(ReportingBasis.CONSOLIDATED)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                  reportingBasis === ReportingBasis.CONSOLIDATED ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Consolidated
              </button>
              <button
                onClick={() => setReportingBasis(ReportingBasis.STANDALONE)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                  reportingBasis === ReportingBasis.STANDALONE ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Standalone
              </button>
            </div>

            <div className="glass-panel p-8 rounded-2xl shadow-xl border-dashed border-2 border-slate-300">
              <div className="flex flex-col items-center">
                <i className="fas fa-file-invoice-dollar text-5xl text-indigo-200 mb-4"></i>
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-indigo-600 rounded-lg shadow-sm border border-indigo-200 cursor-pointer hover:bg-indigo-50 transition-all">
                  <span className="text-base font-semibold truncate max-w-xs">
                    {file ? file.name : "Select financial report"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG</span>
                  <input type='file' className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                </label>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center w-full">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </div>
                )}

                <button
                  onClick={processFile}
                  disabled={!file || loading}
                  className={`mt-6 w-full py-3 px-6 rounded-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all ${
                    !file || loading ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing {reportingBasis} Data...
                    </span>
                  ) : (
                    `Extract ${reportingBasis} Financials`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-3xl font-bold text-slate-900">{result.companyName}</h2>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wider">
                    {reportingBasis}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">{result.reportingPeriod}</p>
              </div>
              <button 
                onClick={() => {setResult(null); setFile(null);}}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <i className="fas fa-redo-alt mr-2"></i> New Analysis
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex space-x-1">
              <button
                onClick={() => setActiveTab(StatementType.PL)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === StatementType.PL ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Profit & Loss
              </button>
              <button
                onClick={() => setActiveTab(StatementType.BS)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === StatementType.BS ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Balance Sheet
              </button>
              <button
                onClick={() => setActiveTab(StatementType.CF)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === StatementType.CF ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Cash Flow
              </button>
            </div>

            {/* Active Table */}
            <div className="relative">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <i className={`fas ${
                    activeTab === StatementType.PL ? 'fa-file-invoice' : 
                    activeTab === StatementType.BS ? 'fa-balance-scale' : 'fa-hand-holding-usd'
                  } mr-2 text-indigo-500`}></i>
                  {result[activeTab].title}
                </h3>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold uppercase">
                  {reportingBasis} Format
                </span>
              </div>
              {renderActiveStatement()}
            </div>

            {/* Export Actions */}
            <div className="flex justify-end space-x-4 sticky bottom-4">
              <button 
                onClick={() => window.print()}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold flex items-center"
              >
                <i className="fas fa-print mr-2"></i> Print Report
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${result.companyName.replace(/\s+/g, '_')}_${reportingBasis.toLowerCase()}.json`;
                  a.click();
                }}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold flex items-center"
              >
                <i className="fas fa-download mr-2"></i> Export JSON
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} FinAnalyzer AI. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Financial data extracted with AI assistance. Always verify with official reports.
          </p>
        </div>
      </footer>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">Crunching {reportingBasis} Data</h3>
            <p className="text-slate-500">Gemini is mapping accounts and identifying reporting structures...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
