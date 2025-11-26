// components/inventory/InventoryTable.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type InventoryRow = {
  id: number;
  name: string;
  quantity: number;
  min_stock: number;
  price: number;
  updated_at: string | null;
};

export function InventoryTable() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setError("Error al cargar inventario. Intenta nuevamente.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="border border-blue-100 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Header tabla + acciones */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/60">
        <div>
          <h2 className="text-sm font-semibold text-blue-900">
            Inventario de productos
          </h2>
          <p className="text-[11px] text-blue-800/70">
            Revisa stock actual y productos con poco stock.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-[11px] sm:text-xs rounded-md border border-blue-300 bg-white px-3 py-1 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Contenido */}
      {error && (
        <div className="px-4 py-3 text-xs text-red-600 bg-red-50">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="px-4 py-6 text-sm text-blue-800/80">
          Cargando inventario...
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="px-4 py-6 text-sm text-blue-800/80">
          No hay productos registrados todavía.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-blue-900">
                  Producto
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                  Stock
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                  Mínimo
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                  Precio
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const lowStock = item.quantity <= item.min_stock;
                const rowBg =
                  idx % 2 === 0 ? "bg-white" : "bg-blue-50/40";

                return (
                  <tr key={item.id} className={rowBg}>
                    <td className="px-3 py-2 text-blue-900">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      {item.min_stock}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      $
                      {Number(item.price).toLocaleString("es-CL", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {lowStock ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
                          Bajo stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Stock OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
