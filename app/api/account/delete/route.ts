import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // auth.users satırını silmek, public.users'a (on delete cascade) ve
  // oradan da tüm bağlı tablolara (feedback, arkadaşlıklar, DM, watch
  // room'lar vb. — bkz. 0007_cascade_deletes_for_account_deletion.sql)
  // otomatik olarak yayılır. Normal anon/authenticated key ile auth.users
  // silinemez, bu yüzden service_role gerekiyor.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
