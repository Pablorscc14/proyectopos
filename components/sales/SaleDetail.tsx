// components/sales/SaleDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SaleHeader = {
  id: number;
  sale_date: string;
  total_sale: number;
  payment_method: "Efectivo" | "Debito" | "Credito";
  seller_id: number | null;
};

type SaleDetailRow = {
  id: number;
  quantity: number;
  price: number;
  inventory: {
    name: string;
  } | null;
};

type Props = {
  saleId: number | null;
};

export function SaleDetail({ saleId }: Props) {
  const [header, setHeader] = useState<SaleHeader | null>(null);
  const [details, setDetails] = useState<SaleDetailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    setLoading(true);
    setError(null);

    // 1) Venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(
        "id, sale_date, total_sale, payment_method, seller_id"
      )
      .eq("id", id)
      .single();

    if (saleError || !sale) {
      console.error(saleError);
      setError("Error al cargar la venta seleccionada.");
      setHeader(null);
      setDetails([]);
      setLoading(false);
      return;
    }

    // 2) Detalles + producto
    const { data: detailRows, error: detailError } = await supabase
      .from("sales_details")
      .select("id, quantity, price, inventory(name)")
      .eq("sale_id", id);

    if (detailError) {
      console.error(detailError);
      setError("Error al cargar el detalle de la venta.");
      setHeader(sale as SaleHeader);
      setDetails([]);
      setLoading(false);
      return;
    }

    setHeader(sale as SaleHeader);
    // Normalize detail rows coming from Supabase: it may return inventory as an array
    const mappedDetails: SaleDetailRow[] = (detailRows ?? []).map((r: any) => {
      // r.inventory can be an array (when using select with a relation) or an object or null
      let inventoryVal: { name: string } | null = null;

      if (Array.isArray(r.inventory)) {
        const first = r.inventory[0];
        inventoryVal = first ? { name: first?.name ?? "" } : null;
      } else if (r.inventory) {
        inventoryVal = { name: r.inventory.name ?? "" };
      } else {
        inventoryVal = null;
      }

      return {
        id: r.id,
        quantity: r.quantity,
        price: r.price,
        inventory: inventoryVal,
      };
    });

    setDetails(mappedDetails);
    setLoading(false);
  };

  useEffect(() => {
    if (saleId != null) {
      load(saleId);
    } else {
      setHeader(null);
      setDetails([]);
    }
  }, [saleId]);

  if (saleId == null) {
    return (
      <div className="border border-blue-100 rounded-xl bg-white p-4 shadow-sm h-[420px]">
        <h2 className="text-sm font-semibold text-blue-900 mb-2">
          Detalle de venta
        </h2>
        <p className="text-xs text-blue-800/80">
          Selecciona una venta en la tabla de la izquierda para ver el
          detalle.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-blue-100 rounded-xl bg-white p-4 shadow-sm h-[420px]">
        <h2 className="text-sm font-semibold text-blue-900 mb-2">
          Detalle de venta
        </h2>
        <p className="text-xs text-blue-800/80">
          Cargando información de la venta...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-blue-100 rounded-xl bg-white p-4 shadow-sm h-[420px]">
        <h2 className="text-sm font-semibold text-blue-900 mb-2">
          Detalle de venta
        </h2>
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1">
          {error}
        </p>
      </div>
    );
  }

  if (!header) {
    return (
      <div className="border border-blue-100 rounded-xl bg-white p-4 shadow-sm h-[420px]">
        <h2 className="text-sm font-semibold text-blue-900 mb-2">
          Detalle de venta
        </h2>
        <p className="text-xs text-blue-800/80">
          No se encontró información de esta venta.
        </p>
      </div>
    );
  }

  const date = new Date(header.sale_date);
  const formattedDate = isNaN(date.getTime())
    ? header.sale_date
    : date.toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
      });

  const totalFromDetails = details.reduce(
    (sum, d) => sum + d.price * d.quantity,
    0
  );

  return (
    <div className="border border-blue-100 rounded-xl bg-white p-4 shadow-sm h-[420px] flex flex-col">
      <h2 className="text-sm font-semibold text-blue-900 mb-3">
        Detalle de venta #{header.id}
      </h2>

      {/* Header venta */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-blue-900">
        <div>
          <span className="font-semibold">Fecha:</span>{" "}
          <span className="text-blue-800/90">{formattedDate}</span>
        </div>
        <div className="text-right">
          <span className="font-semibold">Total:</span>{" "}
          <span className="font-bold text-blue-900">
            $
            {header.total_sale.toLocaleString("es-CL", {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div>
          <span className="font-semibold">Método de pago:</span>{" "}
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
            {header.payment_method}
          </span>
        </div>
        <div className="text-right">
          <span className="font-semibold">Vendedor (id):</span>{" "}
          <span className="text-blue-800/90">
            {header.seller_id ?? "No asignado"}
          </span>
        </div>
      </div>

      {/* Detalle productos */}
      <div className="flex-1 overflow-auto border border-blue-50 rounded-md">
        {details.length === 0 && (
          <p className="text-xs text-blue-800/80 px-3 py-3">
            Esta venta no tiene productos registrados.
          </p>
        )}

        {details.length > 0 && (
          <table className="w-full text-xs">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                  Producto
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold text-blue-900">
                  Cant.
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold text-blue-900">
                  Precio
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold text-blue-900">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {details.map((d, idx) => {
                const rowBg =
                  idx % 2 === 0 ? "bg-white" : "bg-blue-50/40";
                const subtotal = d.price * d.quantity;

                return (
                  <tr key={d.id} className={rowBg}>
                    <td className="px-3 py-2 text-blue-900">
                      {d.inventory?.name ?? "Producto sin nombre"}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      {d.quantity}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      $
                      {d.price.toLocaleString("es-CL", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right text-blue-900">
                      $
                      {subtotal.toLocaleString("es-CL", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Comparación total */}
      {details.length > 0 && (
        <div className="mt-3 text-[11px] text-blue-900 flex justify-between">
          <span>Sumatoria por detalle:</span>
          <span className="font-semibold">
            $
            {totalFromDetails.toLocaleString("es-CL", {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
