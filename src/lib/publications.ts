import { db } from "@/db";
import { organizations, publications, reactions } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

type Options = {
  organizationId?: string;
  region?: string;
  limit?: number;
};

// Fil de publications non masquées, avec le nombre de réactions agrégé côté
// serveur (comptage SQL, pas d'appel API). Réutilisé par l'accueil, la fiche
// organisation et la carte.
export async function getPublicationsWithReactions({
  organizationId,
  region,
  limit = 20,
}: Options = {}) {
  const conditions = [eq(publications.masque, false)];
  if (organizationId) {
    conditions.push(eq(publications.organizationId, organizationId));
  }
  if (region) {
    conditions.push(eq(publications.region, region));
  }

  const rows = await db
    .select({
      id: publications.id,
      contenu: publications.contenu,
      imageUrl: publications.imageUrl,
      videoUrl: publications.videoUrl,
      secteur: publications.secteur,
      region: publications.region,
      localisation: publications.localisation,
      nombreBeneficiaires: publications.nombreBeneficiaires,
      createdAt: publications.createdAt,
      organisationNom: organizations.nom,
      organisationSlug: organizations.slug,
      reactionCount: sql<number>`count(${reactions.userId})`.as("reaction_count"),
    })
    .from(publications)
    .innerJoin(organizations, eq(publications.organizationId, organizations.id))
    .leftJoin(reactions, eq(reactions.publicationId, publications.id))
    .where(and(...conditions))
    .groupBy(publications.id, organizations.nom, organizations.slug)
    .orderBy(desc(publications.createdAt))
    .limit(limit);

  return rows.map((row) => ({ ...row, reactionCount: Number(row.reactionCount) }));
}
