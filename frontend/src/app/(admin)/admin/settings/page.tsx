'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GeneralSettings {
  instituteName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  timezone: string;
  academicYear: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  isActive: boolean;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
}

type ActiveTab = 'general' | 'subjects' | 'faculty' | 'holidays' | 'email';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    instituteName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logo: '',
    timezone: 'Asia/Kolkata',
    academicYear: '',
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [emailTemplate, setEmailTemplate] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const s = data.data;
        setGeneralSettings({
          instituteName: s.instituteName || '',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          website: s.website || '',
          logo: s.logo || '',
          timezone: s.timezone || 'Asia/Kolkata',
          academicYear: s.academicYear || '',
        });
        setEmailTemplate(s.emailTemplate || '');
        setHolidays(s.holidays || []);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subjects', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setSubjects(data.data.subjects || data.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  }, []);

  const fetchFaculty = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/faculty', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setFaculty(data.data.faculty || data.data || []);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchSubjects();
    fetchFaculty();
  }, [fetchSettings, fetchSubjects, fetchFaculty]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettings),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Settings saved successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'holidays', label: 'Holidays' },
    { id: 'email', label: 'Email Templates' },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage institute settings and configurations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* General Tab */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral} className="p-6 space-y-5">
                <h3 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-100">Institute Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
                    <input
                      type="text"
                      value={generalSettings.instituteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, instituteName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={generalSettings.website}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      rows={2}
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={generalSettings.academicYear}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, academicYear: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="e.g. 2024-25"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Subjects Tab */}
            {activeTab === 'subjects' && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Subjects</h3>
                {subjects.length === 0 ? (
                  <p className="text-gray-400 text-sm">No subjects configured</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Code</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {subjects.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="py-2 px-3 font-mono text-xs text-indigo-600">{sub.code}</td>
                            <td className="py-2 px-3 font-medium text-gray-900">{sub.name}</td>
                            <td className="py-2 px-3 text-gray-500">{sub.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Faculty Tab */}
            {activeTab === 'faculty' && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Faculty Members</h3>
                {faculty.length === 0 ? (
                  <p className="text-gray-400 text-sm">No faculty configured</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {faculty.map((f) => (
                      <div key={f.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{f.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {f.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{f.email}</p>
                        {f.phone && <p className="text-sm text-gray-500">{f.phone}</p>}
                        {f.subjects?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {f.subjects.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Holidays Tab */}
            {activeTab === 'holidays' && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Holidays & Closures</h3>
                {holidays.length === 0 ? (
                  <p className="text-gray-400 text-sm">No holidays configured</p>
                ) : (
                  <div className="space-y-2">
                    {holidays.map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{h.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{h.type}</p>
                        </div>
                        <p className="text-sm text-gray-600">{new Date(h.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Email Templates Tab */}
            {activeTab === 'email' && (
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Email Templates</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Email Template</label>
                  <textarea
                    rows={10}
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    placeholder="Enter email template HTML..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Use {'{{studentName}}'}, {'{{message}}'} as placeholders.</p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const token = localStorage.getItem('token');
                        await fetch('/api/admin/settings', {
                          method: 'PUT',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ emailTemplate }),
                        });
                        setSuccessMsg('Email template saved');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      } catch (err) {
                        console.error('Error saving email template:', err);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
