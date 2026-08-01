import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Paperclip, Mic, ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { initialChat, suggestedPrompts, type ChatMessage } from '@/data/mock';

interface AIChatProps {
  className?: string;
  compact?: boolean;
}

function generateReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('duplicate'))
    return "I found 1 duplicate: **TX-10427** (Google Ads, $1,850) matches **TX-10423** from 3 days earlier. I recommend disputing the second charge with your card issuer and flagging it in your books. Want me to draft a dispute note?";
  if (p.includes('overspend') || p.includes('over'))
    return "Your **Marketing** category is at 108% of budget ($21,600 of $20,000). Software is at 85% — healthy. The biggest lever is pausing two underperforming Google Ads campaigns that together cost $1,850 this month.";
  if (p.includes('vat'))
    return "Your recorded VAT for Q3 is **$24,680** across 47 invoices. One gap: TX-10429 (Gusto, $12,800) has no VAT — payroll services are typically VAT-exempt, but you should confirm with your accountant.";
  if (p.includes('subscription') || p.includes('cancel'))
    return "Three subscriptions look underused: **Notion** ($960/yr, 3 active seats), **Lyft Business** ($210 last month, 2 rides), and **Stapel** ($320/yr). Cancelling Notion's spare seats alone saves ~$480/yr.";
  return "I've pulled the latest figures. Your total expenses this month are **$184,320**, up 9% vs last month — driven mostly by a payroll run and AWS growth. Potential savings identified: **$12,840**. Want me to break that down by category?";
}

export function AIChat({ className, compact = false }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: generateReply(text),
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, reply]);
      setTyping(false);
    }, 1400);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Messages */}
      <div ref={scrollRef} className={cn('no-scrollbar flex-1 space-y-4 overflow-y-auto pr-1', compact ? 'max-h-[360px]' : 'max-h-[520px]')}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}
          >
            {m.role === 'assistant' ? (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
                <Sparkles size={15} className="text-white" />
              </div>
            ) : (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/8 text-xs font-bold text-white">
                AM
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                m.role === 'assistant'
                  ? 'rounded-tl-sm bg-white/5 text-text-1'
                  : 'rounded-tr-sm bg-gradient-to-br from-primary to-primary-hover text-white shadow-glow',
              )}
            >
              {m.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                  {renderRich(line)}
                </p>
              ))}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
                <Sparkles size={15} className="text-white" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-text-2"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-text-2 transition hover:border-primary/40 hover:bg-primary/10 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-4">
        <div className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 transition focus-within:border-primary/50 focus-within:shadow-glow">
          <button className="mb-1.5 ml-1 rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-white" aria-label="Attach file">
            <Paperclip size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask your AI copilot anything…"
            className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder:text-muted focus:outline-none"
          />
          <button className="mb-1.5 rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-white" aria-label="Voice input">
            <Mic size={18} />
          </button>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            className="mb-0.5 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white shadow-glow transition hover:brightness-110 disabled:opacity-40"
            aria-label="Send message"
          >
            {input.trim() ? <ArrowUp size={17} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderRich(text: string) {
  // simple **bold** parser
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
