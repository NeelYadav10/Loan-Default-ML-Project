import React, { useState, useEffect } from 'react';
import { getHealth, API_BASE_URL } from '../lib/api';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export default function ApiStatusPill() {
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    setIsWakingUp(false);
    const timer = setTimeout(() => {
      setIsWakingUp(true);
    }, 5000);

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
      clearTimeout(timer);
      setIsWakingUp(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => !online && setShowModal(!showModal)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          online
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
            : isWakingUp
            ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm animate-pulse cursor-pointer'
            : 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm animate-pulse cursor-pointer'
        }`}
        title={
          online
            ? `FastAPI Backend connected at ${API_BASE_URL}`
            : isWakingUp
            ? 'Backend is waking up on Render (free tier cold start, up to 1 min)...'
            : 'Backend offline. Click for details'
        }
      >
        <span
          className={`w-2 h-2 rounded-full ${
            online ? 'bg-emerald-500' : isWakingUp ? 'bg-amber-500' : 'bg-rose-600'
          }`}
        ></span>
        <span className="hidden sm:inline font-mono">
          {online ? 'API Connected' : isWakingUp ? 'Waking Server...' : 'API Offline'}
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
            Backend Connection Notice
          </div>
          <p className="text-ink-muted leading-relaxed">
            Target URL: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-ink">{API_BASE_URL}</code>
          </p>
          <p className="text-ink-muted leading-relaxed">
            {isWakingUp
              ? 'Render free-tier is currently spinning up from inactivity. This usually takes 30-50 seconds.'
              : 'Unable to reach backend. Ensure your backend service is online or local server is running.'}
          </p>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Connecting...' : 'Retry Connection'}
          </button>
        </div>
      )}
    </div>
  );
}
