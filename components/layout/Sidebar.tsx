// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const links = [
    { href: "/dashboard", label: "Resumen", roles: ["Administrador", "Trabajador"] },
    { href: "/pos", label: "POS", roles: ["Administrador", "Trabajador"] },
    { href: "/inventory", label: "Inventario", roles: ["Administrador"] },
    { href: "/ventas", label: "Ventas", roles: ["Administrador"] },
    { href: "/usuarios", label: "Usuarios", roles: ["Administrador"] },
    { href: "/categorias", label: "Categorias", roles: ["Administrador"] },

  ];

  return (
    <aside className="w-60 bg-blue-950 text-blue-100 border-r border-blue-900 min-h-screen">
      <div className="px-4 py-3 border-b border-blue-900">
        <p className="text-xs uppercase tracking-wide text-blue-400">
          Panel
        </p>
        <p className="text-sm font-semibold mt-1">
          {profile?.username ?? "Usuario"}
        </p>
        <p className="text-[11px] text-blue-300">
          {profile?.role ?? ""}
        </p>
      </div>

      <nav className="flex flex-col p-3 gap-1 text-sm">
        {links
          .filter((link) =>
            profile ? link.roles.includes(profile.role) : false
          )
          .map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center rounded-md px-3 py-2 font-medium transition-colors ${
                  active
                    ? "bg-white text-blue-900 shadow-sm"
                    : "text-blue-100 hover:bg-blue-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
