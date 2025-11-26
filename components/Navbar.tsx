"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-700">
        Sistema de Ventas
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
