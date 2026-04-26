import { NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL, SKILL_EXTRACTION_PROMPT } from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const jdText = formData.get('jd');
    const resumeFile = formData.get('resume');
    const resumeText = formData.get('resumeText');

    let resumeContent = resumeText || '';

    // If PDF uploaded, parse it
    if (resumeFile && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        resumeContent = data.text;
      } catch (e) {
        // fallback: try reading as plain text
        resumeContent = buffer.toString('utf-8');
      }
    }

    if (!jdText || !resumeContent) {
      return NextResponse.json({ error: 'Both Job Description and Resume are required.' }, { status: 400 });
    }

    const prompt = `${SKILL_EXTRACTION_PROMPT}

--- JOB DESCRIPTION ---
${jdText}

--- RESUME ---
${resumeContent}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    const text = response.choices[0].message.content.trim();

    // Strip markdown code fences and conversational padding
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', text);
      return NextResponse.json({ 
        error: 'The AI model refused to process this or returned invalid data. Please ensure your Job Description and Resume are complete and try again.',
        details: text.slice(0, 200)
      }, { status: 422 });
    }

    // ── Safety net: if AI returned garbage/instruction text as candidateName, extract from resume directly
    const isGarbageName = !data.candidateName
      || data.candidateName.length > 60
      || /extract|candidate|full name|resume|instruction|return|person/i.test(data.candidateName);

    if (isGarbageName) {
      // Try to extract name from the first 3 lines of the resume (usually the header)
      const firstLines = resumeContent.split('\n').slice(0, 5).join(' ').trim();
      // Match a capitalized full name pattern (e.g. "Rohit Jamakhandi" or "ROHIT JAMAKHANDI")
      const nameMatch = firstLines.match(/^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+)/m)
        || firstLines.match(/([A-Z]{2,}\s+[A-Z]{2,})/);
      data.candidateName = nameMatch ? nameMatch[1].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : null;
    }

    return NextResponse.json({ success: true, data, resumeText: resumeContent });
  } catch (err) {
    console.error('parse-documents error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse documents.' }, { status: 500 });
  }
}
