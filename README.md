# HumanityLink — Réseau de l'action humanitaire au Mali

Scaffold du MVP : Next.js 14 (App Router) + Neon PostgreSQL + Drizzle ORM + NextAuth v5.

## Déjà en place

- Schéma Drizzle complet (`src/db/schema.ts`) : organisations, utilisateurs/rôles, projets, publications (avec tags secteur/région/localisation/bénéficiaires propres à chaque publication), réactions, signalements
- 14 secteurs (clusters humanitaires : Santé, WASH, Éducation, Protection, Sécurité alimentaire, Abris, Moyens d'existence, Nutrition, CCCM, Environnement, Développement, Paix, Triple Nexus, Autre) + 12 régions/districts du Mali
- Pages publiques : accueil avec **fil d'actualité** (type réseau social, réactions ❤️ + partage ↗), annuaire organisations, fiche organisation (avec compteurs projets/bénéficiaires/régions), liste/fiche projets, recherche
- Composant `PublicationCard` : réaction (like) + partage (copie de lien) + tags secteur/région/bénéficiaires affichés sur chaque publication
- Route API réactions (`/api/reactions`) — auth non branchée encore
- Script de seed (`src/db/seed.ts`, commande `npm run db:seed`) avec données réalistes (AMSODE, kits alimentaires Mopti, etc.)
- Stub NextAuth v5 à compléter
- Pas de commentaires (volontaire — attend une modération active avant d'ouvrir ce risque)

## À faire ensuite (prompt pour OpenCode)

Copier-coller ce qui suit dans OpenCode pour continuer :

---

Voici le projet HumanityLink (Next.js 14 + Drizzle + Neon), scaffold déjà en place, avec fil d'actualité et réactions déjà fonctionnels côté UI. Complète les étapes suivantes dans l'ordre :

1. Exécuter `npm install` à la racine.
2. Créer un projet sur console.neon.tech nommé `humanitylink`, récupérer la connection string pooled, la mettre dans `.env.local` sous `DATABASE_URL` (copier `.env.example`).
3. Lancer `npm run db:generate` puis `npm run db:migrate` pour créer les tables dans Neon à partir de `src/db/schema.ts`.
4. Lancer `npm run db:seed` pour peupler la base avec des données de test et vérifier que le fil d'actualité et les pages organisations s'affichent correctement en local (`npm run dev`).
5. Configurer `src/lib/auth.ts` avec le provider Email (magic link) de NextAuth v5, en utilisant Resend comme transport (voir configuration déjà utilisée sur le projet muscledbrains.com pour Resend). Ajouter l'adapter `@auth/drizzle-adapter` pointant vers `src/db/schema.ts` (table `users`).
6. Dans les callbacks NextAuth (`jwt` et `session`), exposer le champ `role` et `organizationId` de la table `users` dans la session, pour pouvoir vérifier les droits (visiteur / membre_organisation / administrateur_ong / moderateur / administrateur_plateforme) dans les pages et routes API.
7. Créer une page `/dashboard` réservée aux rôles `administrateur_ong` et `membre_organisation` :
   - édition du profil de son organisation (nom, description, logo, secteurs, régions, contact)
   - création/édition de ses fiches projets (titre, secteur, régions, statut, période, bénéficiaires + nombreBeneficiaires, résultat clé)
   - création de publications, avec les champs secteur / region / localisation / dateEvenement / nombreBeneficiaires optionnels, upload photo/vidéo
8. Créer une page `/admin/organisations` réservée à `administrateur_plateforme` qui liste les organisations `statut: "en_attente"` avec un bouton pour passer à `verifie` ou `non_verifie`.
9. Créer une page `/admin/moderation` réservée au rôle `moderateur` qui liste les publications avec `masque: false` et les signalements non traités (`traite: false`), avec un bouton pour masquer une publication.
10. Créer une page `/carte` — carte interactive du Mali :
    - Utiliser une carte SVG stylisée des régions du Mali (pas besoin de Mapbox/Google Maps — un SVG avec un `<path>` cliquable par région suffit pour le MVP) ou la librairie `react-simple-maps` avec un GeoJSON des régions maliennes.
    - Filtres au-dessus de la carte : secteur (menu déroulant, les 14 valeurs de `secteurEnum`) et région.
    - Au clic sur une région : afficher en dessous la liste des projets et publications de cette région (réutiliser `ProjectCard` et `PublicationCard`).
    - Au choix d'un secteur : mettre en surbrillance les régions où ce secteur est actif (requête groupée région × secteur sur `projects`).
    - Ajouter le lien `/carte` dans `Header.tsx`.
11. Remonter le vrai compteur de réactions sur la page `/organisations/[slug]` (actuellement en dur à 0, TODO déjà marqué dans le fichier) — même requête groupée que sur la page d'accueil.
12. Vérifier que `npm run build` passe sans erreur.
13. Initialiser le repo git, créer le repo GitHub `Ibwaigalo/humanitylink`, pousser, puis connecter à Vercel pour le déploiement auto (ajouter les variables d'environnement `DATABASE_URL`, `AUTH_SECRET`, `AUTH_RESEND_KEY` dans les settings Vercel).

---

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

