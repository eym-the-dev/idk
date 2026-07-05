import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * DİKKAT: Bu client service_role key kullanır — RLS'i tamamen bypass eder.
 * ASLA bir client component'e import etme, ASLA tarayıcıya sızdırma.
 * Sadece app/api/**\/route.ts dosyaları içinde, gerekli işlemler için
 * (ör. hesap silme — auth.users satırını silmek normal anon key ile
 * mümkün değil) kullanılmalı.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
