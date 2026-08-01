import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg p-4">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-purple/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-modal border border-white/10 bg-card/80 backdrop-blur-xl lg:grid-cols-2">
        {/* Left — brand panel */}
        <div className="relative hidden flex-col justify-between p-10 lg:flex">
          <div>
            <Logo />
            <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-white">
              Your AI financial<br />copilot for smarter<br /><span className="text-gradient-blue">business decisions.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-2">
              Mzansi Ledger helps South African micro-businesses capture receipts, extract transactions with AI, calculate VAT, and keep a clean ledger — all in one place.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: Sparkles, text: 'AI extracts transactions from any text or receipt' },
              { icon: TrendingUp, text: 'Automatic 15% VAT calculation and duplicate detection' },
              { icon: ShieldCheck, text: 'Human review before anything hits your ledger' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-accent"><f.icon size={16} /></span>
                <p className="text-sm text-text-2">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="p-8 sm:p-10">
          <div className="lg:hidden"><Logo /></div>
          <div className="mt-8 lg:mt-0">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1 text-sm text-text-2">
              {mode === 'signin' ? 'Sign in to your Mzansi Ledger workspace.' : 'Start managing your micro-business finances today.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={cn('rounded-lg px-4 py-2 text-sm font-medium transition', mode === m ? 'bg-white/10 text-white' : 'text-text-2 hover:text-white')}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.co.za"
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />

            {error && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-[#fca5a5]">{error}</div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading} rightIcon={<ArrowRight size={18} />}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            By continuing you agree to Mzansi Ledger's terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/image.png" alt="Mzansi Ledger logo" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
      <div className="leading-tight">
        <p className="text-base font-bold tracking-tight text-white">Mzansi Ledger</p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">AI Financial Copilot</p>
      </div>
    </div>
  );
}
