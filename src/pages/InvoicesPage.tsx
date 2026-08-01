import { useState } from 'react';
import { FileText, Download, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useInvoices } from '@/lib/hooks';
import type { Invoice, TxStatus } from '@/lib/types';
import { exportCSV, exportExcel } from '@/lib/export';
import { formatCurrency, formatDate } from '@/lib/utils';

export function InvoicesPage() {
  const { rows, loading, insert } = useInvoices();
  const [q, setQ] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const filtered = rows.filter((i) => i.vendor.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase()));

  const totalValue = rows.reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="mt-1 text-sm text-text-2">Manage and track all your invoices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" leftIcon={<Download size={16} />} onClick={() => exportCSV(rows.map((i) => ({ id: i.id, vendor: i.vendor, date: i.date, amount: i.amount, status: i.status, due: i.due })), 'invoices.csv')}>Export CSV</Button>
          <Button leftIcon={<Plus size={16} />} onClick={() => setNewOpen(true)}>New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total invoices', value: String(rows.length), tone: 'text-white' },
          { label: 'Pending', value: String(rows.filter((i) => i.status === 'pending').length), tone: 'text-warning' },
          { label: 'Flagged', value: String(rows.filter((i) => i.status === 'flagged').length), tone: 'text-danger' },
          { label: 'Total value', value: formatCurrency(totalValue), tone: 'text-accent' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{s.label}</p>
            <p className={`mt-1.5 text-2xl font-extrabold tracking-tight ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices…" leftIcon={<Search size={16} />} containerClassName="sm:max-w-sm" />
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="ghost" size="md" leftIcon={<Download size={15} />} onClick={() => exportCSV(filtered.map((i) => ({ id: i.id, vendor: i.vendor, date: i.date, amount: i.amount, status: i.status, due: i.due })), 'invoices.csv')}>CSV</Button>
            <Button variant="ghost" size="md" leftIcon={<Download size={15} />} onClick={() => exportExcel(filtered.map((i) => ({ id: i.id, vendor: i.vendor, date: i.date, amount: i.amount, status: i.status, due: i.due })), 'invoices.xls')}>Excel</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : (
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-y border-white/8 text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Vendor</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/3">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-accent" />
                        <span className="text-sm font-medium text-white">{inv.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-2">{inv.vendor}</td>
                    <td className="px-5 py-3.5 text-sm text-text-2">{formatDate(inv.date)}</td>
                    <td className="px-5 py-3.5 text-sm text-text-2">{inv.due ? formatDate(inv.due) : '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-white">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="sm" variant="ghost" leftIcon={<Download size={14} />} onClick={() => exportCSV([{ id: inv.id, vendor: inv.vendor, date: inv.date, amount: inv.amount, status: inv.status, due: inv.due }], `${inv.id}.csv`)}>PDF</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <NewInvoiceModal open={newOpen} onClose={() => setNewOpen(false)} onSave={async (inv) => { await insert(inv); }} />
    </div>
  );
}

function NewInvoiceModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (inv: Omit<Invoice, 'id'>) => Promise<void> }) {
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState('');
  const [status, setStatus] = useState<TxStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setVendor(''); setAmount(''); setDate(new Date().toISOString().slice(0, 10)); setDue(''); setStatus('pending'); setError(null); };

  const submit = async () => {
    if (!vendor.trim() || !amount) { setError('Vendor and amount are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({ vendor: vendor.trim(), amount: Number(amount) || 0, date, due: due || date, status });
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Invoice"
      subtitle="Add a vendor invoice to track for payment."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="md" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Add Invoice'}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-[#fca5a5]">{error}</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Figma, Inc." />
          <Input label="Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TxStatus)} className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm capitalize">
              {(['pending', 'reviewed', 'flagged'] as TxStatus[]).map((s) => <option key={s} className="bg-sidebar capitalize">{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
