import "next-auth";

import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }

  interface Session {
    user?: {
      id?: string; // Set from user.id in the session callback
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

