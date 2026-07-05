-- Statik prompt şablonları artık kişilik özeti üretmiyor;
-- uygulama buildPersonalitySummary() ile profilden özet çıkarıyor.
-- Bu migration, DB kayıtlarını yeni mimariye uyumlu tutar (arşiv/not amaçlı).

update public.static_prompts sp
set prompt_template = 'Bu şablon artık kullanılmıyor. Kişilik özeti uygulama tarafından profilden üretilir.

Mod: {{current_mood}}
Vibe: {{preferred_vibe}}
Kaçınılacak: {{disliked_genres}}
Zevk vektörü: {{taste_vector}}'
from public.ai_models m
where sp.ai_model_id = m.id and sp.is_active = true;
