export type AppRole =
  | "visiteur"
  | "membre_organisation"
  | "administrateur_ong"
  | "moderateur"
  | "administrateur_plateforme";

export function isOrgRole(role?: string | null): boolean {
  return role === "administrateur_ong" || role === "membre_organisation";
}

export function isModeratorRole(role?: string | null): boolean {
  return role === "moderateur" || role === "administrateur_plateforme";
}

export function isPlatformAdminRole(role?: string | null): boolean {
  return role === "administrateur_plateforme";
}
