import { NextRequest, NextResponse } from 'next/server';
import { assessmentInputSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Graceful handling if no AI provider key is configured
    if (!geminiKey && !openaiKey) {
      return NextResponse.json({
        configured: false,
        message:
          'AI Assistant enhancement is optional and currently unconfigured. HealthGuide AI continues to operate with complete rules-based triage safety.',
      });
    }

    const body = await req.json();
    const parsed = assessmentInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { configured: true, error: 'Invalid assessment data provided.' },
        { status: 400 }
      );
    }

    const { ageGroup, symptoms, customDescription, duration, contextFactors } = parsed.data;

    // Strict safety prompt - No PII included
    const systemPrompt = `You are HealthGuide AI Assistant, an educational health navigation companion.
STRICT SAFETY MANDATES:
1. You are NOT a medical doctor. DO NOT provide a definitive medical diagnosis.
2. DO NOT prescribe any medications, dosages, or drug treatments.
3. DO NOT claim the user is "healthy", "fine", or does not need a doctor.
4. DO NOT override rules-based safety tiers.
5. Emphasize clinical uncertainty and encourage consulting an authorized healthcare professional.
6. Provide helpful questions the user can write down to ask their doctor during their appointment.
7. Remind them of emergency warning signs (chest pain, breathing difficulty, sudden weakness) that require calling 112 or local emergency services immediately.
8. Maintain a polite, cautious, reassuring, professional tone.`;

    const userMessage = `Patient context:
- Age Group: ${ageGroup.replace(/_/g, ' ')}
- Reported Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None selected from list'}
- User Description: "${customDescription || 'None provided'}"
- Duration: ${duration.replace(/_/g, ' ')}
- Health Context / Comorbidities: ${contextFactors.join(', ')}

Please provide:
1. A brief, cautious summary of why discussing these symptoms with a doctor is prudent.
2. 3 to 4 thoughtful questions the user can bring to their doctor appointment.
3. Safe supportive habits (e.g. hydration, rest) and red-flag symptoms that should prompt emergency care.`;

    if (geminiKey) {
      // Call Google Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for maximum caution
            maxOutputTokens: 600,
          },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return NextResponse.json(
          {
            configured: true,
            error: 'AI service provider returned a non-200 response or rate limit.',
          },
          { status: 502 }
        );
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return NextResponse.json(
          { configured: true, error: 'Empty response returned from AI provider.' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        configured: true,
        source: 'Google Gemini',
        disclaimer:
          'AI-generated insights are educational and informational only. They do not constitute a medical opinion, diagnosis, or treatment plan.',
        content: text,
      });
    }

    if (openaiKey) {
      // Call OpenAI API
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0.2,
          max_tokens: 600,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { configured: true, error: 'OpenAI provider returned an error.' },
          { status: 502 }
        );
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;

      return NextResponse.json({
        configured: true,
        source: 'OpenAI',
        disclaimer:
          'AI-generated insights are educational and informational only. They do not constitute a medical opinion, diagnosis, or treatment plan.',
        content: text,
      });
    }

    return NextResponse.json({
      configured: false,
      message: 'No valid AI provider configured.',
    });
  } catch {
    return NextResponse.json(
      {
        configured: true,
        error: 'AI insight service timed out or was temporarily unavailable.',
      },
      { status: 504 }
    );
  }
}
