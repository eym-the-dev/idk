import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LaunchScreen } from '@/components/launch/LaunchScreen';

export default async function LaunchPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).single();

  return <LaunchScreen username={(profile as { username?: string | null } | null)?.username ?? user.email?.split('@')[0]} />;
}
