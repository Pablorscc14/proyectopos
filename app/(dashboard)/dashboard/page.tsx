// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Role = "Administrador" | "Trabajador";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setSessionUser(user);

      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !userData) {
        router.push("/login");
        return;
      }

      setRole(userData.role as Role);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-linear-to-b from-blue-50 via-white to-blue-50">
        <p className="text-blue-900 font-medium">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-linear-to-b from-blue-50 via-white to-blue-50 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
              Dashboard
            </h1>
            <p className="text-sm text-blue-800/80 mt-1">
              Bienvenido,{" "}
              <span className="font-semibold">
                {sessionUser?.email ?? "usuario"}
              </span>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-800/80">Rol</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1">
              {role}
            </span>
          </div>
        </div>

        {/* Resumen mini KPIs (dummy por ahora) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Ventas hoy
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">$0</p>
            <p className="mt-1 text-xs text-blue-800/70">
              Integrar consulta a la tabla <b>sales</b>.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Productos con poco stock
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">0</p>
            <p className="mt-1 text-xs text-blue-800/70">
              Integrar alerta desde <b>inventory</b>.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Última venta 
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">—</p>
            <p className="mt-1 text-xs text-blue-800/70">
              Puedes mostrar fecha y total desde <b>sales</b>.
            </p>
          </div>
        </div>

        {/* Tarjetas de navegación según rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ADMIN */}
          {role === "Administrador" && (
            <>
              <a
                href="/usuarios"
                className="group rounded-xl bg-white border border-blue-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  Gestión de usuarios
                </h2>
                <p className="text-sm text-blue-800/80">
                  Crear, editar y administrar usuarios del sistema.
                </p>
                <p className="mt-2 text-xs text-blue-500 group-hover:text-blue-600">
                  Ir a gestión de usuarios →
                </p>
              </a>

              <a
                href="/inventory"
                className="group rounded-xl bg-white border border-blue-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  Inventario
                </h2>
                <p className="text-sm text-blue-800/80">
                  Administrar stock, precios y productos.
                </p>
                <p className="mt-2 text-xs text-blue-500 group-hover:text-blue-600">
                  Ir a inventario →
                </p>
              </a>

              <a
                href="/pos"
                className="group rounded-xl bg-white border border-blue-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  POS
                </h2>
                <p className="text-sm text-blue-800/80">
                  Punto de venta rápido y sencillo para caja.
                </p>
                <p className="mt-2 text-xs text-blue-500 group-hover:text-blue-600">
                  Ir al POS →
                </p>
              </a>

              <a
                href="/ventas"
                className="group rounded-xl bg-white border border-blue-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  Historial de ventas
                </h2>
                <p className="text-sm text-blue-800/80">
                  Revisa ventas realizadas y detalles de cada una.
                </p>
                <p className="mt-2 text-xs text-blue-500 group-hover:text-blue-600">
                  Ver historial →
                </p>
              </a>
            </>
          )}

          {/* TRABAJADOR */}
          {role === "Trabajador" && (
            <>
              <a
                href="/pos"
                className="group rounded-xl bg-white border border-blue-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  POS
                </h2>
                <p className="text-sm text-blue-800/80">
                  Registrar ventas rápidas desde caja.
                </p>
                <p className="mt-2 text-xs text-blue-500 group-hover:text-blue-600">
                  Ir al POS →
                </p>
              </a>

              <a
                href="/inventory"
                className="group rounded-xl bg-white border border-blue-100 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-blue-900 mb-1">
                  Inventario
                </h2>
                <p className="text-sm text-blue-800/80">
                  Consultar stock y precios de productos.
                </p>
                <p className="mt-2 text-xs text-blue-500 group-hover:text-blue-600">
                  Ir a inventario →
                </p>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
