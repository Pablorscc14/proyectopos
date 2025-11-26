// hooks/useRequireAuth.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(allowedRoles?: ("Administrador" | "Trabajador")[]) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router, allowedRoles]);

  return { user, profile, loading };
}
