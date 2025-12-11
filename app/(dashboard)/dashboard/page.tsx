// app/(dashboard)/dashboard/page.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Role = "Administrador" | "Trabajador";

type DashboardMetrics = {
  salesToday: number;
  salesTodayCount: number;
  lowStockCount: number;
  lastSaleTotal: number | null;
  lastSaleDate: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // carga de usuario/rol
  const [metricsLoading, setMetricsLoading] = useState(true); // carga de métricas

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    salesToday: 0,
    salesTodayCount: 0,
    lowStockCount: 0,
    lastSaleTotal: null,
    lastSaleDate: null,
  });

  // 1) Cargar usuario y rol
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

  // 2) Cargar métricas del dashboard
  const fetchMetrics = async () => {
    setMetricsLoading(true);

    try {
      // ---- Ventas hoy (suma total_sale de hoy + cantidad) ----
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: salesTodayData, error: salesTodayError } = await supabase
        .from("sales")
        .select("total_sale, sale_date")
        .gte("sale_date", startOfDay.toISOString());

      if (salesTodayError) {
        console.error("Error cargando ventas de hoy:", salesTodayError);
      }

      const salesToday =
        salesTodayData?.reduce(
          (sum, row) => sum + Number(row.total_sale || 0),
          0
        ) ?? 0;

      const salesTodayCount = salesTodayData?.length ?? 0;

      // ---- Productos con poco stock (quantity <= min_stock) ----
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("id, quantity, min_stock");

      if (inventoryError) {
        console.error("Error cargando inventario:", inventoryError);
      }

      const lowStockCount =
        inventoryData?.filter(
          (item) => item.quantity <= item.min_stock
        ).length ?? 0;

      // ---- Última venta (fecha + total) ----
      const { data: lastSaleData, error: lastSaleError } = await supabase
        .from("sales")
        .select("id, sale_date, total_sale")
        .order("sale_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastSaleError) {
        console.error("Error cargando última venta:", lastSaleError);
      }

      setMetrics({
        salesToday,
        salesTodayCount,
        lowStockCount,
        lastSaleTotal: lastSaleData?.total_sale ?? null,
        lastSaleDate: lastSaleData?.sale_date ?? null,
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  // Dispara la carga de métricas cuando ya sabemos que el usuario está cargado
  useEffect(() => {
    if (!loading && sessionUser) {
      fetchMetrics();
    }
  }, [loading, sessionUser]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-linear-to-b from-blue-50 via-white to-blue-50">
        <p className="text-blue-900 font-medium">Cargando dashboard...</p>
      </div>
    );
  }

  const formatCurrency = (value: number | null) =>
    value == null
      ? "—"
      : `$${Number(value).toLocaleString("es-CL", {
          maximumFractionDigits: 0,
        })}`;

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "Sin ventas registradas";
    const date = new Date(isoString);
    return date.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

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

        {/* Resumen mini KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Ventas de hoy (redirige a /ventas) */}
          <button
            type="button"
            onClick={() => router.push("/ventas")}
            className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Ventas de hoy
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {metricsLoading ? "…" : formatCurrency(metrics.salesToday)}
            </p>
            <p className="mt-1 text-xs text-blue-800/80">
              {metricsLoading
                ? "Calculando ventas del día..."
                : metrics.salesTodayCount > 0
                ? `${metrics.salesTodayCount} venta${
                    metrics.salesTodayCount > 1 ? "s" : ""
                  } registradas hoy.`
                : "Aún no hay ventas registradas hoy."}
            </p>
            <p className="mt-2 text-[11px] text-blue-500">
              Ver detalle de ventas del día →
            </p>
          </button>

          {/* Productos con poco stock */}
          <button
            type="button"
            onClick={() => router.push("/inventory")}
            className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Productos con poco stock
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {metricsLoading ? "…" : metrics.lowStockCount}
            </p>
            <p className="mt-1 text-xs text-blue-800/80">
              {metricsLoading
                ? "Revisando inventario..."
                : metrics.lowStockCount > 0
                ? "Revisa estos productos antes de que se agoten."
                : "Todo el stock está por sobre el mínimo configurado."}
            </p>
            <p className="mt-2 text-[11px] text-blue-500">
              Ver inventario detallado →
            </p>
          </button>

          {/* Última venta */}
          <button
            type="button"
            onClick={() => router.push("/ventas")}
            className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Última venta
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {metricsLoading
                ? "…"
                : metrics.lastSaleTotal == null
                ? "—"
                : formatCurrency(metrics.lastSaleTotal)}
            </p>
            <p className="mt-1 text-xs text-blue-800/80">
              {metricsLoading
                ? "Buscando la última venta..."
                : formatDateTime(metrics.lastSaleDate)}
            </p>
            <p className="mt-2 text-[11px] text-blue-500">
              Ver historial de ventas →
            </p>
          </button>
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
