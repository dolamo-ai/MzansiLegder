import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { transactions } from '@/data/mock';
import { formatCurrency, formatDate } from '@/lib/utils';

export function RecentTransactions() {
  const rows = transactions.slice(0, 6);
  return (
    <Card className="p-0">
      <div className="p-6 pb-4">
        <SectionHeader
          title="Recent Transactions"
          subtitle="Latest activity across all sources"
          action={
            <Link to="/transactions" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-[#67e8f9]">
              View all <ArrowRight size={14} />
            </Link>
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-y border-white/8 text-[11px] uppercase tracking-wider text-muted">
              <th className="px-6 py-3 font-medium">Vendor</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/3">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-bold text-text-2">
                      {tx.vendor.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.vendor}</p>
                      <p className="text-xs text-muted">{tx.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-sm text-text-2">{formatDate(tx.date)}</td>
                <td className="px-6 py-3.5 text-sm text-text-2">{tx.category}</td>
                <td className="px-6 py-3.5"><StatusBadge status={tx.status} /></td>
                <td className="px-6 py-3.5 text-right text-sm font-semibold text-white">{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
