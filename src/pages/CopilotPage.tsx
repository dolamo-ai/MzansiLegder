import { Sparkles, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AIChat } from '@/components/ai/AIChat';

export function CopilotPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-2">
          <Sparkles size={13} className="text-accent" /> Powered by Mzansi Ledger AI
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">AI Copilot</h1>
        <p className="mt-1 text-sm text-text-2">Your intelligent financial assistant — ask anything about your business finances.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Chat */}
        <Card glow className="lg:col-span-3">
          <AIChat />
        </Card>

        {/* Capabilities */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-white">What I can do</h3>
            <div className="mt-3 space-y-3">
              {[
                { icon: Zap, title: 'Instant analysis', desc: 'Query any metric in seconds' },
                { icon: ShieldCheck, title: 'Anomaly detection', desc: 'Catch duplicates & fraud' },
                { icon: TrendingUp, title: 'Forecasting', desc: 'Project cash flow & budgets' },
              ].map((c) => (
                <div key={c.title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-accent"><c.icon size={16} /></span>
                  <div>
                    <p className="text-sm font-medium text-white">{c.title}</p>
                    <p className="text-xs text-text-2">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-primary/15 to-accent/10">
            <Sparkles size={18} className="text-accent" />
            <p className="mt-2 text-sm font-semibold text-white">Pro tip</p>
            <p className="mt-1 text-xs leading-relaxed text-text-2">Ask me to compare periods — e.g. "Compare marketing spend this month vs last 3 months."</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
