'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'test' | 'holiday' | 'event' | 'deadline' | 'class';
  date: string;
  endDate?: string;
  description?: string;
  batchName?: string;
  location?: string;
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  test: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  holiday: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  event: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  deadline: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  class: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
};

export default function AdminCalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard/events', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.data.events || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(
    (e) => filterType === 'all' || e.type === filterType
  );

  // Group events by month/date
  const groupedByDate = filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dateKey = event.date.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  const today = new Date().toISOString().split('T')[0];

  const upcomingDates = sortedDates.filter((d) => d >= today);
  const pastDates = sortedDates.filter((d) => d < today).reverse();

  const getEventColors = (type: string) =>
    EVENT_TYPE_COLORS[type] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const isToday = dateStr === today;
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return {
      label: date.toLocaleDateString('en-US', options),
      isToday,
    };
  };

  const renderEventList = (dates: string[], emptyMsg: string) => (
    dates.length === 0 ? (
      <p className="text-gray-400 text-sm py-4">{emptyMsg}</p>
    ) : (
      <div className="space-y-6">
        {dates.map((dateStr) => {
          const { label, isToday } = formatDateHeader(dateStr);
          return (
            <div key={dateStr}>
              <div className={`flex items-center gap-3 mb-3 ${isToday ? '' : ''}`}>
                <div className={`text-sm font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {label}
                  {isToday && <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Today</span>}
                </div>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>
              <div className="space-y-2 pl-2">
                {groupedByDate[dateStr].map((event) => {
                  const colors = getEventColors(event.type);
                  return (
                    <div key={event.id} className={`${colors.bg} rounded-lg p-3 flex items-start gap-3`}>
                      <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1.5 shrink-0`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium ${colors.text}`}>{event.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${colors.bg} ${colors.text} border border-current border-opacity-20`}>
                            {event.type}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {event.batchName && (
                            <span className="text-xs text-gray-400">📚 {event.batchName}</span>
                          )}
                          {event.location && (
                            <span className="text-xs text-gray-400">📍 {event.location}</span>
                          )}
                          {event.endDate && (
                            <span className="text-xs text-gray-400">
                              Until {new Date(event.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )
  );

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
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-sm text-gray-500 mt-1">Upcoming tests, holidays, and events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Events</option>
                <option value="test">Tests</option>
                <option value="holiday">Holidays</option>
                <option value="event">Events</option>
                <option value="deadline">Deadlines</option>
                <option value="class">Classes</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(EVENT_TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></div>
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Upcoming Events</h2>
                {renderEventList(upcomingDates, 'No upcoming events')}
              </div>
            </div>

            {/* Sidebar: Stats + Past Events */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
                <div className="space-y-2">
                  {Object.entries(EVENT_TYPE_COLORS).map(([type, colors]) => {
                    const count = filteredEvents.filter((e) => e.type === type).length;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                          <span className="text-sm text-gray-600 capitalize">{type}s</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Past Events */}
              {pastDates.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Past Events</h3>
                  <div className="opacity-60">
                    {renderEventList(pastDates.slice(0, 5), 'No past events')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
