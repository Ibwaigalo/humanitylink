import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations, publications, signalements } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isModeratorRole } from "@/lib/guards";
import { SECTEUR_LABEL, REGION_LABEL } from "@/lib/constants";
import { masquerPublication, restaurerPublication, traiterSignalement } from "./actions";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  if (!isModeratorRole(session?.user?.role)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-hl-navy">Accès restreint</h1>
        <p className="mt-2 text-sm text-slate-700">
          Cette page est réservée aux modérateurs.
        </p>
      </div>
    );
  }

  const publicationsEnLigne = await db
    .select({
      id: publications.id,
      contenu: publications.contenu,
      secteur: publications.secteur,
      region: publications.region,
      createdAt: publications.createdAt,
      organisationNom: organizations.nom,
      organisationSlug: organizations.slug,
    })
    .from(publications)
    .innerJoin(organizations, eq(publications.organizationId, organizations.id))
    .where(eq(publications.masque, false))
    .orderBy(desc(publications.createdAt))
    .limit(50);

  const signalementsOuverts = await db
    .select({
      id: signalements.id,
      motif: signalements.motif,
      createdAt: signalements.createdAt,
      publicationId: publications.id,
      contenu: publications.contenu,
      organisationNom: organizations.nom,
    })
    .from(signalements)
    .innerJoin(publications, eq(signalements.publicationId, publications.id))
    .innerJoin(organizations, eq(publications.organizationId, organizations.id))
    .where(eq(signalements.traite, false))
    .orderBy(desc(signalements.createdAt));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-hl-navy">Modération</h1>
        <p className="text-sm text-slate-500">
          {signalementsOuverts.length} signalement(s) à traiter.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">
          Signalements non traités
        </h2>
        <div className="space-y-3">
          {signalementsOuverts.map((sig) => (
            <div
              key={sig.id}
              className="rounded-lg border border-red-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-red-700">
                Motif : {sig.motif}
              </p>
              <p className="mt-2 text-sm text-slate-700">{sig.contenu}</p>
              <p className="mt-1 text-xs text-slate-400">
                {sig.organisationNom} ·{" "}
                {new Date(sig.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <div className="mt-3 flex gap-2">
                <form action={masquerPublication}>
                  <input type="hidden" name="publicationId" value={sig.publicationId} />
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Masquer la publication
                  </button>
                </form>
                <form action={traiterSignalement}>
                  <input type="hidden" name="signalementId" value={sig.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-hl-navy hover:text-hl-navy"
                  >
                    Marquer comme traité
                  </button>
                </form>
              </div>
            </div>
          ))}
          {signalementsOuverts.length === 0 && (
            <p className="text-sm text-slate-500">Aucun signalement en attente.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">
          Publications en ligne ({publicationsEnLigne.length})
        </h2>
        <div className="space-y-2">
          {publicationsEnLigne.map((pub) => (
            <div
              key={pub.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-700">{pub.contenu}</p>
                <p className="mt-1 text-xs text-slate-400">
                  <Link
                    href={`/organisations/${pub.organisationSlug}`}
                    className="text-hl-navy hover:underline"
                  >
                    {pub.organisationNom}
                  </Link>
                  {pub.secteur ? ` · ${SECTEUR_LABEL[pub.secteur] ?? pub.secteur}` : ""}
                  {pub.region ? ` · ${REGION_LABEL[pub.region] ?? pub.region}` : ""}
                </p>
              </div>
              <form action={masquerPublication}>
                <input type="hidden" name="publicationId" value={pub.id} />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Masquer
                </button>
              </form>
            </div>
          ))}
          {publicationsEnLigne.length === 0 && (
            <p className="text-sm text-slate-500">Aucune publication en ligne.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">
          Publications masquées (restaurer)
        </h2>
        <PublicationsMasquees />
      </section>
    </div>
  );
}

async function PublicationsMasquees() {
  const rows = await db
    .select({
      id: publications.id,
      contenu: publications.contenu,
      organisationNom: organizations.nom,
    })
    .from(publications)
    .innerJoin(organizations, eq(publications.organizationId, organizations.id))
    .where(eq(publications.masque, true))
    .orderBy(desc(publications.createdAt))
    .limit(30);

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Aucune publication masquée.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((pub) => (
        <div
          key={pub.id}
          className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <div className="min-w-0">
            <p className="text-sm text-slate-600">{pub.contenu}</p>
            <p className="mt-1 text-xs text-slate-400">{pub.organisationNom}</p>
          </div>
          <form action={restaurerPublication}>
            <input type="hidden" name="publicationId" value={pub.id} />
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Restaurer
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
