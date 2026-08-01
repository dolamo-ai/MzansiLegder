import { FileText, Download, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { transactions } from '@/data/mock';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Invoice {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  status: 'reviewed' | 'pending' | 'flagged';
  due: string;
}

const invoices: Invoice[] = transactions
  .filter((t) => t.source === 'invoice')
  .map((t) => ({ id: t.id, vendor: t.vendor, date: t.date, amount: t.amount, status: t.status as Invoice['status'], due: '2026-08-15' }));

export function InvoicesPage() {
  const [q, setQ] = useState('');
  const filtered = invoices.filter((i) => i.vendor.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="mt-1 text-sm text-text-2">Manage and track all your invoices.</p>
        </div>
        <Button leftIcon={<Plus size={16} />}>New Invoice</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total invoices', value: invoices.length, tone: 'text-white' },
          { label: 'Pending', value: invoices.filter((i) => i.status === 'pending').length, tone: 'text-warning' },
          { label: 'Flagged', value: invoices.filter((i) => i.status === 'flagged').length, tone: 'text-danger' },
          { label: 'Total value', value: formatCurrency(invoices.reduce((a, b) => a + b.amount, 0)), tone: 'text-accent' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{s.label}</p>
            <p className={`mt-1.5 text-2xl font-extrabold tracking-tight ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="p-5">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices…" leftIcon={<Search size={16} />} containerClassName="max-w-sm" />
        </div>
        <div className="overflow-x-auto">
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
                  <td className="px-5 py-3.5 text-sm text-text-2">{formatDate(inv.due)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold text-white">{formatCurrency(inv.amount)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>PDF</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
