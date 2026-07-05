import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // users tablosunda satır var mı kontrol et; yoksa ilk girişte oluştur.
      const { data: existing } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!existing) {
        await (supabase.from('users') as any).insert({
          id: data.user.id,
          provider: data.user.app_metadata.provider ?? 'google',
          avatar_url: data.user.user_metadata.avatar_url ?? null,
        });
        await (supabase.from('user_profiles') as any).insert({ user_id: data.user.id });
      }

      const existingUser = existing as { username: string | null } | null;
      const needsUsername = !existingUser?.username;
      return NextResponse.redirect(
        `${origin}${needsUsername ? '/kullanici-adi' : '/dashboard'}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
