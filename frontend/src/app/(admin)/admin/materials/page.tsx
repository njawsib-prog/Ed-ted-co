'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Material {
  id: string;
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'doc' | 'link';
  batchName: string;
  uploadedAt: string;
  downloadCount: number;
  size: string;
  fileUrl: string;
}

interface MaterialFormData {
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'doc' | 'link';
  batchName: string;
  fileUrl: string;
  size: string;
}

const defaultForm: MaterialFormData = {
  title: '',
  subject: '',
  type: 'pdf',
  batchName: '',
  fileUrl: '',
  size: '',
};

export default function AdminMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterSubject !== 'all') params.set('subject', filterSubject);
      if (filterType !== 'all') params.set('type', filterType);
      const response = await fetch(`/api/admin/materials?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const list: Material[] = data.data.materials || data.data || [];
        setMaterials(list);
        const uniqueSubjects = [...new Set(list.map((m) => m.subject).filter(Boolean))];
        setSubjects(uniqueSubjects);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterType]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const openCreate = () => {
    setEditingMaterial(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({ title: m.title, subject: m.subject, type: m.type, batchName: m.batchName, fileUrl: m.fileUrl, size: m.size });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingMaterial ? `/api/admin/materials/${editingMaterial.id}` : '/api/admin/materials';
      const method = editingMaterial ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        fetchMaterials();
      }
    } catch (err) {
      console.error('Error saving material:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchMaterials();
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { pdf: '📄', video: '🎥', doc: '📝', link: '🔗' };
    return icons[type] || '📁';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-100 text-red-700',
      video: 'bg-purple-100 text-purple-700',
      doc: 'bg-blue-100 text-blue-700',
      link: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const filtered = materials.filter((m) => {
    const matchSearch =
      searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = filterSubject === 'all' || m.subject === filterSubject;
    const matchType = filterType === 'all' || m.type === filterType;
    return matchSearch && matchSubject && matchType;
  });

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
                <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
                <p className="text-sm text-gray-500 mt-1">Upload and manage learning resources</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Upload Material
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="doc">Document</option>
            <option value="link">Link</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg font-medium">No materials found</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              + Upload Material
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Downloads</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(material.type)}</span>
                        <span className="text-sm font-medium text-gray-900">{material.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getTypeColor(material.type)}`}>
                        {material.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.batchName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.downloadCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.size || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {material.uploadedAt ? new Date(material.uploadedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {material.fileUrl && (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            View
                          </a>
                        )}
                        <button onClick={() => openEdit(material)} className="text-xs text-gray-600 hover:text-gray-900">Edit</button>
                        <button onClick={() => handleDelete(material.id)} className="text-xs text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editingMaterial ? 'Edit Material' : 'Upload Material'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Material title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialFormData['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="doc">Document</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <input
                  type="text"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Batch name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL / Link *</label>
                <input
                  required
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. 2.5 MB"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingMaterial ? 'Update' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
