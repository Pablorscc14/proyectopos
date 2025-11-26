// app/(dashboard)/inventory/page.tsx
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { InventoryTable } from "@/components/inventory/InventoryTable";

export default function InventoryPage() {
  // Solo Administrador puede entrar
  useRequireAuth(["Administrador"]);

  return (
    <div className="space-y-4">
      <InventoryForm />
      <InventoryTable />
    </div>
  );
}
