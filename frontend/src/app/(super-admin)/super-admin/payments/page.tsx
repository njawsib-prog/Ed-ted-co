'use client';

import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, Spinner, Badge, Button } from '@/components/ui';
import apiClient from '@/lib/apiClient';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  mode: string;
  payment_date: string;
  receipt_number?: string;
  transaction_id?: string;
  students?: { name: string; student_code: string; branches?: { name: string } };
  admins?: { name: string };
}

interface Summary {
  total: number;
  pending: number;
  verified: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await apiClient.get('/api/super-admin/payments', {
        params: { page, limit: 20, status: statusFilter || undefined },
      });
      setPayments(res.data.payments || []);
      setSummary(res.data.summary || { total: 0, pending: 0, verified: 0 });
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setFetchError('Failed to load payments. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleVerify = async (id: string) => {
    setActionError('');
    try {
      await apiClient.patch(`/api/super-admin/payments/${id}/verify`);
      fetchPayments();
    } catch {
      setActionError('Failed to verify payment. Please try again.');
    }
  };

  const statusVariant = (status: string) => {
    if (status === 'verified') return 'success';
    if (status === 'rejected') return 'danger';
    return 'warning';
  };

  return (
    <SuperAdminLayout title="Payments">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">{total} records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-gray-900">₹{summary.total.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">₹{summary.pending.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Verified</p>
            <p className="text-2xl font-bold text-green-600">₹{summary.verified.toLocaleString()}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          {(['', 'pending', 'verified', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {fetchError && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-4 py-3">{fetchError}</p>
        )}
        {actionError && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-4 py-3">{actionError}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No payments found</td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{payment.students?.name || '—'}</p>
                          <p className="text-xs text-gray-500">{payment.students?.student_code}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.students?.branches?.name || '—'}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">₹{Number(payment.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{payment.mode}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {payment.status === 'pending' && (
                            <Button size="sm" onClick={() => handleVerify(payment.id)}>Verify</Button>
                          )}
                          {payment.receipt_number && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/super-admin/payments/${payment.id}/receipt`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline ml-2"
                            >
                              Receipt
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {total > 20 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
                  <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
