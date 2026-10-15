import Link from "next/link";

type ProjectCardProps = {
  slug: string;
  titre: string;
  secteur: string;
  statut: "planifie" | "en_cours" | "termine";
  organisationNom: string;
};

const statutLabel: Record<ProjectCardProps["statut"], string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
};

export default function ProjectCard({
  slug,
  titre,
  secteur,
  statut,
  organisationNom,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projets/${slug}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md"
    >
      <h3 className="font-semibold text-hl-navy">{titre}</h3>
      <p className="mt-1 text-xs text-slate-500">{organisationNom}</p>
      <div className="mt-3 flex gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">
          {secteur}
        </span>
        <span className="rounded bg-hl-navy/10 px-2 py-1 text-hl-navy">
          {statutLabel[statut]}
        </span>
      </div>
    </Link>
  );
}
