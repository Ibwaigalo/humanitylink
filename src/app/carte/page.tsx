import Link from "next/link";
import { arrayContains, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations, projects } from "@/db/schema";
import { SECTEURS, REGIONS, SECTEUR_LABEL, REGION_LABEL, STATUT_PROJET_LABEL } from "@/lib/constants";
import { getPublicationsWithReactions } from "@/lib/publications";
import ProjectCard from "@/components/ProjectCard";
import PublicationCard from "@/components/PublicationCard";
import MaliMap from "@/components/MaliMap";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carte — HumanityLink",
};

function valid(value: string | undefined, allowed: { value: string }[]): string | null {
  if (!value) return null;
  return allowed.some((a) => a.value === value) ? value : null;
}

export default async function CartePage({
  searchParams,
}: {
  searchParams: { secteur?: string; region?: string };
}) {
  const secteur = valid(searchParams.secteur, SECTEURS as unknown as { value: string }[]);
  const region = valid(searchParams.region, REGIONS as unknown as { value: string }[]);

  // Régions où le secteur choisi est actif (projets groupés région × secteur).
  let activeRegions: string[] = [];
  if (secteur) {
    const rows = await db
      .select({ regions: projects.regions })
      .from(projects)
      .where(eq(projects.secteur, secteur as never));
    activeRegions = [...new Set(rows.flatMap((r) => r.regions))];
  }

  const regionProjects = region
    ? await db
        .select({
          id: projects.id,
          slug: projects.slug,
          titre: projects.titre,
          secteur: projects.secteur,
          statut: projects.statut,
          organisationNom: organizations.nom,
        })
        .from(projects)
        .leftJoin(organizations, eq(projects.organizationId, organizations.id))
        .where(arrayContains(projects.regions, [region]))
    : [];

  const regionPublications = region
    ? await getPublicationsWithReactions({ region, limit: 20 })
    : [];

  const secteurParam = secteur ?? undefined;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-hl-navy">Carte des actions humanitaires</h1>
        <p className="text-sm text-slate-500">
          Filtrez par secteur pour voir les régions concernées, ou cliquez sur une
          région pour afficher ses projets et publications.
        </p>
      </header>

      <form
        method="get"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="text-sm font-medium text-slate-700">
          Secteur
          <select
            name="secteur"
            defaultValue={secteur ?? ""}
            className="mt-1 w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-hl-navy focus:outline-none"
          >
            <option value="">— Tous les secteurs —</option>
            {SECTEURS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Région
          <select
            name="region"
            defaultValue={region ?? ""}
            className="mt-1 w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-hl-navy focus:outline-none"
          >
            <option value="">— Toutes —</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-hl-navy px-4 py-2 text-sm font-semibold text-white hover:bg-hl-navy/90"
        >
          Filtrer
        </button>
        {(secteur || region) && (
          <Link href="/carte" className="text-sm font-medium text-slate-500 hover:text-hl-navy">
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MaliMap
            selectedRegion={region}
            selectedSecteur={secteur}
            activeRegions={activeRegions}
          />
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#d3dae6]" /> Autre région
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#B8860B]" /> Secteur actif
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#1F3864]" /> Région sélectionnée
            </span>
          </div>
        </div>

        <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <h2 className="font-semibold text-hl-navy">Légende</h2>
          {secteur ? (
            <div>
              <p className="text-slate-700">
                Secteur <strong>{SECTEUR_LABEL[secteur] ?? secteur}</strong> :
              </p>
              <ul className="mt-2 space-y-1 text-slate-600">
                {activeRegions.length > 0 ? (
                  activeRegions.map((r) => (
                    <li key={r}>• {REGION_LABEL[r] ?? r}</li>
                  ))
                ) : (
                  <li className="text-slate-500">Aucune région active pour ce secteur.</li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-slate-500">
              Choisissez un secteur pour mettre en surbrillance les régions où il
              est actif.
            </p>
          )}
          {region && (
            <p className="border-t border-slate-100 pt-4 text-slate-700">
              Région sélectionnée : <strong>{REGION_LABEL[region] ?? region}</strong>
            </p>
          )}
        </aside>
      </div>

      {region && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-hl-navy">
              Projets dans {REGION_LABEL[region] ?? region}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {regionProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  slug={p.slug}
                  titre={p.titre}
                  secteur={p.secteur}
                  statut={p.statut}
                  organisationNom={p.organisationNom ?? ""}
                />
              ))}
              {regionProjects.length === 0 && (
                <p className="text-sm text-slate-500">Aucun projet dans cette région.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-hl-navy">
              Publications dans {REGION_LABEL[region] ?? region}
            </h2>
            <div className="space-y-3">
              {regionPublications.map((pub) => (
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
                  reactionCount={pub.reactionCount}
                />
              ))}
              {regionPublications.length === 0 && (
                <p className="text-sm text-slate-500">Aucune publication dans cette région.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {!region && !secteur && (
        <p className="text-sm text-slate-500">
          Sélectionnez une région sur la carte ou via le menu pour afficher les
          projets et publications correspondants.
        </p>
      )}
    </div>
  );
}
