'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  responseCount: number;
  createdAt: string;
}

interface FeedbackResponse {
  id: string;
  studentName: string;
  submittedAt: string;
  answers: { question: string; answer: string }[];
  rating: number | null;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newForm, setNewForm] = useState({ title: '', description: '' });

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/feedback/forms', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setForms(data.data.forms || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching feedback forms:', err);
      setError('Failed to load feedback forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const fetchResponses = useCallback(async (formId: string) => {
    setLoadingResponses(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/feedback/forms/${formId}/responses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setResponses(data.data.responses || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching responses:', err);
    } finally {
      setLoadingResponses(false);
    }
  }, []);

  const handleSelectForm = (form: FeedbackForm) => {
    setSelectedForm(form);
    fetchResponses(form.id);
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/feedback/forms', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewForm({ title: '', description: '' });
        fetchForms();
      }
    } catch (err) {
      console.error('Error creating form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = (resps: FeedbackResponse[]) => {
    const withRating = resps.filter((r) => r.rating !== null);
    if (withRating.length === 0) return null;
    return (withRating.reduce((sum, r) => sum + (r.rating ?? 0), 0) / withRating.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
                <p className="text-sm text-gray-500 mt-1">Manage feedback forms and view student responses</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Create Form
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forms List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{forms.length} form(s)</p>
                </div>
                {forms.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">No feedback forms</p>
                    <button onClick={() => setShowCreateModal(true)} className="mt-3 text-xs text-indigo-600 hover:underline">
                      Create one
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {forms.map((form) => (
                      <button
                        key={form.id}
                        onClick={() => handleSelectForm(form)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedForm?.id === form.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{form.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{form.description}</p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {form.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{form.responseCount} responses</span>
                          <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Responses Panel */}
            <div className="lg:col-span-2">
              {!selectedForm ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">Select a form to view responses</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedForm.title}</h2>
                        <p className="text-sm text-gray-500">{selectedForm.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{responses.length}</p>
                        <p className="text-xs text-gray-400">responses</p>
                        {avgRating(responses) && (
                          <p className="text-sm font-medium text-yellow-600">⭐ {avgRating(responses)}/5</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    {loadingResponses ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : responses.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p>No responses yet for this form</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {responses.map((resp) => (
                          <div key={resp.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{resp.studentName}</p>
                                <p className="text-xs text-gray-400">{new Date(resp.submittedAt).toLocaleString()}</p>
                              </div>
                              {resp.rating && (
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < resp.rating! ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {resp.answers?.map((ans, i) => (
                              <div key={i} className="mt-2">
                                <p className="text-xs font-medium text-gray-600">{ans.question}</p>
                                <p className="text-sm text-gray-700 mt-0.5">{ans.answer}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Feedback Form</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title *</label>
                <input
                  required
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. End of Term Feedback"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  placeholder="Brief description of this feedback form..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
