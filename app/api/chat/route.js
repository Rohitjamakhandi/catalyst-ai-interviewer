import { NextResponse } from 'next/server';
import { getModel, ASSESSMENT_SYSTEM_PROMPT } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { messages, skillsContext } = await req.json();

    const model = getModel();

    const systemPrompt = `${ASSESSMENT_SYSTEM_PROMPT}

CANDIDATE CONTEXT:
${skillsContext}`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to begin the skill assessment. I will ask scenario-based questions, evaluate answers carefully, and assign proficiency levels.' }] },
        ...messages.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      ],
    });

    const lastUserMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastUserMessage.content);
    const text = result.response.text();

    return NextResponse.json({ success: true, message: text });
  } catch (err) {
    console.error('chat error:', err);
    return NextResponse.json({ error: err.message || 'Chat failed.' }, { status: 500 });
  }
}
