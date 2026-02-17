import { toNextJsHandler } from "better-auth/next-js";

import { authInstance } from "@/auth";

export const { GET, POST } = toNextJsHandler(authInstance);
