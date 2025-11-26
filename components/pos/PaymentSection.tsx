// components/pos/PaymentSection.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePos } from "@/context/PosContext";

const paymentMethods = ["Efectivo", "Debito", "Credito"] as const;
type PaymentMethod = (typeof paymentMethods)[number];

export function PaymentSection() {
  const { items, total, clearCart } = usePos();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"ok" | "error" | null>(null);
  const [loading, setLoading] = useState(false);

  const change =
    paymentMethod === "Efectivo" && cashGiven
      ? Math.max(0, Number(cashGiven) - total)
      : 0;

  const handleConfirmSale = async () => {
    setMessage(null);
    setMessageType(null);

    if (items.length === 0 || total <= 0) {
      setMessage("No hay productos en el carrito.");
      setMessageType("error");
      return;
    }

    if (!paymentMethod) {
      setMessage("Selecciona un método de pago.");
      setMessageType("error");
      return;
    }

    if (paymentMethod === "Efectivo") {
      const cash = Number(cashGiven);
      if (!cashGiven || isNaN(cash) || cash <= 0) {
        setMessage("Ingresa el monto recibido en efectivo.");
        setMessageType("error");
        return;
      }
      if (cash < total) {
        setMessage("El monto recibido es insuficiente.");
        setMessageType("error");
        return;
      }
    }

    setLoading(true);

    try {
      // 1) Verificar stock en BD para todos los productos del carrito
      const productIds = items.map((i) => i.productId);
      const { data: inventoryRows, error: invError } = await supabase
        .from("inventory")
        .select("id, quantity")
        .in("id", productIds);

      if (invError || !inventoryRows) {
        console.error(invError);
        setMessage("Error al verificar stock.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const stockMap = new Map<number, number>();
      inventoryRows.forEach((row: any) => {
        stockMap.set(row.id, row.quantity);
      });

      for (const item of items) {
        const currentStock = stockMap.get(item.productId) ?? 0;
        if (currentStock < item.quantity) {
          setMessage(
            `Stock insuficiente para "${item.name}". Disponible: ${currentStock}.`
          );
          setMessageType("error");
          setLoading(false);
          return;
        }
      }

      // 2) Crear venta en `sales`
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          // seller_id: null, // de momento, hasta que ajustes el tipo
          total_sale: total,
          payment_method: paymentMethod,
        })
        .select("id")
        .single();

      if (saleError || !saleData) {
        console.error(saleError);
        setMessage("Error al registrar la venta.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const saleId = saleData.id as number;

      // 3) Crear detalles en `sales_details`
      const detailsPayload = items.map((item) => ({
        sale_id: saleId,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: detailsError } = await supabase
        .from("sales_details")
        .insert(detailsPayload);

      if (detailsError) {
        console.error(detailsError);
        setMessage("Error al registrar el detalle de la venta.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      // 4) Actualizar stock en `inventory`
      for (const item of items) {
        const currentStock = stockMap.get(item.productId) ?? 0;
        const newStock = currentStock - item.quantity;

        const { error: updateError } = await supabase
          .from("inventory")
          .update({ quantity: newStock })
          .eq("id", item.productId);

        if (updateError) {
          console.error(updateError);
          // No cortamos la venta ya registrada, pero mostramos aviso
        }
      }

      // 5) Opcional: registrar en tabla `pos`
      await supabase.from("pos").insert({
        sale_id: saleId,
        search_bar: null,
      });

      clearCart();

      const msgBase = "Venta registrada correctamente.";
      const msgWithChange =
        paymentMethod === "Efectivo" && change > 0
          ? `${msgBase} Vuelto: $${change.toLocaleString("es-CL", {
              maximumFractionDigits: 0,
            })}.`
          : msgBase;

      setMessage(msgWithChange);
      setMessageType("ok");
      setCashGiven("");
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error inesperado al procesar la venta.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-blue-100 rounded-xl bg-white p-3 space-y-3 shadow-sm">
      <h2 className="text-sm font-semibold text-blue-900">Pago</h2>

      {/* Total */}
      <div className="flex justify-between text-sm">
        <span className="text-blue-800/80">Total</span>
        <span className="font-bold text-blue-900">
          $
          {total.toLocaleString("es-CL", {
            maximumFractionDigits: 0,
          })}
        </span>
      </div>

      {/* Métodos de pago */}
      <div className="flex gap-2 text-xs">
        {paymentMethods.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentMethod(method)}
            className={`flex-1 rounded-md border px-2 py-1.5 font-medium transition-colors ${
              paymentMethod === method
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-800 border-blue-300 hover:bg-blue-50"
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {/* Monto recibido + vuelto (solo efectivo) */}
      {paymentMethod === "Efectivo" && (
        <div className="space-y-1">
          <label className="text-xs text-blue-900 font-medium">
            Monto recibido (efectivo)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              className="flex-1 border border-blue-200 rounded-md px-3 py-1.5 text-sm text-blue-900 placeholder:text-blue-300 outline-none focus:ring-2 focus:ring-blue-500/70"
              placeholder="Ej: 20000"
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
            />
            <span className="text-xs text-blue-800/80">
              Vuelto:{" "}
              <span className="font-semibold text-blue-900">
                $
                {change.toLocaleString("es-CL", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {message && (
        <div
          className={`text-[11px] px-2 py-1 rounded-md ${
            messageType === "ok"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Botón confirmar */}
      <button
        type="button"
        onClick={handleConfirmSale}
        disabled={loading || items.length === 0 || total <= 0}
        className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Procesando..." : "Confirmar venta"}
      </button>
    </div>
  );
}
