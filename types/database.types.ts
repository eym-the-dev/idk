// Bu dosya normalde `npm run supabase:types` ile Supabase CLI tarafından
// otomatik üretilir (bkz. README). Proje henüz bir Supabase instance'ına
// bağlanmadığı için burada, gerçek şemayla (0001_init.sql) birebir uyumlu,
// elle yazılmış bir başlangıç tipi var. CLI çalıştırıldığında bu dosyanın
// üzerine yazılması güvenlidir.

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          provider: 'google' | 'apple' | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      user_profiles: {
        Row: {
          user_id: string;
          current_mood: string | null;
          disliked_genres: string[] | null;
          preferred_vibe: string | null;
          taste_vector: Record<string, number> | null;
          digital_footprint_raw: Record<string, unknown> | null;
          onboarding_completed: boolean;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_profiles']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>;
      };
      ai_models: {
        Row: {
          id: string;
          slug: string;
          display_name: string;
          is_dynamic: boolean;
        };
        Insert: Partial<Database['public']['Tables']['ai_models']['Row']>;
        Update: Partial<Database['public']['Tables']['ai_models']['Row']>;
      };
      static_prompts: {
        Row: {
          id: string;
          ai_model_id: string;
          version: number;
          prompt_template: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['static_prompts']['Row']>;
        Update: Partial<Database['public']['Tables']['static_prompts']['Row']>;
      };
      dynamic_prompt_cache: {
        Row: {
          id: string;
          user_id: string;
          custom_ai_name: string;
          generated_prompt: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['dynamic_prompt_cache']['Row']>;
        Update: Partial<Database['public']['Tables']['dynamic_prompt_cache']['Row']>;
      };
      feedback_responses: {
        Row: {
          id: string;
          user_id: string;
          ai_model_id: string | null;
          raw_response: string;
          parsed_signals: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['feedback_responses']['Row']>;
        Update: Partial<Database['public']['Tables']['feedback_responses']['Row']>;
      };
      // Kalan tablolar (friendships, dm_threads, dm_messages, watch_rooms,
      // watch_room_members, onboarding_questions, onboarding_answers,
      // easter_egg_triggers) için: `npm run supabase:types` çalıştırıldığında
      // bu dosya gerçek şemadan otomatik tamamlanacak.
      [table: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
};
