import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { isOrgRole } from "@/lib/guards";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
];

function extensionFor(type: string, filename: string): string {
  const fromName = filename.includes(".")
    ? filename.split(".").pop()!.toLowerCase()
    : "";
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "video/mp4") return "mp4";
  if (type === "video/webm") return "webm";
  return "bin";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !isOrgRole(session.user.role)) {
    return NextResponse.json(
      { error: "Accès refusé : compte organisation requis." },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 Mo)." },
      { status: 413 }
    );
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Format non supporté (images : JPEG, PNG, WebP, GIF, AVIF ; vidéos : MP4, WebM, MOV, OGG)." },
      { status: 415 }
    );
  }

  const ext = extensionFor(file.type, file.name);
  const pathname = `uploads/${crypto.randomUUID()}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Upload Blob échoué:", err);
    return NextResponse.json(
      { error: "Échec de l'upload. Réessayez." },
      { status: 500 }
    );
  }
}
