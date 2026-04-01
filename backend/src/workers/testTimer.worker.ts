import { Job } from 'bullmq';
import { supabaseAdmin } from '../db/supabaseAdmin';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const SESSION_PREFIX = 'test_session:';

// Calculate score logic (extracted from testEngine.controller for reuse)
const calculateScore = async (testId: string, answers: any) => {
  const { data: test } = await supabaseAdmin
    .from('tests')
    .select('id, totalMarks, passingMarks, settings, negativeMarking, negativeMarkValue')
    .eq('id', testId)
    .single();

  const { data: questions } = await supabaseAdmin
    .from('questions')
    .select('id, correctOption, marks, negativeMarks, type')
    .eq('testId', testId);

  let score = 0;
  let totalMarks = 0;
  const answerRecords: any[] = [];

  questions?.forEach((question: any) => {
    totalMarks += question.marks;
    const userAnswer = answers[question.id];

    if (userAnswer) {
      let isCorrect = false;
      let marksObtained = 0;

      if (question.type === 'mcq' || question.type === 'single_choice') {
        isCorrect = userAnswer.answer === question.correctOption;
        marksObtained = isCorrect ? question.marks : 0;

        if (!isCorrect && test?.negativeMarking) {
          marksObtained = -(question.negativeMarks || test.negativeMarkValue || 0);
        }
      } else if (question.type === 'multiple_choice') {
        const correctOptions = question.correctOption as string[];
        const selectedOptions = userAnswer.answer as string[];
        const correctCount = selectedOptions.filter((o: string) => correctOptions.includes(o)).length;
        const incorrectCount = selectedOptions.filter((o: string) => !correctOptions.includes(o)).length;

        isCorrect = correctCount === correctOptions.length && incorrectCount === 0;
        marksObtained = isCorrect
          ? question.marks
          : (correctCount / correctOptions.length) * question.marks;
      } else if (question.type === 'true_false') {
        isCorrect = userAnswer.answer === question.correctOption;
        marksObtained = isCorrect ? question.marks : 0;
      }

      score += marksObtained;

      answerRecords.push({
        questionId: question.id,
        selectedOption: userAnswer.answer,
        isCorrect,
        marksObtained: Math.max(0, marksObtained),
        timeSpent: userAnswer.timeSpent || 0,
      });
    } else {
      answerRecords.push({
        questionId: question.id,
        selectedOption: null,
        isCorrect: false,
        marksObtained: 0,
        timeSpent: 0,
      });
    }
  });

  score = Math.max(0, score);
  const percentage = (score / totalMarks) * 100;
  const status = percentage >= (test?.passingMarks || 40) ? 'passed' : 'failed';

  return { score, totalMarks, percentage, status, answerRecords };
};

// Auto-submit test when timer expires
const testTimerWorker = async (job: Job) => {
  const { studentId, testId } = job.data;

  console.log(`🕐 Auto-submitting test ${testId} for student ${studentId}`);

  try {
    // Get session from Redis
    const sessionData = await redis.get(`${SESSION_PREFIX}${studentId}:${testId}`);
    if (!sessionData) {
      console.warn(`⚠️  No active session found for student ${studentId}, test ${testId}`);
      return { status: 'no_session' };
    }

    const session = JSON.parse(sessionData);

    // Calculate score using saved answers
    const { score, totalMarks, percentage, status, answerRecords } = await calculateScore(
      testId,
      session.answers
    );

    // Get student info
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id, branchId, userId')
      .eq('id', studentId)
      .single();

    if (!student) {
      throw new Error('Student not found');
    }

    // Get batch ID
    const { data: studentBatch } = await supabaseAdmin
      .from('batch_students')
      .select('batchId')
      .eq('studentId', studentId)
      .limit(1)
      .single();

    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);

    // Create result with auto-submitted flag
    const { data: result, error } = await supabaseAdmin
      .from('results')
      .insert({
        testId,
        studentId,
        branchId: student.branchId,
        batchId: studentBatch?.batchId,
        score,
        totalMarks,
        percentage,
        status,
        timeTaken,
        submittedAt: new Date().toISOString(),
        answers: session.answers,
        autoSubmitted: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create result: ${error.message}`);
    }

    // Save answer records
    if (answerRecords.length > 0) {
      await supabaseAdmin
        .from('result_answers')
        .insert(
          answerRecords.map((a) => ({
            resultId: result.id,
            ...a,
          }))
        );
    }

    // Clear session
    await redis.del(`${SESSION_PREFIX}${studentId}:${testId}`);

    // Update test assignment attempt count
    await supabaseAdmin
      .from('test_assignments')
      .update({
        attempts: session.attempts + 1,
        lastAttemptedAt: new Date().toISOString(),
      })
      .eq('testId', testId)
      .eq('studentId', studentId);

    console.log(`✅ Test ${testId} auto-submitted for student ${studentId}. Score: ${score}/${totalMarks}`);

    // Create notification for student
    await supabaseAdmin.from('notifications').insert({
      branch_id: student.branchId,
      target_type: 'student',
      target_id: studentId,
      title: 'Test Auto-Submitted',
      message: `Your test "${session.test.title}" was automatically submitted due to time expiration. Score: ${score}/${totalMarks}`,
      sent_at: new Date().toISOString(),
    });

    return {
      success: true,
      resultId: result.id,
      score,
      totalMarks,
      percentage,
      status,
    };
  } catch (error) {
    console.error(`❌ Auto-submit failed for test ${testId}, student ${studentId}:`, error);
    throw error;
  }
};

export default testTimerWorker;
