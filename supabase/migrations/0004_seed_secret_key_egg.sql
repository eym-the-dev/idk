-- Gizli tuş kombinasyonuyla tetiklenen, çok nadir görünen easter egg.
-- Uygulama koduna göre çalışır (lib/easter-eggs/registry.ts); bu satır
-- sadece kayıt/dokümantasyon amaçlıdır, trigger mantığının kendisi değil.

insert into public.easter_egg_triggers (trigger_key, trigger_condition, reveal_content) values
  (
    'gizli_soz',
    'Gizli bir tuş dizisi + ~1/12 şans (bkz. lib/easter-eggs/registry.ts)',
    'En iyisi de olsan, onun yeri ayrı her zaman.'
  );
