'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-indigo-100 text-indigo-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
  EXPORT: 'bg-yellow-100 text-yellow-700',
  IMPORT: 'bg-purple-100 text-purple-700',
  VIEW: 'bg-gray-100 text-gray-500',
};

const ENTITY_ICONS: Record<string, string> = {
  student: '👤',
  batch: '📦',
  test: '📝',
  result: '📊',
  attendance: '✅',
  payment: '💰',
  material: '📄',
  notification: '🔔',
  user: '👤',
  settings: '⚙️',
  complaint: '📢',
  feedback: '💬',
};

export default function AdminActivityPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [error, setError] = useState('');

  const itemsPerPage = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (filterAction !== 'all') params.set('action', filterAction);
      if (filterEntity !== 'all') params.set('entityType', filterEntity);

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs || data.data || []);
        setTotalPages(Math.ceil((data.data.total || 0) / itemsPerPage) || 1);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterAction, filterEntity]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action: string) =>
    ACTION_COLORS[action.toUpperCase()] || 'bg-gray-100 text-gray-600';

  const getEntityIcon = (entityType: string) =>
    ENTITY_ICONS[entityType.toLowerCase()] || '📋';

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Get unique entity types from logs for filter
  const entityTypes = [...new Set(logs.map((l) => l.entityType))];

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
                <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-sm text-gray-500 mt-1">Audit trail of all system actions</p>
              </div>
            </div>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search actions, entities, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXPORT">Export</option>
          </select>
          <select
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Entities</option>
            {entityTypes.map((e) => (
              <option key={e} value={e} className="capitalize">{e}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No activity logs found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{filteredLogs.length} entries</p>
                <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="w-full text-left px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">{getEntityIcon(log.entityType)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="text-sm text-gray-700 capitalize">{log.entityType}</span>
                            {log.entityId && (
                              <span className="text-xs text-gray-400 font-mono">#{log.entityId.slice(0, 8)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>by {log.performedBy}</span>
                            <span>•</span>
                            <span title={new Date(log.createdAt).toLocaleString()}>
                              {formatRelativeTime(log.createdAt)}
                            </span>
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expandedLog === log.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded metadata */}
                    {expandedLog === log.id && log.metadata && (
                      <div className="px-4 pb-3 ml-10">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-600 mb-1">Metadata</p>
                          <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 border rounded-lg text-sm ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
