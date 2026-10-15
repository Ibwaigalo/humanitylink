// Script de données de test — à lancer avec : npx tsx src/db/seed.ts
// (nécessite DATABASE_URL déjà configuré vers Neon, tables déjà migrées)

import { db } from "./index";
import { organizations, projects, publications } from "./schema";

async function seed() {
  const [amsode] = await db
    .insert(organizations)
    .values({
      slug: "amsode",
      nom: "AMSODE",
      description:
        "Association malienne pour la solidarité et le développement — humanitaire et développement.",
      secteurPrincipal: "securite_alimentaire",
      regions: ["mopti", "segou", "sikasso", "kayes", "koulikoro", "gao", "tombouctou", "bamako"],
      contactEmail: "contact@amsode.org",
      statut: "verifie",
    })
    .returning();

  const [ongB] = await db
    .insert(organizations)
    .values({
      slug: "ong-b",
      nom: "ONG B",
      description: "Organisation intervenant sur l'eau, l'hygiène et l'assainissement.",
      secteurPrincipal: "wash",
      regions: ["mopti"],
      statut: "verifie",
    })
    .returning();

  const [ongC] = await db
    .insert(organizations)
    .values({
      slug: "ong-c",
      nom: "ONG C",
      description: "Organisation de terrain, production de contenu vidéo.",
      secteurPrincipal: "education",
      regions: ["gao"],
      statut: "verifie",
    })
    .returning();

  const [projetKits] = await db
    .insert(projects)
    .values({
      slug: "distribution-kits-alimentaires-mopti",
      organizationId: amsode.id,
      titre: "Distribution de kits alimentaires — Mopti",
      description: "Distribution de kits alimentaires aux ménages vulnérables du cercle de Mopti.",
      secteur: "securite_alimentaire",
      regions: ["mopti"],
      statut: "en_cours",
      beneficiaires: "2 500 ménages",
      nombreBeneficiaires: 2500,
      resultatCle: "2 500 kits distribués",
    })
    .returning();

  await db.insert(projects).values([
    {
      slug: "formation-femmes-koulikoro",
      organizationId: amsode.id,
      titre: "Formation professionnelle des femmes — Koulikoro",
      secteur: "moyens_existence",
      regions: ["koulikoro"],
      statut: "termine",
      beneficiaires: "350 femmes",
      nombreBeneficiaires: 350,
    },
    {
      slug: "projet-wash-mopti",
      organizationId: ongB.id,
      titre: "Accès à l'eau potable — Mopti",
      secteur: "wash",
      regions: ["mopti"],
      statut: "planifie",
      beneficiaires: "1 200 personnes",
      nombreBeneficiaires: 1200,
    },
  ]);

  await db.insert(publications).values([
    {
      organizationId: amsode.id,
      projectId: projetKits.id,
      contenu: "AMSODE a distribué 2 500 kits alimentaires à des familles vulnérables du cercle de Mopti.",
      secteur: "securite_alimentaire",
      region: "mopti",
      localisation: "Cercle de Mopti",
      nombreBeneficiaires: 2500,
    },
    {
      organizationId: amsode.id,
      contenu: "350 femmes ont bénéficié d'une formation en couture et transformation agroalimentaire à Koulikoro.",
      secteur: "moyens_existence",
      region: "koulikoro",
      nombreBeneficiaires: 350,
    },
    {
      organizationId: ongB.id,
      contenu: "Lancement d'un nouveau projet WASH à Mopti pour l'accès à l'eau potable.",
      secteur: "wash",
      region: "mopti",
      nombreBeneficiaires: 1200,
    },
    {
      organizationId: ongC.id,
      contenu: "Reportage vidéo terrain sur nos activités éducatives à Gao.",
      videoUrl: "https://example.com/video-terrain-gao.mp4",
      secteur: "education",
      region: "gao",
    },
  ]);

  console.log("Seed terminé : 3 organisations, 3 projets, 4 publications.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
