import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Transaction, TxCategory, TxStatus, Invoice, Goal } from '@/lib/types';

export function useTransactions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      setError(error.message);
    } else if (data) {
      setRows(data as Transaction[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const insert = useCallback(async (tx: Omit<Transaction, 'id' | 'user_id'> & { id?: string }) => {
    const id = tx.id ?? `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = { ...tx, id, user_id: user!.id };
    const { data, error } = await supabase.from('transactions').insert(payload).select().single();
    if (error) throw new Error(error.message);
    if (data) setRows((prev) => [data as Transaction, ...prev]);
    return data as Transaction;
  }, [user]);

  const update = useCallback(async (id: string, patch: Partial<Transaction>) => {
    const { data, error } = await supabase.from('transactions').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) setRows((prev) => prev.map((r) => (r.id === id ? (data as Transaction) : r)));
    return data as Transaction;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rows, loading, error, refetch: fetchAll, insert, update, remove };
}

export function useInvoices() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('invoices').select('*').order('date', { ascending: false });
    if (error) setError(error.message);
    else if (data) setRows(data as Invoice[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const insert = useCallback(async (inv: Omit<Invoice, 'id' | 'user_id'> & { id?: string }) => {
    const id = inv.id ?? `INV-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = { ...inv, id, user_id: user!.id };
    const { data, error } = await supabase.from('invoices').insert(payload).select().single();
    if (error) throw new Error(error.message);
    if (data) setRows((prev) => [data as Invoice, ...prev]);
    return data as Invoice;
  }, [user]);

  const update = useCallback(async (id: string, patch: Partial<Invoice>) => {
    const { data, error } = await supabase.from('invoices').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) setRows((prev) => prev.map((r) => (r.id === id ? (data as Invoice) : r)));
    return data as Invoice;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rows, loading, error, refetch: fetchAll, insert, update, remove };
}

export function useGoals() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else if (data) setRows(data as Goal[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const insert = useCallback(async (goal: Omit<Goal, 'id' | 'user_id'> & { id?: string }) => {
    const id = goal.id ?? `G-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = { ...goal, id, user_id: user!.id };
    const { data, error } = await supabase.from('goals').insert(payload).select().single();
    if (error) throw new Error(error.message);
    if (data) setRows((prev) => [data as Goal, ...prev]);
    return data as Goal;
  }, [user]);

  const update = useCallback(async (id: string, patch: Partial<Goal>) => {
    const { data, error } = await supabase.from('goals').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) setRows((prev) => prev.map((r) => (r.id === id ? (data as Goal) : r)));
    return data as Goal;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rows, loading, error, refetch: fetchAll, insert, update, remove };
}

export { TxCategory, TxStatus };
