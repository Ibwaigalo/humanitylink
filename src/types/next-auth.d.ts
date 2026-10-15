import { DefaultSession } from "next-auth";
import type { userRoleEnum } from "@/db/schema";

type Role = (typeof userRoleEnum.enumValues)[number];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    organizationId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string | null;
  }
}
