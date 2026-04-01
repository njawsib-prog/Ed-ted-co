import { Job } from 'bullmq';
import { supabaseAdmin } from '../db/supabaseAdmin';
import crypto from 'crypto';

// HMAC signature helper
const generateSignature = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

// Trigger webhooks with HMAC signatures
const webhookTriggerWorker = async (job: Job) => {
  const { event, payload, branchId } = job.data;

  console.log(`🪝 Processing webhook for event: ${event}`);

  try {
    // Get webhooks that subscribe to this event
    const { data: webhooks, error } = await supabaseAdmin
      .from('webhooks')
      .select('id, url, secret, events, isActive')
      .eq('branchId', branchId)
      .eq('isActive', true);

    if (error) {
      throw new Error(`Failed to fetch webhooks: ${error.message}`);
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('No active webhooks for this branch');
      return { triggered: 0 };
    }

    // Filter webhooks that are subscribed to this event
    const matchingWebhooks = webhooks.filter((webhook) =>
      webhook.events.includes(event)
    );

    if (matchingWebhooks.length === 0) {
      console.log('No webhooks subscribed to this event');
      return { triggered: 0 };
    }

    // Prepare webhook payload
    const webhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const payloadString = JSON.stringify(webhookPayload);
    let successCount = 0;
    let failedCount = 0;

    // Trigger each matching webhook
    for (const webhook of matchingWebhooks) {
      try {
        // Generate HMAC signature
        const signature = generateSignature(payloadString, webhook.secret);

        // Add signature to headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': webhookPayload.timestamp,
          'User-Agent': 'EdTech-Platform-Webhooks/1.0',
        };

        // Send webhook
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: payloadString,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Log successful webhook delivery
        await supabaseAdmin.from('webhook_logs').insert({
          webhookId: webhook.id,
          event,
          status: 'delivered',
          statusCode: response.status,
          payload,
          deliveredAt: new Date().toISOString(),
        });

        successCount++;
        console.log(`✅ Webhook delivered to ${webhook.url}`);
      } catch (error: any) {
        failedCount++;
        console.error(`❌ Failed to deliver webhook to ${webhook.url}:`, error.message);

        // Log failed webhook delivery
        await supabaseAdmin.from('webhook_logs').insert({
          webhookId: webhook.id,
          event,
          status: 'failed',
          statusCode: 0,
          payload,
          error: error.message,
          attemptedAt: new Date().toISOString(),
        });

        // Retry logic for failed webhooks (up to 3 attempts)
        const retryCount = job.attemptsMade || 0;
        if (retryCount < 3) {
          console.log(`🔄 Retrying webhook to ${webhook.url} (attempt ${retryCount + 1}/3)`);
          throw new Error(`Webhook delivery failed, will retry: ${error.message}`);
        }
      }
    }

    console.log(`✅ Webhooks triggered: ${successCount} succeeded, ${failedCount} failed`);

    return {
      success: true,
      triggered: successCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error('❌ Webhook trigger failed:', error);
    throw error;
  }
};

export default webhookTriggerWorker;
