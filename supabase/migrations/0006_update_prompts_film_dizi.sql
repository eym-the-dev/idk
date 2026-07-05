-- Uygulamanın asıl amacı film ve dizi önerisi — önceki şablonlar çok
-- genel "içerik" diliyle yazılmıştı. Var olan aktif şablonları güncelliyoruz
-- (yeni versiyon eklemek yerine üzerine yazıyoruz çünkü henüz gerçek
-- kullanıcı verisiyle A/B testi yapılmıyor).

update public.static_prompts sp
set prompt_template = 'Sen bir film ve dizi küratörüsün. Aşağıdaki kullanıcı zevk profiline göre 5 film veya dizi öner (uydurma değil, gerçekten var olan yapımlar):

Mod: {{current_mood}}
Tercih edilen vibe: {{preferred_vibe}}
Kaçınılacak türler: {{disliked_genres}}
Zevk vektörü: {{taste_vector}}

Her öneri için: film/dizi adı, türü (film mi dizi mi), 1 cümlelik "neden bu sana uygun" açıklaması, ve süre/sezon-bölüm bilgisi ver. Yanıtı madde işaretli liste olarak ver, ekstra yorum ekleme.'
from public.ai_models m
where sp.ai_model_id = m.id and m.slug = 'chatgpt' and sp.is_active = true;

update public.static_prompts sp
set prompt_template = 'Bir film ve dizi önerisi asistanı gibi davran. Kullanıcının profili:

Mod: {{current_mood}}
Vibe: {{preferred_vibe}}
Kaçınılacak: {{disliked_genres}}
Zevk verisi: {{taste_vector}}

Bu profile göre, gerçekten var olan 5 film veya dizi öner. Her biri için: ad, türü (film/dizi), kısa gerekçe, süre/sezon-bölüm bilgisi. Liste formatında, ekstra açıklama olmadan yanıtla.'
from public.ai_models m
where sp.ai_model_id = m.id and m.slug = 'gemini' and sp.is_active = true;

update public.static_prompts sp
set prompt_template = 'Sana bir kullanıcının film/dizi zevk profilini vereceğim, buna göre gerçekten var olan 5 nokta atışı film veya dizi önerisi istiyorum.

Mod: {{current_mood}}
Aradığı vibe: {{preferred_vibe}}
Kaçındığı türler: {{disliked_genres}}
Zevk vektörü (ağırlıklı): {{taste_vector}}

Her öneri: ad, türü (film/dizi), neden uygun olduğuna dair tek cümle, süre/sezon-bölüm bilgisi. Sadece madde işaretli liste ver.'
from public.ai_models m
where sp.ai_model_id = m.id and m.slug = 'claude' and sp.is_active = true;
