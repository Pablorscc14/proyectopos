// components/pos/Cart.tsx
"use client";

import { usePos } from "@/context/PosContext";

export function Cart() {
  const { items, updateQuantity, removeItem, total } = usePos();

  return (
    <div className="border border-blue-100 rounded-xl bg-white p-3 flex flex-col h-full shadow-sm">
      <h2 className="text-sm font-semibold text-blue-900 mb-2">
        Detalle de la venta
      </h2>

      {items.length === 0 && (
        <p className="text-xs text-blue-800/80">
          No hay productos en el carrito.
        </p>
      )}

      {items.length > 0 && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-blue-100 bg-blue-50/60">
              <tr>
                <th className="text-left px-2 py-1 text-blue-900">Producto</th>
                <th className="text-right px-2 py-1 text-blue-900">Cant.</th>
                <th className="text-right px-2 py-1 text-blue-900">Precio</th>
                <th className="text-right px-2 py-1 text-blue-900">Subt.</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const subtotal = item.quantity * item.price;
                return (
                  <tr key={item.productId} className="border-b border-blue-50">
                    <td className="px-2 py-1 text-blue-900">{item.name}</td>
                    <td className="px-2 py-1 text-right">
                      <input
                        type="number"
                        min={1}
                        className="w-14 border border-blue-200 rounded px-1 py-0.5 text-right text-[11px] text-blue-900"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-1 text-right text-blue-900">
                      $
                      {item.price.toLocaleString("es-CL", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-2 py-1 text-right text-blue-900">
                      $
                      {subtotal.toLocaleString("es-CL", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-2 py-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-[11px] text-red-600 hover:text-red-700"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex justify-between items-center text-sm">
        <span className="font-medium text-blue-900">Total</span>
        <span className="font-bold text-blue-900">
          $
          {total.toLocaleString("es-CL", {
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
    </div>
  );
}
