import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Palette, Globe, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: Globe },
];

export function SettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = (user?.email ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-text-2">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                active === t.id ? 'bg-white/10 text-white' : 'text-text-2 hover:bg-white/5 hover:text-white',
              )}
            >
              <t.icon size={16} className={active === t.id ? 'text-accent' : 'text-muted'} />
              {t.label}
            </button>
          ))}
        </nav>

        <Card glow>
          {active === 'profile' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Profile</h3>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-purple to-primary text-xl font-bold text-white">{initials}</div>
                <Button variant="ghost" size="sm">Change avatar</Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                <Input label="Email" value={user?.email ?? ''} disabled />
                <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your business name" />
                <Input label="Role" defaultValue="Finance Lead" />
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Notifications</h3>
              {[
                { label: 'Duplicate transactions', desc: 'Alert me when a duplicate charge is detected' },
                { label: 'Budget warnings', desc: 'Notify when a category exceeds its budget' },
                { label: 'Weekly summary', desc: 'Email me a weekly financial digest' },
                { label: 'AI recommendations', desc: 'Push new savings opportunities' },
              ].map((n, i) => (
                <ToggleRow key={n.label} label={n.label} desc={n.desc} defaultOn={i < 3} />
              ))}
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Security</h3>
              <Input label="Current password" type="password" placeholder="••••••••" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="New password" type="password" placeholder="••••••••" />
                <Input label="Confirm password" type="password" placeholder="••••••••" />
              </div>
              <ToggleRow label="Two-factor authentication" desc="Require a code on every login" defaultOn />
            </div>
          )}

          {active === 'billing' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Billing</h3>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                <p className="text-sm font-semibold text-white">Pro plan</p>
                <p className="mt-1 text-xs text-text-2">R199/mo · renews monthly</p>
              </div>
              <Input label="Payment method" defaultValue="Visa •••• 4242" />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Change plan</Button>
                <Button variant="ghost" size="sm">Update card</Button>
              </div>
            </div>
          )}

          {active === 'appearance' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Appearance</h3>
              <div>
                <p className="mb-2 text-xs font-medium text-text-2">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Dark', 'Midnight', 'Light'].map((t, i) => (
                    <button key={t} className={cn('rounded-xl border p-4 text-left transition', i === 0 ? 'border-primary/50 bg-primary/10' : 'border-white/8 hover:border-white/15')}>
                      <div className={cn('mb-2 h-12 rounded-lg', i === 0 ? 'bg-gradient-to-br from-bg to-sidebar' : i === 1 ? 'bg-gradient-to-br from-sidebar to-bg-2' : 'bg-gradient-to-br from-white to-text-2')} />
                      <p className="text-sm font-medium text-white">{t}</p>
                    </button>
                  ))}
                </div>
              </div>
              <ToggleRow label="Reduce motion" desc="Minimize animations across the app" defaultOn={false} />
            </div>
          )}

          {active === 'preferences' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Preferences</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-2">Currency</label>
                  <select className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm" defaultValue="ZAR">
                    <option className="bg-sidebar">ZAR — South African Rand</option>
                    <option className="bg-sidebar">USD — US Dollar</option>
                    <option className="bg-sidebar">EUR — Euro</option>
                    <option className="bg-sidebar">GBP — British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-2">Date format</label>
                  <select className="input-base h-12 w-full cursor-pointer appearance-none px-4 text-sm" defaultValue="DD/MM/YYYY">
                    <option className="bg-sidebar">DD/MM/YYYY</option>
                    <option className="bg-sidebar">MM/DD/YYYY</option>
                    <option className="bg-sidebar">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <ToggleRow label="Auto-approve high-confidence AI extractions" desc="Skip review for transactions above 95% confidence" defaultOn={false} />
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/8 pt-5">
            <Button variant="ghost" size="md">Cancel</Button>
            <Button size="md" onClick={save} leftIcon={saved ? <Check size={16} /> : undefined}>
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs text-text-2">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition', on ? 'bg-primary' : 'bg-white/10')}
        aria-pressed={on}
      >
        <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-all', on ? 'left-6' : 'left-1')} />
      </button>
    </div>
  );
}
