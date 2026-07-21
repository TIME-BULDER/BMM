-- =========================================================================
-- Bitcoin Blood — Peuplement de la base (version SQL pour l'éditeur Supabase)
--
-- À exécuter dans : Dashboard Supabase → SQL Editor.
-- Équivalent SQL de supabase_scripts/seed_donors.mjs.
--
-- Insère : 7 structures sanitaires (5 vérifiées + 2 en attente),
--          210 donneurs VALIDÉS (réseau) + 30 en attente de validation,
--          11 urgences et 8 campagnes rattachées aux structures vérifiées.
--
-- Rappel métier : un donneur n'appartient à la base opérationnelle que si
-- `validated = true`. Les donneurs en attente n'apparaissent ni dans
-- l'annuaire ni dans la recherche/matching.
--
-- IDEMPOTENT : ne fait rien si la base compte déjà >= 200 donneurs validés.
-- =========================================================================

DO $$
DECLARE
  v_count      int;
  first_names  text[] := ARRAY['Kossi','Afiavi','Rodrigue','Nadege','Wenceslas','Carmelle','Mahougnon','Segla','Bertille',
    'Delphin','Fabrice','Gildas','Hortense','Ismael','Justine','Landry','Mireille','Norbert','Odette','Parfait','Reine',
    'Sylvain','Therese','Ulrich','Viviane','Wilfried','Yasmine','Zephirin','Aurel','Benedicte','Cyriaque','Donatien',
    'Edwige','Firmin','Ghislaine','Herbert','Igor','Josee','Kevin','Leonie','Marius','Nathalie','Olivier','Prisca',
    'Raoul','Sandrine','Theo','Urbain','Vanessa','Gaston'];
  last_names   text[] := ARRAY['Dossou','Houngbedji','Gbaguidi','Aivodji','Sossou','Ahouansou','Tchibozo','Adjovi',
    'Kpodar','Zinsou','Agbo','Dagba','Hounkpatin','Lokossou','Mensah','Quenum','Sagbo','Vodounou','Akplogan','Djossou',
    'Fagla','Gandaho','Hessou','Idohou','Kakpo','Lawani','Migan','Nago','Ogoudjobi','Padonou','Sohou','Tossou','Wanou',
    'Yekini','Zannou','Amoussou','Bio','Chabi'];
  city_names   text[] := ARRAY['Cotonou','Porto-Novo','Abomey-Calavi','Parakou','Bohicon','Djougou','Natitingou',
    'Ouidah','Abomey','Lokossa','Kandi','Save','Come','Dassa-Zoume','Pobe'];
  city_lat     double precision[] := ARRAY[6.3703,6.4969,6.4485,9.3372,7.1782,9.7085,10.3042,6.3626,7.1826,6.6389,11.1342,8.034,6.4061,7.7833,6.98];
  city_lon     double precision[] := ARRAY[2.4256,2.6289,2.3556,2.6303,2.0667,1.6659,1.3796,2.0853,1.9912,1.7167,2.9386,2.4864,1.8817,2.1833,2.6647];
  camp_titles  text[] := ARRAY['Collecte solidaire','Journee don de sang','Mobilisation urgence','Campagne trimestrielle',
    'Don de rentree','Appel aux donneurs','Marathon du don'];
BEGIN
  SELECT count(*) INTO v_count FROM donors WHERE validated;
  IF v_count >= 200 THEN
    RAISE NOTICE 'Deja % donneurs valides — seed ignore.', v_count;
    RETURN;
  END IF;

  -- ---- 7 structures sanitaires ----------------------------------------
  INSERT INTO organizations (id, name, type, city, latitude, longitude, contact_email, verified, submitted_at, created_at)
  VALUES
    (gen_random_uuid(),'CNHU-HKM de Cotonou','hospital','Cotonou',6.3703,2.4256,'contact@cnhu-cotonou.bj',true,  now()-interval '40 days', now()-interval '60 days'),
    (gen_random_uuid(),'CHU-MEL (Mere-Enfant Lagune)','hospital','Cotonou',6.3622,2.4189,'contact@chu-mel.bj',true, now()-interval '38 days', now()-interval '58 days'),
    (gen_random_uuid(),'Centre National de Transfusion Sanguine','blood_center','Cotonou',6.369,2.4151,'contact@cnts.bj',true, now()-interval '45 days', now()-interval '65 days'),
    (gen_random_uuid(),'CHUD-Borgou de Parakou','hospital','Parakou',9.3372,2.6303,'contact@chud-borgou.bj',true, now()-interval '35 days', now()-interval '55 days'),
    (gen_random_uuid(),'Hopital de Zone d''Abomey-Calavi','hospital','Abomey-Calavi',6.4485,2.3556,'contact@hz-calavi.bj',true, now()-interval '30 days', now()-interval '50 days'),
    (gen_random_uuid(),'Croix-Rouge Beninoise','ngo','Porto-Novo',6.4969,2.6289,'contact@croix-rouge.bj',false, now()-interval '3 days', now()-interval '5 days'),
    (gen_random_uuid(),'Banque de Sang de Bohicon','blood_center','Bohicon',7.1782,2.0667,'contact@bs-bohicon.bj',false, now()-interval '2 days', now()-interval '4 days');

  -- ---- Donneurs : 1..210 valides, 211..240 en attente ------------------
  INSERT INTO donors (blood_type, city, latitude, longitude, age, available, bitcoin_address, profile_hash,
                      first_name, last_name, email, phone_number, validated, created_at)
  SELECT
    CASE WHEN t.rb<45 THEN 'O+' WHEN t.rb<67 THEN 'A+' WHEN t.rb<87 THEN 'B+' WHEN t.rb<90 THEN 'AB+'
         WHEN t.rb<94 THEN 'O-' WHEN t.rb<96 THEN 'A-' WHEN t.rb<99 THEN 'B-' ELSE 'AB-' END,
    city_names[t.ci],
    round((city_lat[t.ci] + (random()-0.5)*0.05)::numeric, 5),
    round((city_lon[t.ci] + (random()-0.5)*0.05)::numeric, 5),
    18 + floor(random()*44)::int,
    CASE WHEN g <= 210 THEN random() < 0.85 ELSE random() < 0.70 END,
    'bc1q' || substr(md5(random()::text),1,32) || substr(md5(gen_random_uuid()::text),1,6),
    md5(random()::text || clock_timestamp()::text) || md5(gen_random_uuid()::text),
    first_names[t.fi],
    last_names[t.li],
    lower(regexp_replace(first_names[t.fi] || '.' || last_names[t.li], '[^a-zA-Z]', '', 'g')) || g || '@seed.bitcoinblood.africa',
    '+229 01' || lpad(floor(random()*100000000)::text, 8, '0'),
    (g <= 210),
    now() - (floor(random()*120) || ' days')::interval
  FROM generate_series(1, 240) g
  CROSS JOIN LATERAL (
    SELECT (1 + floor(random()*array_length(city_names,1)))::int  AS ci,
           (1 + floor(random()*array_length(first_names,1)))::int AS fi,
           (1 + floor(random()*array_length(last_names,1)))::int  AS li,
           random()*100                                           AS rb
  ) t;

  -- ---- 11 urgences (structures verifiees) ------------------------------
  INSERT INTO emergencies (hospital_id, blood_type, quantity_needed, city, latitude, longitude, status, created_at)
  SELECT
    o.id,
    CASE WHEN t.rb<45 THEN 'O+' WHEN t.rb<67 THEN 'A+' WHEN t.rb<87 THEN 'B+' WHEN t.rb<90 THEN 'AB+'
         WHEN t.rb<94 THEN 'O-' WHEN t.rb<96 THEN 'A-' WHEN t.rb<99 THEN 'B-' ELSE 'AB-' END,
    2 + floor(random()*7)::int,
    o.city,
    round((o.latitude + (random()-0.5)*0.02)::numeric, 5),
    round((o.longitude + (random()-0.5)*0.02)::numeric, 5),
    CASE WHEN random() < 0.55 THEN 'active' ELSE 'resolved' END,
    now() - (floor(random()*20) || ' days')::interval
  FROM generate_series(1, 11) g
  CROSS JOIN LATERAL (SELECT id, city, latitude, longitude FROM organizations WHERE verified ORDER BY random() LIMIT 1) o
  CROSS JOIN LATERAL (SELECT random()*100 AS rb) t;

  -- ---- 8 campagnes (structures verifiees) ------------------------------
  INSERT INTO campaigns (hospital_id, title, type, target_blood_type, city, latitude, longitude,
                         radius_km, emails_sent, responses_count, status, created_at)
  SELECT
    o.id,
    camp_titles[1 + floor(random()*array_length(camp_titles,1))::int] || ' — ' || o.city,
    (CASE WHEN t.targeted THEN 'targeted' ELSE 'general' END)::campaign_type,
    CASE WHEN t.targeted THEN
      (CASE WHEN t.rb<45 THEN 'O+' WHEN t.rb<67 THEN 'A+' WHEN t.rb<87 THEN 'B+' WHEN t.rb<90 THEN 'AB+'
            WHEN t.rb<94 THEN 'O-' WHEN t.rb<96 THEN 'A-' WHEN t.rb<99 THEN 'B-' ELSE 'AB-' END)
      ELSE NULL END,
    o.city, o.latitude, o.longitude,
    15 + floor(random()*26)::int,
    t.sent,
    floor(t.sent * (0.1 + random()*0.3))::int,
    CASE WHEN random() < 0.70 THEN 'active' ELSE 'completed' END,
    now() - (floor(random()*45) || ' days')::interval
  FROM generate_series(1, 8) g
  CROSS JOIN LATERAL (SELECT id, city, latitude, longitude FROM organizations WHERE verified ORDER BY random() LIMIT 1) o
  CROSS JOIN LATERAL (SELECT (random()<0.45) AS targeted, random()*100 AS rb, (200 + floor(random()*1400))::int AS sent) t;

  RAISE NOTICE 'Seed termine : 7 structures, 240 donneurs (210 valides), 11 urgences, 8 campagnes.';
END $$;

-- Contrôle rapide après exécution :
--   SELECT validated, count(*) FROM donors GROUP BY validated;
--   SELECT verified, count(*) FROM organizations GROUP BY verified;
