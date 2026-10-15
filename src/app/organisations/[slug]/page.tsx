import { db } from "@/db";
import { organizations, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import PublicationCard from "@/components/PublicationCard";
import { getPublicationsWithReactions } from "@/lib/publications";

export const revalidate = 60;

export default async function OrganisationPage({
  params,
}: {
  params: { slug: string };
}) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, params.slug),
  });

  if (!org) notFound();

  const orgProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, org.id));

  // Publications de l'organisation, avec le vrai compteur de réactions agrégé
  // (même requête groupée que sur la page d'accueil).
  const orgPublications = await getPublicationsWithReactions({
    organizationId: org.id,
    limit: 10,
  });

  // Compteurs agrégés affichés sur le profil (nombre de projets, total des
  // bénéficiaires chiffrés, nombre de régions couvertes). Le total bénéficiaires
  // ne compte que les projets avec un chiffre renseigné (nombreBeneficiaires) —
  // un projet sans chiffre n'est pas compté comme 0.
  const totalBeneficiaires = orgProjects.reduce(
    (sum, p) => sum + (p.nombreBeneficiaires ?? 0),
    0
  );
  const regionsCouvertes = new Set(orgProjects.flatMap((p) => p.regions)).size;

  return (
    <div className="space-y-8">
      <header className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-hl-navy">{org.nom}</h1>
          {org.statut === "verifie" && (
            <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Organisation vérifiée
            </span>
          )}
        </div>
        <p className="mt-2 text-slate-600">{org.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          {org.secteurPrincipal} — {org.regions.join(", ")}
        </p>
        {org.contactEmail && (
          <p className="mt-2 text-sm text-slate-500">
            Contact : {org.contactEmail}
            {org.contactTelephone ? ` · ${org.contactTelephone}` : ""}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-sm">
          <div>
            <span className="text-lg font-bold text-hl-navy">{orgProjects.length}</span>{" "}
            <span className="text-slate-500">projets</span>
          </div>
          <div>
            <span className="text-lg font-bold text-hl-navy">
              {totalBeneficiaires.toLocaleString("fr-FR")}
            </span>{" "}
            <span className="text-slate-500">bénéficiaires</span>
          </div>
          <div>
            <span className="text-lg font-bold text-hl-navy">{regionsCouvertes}</span>{" "}
            <span className="text-slate-500">régions</span>
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">Projets</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {orgProjects.map((p) => (
            <ProjectCard
              key={p.id}
              slug={p.slug}
              titre={p.titre}
              secteur={p.secteur}
              statut={p.statut}
              organisationNom={org.nom}
            />
          ))}
          {orgProjects.length === 0 && (
            <p className="text-sm text-slate-500">Aucun projet publié.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">
          Publications récentes
        </h2>
        <div className="space-y-3">
          {orgPublications.map((pub) => (
            <PublicationCard
              key={pub.id}
              id={pub.id}
              organisationNom={org.nom}
              organisationSlug={org.slug}
              contenu={pub.contenu}
              imageUrl={pub.imageUrl}
              videoUrl={pub.videoUrl}
              secteur={pub.secteur}
              region={pub.region}
              localisation={pub.localisation}
              nombreBeneficiaires={pub.nombreBeneficiaires}
              createdAt={pub.createdAt.toISOString()}
              reactionCount={pub.reactionCount}
            />
          ))}
          {orgPublications.length === 0 && (
            <p className="text-sm text-slate-500">Aucune publication.</p>
          )}
        </div>
      </section>
    </div>
  );
}
