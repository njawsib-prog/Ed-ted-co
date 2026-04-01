import { Worker } from 'bullmq';
import { bullmqConnection } from '../utils/redisClient';
import testTimerWorker from './testTimer.worker';
import testScheduleWorker from './testSchedule.worker';
import notificationSendWorker from './notificationSend.worker';
import webhookTriggerWorker from './webhookTrigger.worker';

// Initialize all workers
const workers: Worker[] = [];

export const initializeWorkers = () => {
  console.log('🔄 Initializing BullMQ workers...');

  // Test Timer Worker - Auto-submit tests when timer expires
  const testTimerJobWorker = new Worker(
    'test-timer',
    async (job) => {
      await testTimerWorker(job);
    },
    {
      connection: bullmqConnection,
      concurrency: 10,
    }
  );

  testTimerJobWorker.on('completed', (job) => {
    console.log(`✅ Test timer job completed: ${job.id}`);
  });

  testTimerJobWorker.on('failed', (job, err) => {
    console.error(`❌ Test timer job failed: ${job?.id}`, err.message);
  });

  workers.push(testTimerJobWorker);

  // Test Schedule Worker - Activate scheduled tests
  const testScheduleJobWorker = new Worker(
    'test-schedule',
    async (job) => {
      await testScheduleWorker(job);
    },
    {
      connection: bullmqConnection,
      concurrency: 5,
    }
  );

  testScheduleJobWorker.on('completed', (job) => {
    console.log(`✅ Test schedule job completed: ${job.id}`);
  });

  testScheduleJobWorker.on('failed', (job, err) => {
    console.error(`❌ Test schedule job failed: ${job?.id}`, err.message);
  });

  workers.push(testScheduleJobWorker);

  // Notification Send Worker - Send bulk notifications
  const notificationSendJobWorker = new Worker(
    'notification-send',
    async (job) => {
      await notificationSendWorker(job);
    },
    {
      connection: bullmqConnection,
      concurrency: 20,
    }
  );

  notificationSendJobWorker.on('completed', (job) => {
    console.log(`✅ Notification send job completed: ${job.id}`);
  });

  notificationSendJobWorker.on('failed', (job, err) => {
    console.error(`❌ Notification send job failed: ${job?.id}`, err.message);
  });

  workers.push(notificationSendJobWorker);

  // Webhook Trigger Worker - Deliver webhooks with HMAC signatures
  const webhookTriggerJobWorker = new Worker(
    'webhook-trigger',
    async (job) => {
      await webhookTriggerWorker(job);
    },
    {
      connection: bullmqConnection,
      concurrency: 5,
    }
  );

  webhookTriggerJobWorker.on('completed', (job) => {
    console.log(`✅ Webhook trigger job completed: ${job.id}`);
  });

  webhookTriggerJobWorker.on('failed', (job, err) => {
    console.error(`❌ Webhook trigger job failed: ${job?.id}`, err.message);
  });

  workers.push(webhookTriggerJobWorker);

  console.log(`✅ All ${workers.length} workers initialized successfully`);

  return workers;
};

// Graceful shutdown
const shutdownWorkers = async () => {
  console.log('🛑 Shutting down workers...');
  await Promise.all(workers.map((worker) => worker.close()));
  console.log('✅ All workers shut down gracefully');
};

// Handle process signals
process.on('SIGTERM', shutdownWorkers);
process.on('SIGINT', shutdownWorkers);

// Start workers if running directly
if (require.main === module) {
  initializeWorkers();
  console.log('🚀 Workers started. Press Ctrl+C to stop.');
}

export default initializeWorkers;
