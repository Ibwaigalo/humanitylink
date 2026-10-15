"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { publications, signalements } from "@/db/schema";
import { isModeratorRole } from "@/lib/guards";

export async function masquerPublication(formData: FormData) {
  const session = await auth();
  if (!isModeratorRole(session?.user?.role)) {
    throw new Error("Accès refusé : modérateur requis.");
  }

  const id = String(formData.get("publicationId") ?? "");
  if (!id) throw new Error("Publication manquante.");

  await db.update(publications).set({ masque: true }).where(eq(publications.id, id));
  await db
    .update(signalements)
    .set({ traite: true })
    .where(eq(signalements.publicationId, id));

  revalidatePath("/admin/moderation");
  revalidatePath("/");
}

export async function restaurerPublication(formData: FormData) {
  const session = await auth();
  if (!isModeratorRole(session?.user?.role)) {
    throw new Error("Accès refusé : modérateur requis.");
  }

  const id = String(formData.get("publicationId") ?? "");
  if (!id) throw new Error("Publication manquante.");

  await db.update(publications).set({ masque: false }).where(eq(publications.id, id));

  revalidatePath("/admin/moderation");
  revalidatePath("/");
}

export async function traiterSignalement(formData: FormData) {
  const session = await auth();
  if (!isModeratorRole(session?.user?.role)) {
    throw new Error("Accès refusé : modérateur requis.");
  }

  const id = String(formData.get("signalementId") ?? "");
  if (!id) throw new Error("Signalement manquant.");

  await db.update(signalements).set({ traite: true }).where(eq(signalements.id, id));

  revalidatePath("/admin/moderation");
}
