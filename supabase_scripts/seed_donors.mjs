/**
 * Peuplement de la base — structures sanitaires + donneurs (réseau) + activité.
 *
 * Rappel métier : un donneur n'appartient à la base opérationnelle qu'une fois
 * VALIDÉ par un centre (`donors.validated = true`). Les donneurs en attente
 * (`validated = false`) n'apparaissent ni dans l'annuaire ni dans la recherche.
 *
 * Idempotent : n'insère rien si la base compte déjà ≥ 200 donneurs validés.
 * Utilise DIRECT_URL (port 5432) qui contourne RLS.
 *
 *   node supabase_scripts/seed_donors.mjs
 */
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i).trim(),
        l
          .slice(i + 1)
          .trim()
          .replace(/^"|"$/g, ""),
      ];
    }),
);
const sql = postgres(env.DIRECT_URL, { prepare: false, max: 1 });

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const jit = (v, d = 0.05) => v + (Math.random() - 0.5) * d;
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const digits = (n) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
const B32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l".split("");
const btcAddr = () =>
  "bc1q" + Array.from({ length: 38 }, () => rand(B32)).join("");
const weighted = (pairs) => {
  const tot = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * tot;
  for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
  return pairs[0][0];
};

const CITIES = [
  ["Cotonou", 6.3703, 2.4256],
  ["Porto-Novo", 6.4969, 2.6289],
  ["Abomey-Calavi", 6.4485, 2.3556],
  ["Parakou", 9.3372, 2.6303],
  ["Bohicon", 7.1782, 2.0667],
  ["Djougou", 9.7085, 1.6659],
  ["Natitingou", 10.3042, 1.3796],
  ["Ouidah", 6.3626, 2.0853],
  ["Abomey", 7.1826, 1.9912],
  ["Lokossa", 6.6389, 1.7167],
  ["Kandi", 11.1342, 2.9386],
  ["Savè", 8.034, 2.4864],
  ["Comè", 6.4061, 1.8817],
  ["Dassa-Zoumè", 7.7833, 2.1833],
  ["Pobè", 6.98, 2.6647],
];
const BLOOD = [
  ["O+", 45],
  ["A+", 22],
  ["B+", 20],
  ["AB+", 3],
  ["O-", 4],
  ["A-", 2],
  ["B-", 3],
  ["AB-", 1],
];
const FIRST = [
  "Kossi",
  "Afiavi",
  "Rodrigue",
  "Nadège",
  "Wenceslas",
  "Carmelle",
  "Mahougnon",
  "Sègla",
  "Bertille",
  "Delphin",
  "Fabrice",
  "Gildas",
  "Hortense",
  "Ismaël",
  "Justine",
  "Landry",
  "Mireille",
  "Norbert",
  "Odette",
  "Parfait",
  "Reine",
  "Sylvain",
  "Thérèse",
  "Ulrich",
  "Viviane",
  "Wilfried",
  "Yasmine",
  "Zéphirin",
  "Aurel",
  "Bénédicte",
  "Cyriaque",
  "Donatien",
  "Édwige",
  "Firmin",
  "Ghislaine",
  "Herbert",
  "Igor",
  "Josée",
  "Kevin",
  "Léonie",
  "Marius",
  "Nathalie",
  "Olivier",
  "Prisca",
  "Raoul",
  "Sandrine",
  "Théo",
  "Urbain",
  "Vanessa",
];
const LAST = [
  "Dossou",
  "Houngbédji",
  "Gbaguidi",
  "Aïvodji",
  "Sossou",
  "Ahouansou",
  "Tchibozo",
  "Adjovi",
  "Kpodar",
  "Zinsou",
  "Agbo",
  "Dagba",
  "Hounkpatin",
  "Lokossou",
  "Mensah",
  "Quenum",
  "Sagbo",
  "Vodounou",
  "Akplogan",
  "Djossou",
  "Fagla",
  "Gandaho",
  "Hessou",
  "Idohou",
  "Kakpo",
  "Lawani",
  "Migan",
  "Nago",
  "Ogoudjobi",
  "Padonou",
  "Sohou",
  "Tossou",
  "Wanou",
  "Yèkini",
  "Zannou",
  "Amoussou",
  "Bio",
  "Chabi",
];
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

function makeDonor(i, validated) {
  const [city, lat, lon] = rand(CITIES);
  const fn = rand(FIRST),
    ln = rand(LAST);
  return {
    blood_type: weighted(BLOOD),
    city,
    latitude: +jit(lat).toFixed(5),
    longitude: +jit(lon).toFixed(5),
    age:
      weighted([
        [19, 3],
        [24, 6],
        [29, 6],
        [34, 5],
        [39, 4],
        [44, 3],
        [49, 2],
        [55, 1],
        [61, 1],
      ]) + Math.floor(Math.random() * 4),
    available: validated ? Math.random() < 0.85 : Math.random() < 0.7,
    bitcoin_address: btcAddr(),
    profile_hash: createHash("sha256")
      .update(`${fn}.${ln}.${i}.${randomUUID()}`)
      .digest("hex"),
    first_name: fn,
    last_name: ln,
    email: `${slug(fn)}.${slug(ln)}${i}@seed.bitcoinblood.africa`,
    phone_number: `+229 01${digits(8)}`,
    validated,
    created_at: daysAgo(Math.floor(Math.random() * 120) + (validated ? 3 : 0)),
  };
}

const ORGS = [
  {
    name: "CNHU-HKM de Cotonou",
    type: "hospital",
    city: "Cotonou",
    lat: 6.3703,
    lon: 2.4256,
    verified: true,
  },
  {
    name: "CHU-MEL (Mère-Enfant Lagune)",
    type: "hospital",
    city: "Cotonou",
    lat: 6.3622,
    lon: 2.4189,
    verified: true,
  },
  {
    name: "Centre National de Transfusion Sanguine",
    type: "blood_center",
    city: "Cotonou",
    lat: 6.369,
    lon: 2.4151,
    verified: true,
  },
  {
    name: "CHUD-Borgou de Parakou",
    type: "hospital",
    city: "Parakou",
    lat: 9.3372,
    lon: 2.6303,
    verified: true,
  },
  {
    name: "Hôpital de Zone d'Abomey-Calavi",
    type: "hospital",
    city: "Abomey-Calavi",
    lat: 6.4485,
    lon: 2.3556,
    verified: true,
  },
  {
    name: "Croix-Rouge Béninoise",
    type: "ngo",
    city: "Porto-Novo",
    lat: 6.4969,
    lon: 2.6289,
    verified: false,
  },
  {
    name: "Banque de Sang de Bohicon",
    type: "blood_center",
    city: "Bohicon",
    lat: 7.1782,
    lon: 2.0667,
    verified: false,
  },
];

async function main() {
  const [{ count }] =
    await sql`select count(*)::int from donors where validated = true`;
  if (count >= 200) {
    console.log(`Déjà ${count} donneurs validés — seed ignoré.`);
    return;
  }

  const orgRows = ORGS.map((o) => ({
    id: randomUUID(),
    name: o.name,
    type: o.type,
    city: o.city,
    latitude: o.lat,
    longitude: o.lon,
    contact_email: `contact@${slug(o.name).slice(0, 18)}.bj`,
    verified: o.verified,
    submitted_at: daysAgo(o.verified ? 40 : 3),
    created_at: daysAgo(o.verified ? 60 : 5),
  }));
  await sql`insert into organizations ${sql(orgRows)}`;
  const verified = orgRows.filter((o) => o.verified);
  console.log(`+ ${orgRows.length} structures (${verified.length} vérifiées)`);

  const NV = 210,
    NP = 30;
  const donors = [];
  for (let i = 1; i <= NV; i++) donors.push(makeDonor(i, true));
  for (let i = 1; i <= NP; i++) donors.push(makeDonor(1000 + i, false));
  for (let i = 0; i < donors.length; i += 120)
    await sql`insert into donors ${sql(donors.slice(i, i + 120))}`;
  console.log(`+ ${NV} donneurs validés + ${NP} en attente`);

  const emg = Array.from({ length: 11 }, () => {
    const o = rand(verified);
    return {
      hospital_id: o.id,
      blood_type: weighted(BLOOD),
      quantity_needed: 2 + Math.floor(Math.random() * 7),
      city: o.city,
      latitude: +jit(o.latitude, 0.02).toFixed(5),
      longitude: +jit(o.longitude, 0.02).toFixed(5),
      status: Math.random() < 0.55 ? "active" : "resolved",
      created_at: daysAgo(Math.floor(Math.random() * 20)),
    };
  });
  await sql`insert into emergencies ${sql(emg)}`;

  const titles = [
    "Collecte solidaire",
    "Journée don de sang",
    "Mobilisation urgence",
    "Campagne trimestrielle",
    "Don de rentrée",
    "Appel aux donneurs",
    "Marathon du don",
  ];
  const camp = Array.from({ length: 8 }, () => {
    const o = rand(verified),
      targeted = Math.random() < 0.45,
      sent = 200 + Math.floor(Math.random() * 1400);
    return {
      hospital_id: o.id,
      title: `${rand(titles)} — ${o.city}`,
      type: targeted ? "targeted" : "general",
      target_blood_type: targeted ? weighted(BLOOD) : null,
      city: o.city,
      latitude: o.latitude,
      longitude: o.longitude,
      radius_km: 15 + Math.floor(Math.random() * 26),
      emails_sent: sent,
      responses_count: Math.floor(sent * (0.1 + Math.random() * 0.3)),
      status: Math.random() < 0.7 ? "active" : "completed",
      created_at: daysAgo(Math.floor(Math.random() * 45)),
    };
  });
  await sql`insert into campaigns ${sql(camp)}`;
  console.log(`+ ${emg.length} urgences, ${camp.length} campagnes`);
}

try {
  await main();
} catch (e) {
  console.error("ERR:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
