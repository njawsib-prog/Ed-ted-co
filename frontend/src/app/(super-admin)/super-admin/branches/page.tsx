'use client';

import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, Spinner, Badge, Button } from '@/components/ui';
import apiClient from '@/lib/apiClient';

interface Branch {
  id: string;
  name: string;
  location: string;
  contact?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  admins?: Array<{ name: string; email: string }>;
  students?: Array<{ count: number }>;
}

interface CreateBranchForm {
  name: string;
  location: string;
  contact: string;
  email: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [form, setForm] = useState<CreateBranchForm>({
    name: '',
    location: '',
    contact: '',
    email: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const fetchBranches = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await apiClient.get('/api/super-admin/branches', {
        params: { page, limit: 10, search: search || undefined },
      });
      setBranches(res.data.branches || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setFetchError('Failed to load branches. Please try again.');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      await apiClient.post('/api/super-admin/branches', form);
      setShowCreateModal(false);
      setForm({ name: '', location: '', contact: '', email: '', admin_name: '', admin_email: '', admin_password: '' });
      fetchBranches();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setFormError(error.response?.data?.error || 'Failed to create branch');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionError('');
    try {
      await apiClient.patch('/api/super-admin/branches/bulk', {
        ids: [id],
        action: currentStatus ? 'deactivate' : 'activate',
      });
      fetchBranches();
    } catch {
      setActionError('Failed to update branch status. Please try again.');
    }
  };

  return (
    <SuperAdminLayout title="Branches">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
            <p className="text-sm text-gray-500">{total} branches total</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>+ Add Branch</Button>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search branches..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {branches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No branches found</td>
                    </tr>
                  ) : (
                    branches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{branch.name}</p>
                          {branch.email && <p className="text-xs text-gray-500">{branch.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{branch.location || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {branch.admins?.[0]?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {Array.isArray(branch.students) ? branch.students.length : 0}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={branch.is_active ? 'success' : 'danger'}>
                            {branch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(branch.id, branch.is_active)}
                            className="text-sm text-primary hover:underline"
                          >
                            {branch.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {total > 10 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 10)}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= Math.ceil(total / 10)}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Branch</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch Name *</label>
                  <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch Email</label>
                  <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <hr />
              <p className="text-xs font-semibold text-gray-500 uppercase">Admin Account</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Name *</label>
                  <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Email *</label>
                  <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Password *</label>
                  <input required type="password" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Branch'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
