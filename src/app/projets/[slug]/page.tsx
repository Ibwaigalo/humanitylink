import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export default async function ProjetPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, params.slug),
  });

  if (!project) notFound();

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, project.organizationId),
  });

  return (
    <article className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-hl-navy">{project.titre}</h1>
        {org && (
          <Link
            href={`/organisations/${org.slug}`}
            className="mt-1 inline-block text-sm text-hl-gold hover:underline"
          >
            {org.nom}
          </Link>
        )}
        <div className="mt-3 flex gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">
            {project.secteur}
          </span>
          <span className="rounded bg-hl-navy/10 px-2 py-1 text-hl-navy">
            {project.statut}
          </span>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-slate-700">{project.description}</p>
        {project.beneficiaires && (
          <p className="mt-4 text-sm text-slate-600">
            <strong>Bénéficiaires :</strong> {project.beneficiaires}
          </p>
        )}
        {project.resultatCle && (
          <p className="mt-2 text-sm text-slate-600">
            <strong>Résultat clé :</strong> {project.resultatCle}
          </p>
        )}
      </section>
    </article>
  );
}
