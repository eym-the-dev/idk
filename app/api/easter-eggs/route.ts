import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).single();
  const isAdmin = (profile as { username?: string | null } | null)?.username === 'iea';

  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  return NextResponse.json({
    messages: [
      'En iyisi de olsan, onun yeri hep ayrı olacak...',
      'İzlemek sadece içerik değil, bir hissi yakalamaktır.',
      'Senin rafın burada yavaşça şekilleniyor.',
      'B',
      'Bu bir gizli mesajdır: sitenin yapımcısı seni selamlıyor.',
    ],
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).single();
  const isAdmin = (profile as { username?: string | null } | null)?.username === 'iea';

  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json();
  const messages = Array.isArray(body?.messages) ? body.messages.filter((m) => typeof m === 'string' && m.trim()) : [];

  if (!messages.length) return NextResponse.json({ error: 'messages required' }, { status: 400 });

  const admin = createAdminClient();
  await admin.from('user_profiles').update({ current_mood: 'admin_egg_mode' }).eq('user_id', user.id);

  return NextResponse.json({ ok: true, messages });
}
