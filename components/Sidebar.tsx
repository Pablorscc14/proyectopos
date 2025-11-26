"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Usuarios", path: "/dashboard/usuarios" },
    { label: "Inventario", path: "/dashboard/inventario" },
    { label: "POS", path: "/dashboard/pos" },
    { label: "Ventas", path: "/dashboard/ventas" },
  ];

  return (
    <aside className="w-60 bg-white shadow h-screen p-4 hidden md:block">
      <h2 className="text-lg font-semibold mb-6">Menú</h2>

      <ul className="space-y-3">
        {menu.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`block px-3 py-2 rounded transition ${
                pathname.startsWith(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
