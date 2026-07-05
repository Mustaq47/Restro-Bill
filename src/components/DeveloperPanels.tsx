import React, { useState } from 'react';
import { Database, FileCode, CheckCircle, Code, Copy, Check } from 'lucide-react';
import { apiDocsCode } from '../apiDocs';

interface DeveloperPanelsProps {
  sqlSchema: string;
  kotFormatterSource: string;
}

export const DeveloperPanels: React.FC<DeveloperPanelsProps> = ({ sqlSchema, kotFormatterSource }) => {
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'api' | 'kot'>('schema');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white text-slate-800 rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-900" />
            Backend Schema & API Documentation
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Production-ready structures addressing digital-to-physical gaps.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'schema'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            PostgreSQL DDL
          </button>
          <button
            onClick={() => setActiveSubTab('api')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'api'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Supabase APIs
          </button>
          <button
            onClick={() => setActiveSubTab('kot')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'kot'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            KOT Printer Code
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        {activeSubTab === 'schema' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-900" />
                Relational Design Insights
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-mono mt-0.5">•</span>
                  <span><strong>Cascading Safeguards:</strong> FK rules ensure cascading deletions or standard default nulls upon table modifications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-mono mt-0.5">•</span>
                  <span><strong>Performance Indexing:</strong> Indexes configured on search columns (e.g. status, order_id, categories) to scale seamlessly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-mono mt-0.5">•</span>
                  <span><strong>Postgres Enums:</strong> Standard static types reduce invalid state entries and maximize query optimizer efficiency.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-mono mt-0.5">•</span>
                  <span><strong>Realtime Publication:</strong> Tables are flagged for direct Supabase replication to keep owner screens synced.</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <button
                onClick={() => handleCopy(sqlSchema, 'schema')}
                className="absolute right-4 top-4 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-medium shadow-sm"
                title="Copy DDL Script"
              >
                {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'schema' ? 'Copied' : 'Copy SQL'}
              </button>
              <pre className="bg-slate-50 p-5 rounded-xl border border-slate-200 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-800 max-h-[480px]">
                {sqlSchema}
              </pre>
            </div>
          </div>
        )}

        {activeSubTab === 'api' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 font-mono">1. Submitting Order (Guest)</h3>
                <button
                  onClick={() => handleCopy(apiDocsCode.submitOrder, 'submitOrder')}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 text-xs shadow-sm"
                >
                  {copiedKey === 'submitOrder' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Function
                </button>
              </div>
              <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto text-[11px] font-mono text-slate-800 max-h-60">
                {apiDocsCode.submitOrder}
              </pre>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 font-mono">2. Realtime Listener (Owner Dashboard)</h3>
                <button
                  onClick={() => handleCopy(apiDocsCode.realtimeListener, 'realtimeListener')}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 text-xs shadow-sm"
                >
                  {copiedKey === 'realtimeListener' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Function
                </button>
              </div>
              <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto text-[11px] font-mono text-slate-800 max-h-60">
                {apiDocsCode.realtimeListener}
              </pre>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 font-mono">3. Updating Menu Item Availability (Owner)</h3>
                <button
                  onClick={() => handleCopy(apiDocsCode.updateMenuAvailability, 'toggleMenu')}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 text-xs shadow-sm"
                >
                  {copiedKey === 'toggleMenu' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Function
                </button>
              </div>
              <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto text-[11px] font-mono text-slate-800 max-h-60">
                {apiDocsCode.updateMenuAvailability}
              </pre>
            </div>
          </div>
        )}

        {activeSubTab === 'kot' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">Analog Kitchen Bridge Integration:</p>
              <p>
                Uneducated or non-technical kitchen staff rely on clear paper receipts. The KOT Print Formatter converts order snapshots into a centered, padded, line-wrapped monospaced format suitable for standard 80mm thermal receipt roll sizes.
              </p>
              <p className="text-slate-800 font-mono italic">
                💡 Added local dictionary mappings to automatically translate item descriptions into localized scripts (e.g. Devnagari Hindi) so kitchen execution requires zero tech training.
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => handleCopy(kotFormatterSource, 'kotCode')}
                className="absolute right-4 top-4 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-medium shadow-sm"
              >
                {copiedKey === 'kotCode' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'kotCode' ? 'Copied' : 'Copy Formatter TS'}
              </button>
              <pre className="bg-slate-50 p-5 rounded-xl border border-slate-200 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-800 max-h-[440px]">
                {kotFormatterSource}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
