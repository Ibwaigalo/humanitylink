import { db } from "@/db";
import { organizations } from "@/db/schema";
import OrgCard from "@/components/OrgCard";

export const revalidate = 60;

export default async function OrganisationsPage() {
  const orgs = await db.select().from(organizations);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-hl-navy">
        Annuaire des organisations
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((org) => (
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
        {orgs.length === 0 && (
          <p className="text-sm text-slate-500">Aucune organisation pour le moment.</p>
        )}
      </div>
    </div>
  );
}
