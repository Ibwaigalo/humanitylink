"use client";

import { useState } from "react";

type PublicationCardProps = {
  id: string;
  organisationNom: string;
  organisationSlug: string;
  contenu: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  secteur?: string | null;
  region?: string | null;
  localisation?: string | null;
  nombreBeneficiaires?: number | null;
  createdAt: string; // ISO
  reactionCount: number;
};

const secteurLabel: Record<string, string> = {
  sante: "Santé",
  education: "Éducation",
  wash: "WASH",
  protection: "Protection",
  securite_alimentaire: "Sécurité alimentaire",
  abris: "Abris",
  moyens_existence: "Moyens d'existence",
  nutrition: "Nutrition",
  cccm: "CCCM",
  environnement: "Environnement",
  developpement: "Développement",
  paix: "Paix",
  triple_nexus: "Triple Nexus",
  droits_humains: "Droits humains",
  autre: "Autre",
};

function tempsEcoule(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `${h} h`;
  const j = Math.floor(h / 24);
  return j === 1 ? "hier" : `${j} j`;
}

export default function PublicationCard({
  id,
  organisationNom,
  organisationSlug,
  contenu,
  imageUrl,
  videoUrl,
  secteur,
  region,
  localisation,
  nombreBeneficiaires,
  createdAt,
  reactionCount,
}: PublicationCardProps) {
  const [count, setCount] = useState(reactionCount);
  const [reagi, setReagi] = useState(false);
  const [copie, setCopie] = useState(false);

  async function reagir() {
    if (reagi) return; // un like par utilisateur, pas de retrait pour rester simple en MVP
    setReagi(true);
    setCount((c) => c + 1);
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicationId: id }),
      });
    } catch {
      // silencieux : le compteur reste optimiste, TODO gestion d'erreur (OpenCode)
    }
  }

  function partager() {
    const url = `${window.location.origin}/organisations/${organisationSlug}#pub-${id}`;
    navigator.clipboard?.writeText(url);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <article
      id={`pub-${id}`}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <header className="flex items-center justify-between">
        <a
          href={`/organisations/${organisationSlug}`}
          className="font-semibold text-hl-navy hover:underline"
        >
          {organisationNom}
        </a>
        <span className="text-xs text-slate-400">{tempsEcoule(createdAt)}</span>
      </header>

      <p className="mt-2 text-sm text-slate-700">{contenu}</p>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mt-3 max-h-72 w-full rounded object-cover" />
      )}
      {videoUrl && (
        <video src={videoUrl} controls className="mt-3 max-h-72 w-full rounded" />
      )}

      {(secteur || region || localisation || nombreBeneficiaires) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {secteur && (
            <span className="rounded bg-hl-navy/10 px-2 py-1 font-medium text-hl-navy">
              {secteurLabel[secteur] ?? secteur}
            </span>
          )}
          {region && (
            <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">📍 {region}</span>
          )}
          {localisation && !region && (
            <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">📍 {localisation}</span>
          )}
          {nombreBeneficiaires ? (
            <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
              👥 {nombreBeneficiaires.toLocaleString("fr-FR")} bénéficiaires
            </span>
          ) : null}
        </div>
      )}

      <footer className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm">
        <button
          onClick={reagir}
          disabled={reagi}
          className={`flex items-center gap-1 ${
            reagi ? "text-red-500" : "text-slate-500 hover:text-red-500"
          }`}
        >
          ❤️ {count}
        </button>
        <button
          onClick={partager}
          className="flex items-center gap-1 text-slate-500 hover:text-hl-navy"
        >
          ↗ {copie ? "Lien copié" : "Partager"}
        </button>
      </footer>
    </article>
  );
}
