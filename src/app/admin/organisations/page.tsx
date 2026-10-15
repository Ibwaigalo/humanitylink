import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isPlatformAdminRole } from "@/lib/guards";
import { ORG_STATUT_LABEL, REGION_LABEL } from "@/lib/constants";
import { setOrgStatut } from "./actions";

export const dynamic = "force-dynamic";

function StatutBadge({ statut }: { statut: string }) {
  const styles =
    statut === "verifie"
      ? "bg-green-100 text-green-700"
      : statut === "non_verifie"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span className={`rounded px-2 py-1 text-xs font-medium ${styles}`}>
      {ORG_STATUT_LABEL[statut] ?? statut}
    </span>
  );
}

export default async function AdminOrganisationsPage() {
  const session = await auth();
  if (!isPlatformAdminRole(session?.user?.role)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-hl-navy">Accès restreint</h1>
        <p className="mt-2 text-sm text-slate-700">
          Cette page est réservée à l&rsquo;administrateur de la plateforme.
        </p>
      </div>
    );
  }

  const enAttente = await db
    .select()
    .from(organizations)
    .where(eq(organizations.statut, "en_attente"))
    .orderBy(desc(organizations.createdAt));

  const toutes = await db
    .select()
    .from(organizations)
    .orderBy(desc(organizations.createdAt));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-hl-navy">Validation des organisations</h1>
        <p className="text-sm text-slate-500">
          {enAttente.length} organisation(s) en attente de vérification.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">
          En attente de vérification
        </h2>
        <div className="space-y-3">
          {enAttente.map((org) => (
            <div
              key={org.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-amber-200 bg-white p-4"
            >
              <div>
                <Link
                  href={`/organisations/${org.slug}`}
                  className="font-semibold text-hl-navy hover:underline"
                >
                  {org.nom}
                </Link>
                <p className="text-xs text-slate-500">
                  {org.regions.map((r) => REGION_LABEL[r] ?? r).join(", ") || "Région non renseignée"}
                  {org.contactEmail ? ` · ${org.contactEmail}` : ""}
                </p>
              </div>
              <form action={setOrgStatut} className="flex gap-2">
                <input type="hidden" name="orgId" value={org.id} />
                <button
                  type="submit"
                  name="statut"
                  value="verifie"
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Vérifier
                </button>
                <button
                  type="submit"
                  name="statut"
                  value="non_verifie"
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Refuser
                </button>
              </form>
            </div>
          ))}
          {enAttente.length === 0 && (
            <p className="text-sm text-slate-500">Aucune organisation en attente.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-hl-navy">Toutes les organisations</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {toutes.map((org) => (
                <tr key={org.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/organisations/${org.slug}`}
                      className="font-medium text-hl-navy hover:underline"
                    >
                      {org.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={org.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <form action={setOrgStatut} className="flex gap-2">
                      <input type="hidden" name="orgId" value={org.id} />
                      <button
                        type="submit"
                        name="statut"
                        value="verifie"
                        className="text-xs font-medium text-green-700 hover:underline"
                      >
                        Vérifier
                      </button>
                      <button
                        type="submit"
                        name="statut"
                        value="non_verifie"
                        className="text-xs font-medium text-amber-700 hover:underline"
                      >
                        Non vérifiée
                      </button>
                      <button
                        type="submit"
                        name="statut"
                        value="en_attente"
                        className="text-xs font-medium text-slate-500 hover:underline"
                      >
                        Remettre en attente
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {toutes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm text-slate-500">
                    Aucune organisation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
