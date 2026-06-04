import React, { useState } from 'react';
import { fileService } from '../services/api';
import { toast } from 'react-hot-toast';
import { Upload, Lock, Clock, CheckCircle, Loader2, Copy } from 'lucide-react';

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('15'); // default 15 minutes
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: '', message: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !password) {
      toast.error('Please select a file and enter an access password.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Securing vault and provisioning links...');

    try {
      const backendResponse = await fileService.requestUploadUrl({
        originalName: file.name,
        password: password,
        expiresInMinutes: parseInt(expiresIn, 10),
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Failed to initialize pipeline.');
      }

      const { uploadUrl, fileId } = backendResponse.data;

      toast.loading('Streaming payload directly to encrypted S3 vault...', { id: toastId });
      await fileService.uploadDirectToS3(uploadUrl, file);

      const derivedLink = `${window.location.origin}/download/${fileId}`;
      setShareLink(derivedLink);
      
      toast.success('Vault dropped successfully!', { id: toastId });
      
      setFile(null);
      setPassword('');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Upload failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Secure download link copied to clipboard!');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5 text-indigo-600" />
        Drop Secure File
      </h2>

      {!shareLink ? (
        <form onSubmit={handleUpload} className="space-y-5">
          {/* File input area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              {file ? file.name : 'Click or drag file to start upload'}
            </p>
            {file && (
              <span className="text-xs text-slate-400 block mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>

          {/* Password selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter cryptographic passphrase"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Time retention parameters */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" /> Lifespan Retention
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="15">15 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="1440">24 Hours</option>
            </select>
          </div>

          {/* Fire upload pipeline execution CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Encrypting Payload...' : 'Generate Encrypted Drop Link'}
          </button>
        </form>
      ) : (
        /* Render Shared Asset Download Key Card Container */
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-800">Secure Vault Dropped</h3>
            <p className="text-xs text-emerald-600 mt-1">Share this link. It burns instantly post-download.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="bg-transparent text-xs text-slate-600 outline-none flex-1 select-all font-mono"
            />
            <button
              onClick={copyToClipboard}
              className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-500 hover:text-indigo-600 shadow-sm transition-colors"
              title="Copy link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
                setShareLink('');
                setStatus({ type: '', message: '' });
            }}
            className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-medium text-xs rounded-lg transition-colors"
            >
            Drop Another File
        </button>
        </div>
      )}
    </div>
  );
}