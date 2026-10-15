import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Enums ----------

export const orgStatusEnum = pgEnum("org_status", [
  "en_attente",
  "verifie",
  "non_verifie",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planifie",
  "en_cours",
  "termine",
]);

export const userRoleEnum = pgEnum("user_role", [
  "visiteur",
  "membre_organisation",
  "administrateur_ong",
  "moderateur",
  "administrateur_plateforme",
]);

export const secteurEnum = pgEnum("secteur", [
  "sante",
  "education",
  "wash",
  "protection",
  "securite_alimentaire",
  "abris",
  "moyens_existence",
  "nutrition",
  "cccm",
  "environnement",
  "developpement",
  "paix",
  "triple_nexus",
  "droits_humains",
  "autre",
]);

export const regionEnum = pgEnum("region", [
  "bamako",
  "kayes",
  "koulikoro",
  "sikasso",
  "segou",
  "mopti",
  "tombouctou",
  "gao",
  "kidal",
  "taoudenit",
  "menaka",
]);

// ---------- Organisations ----------

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  nom: varchar("nom", { length: 200 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  siteWeb: text("site_web"),
  facebookUrl: text("facebook_url"),
  secteurPrincipal: secteurEnum("secteur_principal").notNull(),
  regions: text("regions").array().notNull().default([]), // liste de valeurs regionEnum
  contactNom: varchar("contact_nom", { length: 150 }),
  contactEmail: varchar("contact_email", { length: 200 }),
  contactTelephone: varchar("contact_telephone", { length: 50 }),
  statut: orgStatusEnum("statut").notNull().default("en_attente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Utilisateurs (NextAuth) ----------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }),
  email: varchar("email", { length: 200 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("visiteur"),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Tables NextAuth / Auth.js (adapter Drizzle) ----------

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: varchar("provider", { length: 100 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 100 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  })
);

// ---------- Projets ----------

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  titre: varchar("titre", { length: 200 }).notNull(),
  description: text("description"),
  secteur: secteurEnum("secteur").notNull(),
  regions: text("regions").array().notNull().default([]),
  statut: projectStatusEnum("statut").notNull().default("planifie"),
  periodeDebut: timestamp("periode_debut"),
  periodeFin: timestamp("periode_fin"),
  beneficiaires: text("beneficiaires"), // description libre, ex. "500 femmes"
  nombreBeneficiaires: integer("nombre_beneficiaires"), // valeur numérique, pour les compteurs agrégés
  resultatCle: text("resultat_cle"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Publications (fil d'actualité) ----------

export const publications = pgTable("publications", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  contenu: text("contenu").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  // Tags affichés sur la publication elle-même (indépendants du projet lié,
  // pour que le fil d'actualité reste filtrable même sans projet associé) :
  secteur: secteurEnum("secteur"),
  region: text("region"), // valeur regionEnum, en texte libre pour rester tolérant
  localisation: varchar("localisation", { length: 200 }), // ex. "Cercle de Mopti"
  dateEvenement: timestamp("date_evenement"),
  nombreBeneficiaires: integer("nombre_beneficiaires"),
  masque: boolean("masque").notNull().default(false), // modération
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Réactions (like simple, pas de commentaires en Phase 1) ----------

export const reactions = pgTable(
  "reactions",
  {
    publicationId: uuid("publication_id")
      .notNull()
      .references(() => publications.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.publicationId, t.userId] }),
  })
);

// ---------- Signalements (modération) ----------

export const signalements = pgTable("signalements", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicationId: uuid("publication_id")
    .notNull()
    .references(() => publications.id, { onDelete: "cascade" }),
  signaleParId: uuid("signale_par_id").references(() => users.id, {
    onDelete: "set null",
  }),
  motif: text("motif").notNull(),
  traite: boolean("traite").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Relations ----------

export const organizationsRelations = relations(organizations, ({ many }) => ({
  membres: many(users),
  projets: many(projects),
  publications: many(publications),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  publications: many(publications),
  reactions: many(reactions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  publications: many(publications),
}));

export const publicationsRelations = relations(publications, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [publications.organizationId],
    references: [organizations.id],
  }),
  author: one(users, {
    fields: [publications.authorId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [publications.projectId],
    references: [projects.id],
  }),
  reactions: many(reactions),
  signalements: many(signalements),
}));
