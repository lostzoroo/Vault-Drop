import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fileService } from '../services/api';
import { Download, Lock, AlertCircle, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function FileDownloader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!password) {
      setStatus({ type: 'error', message: 'Passphrase is required to decrypt.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Verifying cryptographic hash...' });

    try {
      // 1. Send password to backend to verify and burn the record
      const response = await fileService.verifyAndPasswordDownload(id, password);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      const { downloadUrl, originalName } = response.data;

      setStatus({ type: 'info', message: 'Access granted. Executing secure cloud pull...' });

      // 2. Trigger the direct-to-S3 download in the browser
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setDownloaded(true);
      setStatus({ type: 'success', message: 'Asset downloaded. The vault link has been permanently burned.' });
    } catch (error) {
      console.error(error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Decryption failed or link expired.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-600" />
          Extract File
        </h2>
        <button 
          onClick={() => navigate('/')}
          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Drop New
        </button>
      </div>

      {!downloaded ? (
        <form onSubmit={handleDownload} className="space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Encrypted Payload Detected</p>
            <p className="text-xs text-slate-500 mt-1">Enter the access password to retrieve and burn this file.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Decryption Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {status.message && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
              status.type === 'error' ? 'bg-rose-50 text-rose-600' :
              status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {status.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : 
               <Loader2 className="w-4 h-4 shrink-0 animate-spin mt-0.5" />}
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Decrypting...' : 'Verify & Download'}
          </button>
        </form>
      ) : (
        <div className="text-center py-6 space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Transfer Complete</h3>
          <p className="text-sm text-slate-500">The file has been saved to your device. The server record has been permanently destroyed.</p>
        </div>
      )}
    </div>
  );
}