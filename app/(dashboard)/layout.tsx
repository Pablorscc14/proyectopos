// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Admin y Trabajador pueden entrar al panel general
  const { loading } = useRequireAuth(["Administrador", "Trabajador"]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="dashboard" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
