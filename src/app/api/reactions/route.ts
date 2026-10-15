import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reactions } from "@/db/schema";
import { auth } from "@/lib/auth";

// TODO (OpenCode) : brancher l'auth réelle une fois NextAuth configuré avec Neon.
// Ce endpoint attend { publicationId } et ajoute une réaction pour l'utilisateur connecté.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { publicationId } = await req.json();
  if (!publicationId) {
    return NextResponse.json({ error: "publicationId manquant" }, { status: 400 });
  }

  await db
    .insert(reactions)
    .values({ publicationId, userId: session.user.id })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
