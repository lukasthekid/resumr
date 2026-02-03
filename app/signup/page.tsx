"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login since Google OAuth handles both login and signup
    router.replace("/login");
  }, [router]);

  return null;
}
