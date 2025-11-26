// app/(dashboard)/ventas/page.tsx
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { SalesPage } from "@/components/sales/SalesPage";

export default function VentasPage() {
  // Solo Administrador puede ver historial
  useRequireAuth(["Administrador"]);

  return <SalesPage />;
}
