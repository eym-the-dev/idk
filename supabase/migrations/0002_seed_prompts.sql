-- Sabit meta-prompt şablonları — kullanıcı popüler bir AI seçtiğinde
-- uygulama bu satırları okur, hiçbir AI API çağrısı yapmaz.
-- Uygulamanın asıl amacı: FİLM VE DİZİ önerisi.

insert into public.static_prompts (ai_model_id, prompt_template)
select id, 'Sen bir film ve dizi küratörüsün. Aşağıdaki kullanıcı zevk profiline göre 5 film veya dizi öner (uydurma değil, gerçekten var olan yapımlar):

Mod: {{current_mood}}
Tercih edilen vibe: {{preferred_vibe}}
Kaçınılacak türler: {{disliked_genres}}
Zevk vektörü: {{taste_vector}}

Her öneri için: film/dizi adı, türü (film mi dizi mi), 1 cümlelik "neden bu sana uygun" açıklaması, ve süre/sezon-bölüm bilgisi ver. Yanıtı madde işaretli liste olarak ver, ekstra yorum ekleme.'
from public.ai_models where slug = 'chatgpt';

insert into public.static_prompts (ai_model_id, prompt_template)
select id, 'Bir film ve dizi önerisi asistanı gibi davran. Kullanıcının profili:

Mod: {{current_mood}}
Vibe: {{preferred_vibe}}
Kaçınılacak: {{disliked_genres}}
Zevk verisi: {{taste_vector}}

Bu profile göre, gerçekten var olan 5 film veya dizi öner. Her biri için: ad, türü (film/dizi), kısa gerekçe, süre/sezon-bölüm bilgisi. Liste formatında, ekstra açıklama olmadan yanıtla.'
from public.ai_models where slug = 'gemini';

insert into public.static_prompts (ai_model_id, prompt_template)
select id, 'Sana bir kullanıcının film/dizi zevk profilini vereceğim, buna göre gerçekten var olan 5 nokta atışı film veya dizi önerisi istiyorum.

Mod: {{current_mood}}
Aradığı vibe: {{preferred_vibe}}
Kaçındığı türler: {{disliked_genres}}
Zevk vektörü (ağırlıklı): {{taste_vector}}

Her öneri: ad, türü (film/dizi), neden uygun olduğuna dair tek cümle, süre/sezon-bölüm bilgisi. Sadece madde işaretli liste ver.'
from public.ai_models where slug = 'claude';

-- ========== EASTER EGG: MELİSA REFERANSLARI ==========
insert into public.easter_egg_triggers (trigger_key, trigger_condition, reveal_content) values
  (
    'melisa_search',
    'Arama kutusuna "melisa" yazılması',
    'Bu öneriyi Melisa''ya da göstersen mi? 👀'
  ),
  (
    'melisa_gece_yarisi',
    '3 gece üst üste 00:00 sonrası giriş yapılması',
    'Bu senin Melisa''nın gece modu önerin.'
  ),
  (
    'melisa_konami',
    'Ayarlar ekranında logoya 5 kez tıklanması',
    'Melisa onayladı ✓'
  );
