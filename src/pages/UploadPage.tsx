import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, FileSpreadsheet, File as FileIcon, X, Check, Sparkles, ScanLine, Calculator, Copy, BarChart3, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTransactions } from '@/lib/hooks';
import type { TxCategory } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

const SAMPLE_VENDORS = ['Stripe','Notion Labs','AWS','HubSpot','Figma, Inc.','WeWork','Slack','Dell Technologies'];
const SAMPLE_CATEGORIES: TxCategory[] = ['Software','Marketing','Office','Travel','Utilities','Payroll','Legal','Hardware'];

type Stage = 'idle' | 'uploading' | 'processing' | 'done';

const steps = [
  { icon: ScanLine, label: 'Reading document', color: 'text-accent' },
  { icon: FileText, label: 'Extracting fields', color: 'text-primary' },
  { icon: Calculator, label: 'Calculating VAT', color: 'text-purple' },
  { icon: Copy, label: 'Finding duplicates', color: 'text-warning' },
  { icon: BarChart3, label: 'Analyzing spending', color: 'text-success' },
  { icon: Lightbulb, label: 'Generating recommendations', color: 'text-accent' },
  { icon: Check, label: 'Complete', color: 'text-success' },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export function UploadPage() {
  const navigate = useNavigate();
  const { insert } = useTransactions();
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [createdCount, setCreatedCount] = useState(0);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, size: f.size, type: f.type }));
    setFiles((prev) => [...prev, ...next]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const start = () => {
    if (files.length === 0) return;
    setStage('uploading');
    setProgress(0);
    const up = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(up);
          runProcessing();
          return 100;
        }
        return p + 4;
      });
    }, 40);
  };

  const runProcessing = () => {
    setStage('processing');
    setActiveStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), i * 850);
    });
    setTimeout(async () => {
      // Simulate AI extraction: create one transaction per uploaded file
      let count = 0;
      for (const f of files) {
        const vendor = SAMPLE_VENDORS[Math.floor(Math.random() * SAMPLE_VENDORS.length)];
        const category = SAMPLE_CATEGORIES[Math.floor(Math.random() * SAMPLE_CATEGORIES.length)];
        const amount = Math.round(200 + Math.random() * 4000);
        const vat = Math.round(amount * 0.2);
        try {
          await insert({
            vendor,
            amount,
            vat,
            category,
            status: 'pending',
            source: f.name.endsWith('.csv') ? 'csv' : f.name.match(/\.pdf|\.docx$/i) ? 'invoice' : 'receipt',
            confidence: 0.7 + Math.random() * 0.28,
            date: new Date().toISOString().slice(0, 10),
          });
          count++;
        } catch { /* ignore individual failures */ }
      }
      setCreatedCount(count);
      setStage('done');
    }, steps.length * 850 + 600);
  };

  const reset = () => {
    setStage('idle');
    setFiles([]);
    setProgress(0);
    setActiveStep(-1);
    setCreatedCount(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Upload</h1>
        <p className="mt-1 text-sm text-text-2">Upload receipts, invoices, or CSV files. AI will extract, analyze, and flag issues automatically.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dropzone */}
        <Card glow className="lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition',
              dragging ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/2',
            )}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.csv,.txt,.docx,.png,.jpg,.jpeg"
              className="hidden"
              id="file-input"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
                <Upload size={26} className="text-white" />
              </div>
            </div>
            <p className="mt-5 text-base font-semibold text-white">Drag & drop files here</p>
            <p className="mt-1 text-sm text-text-2">or click to browse — PDF, CSV, TXT, DOCX, PNG, JPG</p>
            <label htmlFor="file-input" className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-btn bg-white/8 px-5 text-sm font-medium text-white transition hover:bg-white/12">
              <Upload size={16} /> Browse files
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {files.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3"
                  >
                    <FileIconType name={f.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{f.name}</p>
                      <p className="text-xs text-muted">{(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {stage === 'idle' && (
                      <button onClick={() => setFiles((fs) => fs.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-white">
                        <X size={16} />
                      </button>
                    )}
                    {stage === 'done' && <Check size={18} className="text-success" />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {stage === 'uploading' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-2">Uploading…</span>
                <span className="font-semibold text-white">{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${progress}%` }} transition={{ ease: 'linear' }} />
              </div>
            </div>
          )}

          {stage === 'idle' && files.length > 0 && (
            <div className="mt-5 flex gap-2">
              <Button onClick={start} leftIcon={<Sparkles size={16} />}>Process with AI</Button>
              <Button variant="ghost" onClick={() => setFiles([])}>Clear</Button>
            </div>
          )}
        </Card>

        {/* Side info */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-white">Supported types</h3>
            <div className="mt-3 space-y-2">
              {[
                { icon: FileText, label: 'Receipts', desc: 'PNG, JPG, PDF' },
                { icon: FileText, label: 'Invoices', desc: 'PDF, DOCX' },
                { icon: FileSpreadsheet, label: 'CSV / TXT', desc: 'Bulk import' },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-accent"><t.icon size={16} /></span>
                  <div>
                    <p className="text-sm font-medium text-white">{t.label}</p>
                    <p className="text-xs text-muted">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-primary/15 to-accent/10">
            <Sparkles size={18} className="text-accent" />
            <p className="mt-2 text-sm font-semibold text-white">AI auto-processing</p>
            <p className="mt-1 text-xs leading-relaxed text-text-2">Every upload is read, categorized, VAT-calculated, and checked for duplicates — then queued for your review.</p>
          </Card>
        </div>
      </div>

      {/* Processing animation */}
      <AnimatePresence>
        {(stage === 'processing' || stage === 'done') && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card glow className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <h3 className="text-sm font-bold text-white">AI Processing Workflow</h3>
                </div>
                {stage === 'done' && <Button size="sm" variant="ghost" onClick={reset}>Upload more</Button>}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {steps.map((s, i) => {
                  const state = activeStep > i || stage === 'done' ? 'done' : activeStep === i ? 'active' : 'pending';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition',
                        state === 'done' ? 'border-success/30 bg-success/5' : state === 'active' ? 'border-accent/40 bg-accent/5' : 'border-white/8 bg-white/2',
                      )}
                    >
                      {state === 'active' && <span className="absolute inset-0 rounded-xl ring-2 ring-accent/30 animate-pulse-ring" />}
                      <span className={cn('grid h-10 w-10 place-items-center rounded-xl', state === 'done' ? 'bg-success/15' : state === 'active' ? 'bg-accent/15' : 'bg-white/5')}>
                        {state === 'done' ? <Check size={18} className="text-success" /> : <s.icon size={18} className={s.color} />}
                      </span>
                      <p className={cn('text-xs font-medium', state === 'pending' ? 'text-muted' : 'text-white')}>{s.label}</p>
                    </motion.div>
                  );
                })}
              </div>
              {stage === 'done' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-xl border border-success/30 bg-success/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/15"><Check size={20} className="text-success" /></span>
                    <div>
                      <p className="text-sm font-semibold text-white">Processing complete</p>
                      <p className="text-xs text-text-2">{createdCount} transaction{createdCount === 1 ? '' : 's'} extracted and queued for review.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigate('/transactions')}>Review transactions</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/copilot')}>View recommendations</Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileIconType({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const Icon = ext === 'csv' ? FileSpreadsheet : FileText;
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-accent"><Icon size={16} /></span>;
}

export { formatCurrency };
