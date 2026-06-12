'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Station {
  id: string;
  code: string;
  iotCard: string;
  latitude: number;
  longitude: number;
}

export default function EditStationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [station, setStation] = useState<Station | null>(null);
  const [iotCard, setIotCard] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/air/api/stations')
      .then(r => r.json())
      .then((stations: Station[]) => {
        const s = stations.find(s => s.id === id);
        if (!s) return;
        setStation(s);
        setIotCard(s.iotCard ?? '');
        setLatitude(String(s.latitude));
        setLongitude(String(s.longitude));
      });
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState('saving');
    setErrorMsg(null);

    const res = await fetch(`/air/api/stations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        iotCard,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }),
    });

    if (res.ok) {
      setSaveState('saved');
      setTimeout(() => router.push('/stations'), 1000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? 'Failed to save');
      setSaveState('error');
    }
  }

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#202124]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-xl mx-auto space-y-5">

      {/* Header */}
      <header className="flex items-center gap-3 bg-card px-6 py-4 rounded-3xl border border-border">
        <Link
          href="/stations"
          className="p-2 rounded-2xl hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#5f6368]" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">Edit Station</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] font-mono">{station.code}</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-card px-6 py-6 rounded-3xl border border-border space-y-5">

        {/* Serial Number (read-only) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide">
            Serial Number
          </label>
          <div className="w-full px-4 py-3 rounded-2xl border border-border bg-[#f1f3f4] dark:bg-[#303134]/60 text-sm text-[#5f6368] dark:text-[#9aa0a6] font-mono select-all">
            {station.code}
          </div>
        </div>

        {/* IoT Card */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide">
            IoT Card Number
          </label>
          <input
            type="text"
            value={iotCard}
            onChange={e => setIotCard(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] font-mono focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
            placeholder="e.g. 8966032540696312462F"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide">
              Latitude
            </label>
            <input
              type="number"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              step="any"
              required
              className="w-full px-4 py-3 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              placeholder="13.7563"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide">
              Longitude
            </label>
            <input
              type="number"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              step="any"
              required
              className="w-full px-4 py-3 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              placeholder="100.5018"
            />
          </div>
        </div>

        {/* Error */}
        {saveState === 'error' && errorMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#fce8e6] text-[#c5221f] text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saveState === 'saving' || saveState === 'saved'}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#1a73e8] hover:bg-[#1765cc] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saveState === 'saving' && <RefreshCw className="h-4 w-4 animate-spin" />}
          {saveState === 'saved'  && <CheckCircle2 className="h-4 w-4" />}
          {saveState === 'error'  && <Save className="h-4 w-4" />}
          {saveState === 'idle'   && <Save className="h-4 w-4" />}
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>

      </form>
    </div>
  );
}
