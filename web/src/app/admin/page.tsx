'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Users, BellRing, RefreshCw, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useLiff } from '@/lib/liffContext';
import LiffGuard from '@/components/LiffGuard';

interface Subscriber {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  createdAt: string;
}

interface Station {
  id: string;
  name: string;
  code: string;
  latestReading: { pm25: number; pm10: number; tsp: number } | null;
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function AdminPage() {
  const { profile } = useLiff();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [customMsg, setCustomMsg] = useState('');
  const [broadcastState, setBroadcastState] = useState<SendState>('idle');
  const [customState, setCustomState] = useState<SendState>('idle');
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/air/api/admin/subscribers').then(r => r.json()).then(setSubscribers).catch(() => {});
    fetch('/air/api/stations').then(r => r.json()).then((data: Station[]) => {
      setStations(data);
      if (data.length > 0) setSelectedStation(data[0].id);
    }).catch(() => {});
  }, []);

  async function sendTestAlert() {
    const station = stations.find(s => s.id === selectedStation);
    if (!station?.latestReading) return;
    setBroadcastState('sending');
    setResult(null);
    const res = await fetch('/air/api/alert/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stationId: station.id,
        stationName: station.name,
        stationCode: station.code,
        pm25: station.latestReading.pm25,
        pm10: station.latestReading.pm10,
        tsp: station.latestReading.tsp,
      }),
    });
    const data = await res.json();
    setBroadcastState(res.ok ? 'sent' : 'error');
    setResult(JSON.stringify(data, null, 2));
    setTimeout(() => setBroadcastState('idle'), 3000);
  }

  async function sendCustomMessage() {
    if (!customMsg.trim()) return;
    setCustomState('sending');
    setResult(null);
    const res = await fetch('/air/api/admin/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: customMsg }),
    });
    const data = await res.json();
    setCustomState(res.ok ? 'sent' : 'error');
    setResult(JSON.stringify(data, null, 2));
    setTimeout(() => setCustomState('idle'), 3000);
  }

  async function removeSubscriber(lineUserId: string) {
    await fetch(`/air/api/subscribe?userId=${lineUserId}`, { method: 'DELETE' });
    setSubscribers(prev => prev.filter(s => s.lineUserId !== lineUserId));
  }

  return (
    <LiffGuard>
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between bg-card px-6 py-4 rounded-3xl border border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] text-xs font-medium hover:bg-[#e8eaed] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#e8f0fe] text-[#1a73e8] rounded-2xl">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">Admin</h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">LINE messaging control</p>
          </div>
          {profile && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#f1f3f4] dark:bg-[#303134] ml-2">
              {profile.pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.pictureUrl} alt={profile.displayName} className="h-8 w-8 rounded-full ring-2 ring-[#06C755]/40" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#06C755] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#06C755]/40">
                  {profile.displayName[0]}
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">สวัสดี</span>
                <span className="text-xs font-semibold text-[#202124] dark:text-[#e8eaed] max-w-[120px] truncate">{profile.displayName}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Subscribers */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1a73e8]" />
            <h2 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Subscribers</h2>
          </div>
          <span className="text-xs text-[#5f6368] bg-[#f1f3f4] px-2 py-0.5 rounded-full">{subscribers.length} total</span>
        </div>
        <div className="divide-y divide-border max-h-64 overflow-y-auto">
          {subscribers.length === 0 ? (
            <p className="px-6 py-4 text-sm text-[#5f6368]">No subscribers yet.</p>
          ) : subscribers.map(s => (
            <div key={s.id} className="px-6 py-3 flex items-center gap-3">
              {s.pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.pictureUrl} alt={s.displayName ?? ''} className="h-8 w-8 rounded-full shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#06C755] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(s.displayName ?? '?')[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] truncate">{s.displayName ?? '—'}</p>
                <p className="text-xs text-[#5f6368] font-mono truncate">{s.lineUserId}</p>
              </div>
              <button
                onClick={() => removeSubscriber(s.lineUserId)}
                className="p-1.5 rounded-xl text-[#5f6368] hover:text-[#ea4335] hover:bg-[#fce8e6] transition-colors cursor-pointer"
                title="Remove subscriber"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Send Alert Test */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <BellRing className="h-4 w-4 text-[#1a73e8]" />
          <h2 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Send Alert (Test)</h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            Sends a Flex Message alert to all subscribers using current readings from the selected station.
            Bypasses threshold and cooldown checks.
          </p>
          <select
            value={selectedStation}
            onChange={e => setSelectedStation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] focus:outline-none focus:border-[#1a73e8]"
          >
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
          <button
            onClick={sendTestAlert}
            disabled={broadcastState !== 'idle' || !selectedStation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {broadcastState === 'sending' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {broadcastState === 'sent'    && <CheckCircle2 className="h-4 w-4" />}
            {broadcastState === 'error'   && <AlertCircle className="h-4 w-4" />}
            {broadcastState === 'idle'    && <BellRing className="h-4 w-4" />}
            {broadcastState === 'sending' ? 'Sending…' : broadcastState === 'sent' ? 'Sent!' : broadcastState === 'error' ? 'Failed' : 'Send Alert'}
          </button>
        </div>
      </div>

      {/* Send Custom Message */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Send className="h-4 w-4 text-[#1a73e8]" />
          <h2 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Send Custom Message</h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <textarea
            value={customMsg}
            onChange={e => setCustomMsg(e.target.value)}
            placeholder="Type a message to send to all subscribers…"
            rows={3}
            className="w-full px-3 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] placeholder:text-[#9aa0a6] focus:outline-none focus:border-[#1a73e8] resize-none"
          />
          <button
            onClick={sendCustomMessage}
            disabled={customState !== 'idle' || !customMsg.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#06C755] hover:bg-[#05b34c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            {customState === 'sending' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {customState === 'sent'    && <CheckCircle2 className="h-4 w-4" />}
            {customState === 'error'   && <AlertCircle className="h-4 w-4" />}
            {customState === 'idle'    && <Send className="h-4 w-4" />}
            {customState === 'sending' ? 'Sending…' : customState === 'sent' ? 'Sent!' : customState === 'error' ? 'Failed' : 'Send to All Subscribers'}
          </button>
        </div>
      </div>

      {/* Response */}
      {result && (
        <div className="bg-card rounded-3xl border border-border px-6 py-4">
          <p className="text-xs font-semibold text-[#5f6368] mb-2">Response</p>
          <pre className="text-xs text-[#202124] dark:text-[#e8eaed] font-mono whitespace-pre-wrap break-all">{result}</pre>
        </div>
      )}

    </div>
    </LiffGuard>
  );
}
