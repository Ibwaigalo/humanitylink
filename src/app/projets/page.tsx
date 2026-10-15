import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProjectCard from "@/components/ProjectCard";

export const revalidate = 60;

export default async function ProjetsPage() {
  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      titre: projects.titre,
      secteur: projects.secteur,
      statut: projects.statut,
      organisationNom: organizations.nom,
    })
    .from(projects)
    .leftJoin(organizations, eq(projects.organizationId, organizations.id));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-hl-navy">
        Projets sur le terrain
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <ProjectCard
            key={p.id}
            slug={p.slug}
            titre={p.titre}
            secteur={p.secteur}
            statut={p.statut}
            organisationNom={p.organisationNom ?? ""}
          />
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-slate-500">Aucun projet pour le moment.</p>
        )}
      </div>
    </div>
  );
}
