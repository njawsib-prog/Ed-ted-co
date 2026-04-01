import { Job } from 'bullmq';
import { supabaseAdmin } from '../db/supabaseAdmin';

// Activate scheduled test
const testScheduleWorker = async (job: Job) => {
  const { testId, action } = job.data;

  console.log(`📅 Test schedule job: ${action} test ${testId}`);

  try {
    if (action === 'activate') {
      // Activate test - make it available to students
      const { data: test, error } = await supabaseAdmin
        .from('tests')
        .select('id, title, branchId, settings')
        .eq('id', testId)
        .single();

      if (error || !test) {
        throw new Error('Test not found');
      }

      // Update test status to active
      const { error: updateError } = await supabaseAdmin
        .from('tests')
        .update({
          isActive: true,
          scheduledStart: null,
        })
        .eq('id', testId);

      if (updateError) {
        throw new Error(`Failed to activate test: ${updateError.message}`);
      }

      console.log(`✅ Test ${testId} (${test.title}) is now active`);

      // Create notification for all assigned students
      const { data: assignments } = await supabaseAdmin
        .from('test_assignments')
        .select(`
          studentId,
          student:students(id, userId, name)
        `)
        .eq('testId', testId);

      if (assignments && assignments.length > 0) {
        // Create notification
        await supabaseAdmin.from('notifications').insert({
          branch_id: test.branchId,
          target_type: 'all',
          title: 'Test Now Available',
          message: `The test "${test.title}" is now available. Please attempt it before the scheduled end time.`,
          sent_at: new Date().toISOString(),
        });

        console.log(`📢 Notification sent to ${assignments.length} students`);
      }

      return { success: true, action: 'activated' };
    }

    if (action === 'deactivate') {
      // Deactivate test - end the testing window
      const { data: test, error } = await supabaseAdmin
        .from('tests')
        .select('id, title, branchId')
        .eq('id', testId)
        .single();

      if (error || !test) {
        throw new Error('Test not found');
      }

      // Update test status to inactive
      const { error: updateError } = await supabaseAdmin
        .from('tests')
        .update({
          isActive: false,
          scheduledEnd: null,
        })
        .eq('id', testId);

      if (updateError) {
        throw new Error(`Failed to deactivate test: ${updateError.message}`);
      }

      console.log(`✅ Test ${testId} (${test.title}) has been deactivated`);

      return { success: true, action: 'deactivated' };
    }

    if (action === 'start_all_tests') {
      // Activate all tests scheduled for this branch
      const { branchId } = job.data;

      const { data: tests, error } = await supabaseAdmin
        .from('tests')
        .select('id, title')
        .eq('branchId', branchId)
        .eq('isActive', false)
        .not('settings->scheduledStart', 'is', null)
        .lte('settings->scheduledStart', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to fetch tests: ${error.message}`);
      }

      if (tests && tests.length > 0) {
        for (const test of tests) {
          await supabaseAdmin
            .from('tests')
            .update({
              isActive: true,
              scheduledStart: null,
            })
            .eq('id', test.id);

          console.log(`✅ Activated test: ${test.title}`);
        }

        return { success: true, activated: tests.length };
      }

      return { success: true, activated: 0 };
    }

    if (action === 'end_all_tests') {
      // Deactivate all tests scheduled to end for this branch
      const { branchId } = job.data;

      const { data: tests, error } = await supabaseAdmin
        .from('tests')
        .select('id, title')
        .eq('branchId', branchId)
        .eq('isActive', true)
        .not('settings->scheduledEnd', 'is', null)
        .lte('settings->scheduledEnd', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to fetch tests: ${error.message}`);
      }

      if (tests && tests.length > 0) {
        for (const test of tests) {
          await supabaseAdmin
            .from('tests')
            .update({
              isActive: false,
              scheduledEnd: null,
            })
            .eq('id', test.id);

          console.log(`✅ Deactivated test: ${test.title}`);
        }

        return { success: true, deactivated: tests.length };
      }

      return { success: true, deactivated: 0 };
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error(`❌ Test schedule job failed:`, error);
    throw error;
  }
};

export default testScheduleWorker;
