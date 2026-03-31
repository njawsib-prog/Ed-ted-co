'use client';

import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, Spinner, Badge, Button } from '@/components/ui';
import apiClient from '@/lib/apiClient';

interface Course {
  id: string;
  title: string;
  description?: string;
  duration_months?: number;
  fee?: number;
  is_active: boolean;
  created_at: string;
}

interface CreateCourseForm {
  title: string;
  description: string;
  duration_months: string;
  fee: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [form, setForm] = useState<CreateCourseForm>({ title: '', description: '', duration_months: '', fee: '' });

  const fetchCourses = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await apiClient.get('/api/super-admin/courses', {
        params: { page, limit: 20, search: search || undefined },
      });
      setCourses(res.data.courses || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setFetchError('Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openCreate = () => {
    setEditCourse(null);
    setForm({ title: '', description: '', duration_months: '', fee: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      title: course.title,
      description: course.description || '',
      duration_months: course.duration_months?.toString() || '',
      fee: course.fee?.toString() || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        duration_months: form.duration_months ? Number(form.duration_months) : undefined,
        fee: form.fee ? Number(form.fee) : undefined,
      };
      if (editCourse) {
        await apiClient.put(`/api/super-admin/courses/${editCourse.id}`, payload);
      } else {
        await apiClient.post('/api/super-admin/courses', payload);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setFormError(error.response?.data?.error || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (course: Course) => {
    setActionError('');
    try {
      await apiClient.put(`/api/super-admin/courses/${course.id}`, { is_active: !course.is_active });
      fetchCourses();
    } catch {
      setActionError('Failed to update course status. Please try again.');
    }
  };

  return (
    <SuperAdminLayout title="Courses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-sm text-gray-500">{total} courses total</p>
          </div>
          <Button onClick={openCreate}>+ Add Course</Button>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search courses..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.length === 0 ? (
              <p className="text-gray-500 col-span-3 text-center py-8">No courses found</p>
            ) : (
              courses.map((course) => (
                <Card key={course.id}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <Badge variant={course.is_active ? 'success' : 'danger'}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    {course.duration_months && <span>⏱ {course.duration_months} months</span>}
                    {course.fee && <span>₹{Number(course.fee).toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(course)} className="text-sm text-primary hover:underline">Edit</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleToggleActive(course)} className="text-sm text-gray-500 hover:underline">
                      {course.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{editCourse ? 'Edit Course' : 'Create Course'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {formError && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration (months)</label>
                  <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fee (₹)</label>
                  <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editCourse ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
