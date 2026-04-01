import { Job } from 'bullmq';
import { supabaseAdmin } from '../db/supabaseAdmin';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Send bulk notifications
const notificationSendWorker = async (job: Job) => {
  const { type, recipientIds, title, message, data } = job.data;

  console.log(`📢 Sending notification to ${recipientIds.length} recipients: ${title}`);

  try {
    const logId = data?.logId;
    const branchId = data?.branchId;

    // Prepare notifications for batch insert
    const notifications = recipientIds.map((recipientId: string) => ({
      userId: recipientId,
      branchId,
      type,
      title,
      message,
      data,
      isRead: false,
    }));

    // Batch insert notifications (max 100 at a time to avoid hitting row limits)
    const batchSize = 100;
    let sentCount = 0;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error: insertError } = await supabaseAdmin.from('notifications').insert(batch);

      if (insertError) {
        console.error(`Failed to insert batch ${i}-${i + batchSize}:`, insertError.message);
        continue;
      }

      sentCount += batch.length;
    }

    // Update log status if logId exists
    if (logId) {
      await supabaseAdmin
        .from('notification_logs')
        .update({
          status: 'sent',
          sentAt: new Date().toISOString(),
        })
        .eq('id', logId);
    }

    console.log(`✅ Notification sent to ${sentCount} recipients`);

    // In production, you would also:
    // 1. Send push notifications via Firebase/APNS
    // 2. Send emails via nodemailer
    // 3. Send SMS via Twilio
    // These would be done in separate workers or services

    return {
      success: true,
      sentCount,
      failedCount: recipientIds.length - sentCount,
    };
  } catch (error) {
    console.error('❌ Failed to send notifications:', error);

    // Update log status to failed if logId exists
    const logId = data?.logId;
    if (logId) {
      await supabaseAdmin
        .from('notification_logs')
        .update({
          status: 'failed',
          sentAt: new Date().toISOString(),
        })
        .eq('id', logId);
    }

    throw error;
  }
};

export default notificationSendWorker;
