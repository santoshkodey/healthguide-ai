import { NextRequest, NextResponse } from 'next/server';
import { assessmentInputSchema } from '@/lib/validation';
import { evaluateTriage } from '@/lib/triage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = assessmentInputSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.errors.forEach((err) => {
        const path = err.path.join('.') || 'general';
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed. Please verify your symptom inputs.',
          fieldErrors,
        },
        { status: 400 }
      );
    }

    // Safety-first triage evaluation (No PII logged)
    const result = evaluateTriage(parsed.data);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch {
    // Return safe generic error without leaking server stack trace
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing the assessment. Please try again.',
      },
      { status: 500 }
    );
  }
}
