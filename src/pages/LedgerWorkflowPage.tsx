import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow, Sparkles, ClipboardPaste, Check, X, AlertTriangle, FileText,
  Calculator, Edit3, Loader2, Wand2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EXTRACT_TX_URL, supabase } from '@/lib/supabase';
import { useTransactions } from '@/lib/hooks';
import type { TxCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AIAnalysis {
  validation_status: 'clean' | 'requires_review' | 'rejected';
  result: {
    merchant: string;
    date: string;
    total: number;
    vat_amount: number;
    category: string;
  };
  issues: string[];
  reasoning_summary: string;
  confidence: 'high' | 'medium' | 'low';
  human_approval_required: boolean;
}

const SAMPLE_TEXTS = [
  'Pick n Pay - Receipt #4471\nDate: 28 Jul 2026\nOffice supplies & printing\nTotal: R1,149.00\nVAT incl.',
  'Figma Inc. invoice INV-2026-08\nBilling period: July 2026\nProfessional plan x3 seats\nAmount due: R2,400.00\nVAT 15%',
  'SMS from Standard Bank:\nCard payment R320.00\nMerchant: Uber SA\nRef: 882341\nDate 26 Jul 2026',
];

const CATEGORIES: TxCategory[] = ['Office Supplies', 'Software', 'Marketing', 'Travel', 'Utilities', 'Rent', 'Payroll', 'Hardware', 'Legal', 'Other'];

export function LedgerWorkflowPage() {
  const { insert } = useTransactions();
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<AIAnalysis['result'] | null>(null);
  const [saved, setSaved] = useState(false);

  const runAI = async () => {
    if (!input.trim()) {
      setError('Please paste some text to analyse.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setSaved(false);
    setEditing(false);
    setEdited(null);

    try {
      const res = await fetch(EXTRACT_TX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: input }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const a = data.analysis as AIAnalysis;
      if (!a || !a.result) throw new Error('AI returned an unexpected format.');
      setAnalysis(a);
      setEdited(a.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyse text.');
    } finally {
      setLoading(false);
    }
  };

  const approveAndAdd = async () => {
    if (!analysis || !edited) return;
    setLoading(true);
    setError(null);
    try {
      await insert({
        vendor: edited.merchant,
        date: edited.date || new Date().toISOString().slice(0, 10),
        amount: Number(edited.total) || 0,
        vat: Number(edited.vat_amount) || 0,
        category: (edited.category as TxCategory) || 'Other',
        status: 'reviewed',
        source: 'manual',
        confidence: analysis.confidence === 'high' ? 0.95 : analysis.confidence === 'medium' ? 0.8 : 0.6,
        notes: `AI extracted: ${analysis.reasoning_summary}`,
      });
      setSaved(true);
      setAnalysis(null);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save to ledger.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setInput('');
    setError(null);
    setSaved(false);
    setEditing(false);
    setEdited(null);
  };

  const statusTone = analysis?.validation_status === 'clean' ? 'success' : analysis?.validation_status === 'requires_review' ? 'warning' : 'danger';

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-2">
          <Workflow size={13} className="text-accent" /> Challenge 04 — Micro-Business Financial Workflow
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Ledger Workflow</h1>
        <p className="mt-1 text-sm text-text-2">
          Paste any raw financial text — a receipt, invoice, SMS, or email. AI extracts the details, calculates VAT, and you approve before it hits your ledger.
        </p>
      </div>

      {/* Workflow steps indicator */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { n: 1, label: 'Paste text', icon: ClipboardPaste, active: !analysis && !loading },
          { n: 2, label: 'AI extracts', icon: Wand2, active: loading },
          { n: 3, label: 'VAT & review', icon: Calculator, active: !!analysis && !saved },
          { n: 4, label: 'Human approve', icon: Check, active: !!analysis && !saved },
          { n: 5, label: 'Add to ledger', icon: FileText, active: saved },
        ].map((s) => (
          <div
            key={s.n}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border p-3 transition',
              s.active ? 'border-accent/40 bg-accent/5' : 'border-white/8 bg-white/2',
            )}
          >
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', s.active ? 'bg-accent/15 text-accent' : 'bg-white/5 text-muted')}>
              <s.icon size={15} />
            </span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Step {s.n}</p>
              <p className={cn('text-xs font-semibold', s.active ? 'text-white' : 'text-text-2')}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card glow>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardPaste size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-white">Raw financial text</h3>
            </div>
            <span className="text-xs text-muted">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder="Paste a receipt, invoice, SMS, or any financial text here…"
            className="input-base mt-4 w-full resize-none p-4 text-sm leading-relaxed"
          />
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-muted">Or try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-2 transition hover:border-primary/40 hover:text-white"
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={runAI} disabled={loading || !input.trim()} leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}>
              {loading ? 'Analysing…' : 'Run AI Extraction'}
            </Button>
          </div>
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-[#fca5a5]">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </Card>

        {/* Output */}
        <Card glow className="min-h-[400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-white">AI structured output</h3>
            </div>
            {analysis && <Badge tone={statusTone as 'success' | 'warning' | 'danger'} dot>{analysis.validation_status.replace('_', ' ')}</Badge>}
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 size={32} className="animate-spin text-accent" />
                <p className="text-sm text-text-2">AI is reading and extracting…</p>
              </motion.div>
            )}

            {!loading && !analysis && !saved && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-muted"><FileText size={24} /></div>
                <p className="text-sm text-text-2">Run the AI extraction to see the structured result here.</p>
              </motion.div>
            )}

            {!loading && analysis && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
                {/* Reasoning */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3.5">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#67e8f9]"><Sparkles size={13} /> AI Reasoning</p>
                  <p className="mt-1 text-sm text-text-2">{analysis.reasoning_summary}</p>
                </div>

                {/* Issues */}
                {analysis.issues.length > 0 && (
                  <div className="rounded-xl border border-warning/20 bg-warning/5 p-3.5">
                    <p className="flex items-center gap-2 text-xs font-semibold text-[#fcd34d]"><AlertTriangle size={13} /> Issues detected</p>
                    <ul className="mt-1.5 space-y-1">
                      {analysis.issues.map((iss, i) => (
                        <li key={i} className="text-sm text-text-2">• {iss}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structured fields */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Extracted fields</p>
                    <button
                      onClick={() => setEditing((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-accent transition hover:bg-accent/10"
                    >
                      <Edit3 size={12} /> {editing ? 'Cancel edit' : 'Edit'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Merchant" value={edited?.merchant ?? ''} editing={editing} onChange={(v) => setEdited({ ...edited!, merchant: v })} />
                    <Field label="Date" value={edited?.date ?? ''} editing={editing} onChange={(v) => setEdited({ ...edited!, date: v })} type="date" />
                    <Field label="Total (R)" value={String(edited?.total ?? '')} editing={editing} onChange={(v) => setEdited({ ...edited!, total: Number(v) || 0 })} type="number" />
                    <Field label="VAT (R)" value={String(edited?.vat_amount ?? '')} editing={editing} onChange={(v) => setEdited({ ...edited!, vat_amount: Number(v) || 0 })} type="number" />
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted">Category</label>
                      {editing ? (
                        <select
                          value={edited?.category ?? 'Other'}
                          onChange={(e) => setEdited({ ...edited!, category: e.target.value })}
                          className="input-base h-10 w-full cursor-pointer appearance-none px-3 text-sm capitalize"
                        >
                          {CATEGORIES.map((c) => <option key={c} className="bg-sidebar capitalize">{c}</option>)}
                        </select>
                      ) : (
                        <p className="rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm text-white capitalize">{edited?.category ?? '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted">Confidence</label>
                      <p className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', analysis.confidence === 'high' ? 'bg-success' : analysis.confidence === 'medium' ? 'bg-warning' : 'bg-danger')} />
                        <span className="text-sm text-white capitalize">{analysis.confidence}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={approveAndAdd} disabled={loading} leftIcon={<Check size={16} />}>
                    {loading ? 'Saving…' : 'Approve & Add to Ledger'}
                  </Button>
                  <Button variant="ghost" onClick={reset} leftIcon={<X size={16} />}>Discard</Button>
                </div>
              </motion.div>
            )}

            {!loading && saved && (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success"><Check size={28} /></div>
                <p className="text-base font-semibold text-white">Added to your ledger</p>
                <p className="text-sm text-text-2">The transaction has been saved and marked as reviewed.</p>
                <Button variant="ghost" size="sm" onClick={reset} className="mt-2">Process another</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, type = 'text' }: { label: string; value: string; editing: boolean; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      {editing ? (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-base h-10 w-full px-3 text-sm" />
      ) : (
        <p className="rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm text-white">{value || '—'}</p>
      )}
    </div>
  );
}
