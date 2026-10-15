import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations, projects, publications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isOrgRole } from "@/lib/guards";
import {
  createPublication,
  createProject,
  deleteProject,
  deletePublication,
  updateOrganisation,
  updateProject,
} from "./actions";
import {
  RegionCheckboxes,
  RegionSelect,
  SecteurSelect,
  StatutSelect,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import FileUploadField from "@/components/FileUploadField";
import {
  ORG_STATUT_LABEL,
  ROLE_LABEL,
  SECTEUR_LABEL,
  REGION_LABEL,
  STATUT_PROJET_LABEL,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  if (!isOrgRole(session.user.role) || !session.user.organizationId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-hl-navy">Accès restreint</h1>
        <p className="mt-2 text-sm text-slate-700">
          Le tableau de bord est réservé aux comptes d&rsquo;organisation
          (administrateur ONG ou membre d&rsquo;organisation). Votre rôle actuel :{" "}
          <strong>{ROLE_LABEL[session.user.role] ?? session.user.role}</strong>.
        </p>
      </div>
    );
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, session.user.organizationId),
  });

  if (!org) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Aucune organisation n&rsquo;est rattachée à ce compte. Contactez
        l&rsquo;administrateur de la plateforme.
      </div>
    );
  }

  const orgProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, org.id))
    .orderBy(desc(projects.createdAt));

  const orgPublications = await db
    .select()
    .from(publications)
    .where(eq(publications.organizationId, org.id))
    .orderBy(desc(publications.createdAt))
    .limit(20);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-hl-navy">Tableau de bord</h1>
          <p className="text-sm text-slate-500">
            {org.nom} ·{" "}
            <span className="font-medium text-slate-700">
              {ORG_STATUT_LABEL[org.statut] ?? org.statut}
            </span>
          </p>
        </div>
        <Link
          href={`/organisations/${org.slug}`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-hl-navy hover:text-hl-navy"
        >
          Voir ma fiche publique
        </Link>
      </header>

      {org.statut === "en_attente" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Votre organisation est en attente de vérification. Elle n&rsquo;apparaîtra
          pas encore comme « vérifiée » dans l&rsquo;annuaire.
        </p>
      )}

      {/* ---------- Profil organisation ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-hl-navy">
          Profil de mon organisation
        </h2>
        <form action={updateOrganisation} className="space-y-4">
          <TextField label="Nom" name="nom" defaultValue={org.nom} required />
          <TextAreaField
            label="Description"
            name="description"
            defaultValue={org.description}
            rows={4}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SecteurSelect
              name="secteurPrincipal"
              defaultValue={org.secteurPrincipal}
              required
            />
            <FileUploadField label="Logo" name="logoUrl" kind="image" defaultValue={org.logoUrl} />
            <TextField label="Site web" name="siteWeb" defaultValue={org.siteWeb} />
            <TextField
              label="Page Facebook"
              name="facebookUrl"
              defaultValue={org.facebookUrl}
            />
          </div>
          <RegionCheckboxes selected={org.regions} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Contact (nom)" name="contactNom" defaultValue={org.contactNom} />
            <TextField
              label="Email de contact"
              name="contactEmail"
              type="email"
              defaultValue={org.contactEmail}
            />
            <TextField
              label="Téléphone"
              name="contactTelephone"
              defaultValue={org.contactTelephone}
            />
          </div>
          <SubmitButton>Enregistrer le profil</SubmitButton>
        </form>
      </section>

      {/* ---------- Publications ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-hl-navy">
          Publier une actualité
        </h2>
        <form action={createPublication} className="space-y-4">
          <TextAreaField
            label="Contenu de la publication"
            name="contenu"
            rows={4}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SecteurSelect name="secteur" allowEmpty />
            <RegionSelect name="region" allowEmpty />
            <TextField
              label="Localisation (ex. Cercle de Mopti)"
              name="localisation"
            />
            <TextField
              label="Nombre de bénéficiaires"
              name="nombreBeneficiaires"
              type="number"
            />
            <TextField
              label="Date de l'événement"
              name="dateEvenement"
              type="datetime-local"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FileUploadField label="Photo" name="imageUrl" kind="image" />
            <FileUploadField label="Vidéo" name="videoUrl" kind="video" />
          </div>
          <SubmitButton>Publier</SubmitButton>
        </form>

        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Mes dernières publications ({orgPublications.length})
          </h3>
          <ul className="space-y-2">
            {orgPublications.map((pub) => (
              <li
                key={pub.id}
                className="flex items-start justify-between gap-4 rounded border border-slate-100 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700">{pub.contenu}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {pub.secteur ? `${SECTEUR_LABEL[pub.secteur] ?? pub.secteur} · ` : ""}
                    {pub.region ? `${REGION_LABEL[pub.region] ?? pub.region} · ` : ""}
                    {pub.createdAt.toLocaleDateString("fr-FR")}
                    {pub.masque ? " · masquée" : ""}
                  </p>
                </div>
                <form action={deletePublication}>
                  <input type="hidden" name="publicationId" value={pub.id} />
                  <button
                    type="submit"
                    className="whitespace-nowrap text-xs font-medium text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
            {orgPublications.length === 0 && (
              <p className="text-sm text-slate-500">Aucune publication pour le moment.</p>
            )}
          </ul>
        </div>
      </section>

      {/* ---------- Projets ---------- */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-hl-navy">
          Créer une fiche projet
        </h2>
        <form action={createProject} className="space-y-4">
          <TextField label="Titre du projet" name="titre" required />
          <TextAreaField label="Description" name="description" rows={3} />
          <div className="grid gap-4 sm:grid-cols-3">
            <SecteurSelect name="secteur" required />
            <StatutSelect />
            <TextField
              label="Bénéficiaires (texte, ex. 500 femmes)"
              name="beneficiaires"
            />
            <TextField
              label="Nombre de bénéficiaires"
              name="nombreBeneficiaires"
              type="number"
            />
            <TextField label="Période — début" name="periodeDebut" type="date" />
            <TextField label="Période — fin" name="periodeFin" type="date" />
          </div>
          <TextAreaField label="Résultat clé" name="resultatCle" rows={2} />
          <FileUploadField label="Image" name="imageUrl" kind="image" />
          <RegionCheckboxes />
          <SubmitButton>Créer le projet</SubmitButton>
        </form>

        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Mes projets ({orgProjects.length})
          </h3>
          {orgProjects.map((project) => (
            <details
              key={project.id}
              className="rounded border border-slate-200 p-3"
            >
              <summary className="cursor-pointer text-sm font-medium text-hl-navy">
                {project.titre}{" "}
                <span className="font-normal text-slate-400">
                  · {STATUT_PROJET_LABEL[project.statut] ?? project.statut}
                </span>
              </summary>
              <form action={updateProject} className="mt-4 space-y-4">
                <input type="hidden" name="projectId" value={project.id} />
                <TextField label="Titre du projet" name="titre" defaultValue={project.titre} required />
                <TextAreaField
                  label="Description"
                  name="description"
                  defaultValue={project.description}
                  rows={3}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <SecteurSelect name="secteur" defaultValue={project.secteur} required />
                  <StatutSelect defaultValue={project.statut} />
                  <TextField
                    label="Bénéficiaires (texte)"
                    name="beneficiaires"
                    defaultValue={project.beneficiaires}
                  />
                  <TextField
                    label="Nombre de bénéficiaires"
                    name="nombreBeneficiaires"
                    type="number"
                    defaultValue={project.nombreBeneficiaires?.toString() ?? null}
                  />
                  <TextField
                    label="Période — début"
                    name="periodeDebut"
                    type="date"
                    defaultValue={project.periodeDebut?.toISOString().slice(0, 10) ?? null}
                  />
                  <TextField
                    label="Période — fin"
                    name="periodeFin"
                    type="date"
                    defaultValue={project.periodeFin?.toISOString().slice(0, 10) ?? null}
                  />
                </div>
                <TextAreaField
                  label="Résultat clé"
                  name="resultatCle"
                  defaultValue={project.resultatCle}
                  rows={2}
                />
                <FileUploadField label="Image" name="imageUrl" kind="image" defaultValue={project.imageUrl} />
                <RegionCheckboxes selected={project.regions} />
                <div className="flex items-center gap-3">
                  <SubmitButton>Enregistrer</SubmitButton>
                </div>
              </form>
              <form action={deleteProject} className="mt-2">
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Supprimer ce projet
                </button>
              </form>
            </details>
          ))}
          {orgProjects.length === 0 && (
            <p className="text-sm text-slate-500">Aucun projet pour le moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
