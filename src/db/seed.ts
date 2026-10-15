import { db } from "./index";
import { organizations, projects, publications, users } from "./schema";

type NewOrg = typeof organizations.$inferInsert;
type NewProject = typeof projects.$inferInsert;
type NewUser = typeof users.$inferInsert;

async function upsertOrg(values: NewOrg) {
  const { slug, ...set } = values;
  const [row] = await db
    .insert(organizations)
    .values(values)
    .onConflictDoUpdate({ target: organizations.slug, set })
    .returning();
  return row;
}

async function upsertProject(values: NewProject) {
  const { slug, ...set } = values;
  const [row] = await db
    .insert(projects)
    .values(values)
    .onConflictDoUpdate({ target: projects.slug, set })
    .returning();
  return row;
}

async function upsertUser(values: NewUser) {
  const { email, ...set } = values;
  const [row] = await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: users.email, set })
    .returning();
  return row;
}

async function seed() {
  const amsode = await upsertOrg({
    slug: "amsode",
    nom: "AMSODE",
    description:
      "Association malienne pour la solidarité et le développement — humanitaire et développement.",
    secteurPrincipal: "securite_alimentaire",
    regions: ["mopti", "segou", "sikasso", "kayes", "koulikoro", "gao", "tombouctou", "bamako"],
    contactEmail: "contact@amsode.org",
    statut: "verifie",
  });

  const ongB = await upsertOrg({
    slug: "ong-b",
    nom: "ONG B",
    description: "Organisation intervenant sur l'eau, l'hygiène et l'assainissement.",
    secteurPrincipal: "wash",
    regions: ["mopti"],
    statut: "verifie",
  });

  const ongC = await upsertOrg({
    slug: "ong-c",
    nom: "ONG C",
    description: "Organisation de terrain, production de contenu vidéo.",
    secteurPrincipal: "education",
    regions: ["gao"],
    statut: "en_attente",
  });

  const projetKits = await upsertProject({
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
  });

  await upsertProject({
    slug: "formation-femmes-koulikoro",
    organizationId: amsode.id,
    titre: "Formation professionnelle des femmes — Koulikoro",
    secteur: "moyens_existence",
    regions: ["koulikoro"],
    statut: "termine",
    beneficiaires: "350 femmes",
    nombreBeneficiaires: 350,
  });

  await upsertProject({
    slug: "projet-wash-mopti",
    organizationId: ongB.id,
    titre: "Accès à l'eau potable — Mopti",
    secteur: "wash",
    regions: ["mopti"],
    statut: "planifie",
    beneficiaires: "1 200 personnes",
    nombreBeneficiaires: 1200,
  });

  await upsertUser({
    name: "Admin Plateforme",
    email: "admin@humanitylink.org",
    role: "administrateur_plateforme",
  });

  await upsertUser({
    name: "Modérateur",
    email: "moderateur@humanitylink.org",
    role: "moderateur",
  });

  await upsertUser({
    name: "Responsable AMSODE",
    email: "responsable@amsode.org",
    role: "administrateur_ong",
    organizationId: amsode.id,
  });

  await upsertUser({
    name: "Membre AMSODE",
    email: "membre@amsode.org",
    role: "membre_organisation",
    organizationId: amsode.id,
  });

  await upsertUser({
    name: "Responsable ONG B",
    email: "contact@ongb.org",
    role: "administrateur_ong",
    organizationId: ongB.id,
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  if (adminEmail) {
    await upsertUser({
      name: "Admin (seed)",
      email: adminEmail,
      role: "administrateur_plateforme",
    });
  }

  const orgEmail = process.env.SEED_ORG_EMAIL?.trim();
  if (orgEmail) {
    await upsertUser({
      name: "Responsable ONG (seed)",
      email: orgEmail,
      role: "administrateur_ong",
      organizationId: amsode.id,
    });
  }

  await db.delete(publications);

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

  const totalUsers = (await db.select().from(users)).length;
  console.log(
    `Seed terminé : 3 organisations, 3 projets, 4 publications, ${totalUsers} utilisateurs.`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
