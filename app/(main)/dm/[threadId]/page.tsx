import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DmThread } from '@/components/dm/DmThread';

export default async function DmPage({ params }: { params: { threadId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: thread } = await supabase
    .from('dm_threads')
    .select('id, user_a, user_b')
    .eq('id', params.threadId)
    .single();

  const typedThread = thread as { id: string; user_a: string | null; user_b: string | null } | null;

  if (!typedThread) redirect('/friends');

  const otherId = typedThread.user_a === user.id ? typedThread.user_b : typedThread.user_a;
  if (!otherId) redirect('/friends');

  const { data: otherUser } = await supabase
    .from('users')
    .select('username')
    .eq('id', otherId)
    .single();

  const typedOtherUser = otherUser as { username: string | null } | null;

  const { data: messages } = await supabase
    .from('dm_messages')
    .select('id, sender_id, content, created_at')
    .eq('thread_id', params.threadId)
    .order('created_at', { ascending: true })
    .limit(100);

  return (
    <main className="min-h-screen bg-void flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 border-b border-hairline">
        <Link href="/dm" className="text-dust text-[13px] hover:text-ivory transition-colors">
          ← geri
        </Link>
        <span className="font-mono text-[13px] text-dust">@{typedOtherUser?.username ?? '?'}</span>
        <span className="w-8" />
      </header>

      <DmThread
        threadId={params.threadId}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </main>
  );
}
