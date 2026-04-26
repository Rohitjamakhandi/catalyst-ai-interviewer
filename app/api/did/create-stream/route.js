import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://api.d-id.com/talks/streams', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: "https://files.catbox.moe/nw2pdt.png"
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('D-ID Create Stream Error:', err);
      return NextResponse.json({ error: 'Failed to create D-ID stream', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('D-ID API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get('streamId');
    const sessionId = searchParams.get('sessionId');

    if (!streamId || !sessionId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    return NextResponse.json({ success: response.ok });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
