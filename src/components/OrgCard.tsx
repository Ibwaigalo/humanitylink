import Link from "next/link";

type OrgCardProps = {
  slug: string;
  nom: string;
  secteurPrincipal: string;
  regions: string[];
  statut: "en_attente" | "verifie" | "non_verifie";
  logoUrl?: string | null;
};

const statutLabel: Record<OrgCardProps["statut"], string> = {
  en_attente: "En attente",
  verifie: "Vérifiée",
  non_verifie: "Non vérifiée",
};

export default function OrgCard({
  slug,
  nom,
  secteurPrincipal,
  regions,
  statut,
  logoUrl,
}: OrgCardProps) {
  return (
    <Link
      href={`/organisations/${slug}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={nom}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-slate-400">
            {nom.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-hl-navy">{nom}</h3>
          <p className="text-xs text-slate-500">{regions.join(", ")}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">
          {secteurPrincipal}
        </span>
        {statut === "verifie" && (
          <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-700">
            {statutLabel[statut]}
          </span>
        )}
      </div>
    </Link>
  );
}
