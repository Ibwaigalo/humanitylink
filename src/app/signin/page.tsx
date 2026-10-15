import SignInForm from "@/components/SignInForm";

export const metadata = {
  title: "Connexion — HumanityLink",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold text-hl-navy">Connexion</h1>
      <p className="mb-6 text-sm text-slate-500">
        Espace réservé aux organisations et à l&rsquo;équipe de modération.
      </p>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <SignInForm />
      </div>
    </div>
  );
}
