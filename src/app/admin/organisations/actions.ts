"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { isPlatformAdminRole } from "@/lib/guards";

type OrgStatut = "en_attente" | "verifie" | "non_verifie";

export async function setOrgStatut(formData: FormData) {
  const session = await auth();
  if (!isPlatformAdminRole(session?.user?.role)) {
    throw new Error("Accès refusé : administrateur plateforme requis.");
  }

  const id = String(formData.get("orgId") ?? "");
  const statut = String(formData.get("statut") ?? "") as OrgStatut;
  if (!id || !["verifie", "non_verifie", "en_attente"].includes(statut)) {
    throw new Error("Paramètres invalides.");
  }

  await db
    .update(organizations)
    .set({ statut, updatedAt: new Date() })
    .where(eq(organizations.id, id));

  revalidatePath("/admin/organisations");
  revalidatePath("/organisations");
  revalidatePath("/");
}
