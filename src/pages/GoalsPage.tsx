import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Edit3, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useGoals } from '@/lib/hooks';
import type { Goal, TxCategory } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { DeleteConfirmModal } from '@/pages/InvoicesPage';

const categories: TxCategory[] = ['Software', 'Marketing', 'Office', 'Travel', 'Utilities', 'Payroll', 'Legal', 'Hardware', 'Rent', 'Office Supplies', 'Other'];

export function GoalsPage() {
  const { rows, loading, insert, update, remove } = useGoals();
  const [newOpen, setNewOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onTrack = rows.filter((g) => g.current <= g.target).length;
  const exceeded = rows.filter((g) => g.current > g.target).length;
  const avg = rows.length ? Math.round(rows.reduce((a, g) => a + Math.min(100, (g.current / g.target) * 100), 0) / rows.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Goals</h1>
          <p className="mt-1 text-sm text-text-2">Set spending targets and track your progress.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setNewOpen(true)}>Create Goal</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-[220px] rounded-card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((g, i) => (
            <GoalCard key={g.id} goal={g} delay={i * 0.08} onEdit={() => setEditGoal(g)} onDelete={() => setDeleteId(g.id)} />
          ))}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rows.length * 0.08 }}
            onClick={() => setNewOpen(true)}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-white/10 text-text-2 transition hover:border-primary/40 hover:bg-primary/5 hover:text-white"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">New goal</span>
          </motion.button>
        </div>
      )}

      <Card glow>
        <SectionHeader title="Goal Performance" subtitle="How you're tracking against all targets" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'On track', value: String(onTrack), tone: 'text-success' },
            { label: 'Exceeded', value: String(exceeded), tone: 'text-danger' },
            { label: 'Avg progress', value: `${avg}%`, tone: 'text-accent' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{s.label}</p>
              <p className={cn('mt-1.5 text-2xl font-extrabold', s.tone)}>{s.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <CreateGoalModal open={newOpen} onClose={() => setNewOpen(false)} onSave={async (g) => { await insert(g); }} />
      <EditGoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={async (id, patch) => { await update(id, patch); }} />
      <DeleteConfirmModal open={!!deleteId} title="Delete goal" message="This will permanently remove the goal. This cannot be undone." loading={false} onConfirm={async () => { if (deleteId) { await remove(deleteId); } setDeleteId(null); }} onClose={() => setDeleteId(null)} />
    </div>
  );
}

function GoalCard({ goal, delay, onEdit, onDelete }: { goal: Goal; delay: number; onEdit: () => void; onDelete: () => void }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const over = goal.current > goal.target;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card glow className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <span className={cn('grid h-10 w-10 place-items-center rounded-xl', over ? 'bg-danger/15 text-[#fca5a5]' : 'bg-success/15 text-[#6ee7b7]')}>
            <Target size={18} />
          </span>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="rounded-lg p-2 text-text-2 transition hover:bg-white/5 hover:text-accent" aria-label="Edit"><Edit3 size={15} /></button>
            <button onClick={onDelete} className="rounded-lg p-2 text-text-2 transition hover:bg-white/5 hover:text-danger" aria-label="Delete"><Trash2 size={15} /></button>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-white">{goal.name}</p>
        <p className="mt-0.5 text-xs text-muted">{goal.category} · Due {goal.deadline ? formatDate(goal.deadline) : '—'}</p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-text-2">{formatCurrency(goal.current)}</span>
            <span className="text-muted">{formatCurrency(goal.target)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className={cn('h-full rounded-full', over ? 'bg-gradient-to-r from-danger to-warning' : 'bg-gradient-to-r from-primary to-accent')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: delay + 0.2, duration: 0.8 }}
            />
          </div>
          <p className={cn('mt-2 text-xs font-semibold', over ? 'text-danger' : 'text-success')}>
            {over ? `${pct - 100}% over target` : `${100 - pct}% headroom remaining`}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

function CreateGoalModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (g: Omit<Goal, 'id'>) => Promise<void> }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [category, setCategory] = useState<TxCategory>('Software');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setName(''); setTarget(''); setCurrent(''); setCategory('Software'); setDeadline(''); setError(null); };

  const submit = async () => {
    if (!name.trim() || !target) { setError('Name and target are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), target: Number(target) || 0, current: Number(current) || 0, category, deadline: deadline || new Date().toISOString().slice(0, 10) });
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Goal" subtitle="Set a spending or savings target to track."
      footer={<div className="flex items-center justify-end gap-2"><Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button><Button size="md" onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Create Goal'}</Button></div>}>
      <div className="space-y-4">
        {error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-[#fca5a5]">{error}</div>}
        <Input label="Goal name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Reduce software spend" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Target (R)" type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="40000" />
          <Input label="Current spend (R)" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0" />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as TxCategory)} className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm capitalize">
              {categories.map((c) => <option key={c} className="bg-sidebar capitalize">{c}</option>)}
            </select>
          </div>
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function EditGoalModal({ goal, onClose, onSave }: { goal: Goal | null; onClose: () => void; onSave: (id: string, patch: Partial<Goal>) => Promise<void> }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [category, setCategory] = useState<TxCategory>('Software');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTarget(String(goal.target));
      setCurrent(String(goal.current));
      setCategory(goal.category);
      setDeadline(goal.deadline ?? '');
      setError(null);
    }
  }, [goal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!goal) return null;

  const submit = async () => {
    if (!name.trim() || !target) { setError('Name and target are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(goal.id, { name: name.trim(), target: Number(target) || 0, current: Number(current) || 0, category, deadline: deadline || new Date().toISOString().slice(0, 10) });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!goal} onClose={onClose} title="Edit Goal" subtitle="Update the goal details."
      footer={<div className="flex items-center justify-end gap-2"><Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button><Button size="md" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button></div>}>
      <div className="space-y-4">
        {error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-[#fca5a5]">{error}</div>}
        <Input label="Goal name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Target (R)" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input label="Current spend (R)" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <div>
            <label className="mb-2 block text-xs font-medium text-text-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as TxCategory)} className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm capitalize">
              {categories.map((c) => <option key={c} className="bg-sidebar capitalize">{c}</option>)}
            </select>
          </div>
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

export { Calendar };
