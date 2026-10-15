CREATE TYPE "public"."org_status" AS ENUM('en_attente', 'verifie', 'non_verifie');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planifie', 'en_cours', 'termine');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('bamako', 'kayes', 'koulikoro', 'sikasso', 'segou', 'mopti', 'tombouctou', 'gao', 'kidal', 'taoudenit', 'menaka');--> statement-breakpoint
CREATE TYPE "public"."secteur" AS ENUM('sante', 'education', 'wash', 'protection', 'securite_alimentaire', 'abris', 'moyens_existence', 'nutrition', 'cccm', 'environnement', 'developpement', 'paix', 'triple_nexus', 'droits_humains', 'autre');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('visiteur', 'membre_organisation', 'administrateur_ong', 'moderateur', 'administrateur_plateforme');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"nom" varchar(200) NOT NULL,
	"description" text,
	"logo_url" text,
	"site_web" text,
	"facebook_url" text,
	"secteur_principal" "secteur" NOT NULL,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"contact_nom" varchar(150),
	"contact_email" varchar(200),
	"contact_telephone" varchar(50),
	"statut" "org_status" DEFAULT 'en_attente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"organization_id" uuid NOT NULL,
	"titre" varchar(200) NOT NULL,
	"description" text,
	"secteur" "secteur" NOT NULL,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"statut" "project_status" DEFAULT 'planifie' NOT NULL,
	"periode_debut" timestamp,
	"periode_fin" timestamp,
	"beneficiaires" text,
	"nombre_beneficiaires" integer,
	"resultat_cle" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"author_id" uuid,
	"project_id" uuid,
	"contenu" text NOT NULL,
	"image_url" text,
	"video_url" text,
	"secteur" "secteur",
	"region" text,
	"localisation" varchar(200),
	"date_evenement" timestamp,
	"nombre_beneficiaires" integer,
	"masque" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"publication_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_publication_id_user_id_pk" PRIMARY KEY("publication_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signalements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid NOT NULL,
	"signale_par_id" uuid,
	"motif" text NOT NULL,
	"traite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar(150),
	"email" varchar(200) NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" "user_role" DEFAULT 'visiteur' NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications" ADD CONSTRAINT "publications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications" ADD CONSTRAINT "publications_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publications" ADD CONSTRAINT "publications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signalements" ADD CONSTRAINT "signalements_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signalements" ADD CONSTRAINT "signalements_signale_par_id_users_id_fk" FOREIGN KEY ("signale_par_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
