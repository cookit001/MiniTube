import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceApiAccess, logAuditEvent } from '@/app/utils/security';

const AiRequestSchema = z.object({
  videoId: z.string().min(1, "Video ID is required"),
  task: z.enum(['summarize', 'extract_hooks', 'analyze_sentiment']),
  paymentIntentId: z.string().min(1, "Monetization proof required"), // Ensures the API call is paid for
});

export async function POST(request: Request) {
  try {
    // 1. Centralized Access Check & Auth
    const user = await enforceApiAccess(request).catch(() => null);
    if (!user) {
      await logAuditEvent('UNAUTHORIZED_AI_ACCESS', 'anonymous', { ip: request.headers.get('x-forwarded-for') });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Strict Payload Validation
    const body = await request.json();
    const validation = AiRequestSchema.safeParse(body);

    if (!validation.success) {
      await logAuditEvent('INVALID_AI_PAYLOAD', user.userId, { errors: validation.error.format() });
      return NextResponse.json({ error: 'Invalid payload', details: validation.error.format() }, { status: 400 });
    }

    const { videoId, task, paymentIntentId } = validation.data;

    // 3. Monetization Verification (Mocked for architecture)
    // In production, call Stripe/Coinbase API to verify paymentIntentId status here
    const isPaymentValid = paymentIntentId.startsWith('pi_'); 
    if (!isPaymentValid) {
      await logAuditEvent('AI_PAYMENT_FAILED', user.userId, { videoId, paymentIntentId });
      return NextResponse.json({ error: 'Payment validation failed' }, { status: 402 }); // 402 Payment Required
    }

    // 4. AI Processing Logic
    // Here you would connect to OpenAI/Anthropic/Gemini to process the video transcript
    const mockedAiResponse = {
      videoId,
      task,
      result: "This is an enterprise-grade AI summary generated after monetization verification. High leverage achieved.",
      processedAt: new Date().toISOString()
    };

    // 5. Mandatory Audit Logging of Successful Paid Actions
    await logAuditEvent('AI_TASK_COMPLETED', user.userId, { videoId, task, paymentIntentId });

    return NextResponse.json({ success: true, data: mockedAiResponse });
  } catch (error: any) {
    await logAuditEvent('CRITICAL_AI_ERROR', 'unknown', { message: error.message });
    return NextResponse.json({ success: false, error: 'AI Processing failed.' }, { status: 500 });
  }
}
