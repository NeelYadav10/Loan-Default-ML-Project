import React, { useState, useEffect } from 'react';
import { getHealth, API_BASE_URL } from '../lib/api';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export default function ApiStatusPill() {
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await getHealth();
      if (data && data.status === 'ok') {
        setOnline(true);
      } else {
        setOnline(false);
      }
    } catch (err) {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => !online && setShowModal(!showModal)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          online
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
            : 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm animate-pulse cursor-pointer'
        }`}
        title={online ? 'FastAPI Backend connected on port 8001' : 'Backend offline. Click for details'}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            online ? 'bg-emerald-500' : 'bg-rose-600'
          }`}
        ></span>
        <span className="hidden sm:inline font-mono">
          {online ? 'API Connected' : 'API Offline'}
        </span>
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin opacity-60" />
        ) : online ? (
          <Wifi className="w-3.5 h-3.5" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-rose-600" />
        )}
      </button>

      {/* Offline Details Dropdown Modal */}
      {!online && showModal && (
        <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-4 shadow-xl border border-rose-200 z-50 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertCircle className="w-4 h-4" />
            Backend Connection Failed
          </div>
          <p className="text-ink-muted leading-relaxed">
            Target URL: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-ink">{API_BASE_URL}</code>
          </p>
          <p className="text-ink-muted leading-relaxed">
            Ensure FastAPI backend is running via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">run_backend.bat</code> on port 8001.
          </p>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
}
