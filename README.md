# HumanityLink — Réseau de l'action humanitaire au Mali

Scaffold du MVP : Next.js 14 (App Router) + Neon PostgreSQL + Drizzle ORM + NextAuth v5.

## Déjà en place

- Schéma Drizzle complet (`src/db/schema.ts`) : organisations, utilisateurs/rôles, projets, publications (avec tags secteur/région/localisation/bénéficiaires propres à chaque publication), réactions, signalements
- 15 secteurs (clusters humanitaires, `src/lib/constants.ts:1`) + 11 régions/districts du Mali (`src/lib/constants.ts:19`)
- Pages publiques : accueil avec **fil d'actualité** (type réseau social, réactions ❤️ + partage ↗), annuaire organisations, fiche organisation (avec compteurs projets/bénéficiaires/régions), liste/fiche projets, recherche
- Composant `PublicationCard` : réaction (like) + partage (copie de lien) + tags secteur/région/bénéficiaires affichés sur chaque publication
- Route API réactions (`/api/reactions`) — protégée (session requise)
- Auth NextAuth v5 complète : magic link (Resend) + adapter Drizzle, URL résolue dynamiquement en production / preview / local (`src/lib/auth.ts:11`)
- Uploads réels (logo / photo / vidéo) via Vercel Blob — route `/api/upload` réservée aux comptes d'organisation (`src/app/api/upload/route.ts`)
- Script de seed (`src/db/seed.ts`, commande `npm run db:seed`), idempotent, avec données réalistes (AMSODE, kits alimentaires Mopti, etc.) + utilisateurs de test par rôle
- Pas de commentaires (volontaire — attend une modération active avant d'ouvrir ce risque)

## Réalisation — checklist « À faire ensuite »

Tous les items sont livrés et vérifiés (voir aussi le détail dans les sections ci-dessous).

- [x] **Configurer `src/lib/auth.ts`** — Email magic link + Resend + adapter Drizzle. `src/lib/auth.ts:38` (`Resend`), `src/lib/auth.ts:30` (`DrizzleAdapter`). Commits `086c4be`, `fd1d01b`.
- [x] **Callbacks `jwt`/`session`** exposant `role` + `organizationId`. `src/lib/auth.ts:43`–`73` ; typage dans `src/types/next-auth.d.ts`. Commit `086c4be`.
- [x] **Page `/dashboard`** (administrateur_ong / membre_organisation). `src/app/dashboard/page.tsx`, `src/app/dashboard/actions.ts`. Commit `086c4be`.
- [x] **Page `/admin/organisations`** (administrateur_plateforme). `src/app/admin/organisations/page.tsx` (+ `actions.ts`). Commit `086c4be`.
- [x] **Page `/admin/moderation`** (moderateur). `src/app/admin/moderation/page.tsx` (+ `actions.ts`). Commit `086c4be`.
- [x] **Page `/carte`** (carte SVG Mali + filtres secteur/région). `src/app/carte/page.tsx`, `src/components/MaliMap.tsx`. Commit `086c4be`.
- [x] **Vrai compteur de réactions** sur `/organisations/[slug]`. `src/app/organisations/[slug]/page.tsx:29` (`getPublicationsWithReactions`). Commit `086c4be`.
- [x] **`npm run build` sans erreur.** Vérifié après chaque étape (routes `/dashboard`, `/admin/*`, `/carte`, `/api/upload`, `/api/reactions`, …).
- [x] **Git init + repo GitHub + Vercel** (déploiement auto sur push). Repo `Ibwaigalo/humanitylink` ; en ligne : https://humanitylink.vercel.app. Commits `086c4be` → `97e92fe`.

### Suite (au-delà du MVP initial)

- [x] **Uploads réels** via Vercel Blob — `src/app/api/upload/route.ts`, `src/components/FileUploadField.tsx`. Commit `1e1d9e5`.
- [x] **`AUTH_URL` résolu dynamiquement** (VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL, fallback localhost) — `src/lib/auth.ts:11`–`26`. Commit `fd1d01b`.
- [x] **Gestion d'erreur de la réaction** (annulation du like optimiste + message de reprise) — `src/components/PublicationCard.tsx:65`. Commit `97e92fe`.

## Connu : limites du MVP

- **Uploads** : désormais **réels** (Vercel Blob, `src/app/api/upload/route.ts`) — donc retirés de la liste des limites. Nuance à connaître : les fonctions Vercel plafonnent le corps de requête à ~4,5 Mo, l'upload est donc validé jusqu'à 10 Mo en local mais limité à ~4,5 Mo en production ; au-delà, passer à l'upload direct navigateur (`@vercel/blob/client`). Formats acceptés : JPEG, PNG, WebP, GIF, AVIF (images) ; MP4, WebM, MOV, OGG (vidéos).
- **Commentaires** : volontairement **absents** (aucun fil de discussion sous les publications) — en attente d'un dispositif de modération actif.
- **Réactions** : un seul like par utilisateur, sans retrait (choix MVP volontaire).
- **Annuaire / recherche** : pagination et filtres avancés non implémentés.

## Variables d'environnement

Voir `.env.example`.

## Commandes utiles

```bash
npm run dev          # développement local
npm run db:studio    # explorer la base Neon visuellement
npm run db:generate  # générer une migration après modif du schéma
npm run db:migrate   # appliquer les migrations
npm run db:seed      # charger des données de test
```

