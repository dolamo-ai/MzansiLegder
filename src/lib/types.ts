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
export type TxSource = 'receipt' | 'invoice' | 'csv' | 'manual';

export interface Transaction {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  vat: number;
  category: TxCategory;
  status: TxStatus;
  source: TxSource;
  confidence: number;
  duplicate_of?: string | null;
  notes?: string | null;
}

export interface Invoice {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  status: TxStatus;
  due: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: TxCategory;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
