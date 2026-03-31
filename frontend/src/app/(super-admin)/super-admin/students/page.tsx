'use client';

import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, Spinner, Badge } from '@/components/ui';
import apiClient from '@/lib/apiClient';

interface Student {
  id: string;
  name: string;
  student_code: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  defaulter_flag: boolean;
  enrollment_date?: string;
  branches?: { id: string; name: string; location?: string };
  courses?: { id: string; title: string };
}

interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  defaulters: number;
  newThisMonth: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/api/super-admin/students/stats');
      setStats(res.data);
    } catch {
      // silent
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await apiClient.get('/api/super-admin/students', {
        params: { page, limit: 20, search: search || undefined, status: statusFilter || undefined },
      });
      setStudents(res.data.students || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setFetchError('Failed to load students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const statusVariant = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'suspended') return 'danger';
    return 'default';
  };

  return (
    <SuperAdminLayout title="Students">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">{total} students</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500">Suspended</p>
              <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500">Defaulters</p>
              <p className="text-2xl font-bold text-orange-600">{stats.defaulters}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2 flex-wrap">
            {(['', 'active', 'inactive', 'suspended'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {fetchError && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-4 py-3">{fetchError}</p>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defaulter</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No students found</td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          {student.email && <p className="text-xs text-gray-500">{student.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{student.student_code}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.branches?.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.courses?.title || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(student.status)}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {student.defaulter_flag ? (
                            <Badge variant="danger">Yes</Badge>
                          ) : (
                            <span className="text-sm text-gray-400">No</span>
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
