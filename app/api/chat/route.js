import { NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL, ASSESSMENT_SYSTEM_PROMPT } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { messages, skillsContext } = await req.json();

    const systemPrompt = `${ASSESSMENT_SYSTEM_PROMPT}\n\nCANDIDATE CONTEXT:\n${skillsContext}`;

    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: openAIMessages,
      temperature: 0.2
    });

    const text = response.choices[0].message.content;

    return NextResponse.json({ success: true, message: text });
  } catch (err) {
    console.error('chat error:', err);
    return NextResponse.json({ error: err.message || 'Chat failed.' }, { status: 500 });
  }
}
