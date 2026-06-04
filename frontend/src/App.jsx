import React from 'react';
import FileUploader from './components/FileUploader';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Structural Header Banner */}
      <header className="w-full max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <span className="text-white font-black text-sm font-mono">VD</span>
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900">
            Vault<span className="text-indigo-600">Drop</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Zero-Trust Active</span>
        </div>
      </header>

      {/* Main Focus Component Container Block */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <FileUploader />
      </main>

      {/* Footer System Status Banner */}
      <footer className="w-full text-center py-6 text-[11px] text-slate-400 font-medium">
        VaultDrop Architecture &bull; Local Development Matrix
      </footer>
    </div>
  );
}