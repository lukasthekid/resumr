import { Suspense } from "react";

import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
      }
    >
      <LoginClient />
    </Suspense>
  );
}
