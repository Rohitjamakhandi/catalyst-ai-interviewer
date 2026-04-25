import { NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL, LEARNING_PLAN_PROMPT } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { assessedSkills, requiredSkills, jobTitle, candidateName, readiness } = await req.json();

    const prompt = `${LEARNING_PLAN_PROMPT}

JOB TARGET: ${jobTitle}
CANDIDATE: ${candidateName || 'Candidate'}
JOB READINESS SCORE: ${readiness}%

REQUIRED SKILLS & ASSESSED LEVELS:
${requiredSkills.map(r => {
  const assessed = assessedSkills.find(a => a.name.toLowerCase() === r.name.toLowerCase());
  return `- ${r.name} (Required: ${r.requiredLevel}, Importance: ${r.importance}, Assessed: ${assessed ? assessed.level : 'Not assessed'})`;
}).join('\n')}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    const text = response.choices[0].message.content.trim();
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('learning-plan error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate learning plan.' }, { status: 500 });
  }
}
