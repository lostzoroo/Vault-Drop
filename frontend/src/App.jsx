import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileUploader from './components/FileUploader';
import FileDownloader from './components/FileDownloader';
import { ShieldAlert, PowerOff, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [checking, setChecking] = useState(true);

  const checkBackendHealth = async () => {
    setChecking(true);
    try {
      // Direct ping to your health endpoint or base URL configuration
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      // We perform a quick head/get request to see if the server responds
      await axios.get(`${baseUrl}/files/health`, { timeout: 3000 });
      setIsBackendOnline(true);
    } catch (error) {
      // If Ngrok is off or connection is refused, it triggers this block
      setIsBackendOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Structural Header Banner */}
        <header className="w-full max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <span className="text-white font-black text-sm font-mono">VD</span>
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Vault<span className="text-indigo-600">Drop</span>
            </span>
          </a>
          
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            checking ? 'bg-slate-100 border-slate-200 text-slate-500' :
            isBackendOnline ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {checking ? 'Checking Pipeline...' : isBackendOnline ? 'Zero-Trust Active' : 'System Offline'}
            </span>
          </div>
        </header>

        {/* Main Content Area with Fallback Interceptor */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          {checking ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" /> Calibrating secure tunnel...
            </div>
          ) : !isBackendOnline ? (
            /* Minimalist Offline Screen */
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mx-auto text-rose-500">
                <PowerOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Vault is Securely Locked</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                  The local backend relay is currently offline. Drops and decryptions are suspended.
                </p>
              </div>
              <button
                onClick={checkBackendHealth}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            </div>
          ) : (
            /* Standard Application Routing Matrix */
            <Routes>
              <Route path="/" element={<FileUploader />} />
              <Route path="/download/:id" element={<FileDownloader />} />
            </Routes>
          )}
        </main>

        {/* Footer System Status Banner */}
        <footer className="w-full text-center py-6 text-[11px] text-slate-400 font-medium">
          VaultDrop Architecture &bull; Local Development Matrix
        </footer>
      </div>
    </BrowserRouter>
  );
}