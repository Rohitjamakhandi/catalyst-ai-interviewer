import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { streamId, sessionId, answer } = await req.json();

    const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}/sdp`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: answer,
        session_id: sessionId
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('D-ID SDP Error:', err);
      return NextResponse.json({ error: 'Failed to send SDP to D-ID', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('D-ID API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
