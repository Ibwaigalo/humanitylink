import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";

export default async function Header() {
  const session = await auth();
  const role = session?.user?.role;

  const isOrganisation =
    role === "administrateur_ong" || role === "membre_organisation";
  const isModerator = role === "moderateur" || role === "administrateur_plateforme";
  const isPlatformAdmin = role === "administrateur_plateforme";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-hl-navy">HumanityLink</span>
          <span className="hidden text-sm text-slate-500 sm:inline">
            Réseau de l&rsquo;action humanitaire
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/organisations" className="hover:text-hl-navy">
            Organisations
          </Link>
          <Link href="/projets" className="hover:text-hl-navy">
            Projets
          </Link>
          <Link href="/carte" className="hover:text-hl-navy">
            Carte
          </Link>
          <Link href="/recherche" className="hover:text-hl-navy">
            Recherche
          </Link>
          {isOrganisation && (
            <Link href="/dashboard" className="hover:text-hl-navy">
              Tableau de bord
            </Link>
          )}
          {isModerator && (
            <Link href="/admin/moderation" className="hover:text-hl-navy">
              Modération
            </Link>
          )}
          {isPlatformAdmin && (
            <Link href="/admin/organisations" className="hover:text-hl-navy">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <span className="hidden text-slate-500 md:inline" title={role ? ROLE_LABEL[role] : undefined}>
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:border-hl-navy hover:text-hl-navy"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/signin"
              className="rounded-lg bg-hl-navy px-3 py-1.5 font-semibold text-white hover:bg-hl-navy/90"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
