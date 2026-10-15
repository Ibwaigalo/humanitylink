export const SECTEURS = [
  { value: "sante", label: "Santé" },
  { value: "education", label: "Éducation" },
  { value: "wash", label: "WASH" },
  { value: "protection", label: "Protection" },
  { value: "securite_alimentaire", label: "Sécurité alimentaire" },
  { value: "abris", label: "Abris" },
  { value: "moyens_existence", label: "Moyens d'existence" },
  { value: "nutrition", label: "Nutrition" },
  { value: "cccm", label: "CCCM" },
  { value: "environnement", label: "Environnement" },
  { value: "developpement", label: "Développement" },
  { value: "paix", label: "Paix" },
  { value: "triple_nexus", label: "Triple Nexus" },
  { value: "droits_humains", label: "Droits humains" },
  { value: "autre", label: "Autre" },
] as const;

export const REGIONS = [
  { value: "bamako", label: "Bamako" },
  { value: "kayes", label: "Kayes" },
  { value: "koulikoro", label: "Koulikoro" },
  { value: "sikasso", label: "Sikasso" },
  { value: "segou", label: "Ségou" },
  { value: "mopti", label: "Mopti" },
  { value: "tombouctou", label: "Tombouctou" },
  { value: "gao", label: "Gao" },
  { value: "kidal", label: "Kidal" },
  { value: "taoudenit", label: "Taoudénit" },
  { value: "menaka", label: "Ménaka" },
] as const;

export const SECTEUR_LABEL: Record<string, string> = Object.fromEntries(
  SECTEURS.map((s) => [s.value, s.label])
);

export const REGION_LABEL: Record<string, string> = Object.fromEntries(
  REGIONS.map((r) => [r.value, r.label])
);

export const STATUT_PROJET_LABEL: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
};

export const ORG_STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente",
  verifie: "Vérifiée",
  non_verifie: "Non vérifiée",
};

export const ROLE_LABEL: Record<string, string> = {
  visiteur: "Visiteur",
  membre_organisation: "Membre d'organisation",
  administrateur_ong: "Administrateur ONG",
  moderateur: "Modérateur",
  administrateur_plateforme: "Administrateur plateforme",
};

export function secteurLabel(value?: string | null) {
  if (!value) return "";
  return SECTEUR_LABEL[value] ?? value;
}

export function regionLabel(value?: string | null) {
  if (!value) return "";
  return REGION_LABEL[value] ?? value;
}
