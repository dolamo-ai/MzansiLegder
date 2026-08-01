import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Download, ChevronLeft, ChevronRight, Check, X, Sparkles, AlertTriangle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';
import { useTransactions } from '@/lib/hooks';
import type { Transaction, TxCategory, TxStatus } from '@/lib/types';
import { exportCSV, exportExcel } from '@/lib/export';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const categories: TxCategory[] = ['Software', 'Marketing', 'Office', 'Travel', 'Utilities', 'Payroll', 'Legal', 'Hardware'];
const statuses: TxStatus[] = ['reviewed', 'pending', 'flagged', 'duplicate'];

export function TransactionsPage() {
  const { rows, loading, insert, update } = useTransactions();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<TxCategory | 'all'>('all');
  const [status, setStatus] = useState<TxStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [review, setReview] = useState<Transaction | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const perPage = 8;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (query && !r.vendor.toLowerCase().includes(query.toLowerCase()) && !r.id.toLowerCase().includes(query.toLowerCase())) return false;
      if (cat !== 'all' && r.category !== cat) return false;
      if (status !== 'all' && r.status !== status) return false;
      return true;
    });
  }, [rows, query, cat, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  const updateRow = async (id: string, patch: Partial<Transaction>) => {
    try {
      await update(id, patch);
      setReview((r) => (r && r.id === id ? { ...r, ...patch } : r));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update transaction.');
    }
  };

  const handleExportCSV = () => {
    exportCSV(filtered.map((r) => ({ id: r.id, vendor: r.vendor, date: r.date, amount: r.amount, vat: r.vat, category: r.category, status: r.status, source: r.source, confidence: r.confidence })), 'transactions.csv');
  };
  const handleExportExcel = () => {
    exportExcel(filtered.map((r) => ({ id: r.id, vendor: r.vendor, date: r.date, amount: r.amount, vat: r.vat, category: r.category, status: r.status })), 'transactions.xls');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="mt-1 text-sm text-text-2">Review, edit, and approve AI-extracted transactions.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setNewOpen(true)}>New Transaction</Button>
      </div>

      <Card className="p-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search vendor or ID…"
            leftIcon={<Search size={16} />}
            containerClassName="lg:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <FilterSelect label="Category" value={cat} onChange={(v) => { setCat(v as TxCategory | 'all'); setPage(1); }} options={['all', ...categories]} />
            <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v as TxStatus | 'all'); setPage(1); }} options={['all', ...statuses]} />
            <Button variant="ghost" size="md" leftIcon={<Download size={15} />} onClick={handleExportCSV}>CSV</Button>
            <Button variant="ghost" size="md" leftIcon={<Download size={15} />} onClick={handleExportExcel}>Excel</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-y border-white/8 text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Vendor</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">AI Confidence</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {current.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/3">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-bold text-text-2">
                          {tx.vendor.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.vendor}</p>
                          <p className="text-xs text-muted">{tx.id} · {tx.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-2">{formatDate(tx.date)}</td>
                    <td className="px-5 py-3.5 text-sm text-text-2">{tx.category}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={tx.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                          <div className={cn('h-full rounded-full', tx.confidence > 0.9 ? 'bg-success' : tx.confidence > 0.75 ? 'bg-warning' : 'bg-danger')} style={{ width: `${tx.confidence * 100}%` }} />
                        </div>
                        <span className="text-xs text-text-2">{Math.round(tx.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(tx.amount)}</p>
                      <p className="text-xs text-muted">VAT {formatCurrency(tx.vat)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setReview(tx)}>Review</Button>
                    </td>
                  </tr>
                ))}
                {current.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">No transactions match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/8 p-4">
          <p className="text-xs text-muted">Showing {current.length} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg p-2 text-text-2 transition hover:bg-white/5 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm text-text-2">{page} / {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-lg p-2 text-text-2 transition hover:bg-white/5 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      <ReviewModal tx={review} onClose={() => setReview(null)} onSave={updateRow} />
      <NewTransactionModal open={newOpen} onClose={() => setNewOpen(false)} onSave={async (tx) => { await insert(tx); }} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base h-11 cursor-pointer appearance-none pr-9 pl-4 text-sm capitalize"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-sidebar capitalize">{o === 'all' ? `All ${label}` : o}</option>
        ))}
      </select>
      <SlidersHorizontal size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

function ReviewModal({ tx, onClose, onSave }: { tx: Transaction | null; onClose: () => void; onSave: (id: string, patch: Partial<Transaction>) => Promise<void> }) {
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TxCategory>('Software');
  const [vat, setVat] = useState('');
  const [saving, setSaving] = useState(false);

  const key = tx?.id;
  useMemo(() => {
    if (tx) {
      setVendor(tx.vendor);
      setAmount(String(tx.amount));
      setCategory(tx.category);
      setVat(String(tx.vat));
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tx) return null;
  const lowConfidence = tx.confidence < 0.8;

  const approve = async () => {
    setSaving(true);
    await onSave(tx.id, {
      vendor,
      amount: Number(amount) || tx.amount,
      vat: Number(vat) || 0,
      category,
      status: 'reviewed',
      confidence: 1,
    });
    setSaving(false);
    onClose();
  };

  const reject = async () => {
    setSaving(true);
    await onSave(tx.id, { status: 'flagged' });
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={!!tx}
      onClose={onClose}
      title="Human Review"
      subtitle="Verify and correct the AI-extracted values before saving."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="danger" size="md" leftIcon={<X size={16} />} onClick={reject} disabled={saving}>Reject</Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button size="md" leftIcon={<Check size={16} />} onClick={approve} disabled={saving}>{saving ? 'Saving…' : 'Approve & Save'}</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* AI banner */}
        <div className={cn('flex items-start gap-3 rounded-xl border p-3.5', lowConfidence ? 'border-warning/30 bg-warning/10' : 'border-accent/30 bg-accent/10')}>
          <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', lowConfidence ? 'bg-warning/20 text-[#fcd34d]' : 'bg-accent/20 text-[#67e8f9]')}>
            {lowConfidence ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{lowConfidence ? 'Low AI confidence — please verify' : 'AI extracted with high confidence'}</p>
            <p className="mt-0.5 text-xs text-text-2">
              {lowConfidence ? `Confidence is ${Math.round(tx.confidence * 100)}%. Fields below may need correction.` : `Confidence ${Math.round(tx.confidence * 100)}%. Review the highlighted fields.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReviewField label="Vendor" value={vendor} onChange={setVendor} highlight={lowConfidence} />
          <ReviewField label="Amount ($)" value={amount} onChange={setAmount} highlight={lowConfidence} type="number" />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TxCategory)}
              className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm capitalize"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-sidebar">{c}</option>
              ))}
            </select>
          </div>
          <ReviewField label="VAT ($)" value={vat} onChange={setVat} type="number" />
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Source document</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{tx.source.toUpperCase()} · {tx.id}</p>
              <p className="text-xs text-text-2">Uploaded {formatDate(tx.date)}</p>
            </div>
            <Button size="sm" variant="ghost">View original</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ReviewField({ label, value, onChange, type = 'text', highlight = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; highlight?: boolean }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-text-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('input-base h-12 w-full px-4 text-sm', highlight && 'ring-1 ring-warning/40')}
      />
    </div>
  );
}
