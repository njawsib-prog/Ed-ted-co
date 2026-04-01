import { Request, Response } from 'express';
import { supabaseAdmin } from '../../db/supabaseAdmin';

/**
 * GET /api/admin/students
 */
export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const {
      page = '1',
      limit = '20',
      batch = 'all',
      status = 'all',
      feeStatus = 'all',
      sortBy = 'name',
      sortOrder = 'asc',
      search = '',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('students')
      .select(
        `id, name, email, phone, student_code, status, enrollment_date, defaulter_flag,
         batch_students(batch_id, batches(id, name))`,
        { count: 'exact' }
      )
      .eq('branch_id', branchId);

    if (status !== 'all') query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);

    // Fee status filter: use defaulter_flag as proxy
    if (feeStatus === 'overdue') query = query.eq('defaulter_flag', true);
    else if (feeStatus === 'paid') query = query.eq('defaulter_flag', false);

    // Sorting
    const allowedSortFields: Record<string, string> = {
      name: 'name',
      date: 'enrollment_date',
    };
    const sortField = allowedSortFields[sortBy] ?? 'name';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limitNum - 1);

    const { data: students, error, count } = await query;

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    // Normalise student data for the frontend interface
    const normalised = (students ?? []).map((s: Record<string, unknown>) => {
      const batchStudents = Array.isArray(s.batch_students) ? s.batch_students : [];
      const firstBatch = batchStudents[0] as { batch_id?: string; batches?: { id?: string; name?: string } | { id?: string; name?: string }[] } | undefined;
      const batchInfo = firstBatch
        ? (Array.isArray(firstBatch.batches) ? firstBatch.batches[0] : firstBatch.batches)
        : null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone ?? '',
        rollNumber: s.student_code,
        batchId: (batchInfo as { id?: string } | null)?.id ?? '',
        batchName: (batchInfo as { name?: string } | null)?.name ?? 'Not assigned',
        enrollmentStatus: s.status,
        joiningDate: s.enrollment_date,
        avatar: null,
        lastActive: s.enrollment_date,
        totalTests: 0,
        averageScore: 0,
        attendancePercentage: 0,
        feeStatus: s.defaulter_flag ? 'overdue' : 'paid',
      };
    });

    res.json({
      success: true,
      data: {
        students: normalised,
        total: count ?? 0,
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
};

/**
 * POST /api/admin/students/export
 */
export const exportStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const { status, batch } = req.query as Record<string, string>;

    let query = supabaseAdmin
      .from('students')
      .select('id, name, email, phone, student_code, status, enrollment_date, defaulter_flag')
      .eq('branch_id', branchId);

    if (status && status !== 'all') query = query.eq('status', status);

    const { data: students, error } = await query.order('name', { ascending: true });

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Student Code', 'Status', 'Enrollment Date', 'Defaulter'];
    const rows = (students ?? []).map((s: Record<string, unknown>) => [
      s.id,
      s.name,
      s.email,
      s.phone ?? '',
      s.student_code,
      s.status,
      s.enrollment_date,
      s.defaulter_flag ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ success: false, error: 'Failed to export students' });
  }
};

/**
 * POST /api/admin/students/bulk-action
 */
export const bulkActionStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.user!.branch_id;
    const { action, studentIds } = req.body as { action: string; studentIds: string[] };

    if (!action || !Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ success: false, error: 'action and studentIds are required' });
      return;
    }

    const statusMap: Record<string, string> = {
      activate: 'active',
      deactivate: 'inactive',
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      res.status(400).json({ success: false, error: `Unknown action: ${action}` });
      return;
    }

    const { error } = await supabaseAdmin
      .from('students')
      .update({ status: newStatus })
      .in('id', studentIds)
      .eq('branch_id', branchId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: `${studentIds.length} student(s) updated to ${newStatus}` });
  } catch (error) {
    console.error('Bulk action students error:', error);
    res.status(500).json({ success: false, error: 'Failed to perform bulk action' });
  }
};
