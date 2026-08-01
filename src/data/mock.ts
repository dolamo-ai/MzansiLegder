export type TxStatus = 'reviewed' | 'pending' | 'flagged' | 'duplicate';
export type TxCategory =
  | 'Software'
  | 'Marketing'
  | 'Office'
  | 'Travel'
  | 'Utilities'
  | 'Payroll'
  | 'Legal'
  | 'Hardware';

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
  duplicateOf?: string;
}

export const transactions: Transaction[] = [
  { id: 'TX-10421', vendor: 'Figma, Inc.', date: '2026-07-29', amount: 2400, vat: 480, category: 'Software', status: 'reviewed', source: 'invoice', confidence: 0.98 },
  { id: 'TX-10422', vendor: 'WeWork', date: '2026-07-28', amount: 3200, vat: 640, category: 'Office', status: 'reviewed', source: 'invoice', confidence: 0.95 },
  { id: 'TX-10423', vendor: 'Google Ads', date: '2026-07-27', amount: 1850, vat: 370, category: 'Marketing', status: 'pending', source: 'csv', confidence: 0.82 },
  { id: 'TX-10424', vendor: 'United Airlines', date: '2026-07-26', amount: 1240, vat: 248, category: 'Travel', status: 'flagged', source: 'receipt', confidence: 0.71 },
  { id: 'TX-10425', vendor: 'AWS', date: '2026-07-25', amount: 4120, vat: 824, category: 'Software', status: 'reviewed', source: 'invoice', confidence: 0.99 },
  { id: 'TX-10426', vendor: 'Staples', date: '2026-07-24', amount: 320, vat: 64, category: 'Office', status: 'pending', source: 'receipt', confidence: 0.88 },
  { id: 'TX-10427', vendor: 'Google Ads', date: '2026-07-24', amount: 1850, vat: 370, category: 'Marketing', status: 'duplicate', source: 'csv', confidence: 0.9, duplicateOf: 'TX-10423' },
  { id: 'TX-10428', vendor: 'Pacific Gas & Electric', date: '2026-07-23', amount: 640, vat: 128, category: 'Utilities', status: 'reviewed', source: 'invoice', confidence: 0.96 },
  { id: 'TX-10429', vendor: 'Gusto', date: '2026-07-22', amount: 12800, vat: 0, category: 'Payroll', status: 'reviewed', source: 'invoice', confidence: 0.99 },
  { id: 'TX-10430', vendor: 'Cooley LLP', date: '2026-07-21', amount: 4500, vat: 900, category: 'Legal', status: 'pending', source: 'invoice', confidence: 0.84 },
  { id: 'TX-10431', vendor: 'Dell Technologies', date: '2026-07-20', amount: 3200, vat: 640, category: 'Hardware', status: 'reviewed', source: 'invoice', confidence: 0.97 },
  { id: 'TX-10432', vendor: 'Slack', date: '2026-07-19', amount: 720, vat: 144, category: 'Software', status: 'reviewed', source: 'invoice', confidence: 0.98 },
  { id: 'TX-10433', vendor: 'Lyft Business', date: '2026-07-18', amount: 210, vat: 42, category: 'Travel', status: 'flagged', source: 'receipt', confidence: 0.66 },
  { id: 'TX-10434', vendor: 'Notion Labs', date: '2026-07-17', amount: 960, vat: 192, category: 'Software', status: 'reviewed', source: 'invoice', confidence: 0.97 },
  { id: 'TX-10435', vendor: 'HubSpot', date: '2026-07-16', amount: 3600, vat: 720, category: 'Marketing', status: 'pending', source: 'invoice', confidence: 0.89 },
  { id: 'TX-10436', vendor: 'Verizon Business', date: '2026-07-15', amount: 410, vat: 82, category: 'Utilities', status: 'reviewed', source: 'invoice', confidence: 0.95 },
];

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
    detail: 'TX-10423 and TX-10427 are identical $1,850 charges 3 days apart. One appears to be a duplicate billing.',
    amount: 1850,
    severity: 'high',
  },
  {
    id: 'INS-2',
    type: 'savings',
    title: 'Switch to annual Figma billing',
    detail: 'You pay $2,400/mo on monthly billing. Annual would save ~20% — about $576/yr.',
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
  'Summarize my VAT exposure for Q3',
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
      "Hi! I'm your CostPilot AI copilot. I've analyzed your latest 16 transactions and found 1 duplicate, 2 savings opportunities, and 1 budget risk. What would you like to look at first?",
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
  { id: 'A1', title: 'Duplicate charge flagged', detail: 'Google Ads TX-10427 duplicates TX-10423 ($1,850).', level: 'danger', createdAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: 'A2', title: 'Budget exceeded', detail: 'Marketing category is at 108% of monthly budget.', level: 'warning', createdAt: new Date(Date.now() - 7200_000).toISOString() },
  { id: 'A3', title: 'Receipt uploaded', detail: 'United Airlines receipt processed and ready for review.', level: 'info', createdAt: new Date(Date.now() - 86400_000).toISOString() },
];
