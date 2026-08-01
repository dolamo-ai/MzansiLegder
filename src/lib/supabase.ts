import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mzansi-ledger-auth',
  },
});

export const AI_COPILOT_URL = `${url}/functions/v1/ai-copilot`;
export const EXTRACT_TX_URL = `${url}/functions/v1/extract-transaction`;
