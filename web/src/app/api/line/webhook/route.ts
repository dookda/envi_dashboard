import { NextRequest, NextResponse } from 'next/server';

// Temporary webhook to discover LINE User ID / Group ID.
// 1. Set Webhook URL in LINE Developers Console to:
//    https://your-domain/air/api/line/webhook
// 2. Add the bot to the target group (or send it a DM).
// 3. Send any message — the source ID is logged to the server console.
// 4. Delete this file once you have the ID.
export async function POST(request: NextRequest) {
  const body = await request.json();

  for (const event of body.events ?? []) {
    const source = event.source ?? {};
    const type   = source.type;          // 'user' | 'group' | 'room'
    const userId  = source.userId;
    const groupId = source.groupId;
    const roomId  = source.roomId;

    console.log('[LINE webhook] source type :', type);
    console.log('[LINE webhook] userId      :', userId  ?? '—');
    console.log('[LINE webhook] groupId     :', groupId ?? '—');
    console.log('[LINE webhook] roomId      :', roomId  ?? '—');
  }

  return NextResponse.json({ ok: true });
}
