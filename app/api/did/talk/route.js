import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { streamId, sessionId, text } = await req.json();

    const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: text,
          provider: {
            type: "microsoft",
            voice_id: "en-US-JennyNeural"
          }
        },
        config: {
          stitch: true
        },
        session_id: sessionId
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('D-ID Talk Error:', err);
      return NextResponse.json({ error: 'Failed to send talk command to D-ID', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('D-ID API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
