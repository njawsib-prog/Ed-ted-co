import { Request, Response } from 'express';
import { supabaseAdmin } from '../../db/supabaseAdmin';

function getPeriodStart(period: string): string {
  const now = new Date();
  if (period === 'week') {
    now.setDate(now.getDate() - 7);
  } else if (period === 'quarter') {
    now.setDate(now.getDate() - 90);
  } else {
    // Default: month
    now.setDate(now.getDate() - 30);
  }
  return now.toISOString().split('T')[0];
}

/**
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const period = (req.query.period as string) || 'month';
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const [
      { count: totalStudents },
      { count: activeStudents },
      { count: totalTests },
      { count: upcomingTests },
      { count: totalBatches },
      { count: activeBatches },
      { count: pendingComplaints },
      { data: todayAttData },
    ] = await Promise.all([
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('branch_id', branchId),
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('branch_id', branchId).eq('status', 'active'),
      supabaseAdmin.from('tests').select('*', { count: 'exact', head: true }).eq('branch_id', branchId),
      supabaseAdmin.from('tests').select('*', { count: 'exact', head: true }).eq('branch_id', branchId).gte('scheduled_at', now).eq('is_active', true),
      supabaseAdmin.from('batches').select('*', { count: 'exact', head: true }).eq('branch_id', branchId),
      supabaseAdmin.from('batches').select('*', { count: 'exact', head: true }).eq('branch_id', branchId).eq('is_active', true),
      supabaseAdmin.from('complaints').select('*', { count: 'exact', head: true }).eq('branch_id', branchId).in('status', ['open', 'in_progress']),
      supabaseAdmin.from('attendance').select('status').eq('branch_id', branchId).eq('date', today),
    ]);

    const presentCount = todayAttData?.filter((a: { status: string }) => a.status === 'present').length ?? 0;
    const totalToday = todayAttData?.length ?? 0;
    const attendancePercentage = totalToday > 0 ? Math.round((presentCount / totalToday) * 100) : 0;

    // Count results pending review (submitted but not ranked)
    const periodStart = getPeriodStart(period);
    const { data: testIds } = await supabaseAdmin.from('tests').select('id').eq('branch_id', branchId);
    const ids = testIds?.map((t: { id: string }) => t.id) ?? [];

    let pendingResults = 0;
    if (ids.length > 0) {
      const { count: submittedCount } = await supabaseAdmin
        .from('results')
        .select('*', { count: 'exact', head: true })
        .in('test_id', ids)
        .is('rank', null)
        .gte('submitted_at', periodStart);
      pendingResults = submittedCount ?? 0;
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: totalStudents ?? 0,
          activeStudents: activeStudents ?? 0,
          totalTests: totalTests ?? 0,
          pendingResults,
          todayAttendance: presentCount,
          attendancePercentage,
          totalBatches: totalBatches ?? 0,
          activeBatches: activeBatches ?? 0,
          totalFaculty: 0,
          activeFaculty: 0,
          upcomingTests: upcomingTests ?? 0,
          pendingComplaints: pendingComplaints ?? 0,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};

/**
 * GET /api/admin/dashboard/activity
 */
export const getDashboardActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const activities: Array<{ id: string; type: string; message: string; timestamp: string }> = [];

    const [
      { data: recentResults },
      { data: recentStudents },
      { data: recentPayments },
      { data: recentComplaints },
      { data: recentMaterials },
    ] = await Promise.all([
      supabaseAdmin.from('results').select('id, submitted_at, students(name)').in('test_id', await supabaseAdmin.from('tests').select('id').eq('branch_id', branchId).then(r => r.data?.map((t: { id: string }) => t.id) ?? [])).order('submitted_at', { ascending: false }).limit(5),
      supabaseAdmin.from('students').select('id, name, enrollment_date').eq('branch_id', branchId).order('enrollment_date', { ascending: false }).limit(5),
      supabaseAdmin.from('payments').select('id, amount, payment_date, students(name)').eq('branch_id', branchId).order('payment_date', { ascending: false }).limit(5),
      supabaseAdmin.from('complaints').select('id, title, created_at').eq('branch_id', branchId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('study_materials').select('id, title, created_at').eq('branch_id', branchId).order('created_at', { ascending: false }).limit(5),
    ]);

    recentResults?.forEach((r: { id: string; submitted_at: string; students?: { name?: string } | { name?: string }[] }) => {
      const student = Array.isArray(r.students) ? r.students[0] : r.students;
      activities.push({
        id: `result_${r.id}`,
        type: 'test_submitted',
        message: `${student?.name ?? 'A student'} submitted a test`,
        timestamp: r.submitted_at,
      });
    });

    recentStudents?.forEach((s: { id: string; name: string; enrollment_date: string }) => {
      activities.push({
        id: `student_${s.id}`,
        type: 'student_enrolled',
        message: `${s.name} enrolled`,
        timestamp: s.enrollment_date,
      });
    });

    recentPayments?.forEach((p: { id: string; amount: number; payment_date: string; students?: { name?: string } | { name?: string }[] }) => {
      const student = Array.isArray(p.students) ? p.students[0] : p.students;
      activities.push({
        id: `payment_${p.id}`,
        type: 'payment_received',
        message: `Payment of ₹${p.amount} received from ${student?.name ?? 'a student'}`,
        timestamp: p.payment_date,
      });
    });

    recentComplaints?.forEach((c: { id: string; title: string; created_at: string }) => {
      activities.push({
        id: `complaint_${c.id}`,
        type: 'complaint_filed',
        message: `New complaint: ${c.title}`,
        timestamp: c.created_at,
      });
    });

    recentMaterials?.forEach((m: { id: string; title: string; created_at: string }) => {
      activities.push({
        id: `material_${m.id}`,
        type: 'material_uploaded',
        message: `Study material uploaded: ${m.title}`,
        timestamp: m.created_at,
      });
    });

    // Sort all activities by timestamp descending and limit to 20
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      data: { activities: activities.slice(0, 20) },
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard activity' });
  }
};

/**
 * GET /api/admin/dashboard/events
 */
export const getDashboardEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const now = new Date().toISOString();

    const { data: tests } = await supabaseAdmin
      .from('tests')
      .select('id, title, description, scheduled_at')
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(10);

    const events = (tests ?? []).map((t: { id: string; title: string; description?: string; scheduled_at: string }) => ({
      id: t.id,
      title: t.title,
      type: 'test',
      date: t.scheduled_at,
      description: t.description ?? '',
    }));

    res.json({
      success: true,
      data: { events },
    });
  } catch (error) {
    console.error('Dashboard events error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard events' });
  }
};

/**
 * GET /api/admin/dashboard/performance
 */
export const getDashboardPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const period = (req.query.period as string) || 'month';
    const periodStart = getPeriodStart(period);

    const { data: tests } = await supabaseAdmin
      .from('tests')
      .select('id, title')
      .eq('branch_id', branchId);

    const testIdList = tests?.map((t: { id: string }) => t.id) ?? [];

    if (testIdList.length === 0) {
      res.json({ success: true, data: { performance: [] } });
      return;
    }

    const { data: results } = await supabaseAdmin
      .from('results')
      .select('test_id, score, total, submitted_at')
      .in('test_id', testIdList)
      .gte('submitted_at', periodStart);

    // Group by test
    const byTest: Record<string, { title: string; totalScore: number; totalMax: number; count: number }> = {};
    const testTitleMap: Record<string, string> = {};
    tests?.forEach((t: { id: string; title: string }) => { testTitleMap[t.id] = t.title; });

    results?.forEach((r: { test_id: string; score: number; total: number }) => {
      if (!byTest[r.test_id]) {
        byTest[r.test_id] = { title: testTitleMap[r.test_id] ?? r.test_id, totalScore: 0, totalMax: 0, count: 0 };
      }
      byTest[r.test_id].totalScore += r.score;
      byTest[r.test_id].totalMax += r.total;
      byTest[r.test_id].count++;
    });

    const performance = Object.values(byTest).map((item) => ({
      subject: item.title,
      averageScore: item.totalMax > 0 ? Math.round((item.totalScore / item.totalMax) * 100) : 0,
      testCount: item.count,
      trend: 0,
    }));

    res.json({ success: true, data: { performance } });
  } catch (error) {
    console.error('Dashboard performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch performance data' });
  }
};

/**
 * GET /api/admin/dashboard/attendance
 */
export const getDashboardAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const period = (req.query.period as string) || 'month';
    const periodStart = getPeriodStart(period);
    const today = new Date().toISOString().split('T')[0];

    const { data: records } = await supabaseAdmin
      .from('attendance')
      .select('date, status')
      .eq('branch_id', branchId)
      .gte('date', periodStart)
      .lte('date', today);

    // Group by date
    const byDate: Record<string, { present: number; absent: number }> = {};
    records?.forEach((r: { date: string; status: string }) => {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, absent: 0 };
      if (r.status === 'present') byDate[r.date].present++;
      else byDate[r.date].absent++;
    });

    const trend = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => {
        const total = counts.present + counts.absent;
        return {
          date,
          present: counts.present,
          absent: counts.absent,
          percentage: total > 0 ? Math.round((counts.present / total) * 100) : 0,
        };
      });

    res.json({ success: true, data: { trend } });
  } catch (error) {
    console.error('Dashboard attendance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance trend' });
  }
};
