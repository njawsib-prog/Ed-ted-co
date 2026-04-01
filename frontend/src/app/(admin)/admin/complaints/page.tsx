'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ComplaintResponse {
  id: string;
  message: string;
  respondedBy: string;
  createdAt: string;
}

interface Complaint {
  id: string;
  studentName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  responses: ComplaintResponse[];
}

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterPriority !== 'all') params.set('priority', filterPriority);
      const response = await fetch(`/api/admin/complaints?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data.complaints || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusUpdate = async (id: string, status: Complaint['status']) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      fetchComplaints();
      if (selectedComplaint?.id === id) {
        setSelectedComplaint((prev) => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Error updating complaint status:', err);
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !responseText.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/complaints/${selectedComplaint.id}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: responseText }),
      });
      const data = await response.json();
      if (data.success) {
        setResponseText('');
        fetchComplaints();
        // Refresh selected complaint responses
        setSelectedComplaint((prev) =>
          prev ? {
            ...prev,
            responses: [...(prev.responses || []), data.data],
            status: 'in_progress',
          } : null
        );
      }
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      searchQuery === '' ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    open: complaints.filter((c) => c.status === 'open').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    high: complaints.filter((c) => c.priority === 'high').length,
  };

  return (
    <>
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
                <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and respond to student complaints</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open', value: stats.open, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'In Progress', value: stats.in_progress, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'High Priority', value: stats.high, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by student or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaints List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-medium text-gray-700">{filtered.length} complaints</p>
              </div>
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No complaints found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {filtered.map((complaint) => (
                    <button
                      key={complaint.id}
                      onClick={() => setSelectedComplaint(complaint)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedComplaint?.id === complaint.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{complaint.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{complaint.studentName}</p>
                        </div>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {complaint.responses?.length > 0 && (
                        <p className="text-xs text-indigo-600 mt-1">{complaint.responses.length} response(s)</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            {selectedComplaint ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedComplaint.subject}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">by {selectedComplaint.studentName}</p>
                  </div>
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusUpdate(selectedComplaint.id, e.target.value as Complaint['status'])}
                    className="text-sm px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                  {/* Original complaint */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-700">{selectedComplaint.description}</p>
                  </div>
                  {/* Responses */}
                  {selectedComplaint.responses?.map((r) => (
                    <div key={r.id} className="bg-indigo-50 rounded-lg p-3 ml-4">
                      <div className="flex justify-between text-xs text-indigo-600 mb-1">
                        <span className="font-medium">{r.respondedBy} (Admin)</span>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{r.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <form onSubmit={handleRespond}>
                    <textarea
                      rows={3}
                      placeholder="Type your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !responseText.trim()}
                      className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send Response'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-64">
                <div className="text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-sm">Select a complaint to view details</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
