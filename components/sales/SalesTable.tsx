// components/sales/SalesTable.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SaleRow = {
  id: number;
  sale_date: string;
  total_sale: number;
  payment_method: "Efectivo" | "Debito" | "Credito";
  seller_id: number | null;
};

type Props = {
  selectedSaleId: number | null;
  onSelectSale: (id: number) => void;
};

export function SalesTable({ selectedSaleId, onSelectSale }: Props) {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("sales")
      .select("id, sale_date, total_sale, payment_method, seller_id")
      .order("sale_date", { ascending: false });

    if (error) {
      console.error(error);
      setError("Error al cargar ventas.");
      setSales([]);
      setLoading(false);
      return;
    }

    setSales((data as SaleRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="border border-blue-100 rounded-xl bg-white shadow-sm flex flex-col h-[420px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/60">
        <div>
          <h2 className="text-sm font-semibold text-blue-900">
            Ventas registradas
          </h2>
          <p className="text-[11px] text-blue-800/70">
            Selecciona una venta para ver el detalle.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-[11px] rounded-md border border-blue-300 bg-white px-3 py-1 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-xs text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="px-4 py-4 text-sm text-blue-800/80">
          Cargando ventas...
        </div>
      )}

      {!loading && !error && sales.length === 0 && (
        <div className="px-4 py-4 text-sm text-blue-800/80">
          No hay ventas registradas aún.
        </div>
      )}

      {!loading && !error && sales.length > 0 && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                  Venta
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                  Fecha
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold text-blue-900">
                  Total
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-semibold text-blue-900">
                  Pago
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-semibold text-blue-900">
                  Vendedor
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, idx) => {
                const isActive = selectedSaleId === sale.id;
                const rowBg =
                  idx % 2 === 0 ? "bg-white" : "bg-blue-50/40";

                const date = new Date(sale.sale_date);
                const formattedDate = isNaN(date.getTime())
                  ? sale.sale_date
                  : date.toLocaleString("es-CL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    });

                return (
                  <tr
                    key={sale.id}
                    className={`${rowBg} cursor-pointer ${
                      isActive ? "bg-blue-100/80" : ""
                    }`}
                    onClick={() => onSelectSale(sale.id)}
                  >
                    <td className="px-3 py-2 text-blue-900">
                      #{sale.id}
                    </td>
                    <td className="px-3 py-2 text-blue-900">
                      {formattedDate}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      $
                      {sale.total_sale.toLocaleString("es-CL", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-blue-900">
                      {/* Por ahora mostramos seller_id crudo, porque no está relacionado con users (uuid) */}
                      {sale.seller_id ?? "No asignado"}
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
