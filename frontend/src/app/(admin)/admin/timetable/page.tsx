'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TimetableEntry {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
}

interface Timetable {
  id: string;
  name: string;
  batchName: string;
  entries: TimetableEntry[];
  createdAt?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminTimetablePage() {
  const router = useRouter();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTimetable, setNewTimetable] = useState({ name: '', batchName: '' });
  const [entries, setEntries] = useState<TimetableEntry[]>([
    { day: 'Monday', startTime: '', endTime: '', subject: '', faculty: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTimetables = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/timetables', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const list: Timetable[] = data.data.timetables || data.data || [];
        setTimetables(list);
        if (list.length > 0) setSelectedTimetable(list[0]);
      }
    } catch (err) {
      console.error('Error fetching timetables:', err);
      setError('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetables();
  }, [fetchTimetables]);

  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/timetables', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTimetable, entries: entries.filter((en) => en.subject) }),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewTimetable({ name: '', batchName: '' });
        setEntries([{ day: 'Monday', startTime: '', endTime: '', subject: '', faculty: '' }]);
        fetchTimetables();
      }
    } catch (err) {
      console.error('Error creating timetable:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const addEntry = () => {
    setEntries([...entries, { day: 'Monday', startTime: '', endTime: '', subject: '', faculty: '' }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof TimetableEntry, value: string) => {
    setEntries(entries.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const groupedEntries = (tt: Timetable) => {
    const grouped: Record<string, TimetableEntry[]> = {};
    DAYS.forEach((d) => { grouped[d] = []; });
    (tt.entries || []).forEach((entry) => {
      if (!grouped[entry.day]) grouped[entry.day] = [];
      grouped[entry.day].push(entry);
    });
    return grouped;
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
                <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
                <p className="text-sm text-gray-500 mt-1">Weekly schedule for all batches</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Create Timetable
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
        ) : timetables.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No timetables found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              + Create Timetable
            </button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">All Timetables</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {timetables.map((tt) => (
                    <button
                      key={tt.id}
                      onClick={() => setSelectedTimetable(tt)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${selectedTimetable?.id === tt.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                    >
                      <p className="text-sm font-medium text-gray-900">{tt.name}</p>
                      <p className="text-xs text-gray-500">{tt.batchName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly View */}
            {selectedTimetable && (
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedTimetable.name}</h2>
                      <p className="text-sm text-gray-500">{selectedTimetable.batchName}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(groupedEntries(selectedTimetable)).map(([day, dayEntries]) => (
                        <div key={day} className={`rounded-lg border p-3 ${dayEntries.length > 0 ? 'border-indigo-100 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                          <p className="text-sm font-semibold text-gray-700 mb-2">{day}</p>
                          {dayEntries.length === 0 ? (
                            <p className="text-xs text-gray-400">No classes</p>
                          ) : (
                            <div className="space-y-2">
                              {dayEntries.map((entry, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm">
                                  <div className="text-xs text-gray-500 font-medium w-24 shrink-0">
                                    {entry.startTime} – {entry.endTime}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{entry.subject}</p>
                                    {entry.faculty && <p className="text-xs text-gray-500">{entry.faculty}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Timetable Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Create Timetable</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateTimetable} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timetable Name *</label>
                  <input
                    required
                    type="text"
                    value={newTimetable.name}
                    onChange={(e) => setNewTimetable({ ...newTimetable, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="e.g. Batch A Schedule"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                  <input
                    required
                    type="text"
                    value={newTimetable.batchName}
                    onChange={(e) => setNewTimetable({ ...newTimetable, batchName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Batch name"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Schedule Entries</label>
                  <button type="button" onClick={addEntry} className="text-xs text-indigo-600 hover:text-indigo-800">+ Add Entry</button>
                </div>
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-center">
                      <select
                        value={entry.day}
                        onChange={(e) => updateEntry(index, 'day', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {DAYS.map((d) => <option key={d} value={d}>{d.slice(0, 3)}</option>)}
                      </select>
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateEntry(index, 'startTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateEntry(index, 'endTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Subject"
                        value={entry.subject}
                        onChange={(e) => updateEntry(index, 'subject', e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          placeholder="Faculty"
                          value={entry.faculty}
                          onChange={(e) => updateEntry(index, 'faculty', e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        {entries.length > 1 && (
                          <button type="button" onClick={() => removeEntry(index)} className="text-red-500 hover:text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Timetable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
