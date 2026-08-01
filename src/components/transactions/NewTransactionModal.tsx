import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Transaction, TxCategory, TxSource, TxStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NewTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => Promise<void>;
}

const categories: TxCategory[] = ['Software', 'Marketing', 'Office', 'Travel', 'Utilities', 'Payroll', 'Legal', 'Hardware'];
const sources: TxSource[] = ['manual', 'receipt', 'invoice', 'csv'];

export function NewTransactionModal({ open, onClose, onSave }: NewTransactionModalProps) {
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [vat, setVat] = useState('');
  const [category, setCategory] = useState<TxCategory>('Software');
  const [source, setSource] = useState<TxSource>('manual');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setVendor('');
      setAmount('');
      setVat('');
      setCategory('Software');
      setSource('manual');
      setDate(new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    if (!vendor.trim() || !amount) {
      setError('Vendor and amount are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        vendor: vendor.trim(),
        amount: Number(amount) || 0,
        vat: Number(vat) || 0,
        category,
        source,
        status: 'pending' as TxStatus,
        confidence: 1,
        date,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Transaction"
      subtitle="Add a transaction manually. It will be saved and queued for review."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="md" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Add Transaction'}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-[#fca5a5]">{error}</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Figma, Inc." />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Amount (R)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          <Input label="VAT (R)" type="number" value={vat} onChange={(e) => setVat(e.target.value)} placeholder="0.00" />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as TxCategory)} className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm capitalize">
              {categories.map((c) => <option key={c} className="bg-sidebar capitalize">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-text-2">Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value as TxSource)} className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm capitalize">
              {sources.map((s) => <option key={s} className="bg-sidebar capitalize">{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export { cn };
