export type TxStatus = 'reviewed' | 'pending' | 'flagged' | 'duplicate';
export type TxCategory =
  | 'Software'
  | 'Marketing'
  | 'Office'
  | 'Travel'
  | 'Utilities'
  | 'Payroll'
  | 'Legal'
  | 'Hardware'
  | 'Rent'
  | 'Office Supplies'
  | 'Other';

export interface Transaction {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  vat: number;
  category: TxCategory;
  status: TxStatus;
  source: 'receipt' | 'invoice' | 'csv' | 'manual';
  confidence: number;
  duplicate_of?: string | null;
  notes?: string | null;
}

export const kpis = {
  totalExpenses: 184320,
  invoices: 47,
  potentialSavings: 12840,
  vat: 24680,
};

export const expenseTrend = [
  { month: 'Jan', expenses: 14200, budget: 16000 },
  { month: 'Feb', expenses: 15800, budget: 16000 },
  { month: 'Mar', expenses: 13900, budget: 16000 },
  { month: 'Apr', expenses: 17100, budget: 16000 },
  { month: 'May', expenses: 15200, budget: 16000 },
  { month: 'Jun', expenses: 18400, budget: 16000 },
  { month: 'Jul', expenses: 16700, budget: 16000 },
];

export const categoryBreakdown = [
  { name: 'Software', value: 38400, color: '#2563EB' },
  { name: 'Payroll', value: 38400, color: '#7C3AED' },
  { name: 'Marketing', value: 21600, color: '#06B6D4' },
  { name: 'Office', value: 12800, color: '#10B981' },
  { name: 'Travel', value: 6400, color: '#F59E0B' },
  { name: 'Legal', value: 4500, color: '#EF4444' },
];

export const cashFlow = [
  { week: 'W1', inflow: 42000, outflow: 28000 },
  { week: 'W2', inflow: 38000, outflow: 31000 },
  { week: 'W3', inflow: 51000, outflow: 34000 },
  { week: 'W4', inflow: 44000, outflow: 29000 },
];

export const budgetUsage = [
  { name: 'Software', used: 38400, limit: 45000 },
  { name: 'Marketing', used: 21600, limit: 20000 },
  { name: 'Office', used: 12800, limit: 15000 },
  { name: 'Travel', used: 6400, limit: 8000 },
  { name: 'Legal', used: 4500, limit: 10000 },
];

export interface AIInsight {
  id: string;
  type: 'duplicate' | 'savings' | 'budget' | 'risk' | 'recommendation';
  title: string;
  detail: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high';
}

export const aiInsights: AIInsight[] = [
  {
    id: 'INS-1',
    type: 'duplicate',
    title: 'Duplicate Google Ads charge detected',
    detail: 'TX-10423 and TX-10427 are identical R1,850 charges 3 days apart. One appears to be a duplicate billing.',
    amount: 1850,
    severity: 'high',
  },
  {
    id: 'INS-2',
    type: 'savings',
    title: 'Switch to annual Figma billing',
    detail: 'You pay R2,400/mo on monthly billing. Annual would save ~20% — about R5,760/yr.',
    amount: 576,
    severity: 'medium',
  },
  {
    id: 'INS-3',
    type: 'budget',
    title: 'Marketing budget exceeded',
    detail: 'Marketing spend is at 108% of the monthly budget. Consider pausing low-performing campaigns.',
    severity: 'high',
  },
  {
    id: 'INS-4',
    type: 'risk',
    title: 'Missing VAT on payroll invoice',
    detail: 'TX-10429 (Gusto) has no VAT recorded. Confirm whether this is a VAT-exempt service.',
    severity: 'medium',
  },
  {
    id: 'INS-5',
    type: 'recommendation',
    title: 'Negotiate AWS reserved instances',
    detail: 'Your AWS spend grew 22% QoQ. Reserved instances could cut compute costs by ~30%.',
    amount: 1236,
    severity: 'low',
  },
];

export const aiScore = 87;

export const suggestedPrompts = [
  'Where am I overspending this month?',
  'Find all duplicate transactions',
  'Summarise my VAT exposure for Q3',
  'Which subscriptions can I cancel?',
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const initialChat: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content:
      "Hi! I'm your Mzansi Ledger AI copilot. I can analyse your transactions, find duplicates, spot savings, and answer financial questions. What would you like to look at?",
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
];

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: TxCategory;
}

export const goals: Goal[] = [
  { id: 'G1', name: 'Reduce software spend', target: 40000, current: 38400, deadline: '2026-12-31', category: 'Software' },
  { id: 'G2', name: 'Keep travel under budget', target: 8000, current: 6400, deadline: '2026-12-31', category: 'Travel' },
  { id: 'G3', name: 'Marketing cap', target: 20000, current: 21600, deadline: '2026-12-31', category: 'Marketing' },
];

export interface Alert {
  id: string;
  title: string;
  detail: string;
  level: 'info' | 'warning' | 'danger';
  createdAt: string;
}

export const alerts: Alert[] = [
  { id: 'A1', title: 'Duplicate charge flagged', detail: 'Google Ads TX-10427 duplicates TX-10423 (R1,850).', level: 'danger', createdAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: 'A2', title: 'Budget exceeded', detail: 'Marketing category is at 108% of monthly budget.', level: 'warning', createdAt: new Date(Date.now() - 7200_000).toISOString() },
  { id: 'A3', title: 'Receipt uploaded', detail: 'United Airlines receipt processed and ready for review.', level: 'info', createdAt: new Date(Date.now() - 86400_000).toISOString() },
];
