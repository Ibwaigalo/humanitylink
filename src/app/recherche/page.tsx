import { db } from "@/db";
import { organizations } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import OrgCard from "@/components/OrgCard";

export const revalidate = 0;

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";

  const results = q
    ? await db
        .select()
        .from(organizations)
        .where(
          or(
            ilike(organizations.nom, `%${q}%`),
            ilike(organizations.description, `%${q}%`)
          )
        )
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-hl-navy">Recherche</h1>
      <form className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher une organisation, un secteur, une région..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-hl-navy focus:outline-none"
        />
      </form>

      {q && (
        <p className="mb-4 text-sm text-slate-500">
          {results.length} résultat(s) pour « {q} »
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((org) => (
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
      </div>
    </div>
  );
}
