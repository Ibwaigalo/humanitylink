"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organizations, projects, publications } from "@/db/schema";
import { isOrgRole } from "@/lib/guards";

async function requireOrgUser() {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.organizationId || !isOrgRole(user.role)) {
    throw new Error("Accès refusé : compte organisation requis.");
  }
  return user as typeof user & { organizationId: string };
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullable(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const value = text(formData, key);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function intOrNull(formData: FormData, key: string): number | null {
  const value = text(formData, key).replace(/[^0-9-]/g, "");
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
  return base.length > 0 ? base : "sans-titre";
}

function uniqueSlug(input: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slugify(input)}-${suffix}`;
}

function selectedRegions(formData: FormData): string[] {
  return formData.getAll("regions").map((value) => String(value));
}

export async function updateOrganisation(formData: FormData) {
  const user = await requireOrgUser();

  await db
    .update(organizations)
    .set({
      nom: text(formData, "nom"),
      description: nullable(formData, "description"),
      logoUrl: nullable(formData, "logoUrl"),
      siteWeb: nullable(formData, "siteWeb"),
      facebookUrl: nullable(formData, "facebookUrl"),
      secteurPrincipal: text(formData, "secteurPrincipal") as never,
      regions: selectedRegions(formData),
      contactNom: nullable(formData, "contactNom"),
      contactEmail: nullable(formData, "contactEmail"),
      contactTelephone: nullable(formData, "contactTelephone"),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, user.organizationId));

  revalidatePath("/dashboard");
  revalidatePath("/organisations");
  revalidatePath("/");
}

export async function createProject(formData: FormData) {
  const user = await requireOrgUser();
  const titre = text(formData, "titre");

  await db.insert(projects).values({
    slug: uniqueSlug(titre),
    organizationId: user.organizationId,
    titre,
    description: nullable(formData, "description"),
    secteur: text(formData, "secteur") as never,
    regions: selectedRegions(formData),
    statut: (text(formData, "statut") || "planifie") as never,
    periodeDebut: dateOrNull(formData, "periodeDebut"),
    periodeFin: dateOrNull(formData, "periodeFin"),
    beneficiaires: nullable(formData, "beneficiaires"),
    nombreBeneficiaires: intOrNull(formData, "nombreBeneficiaires"),
    resultatCle: nullable(formData, "resultatCle"),
    imageUrl: nullable(formData, "imageUrl"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/projets");
  revalidatePath("/");
}

export async function updateProject(formData: FormData) {
  const user = await requireOrgUser();
  const id = text(formData, "projectId");

  await db
    .update(projects)
    .set({
      titre: text(formData, "titre"),
      description: nullable(formData, "description"),
      secteur: text(formData, "secteur") as never,
      regions: selectedRegions(formData),
      statut: (text(formData, "statut") || "planifie") as never,
      periodeDebut: dateOrNull(formData, "periodeDebut"),
      periodeFin: dateOrNull(formData, "periodeFin"),
      beneficiaires: nullable(formData, "beneficiaires"),
      nombreBeneficiaires: intOrNull(formData, "nombreBeneficiaires"),
      resultatCle: nullable(formData, "resultatCle"),
      imageUrl: nullable(formData, "imageUrl"),
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.organizationId, user.organizationId)));

  revalidatePath("/dashboard");
  revalidatePath("/projets");
}

export async function deleteProject(formData: FormData) {
  const user = await requireOrgUser();
  const id = text(formData, "projectId");

  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.organizationId, user.organizationId)));

  revalidatePath("/dashboard");
  revalidatePath("/projets");
}

export async function createPublication(formData: FormData) {
  const user = await requireOrgUser();
  const contenu = text(formData, "contenu");

  await db.insert(publications).values({
    organizationId: user.organizationId,
    authorId: user.id,
    projectId: nullable(formData, "projectId"),
    contenu,
    imageUrl: nullable(formData, "imageUrl"),
    videoUrl: nullable(formData, "videoUrl"),
    secteur: (nullable(formData, "secteur") as never) ?? undefined,
    region: nullable(formData, "region"),
    localisation: nullable(formData, "localisation"),
    dateEvenement: dateOrNull(formData, "dateEvenement"),
    nombreBeneficiaires: intOrNull(formData, "nombreBeneficiaires"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function deletePublication(formData: FormData) {
  const user = await requireOrgUser();
  const id = text(formData, "publicationId");

  await db
    .delete(publications)
    .where(
      and(eq(publications.id, id), eq(publications.organizationId, user.organizationId))
    );

  revalidatePath("/dashboard");
  revalidatePath("/");
}
