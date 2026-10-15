import { db } from "@/db";
import { organizations, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import OrgCard from "@/components/OrgCard";
import ProjectCard from "@/components/ProjectCard";
import PublicationCard from "@/components/PublicationCard";
import { getPublicationsWithReactions } from "@/lib/publications";

export const revalidate = 60;

export default async function HomePage() {
  const recentOrgs = await db
    .select()
    .from(organizations)
    .where(eq(organizations.statut, "verifie"))
    .orderBy(desc(organizations.createdAt))
    .limit(6);

  const recentProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(6);

  // Fil d'actualité : dernières publications non masquées, avec organisation
  // et nombre de réactions agrégé (comptage côté serveur, pas via l'API).
  const feed = await getPublicationsWithReactions({ limit: 20 });

  return (
    <div className="space-y-12">
      <section className="rounded-xl bg-hl-navy px-8 py-14 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          La plateforme où l&rsquo;on voit ce que font les ONG au Mali
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-200">
          Organisations, projets et résultats de terrain, structurés et
          consultables librement.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-hl-navy">
          Fil humanitaire du Mali
        </h2>
        <div className="space-y-3">
          {feed.map((pub) => (
            <PublicationCard
              key={pub.id}
              id={pub.id}
              organisationNom={pub.organisationNom}
              organisationSlug={pub.organisationSlug}
              contenu={pub.contenu}
              imageUrl={pub.imageUrl}
              videoUrl={pub.videoUrl}
              secteur={pub.secteur}
              region={pub.region}
              localisation={pub.localisation}
              nombreBeneficiaires={pub.nombreBeneficiaires}
              createdAt={pub.createdAt.toISOString()}
              reactionCount={Number(pub.reactionCount)}
            />
          ))}
          {feed.length === 0 && (
            <p className="text-sm text-slate-500">
              Aucune publication pour le moment.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-hl-navy">
          Organisations vérifiées récemment
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentOrgs.map((org) => (
            <OrgCard
              key={org.id}
              slug={org.slug}
              nom={org.nom}
              secteurPrincipal={org.secteurPrincipal}
              regions={org.regions}
              statut={org.statut}
              logoUrl={org.logoUrl}
            />
          ))}
          {recentOrgs.length === 0 && (
            <p className="text-sm text-slate-500">
              Aucune organisation vérifiée pour le moment.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-hl-navy">
          Projets récents
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              titre={project.titre}
              secteur={project.secteur}
              statut={project.statut}
              organisationNom=""
            />
          ))}
          {recentProjects.length === 0 && (
            <p className="text-sm text-slate-500">
              Aucun projet publié pour le moment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
