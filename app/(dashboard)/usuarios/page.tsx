// app/(dashboard)/usuarios/page.tsx
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UsersManagement } from "@/components/users/UsersManagement";

export default function UsuariosPage() {
  // Solo Administrador puede gestionar usuarios
  useRequireAuth(["Administrador"]);

  return <UsersManagement />;
}
