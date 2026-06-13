'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Send, Users, BellRing, RefreshCw, CheckCircle2,
  AlertCircle, Trash2, MessageCircle, SlidersHorizontal, Save, Bug,
} from 'lucide-react';

interface Subscriber {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  createdAt: string;
}

interface Station {
  id: string;
  code: string;
  latestReading: { pm25: number; pm10: number; tsp: number; windSpeed: number; windDirection: number; temperature: number } | null;
}

interface AlertConfig {
  alertEnabled: boolean;
  pm25Threshold: number;
  pm10Threshold: number;
  tspThreshold: number;
  cooldownMinutes: number;
}

interface LineQuota {
  type: string;
  value: number | null;
  totalUsage: number;
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function AdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stations, setStations]       = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [broadcastState, setBroadcastState]   = useState<SendState>('idle');
  const [sendResult, setSendResult]           = useState<string | null>(null);

  const [quota, setQuota]     = useState<LineQuota | null>(null);
  const [quotaErr, setQuotaErr] = useState<string | null>(null);

  const [config, setConfig]       = useState<AlertConfig | null>(null);
  const [configForm, setConfigForm] = useState<AlertConfig | null>(null);
  const [saveState, setSaveState]   = useState<SaveState>('idle');

  useEffect(() => {
    fetch('/air/api/admin/subscribers').then(r => r.json()).then(setSubscribers).catch(() => {});
    fetch('/air/api/stations').then(r => r.json()).then((data: Station[]) => {
      setStations(data);
      if (data.length > 0) setSelectedStation(data[0].id);
    }).catch(() => {});
    fetch('/air/api/admin/line-quota').then(r => r.json()).then(d => {
      if (d.error) setQuotaErr(d.error);
      else setQuota(d);
    }).catch(() => setQuotaErr('Failed to load'));
    fetch('/air/api/admin/config').then(r => r.json()).then((d: AlertConfig) => {
      setConfig(d);
      setConfigForm(d);
    }).catch(() => {});
  }, []);

  async function sendTestAlert() {
    const station = stations.find(s => s.id === selectedStation);
    if (!station?.latestReading) return;
    setBroadcastState('sending');
    setSendResult(null);
    const res = await fetch('/air/api/alert/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stationId: station.id,
        stationName: station.code,
        stationCode: station.code,
        pm25: station.latestReading.pm25,
        pm10: station.latestReading.pm10,
        tsp: station.latestReading.tsp,
        windSpeed: station.latestReading.windSpeed,
        windDirection: station.latestReading.windDirection,
        temperature: station.latestReading.temperature,
      }),
    });
    const data = await res.json();
    setBroadcastState(res.ok ? 'sent' : 'error');
    setSendResult(JSON.stringify(data, null, 2));
    setTimeout(() => setBroadcastState('idle'), 3000);
  }

  async function removeSubscriber(lineUserId: string) {
    await fetch(`/air/api/subscribe?userId=${lineUserId}`, { method: 'DELETE' });
    setSubscribers(prev => prev.filter(s => s.lineUserId !== lineUserId));
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!configForm) return;
    setSaveState('saving');
    const res = await fetch('/air/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configForm),
    });
    if (res.ok) {
      const updated: AlertConfig = await res.json();
      setConfig(updated);
      setConfigForm(updated);
      setSaveState('saved');
    } else {
      setSaveState('error');
    }
    setTimeout(() => setSaveState('idle'), 3000);
  }

  const usedPct = quota?.value ? Math.round((quota.totalUsage / quota.value) * 100) : null;

  return (
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
        </div>
        <Link
          href="/debug"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fce8e6] text-[#c5221f] text-xs font-medium hover:bg-[#f5c6c6] transition-colors"
        >
          <Bug className="h-3.5 w-3.5" />
          API Debug
        </Link>
      </header>

      {/* LINE Quota */}
      <div className="bg-card px-6 py-5 rounded-3xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#e6f4ea] text-[#34a853] rounded-2xl">
            <MessageCircle className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">LINE Messaging Quota</h2>
        </div>
        {quotaErr ? (
          <div className="flex items-center gap-2 text-sm text-[#c5221f]">
            <AlertCircle className="h-4 w-4" /> {quotaErr}
          </div>
        ) : !quota ? (
          <div className="flex items-center gap-2 text-sm text-[#5f6368]">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#202124] dark:text-[#e8eaed]">
                  {quota.totalUsage.toLocaleString()}
                  {quota.value && (
                    <span className="text-sm font-normal text-[#5f6368] ml-1">/ {quota.value.toLocaleString()}</span>
                  )}
                </p>
                <p className="text-xs text-[#5f6368] mt-0.5">messages sent this month</p>
              </div>
              {usedPct !== null && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  usedPct >= 90 ? 'bg-[#fce8e6] text-[#c5221f]' :
                  usedPct >= 70 ? 'bg-[#fef3c7] text-[#b45309]' :
                  'bg-[#e6f4ea] text-[#137333]'
                }`}>{usedPct}% used</span>
              )}
            </div>
            {quota.value && (
              <div className="w-full h-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(usedPct ?? 0, 100)}%`,
                    background: (usedPct ?? 0) >= 90 ? '#ea4335' : (usedPct ?? 0) >= 70 ? '#fbbc04' : '#34a853',
                  }}
                />
              </div>
            )}
            <p className="text-xs text-[#5f6368]">Plan: {quota.type}</p>
          </div>
        )}
      </div>

      {/* Alert Rules */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#1a73e8]" />
          <h2 className="font-semibold text-sm text-[#202124] dark:text-[#e8eaed]">Alert Rules</h2>
        </div>

        {!configForm ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-[#1a73e8]" />
          </div>
        ) : (
          <form onSubmit={saveConfig} className="px-6 py-5 space-y-5">

            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Send LINE alerts</p>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">Notify all subscribers when thresholds are exceeded</p>
              </div>
              <button
                type="button"
                onClick={() => setConfigForm(f => f ? { ...f, alertEnabled: !f.alertEnabled } : f)}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                  configForm.alertEnabled ? 'bg-[#1a73e8]' : 'bg-[#dadce0] dark:bg-[#5f6368]'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  configForm.alertEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'pm25Threshold' as const, label: 'PM2.5', unit: 'µg/m³', color: '#1a73e8' },
                { key: 'pm10Threshold' as const, label: 'PM10',  unit: 'µg/m³', color: '#34a853' },
                { key: 'tspThreshold'  as const, label: 'TSP',   unit: 'µg/m³', color: '#fbbc04' },
              ].map(({ key, label, unit, color }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide">
                    {label} <span className="text-[#9aa0a6] normal-case font-normal">{unit}</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={configForm[key]}
                    onChange={e => setConfigForm(f => f ? { ...f, [key]: parseFloat(e.target.value) } : f)}
                    disabled={!configForm.alertEnabled}
                    className="w-full px-3 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm font-semibold focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-40 transition-colors"
                    style={{ color }}
                  />
                  <p className="text-[10px] text-[#9aa0a6]">Alert when &gt; this value</p>
                </div>
              ))}
            </div>

            {/* Cooldown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wide">
                Cooldown <span className="text-[#9aa0a6] normal-case font-normal">minutes</span>
              </label>
              <input
                type="number"
                min={1}
                max={1440}
                step={1}
                value={configForm.cooldownMinutes}
                onChange={e => setConfigForm(f => f ? { ...f, cooldownMinutes: parseInt(e.target.value, 10) } : f)}
                disabled={!configForm.alertEnabled}
                className="w-full px-3 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:opacity-40 transition-colors"
              />
              <p className="text-[10px] text-[#9aa0a6]">Minimum time between repeat alerts for the same station</p>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saveState === 'saving' || saveState === 'saved'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {saveState === 'saving' && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {saveState === 'saved'  && <CheckCircle2 className="h-3.5 w-3.5" />}
                {saveState === 'error'  && <AlertCircle className="h-3.5 w-3.5" />}
                {saveState === 'idle'   && <Save className="h-3.5 w-3.5" />}
                {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : saveState === 'error' ? 'Failed' : 'Save Rules'}
              </button>
              {config && (
                <button
                  type="button"
                  onClick={() => setConfigForm(config)}
                  className="text-xs text-[#5f6368] hover:text-[#202124] transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        )}
      </div>

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
            className="w-full px-3 py-2.5 rounded-2xl border border-border bg-[#f8f9fa] dark:bg-[#303134] text-sm text-[#202124] dark:text-[#e8eaed] font-mono focus:outline-none focus:border-[#1a73e8]"
          >
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.code}</option>
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

      {/* Response */}
      {sendResult && (
        <div className="bg-card rounded-3xl border border-border px-6 py-4">
          <p className="text-xs font-semibold text-[#5f6368] mb-2">Response</p>
          <pre className="text-xs text-[#202124] dark:text-[#e8eaed] font-mono whitespace-pre-wrap break-all">{sendResult}</pre>
        </div>
      )}

    </div>
  );
}
