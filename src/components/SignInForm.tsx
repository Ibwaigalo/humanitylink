"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setError(
          "Impossible d'envoyer le lien de connexion. Vérifiez la configuration email (AUTH_RESEND_KEY)."
        );
      } else {
        setSent(true);
      }
    } catch {
      setError("Une erreur est survenue. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        <p className="font-semibold">Vérifiez votre boîte mail.</p>
        <p className="mt-2">
          Un lien de connexion vient d&rsquo;être envoyé à <strong>{email}</strong>.
          Cliquez dessus pour vous connecter.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Adresse email professionnelle
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@organisation.org"
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-hl-navy focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-hl-navy px-4 py-3 text-sm font-semibold text-white hover:bg-hl-navy/90 disabled:opacity-60"
      >
        {loading ? "Envoi…" : "Recevoir un lien de connexion"}
      </button>
      <p className="text-xs text-slate-500">
        Connexion sans mot de passe : nous vous envoyons un lien à usage unique.
      </p>
    </form>
  );
}
