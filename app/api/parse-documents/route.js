import { NextResponse } from 'next/server';
import { getModel, SKILL_EXTRACTION_PROMPT } from '@/lib/gemini';

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

    const model = getModel();
    const prompt = `${SKILL_EXTRACTION_PROMPT}

--- JOB DESCRIPTION ---
${jdText}

--- RESUME ---
${resumeContent}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data, resumeText: resumeContent });
  } catch (err) {
    console.error('parse-documents error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse documents.' }, { status: 500 });
  }
}
