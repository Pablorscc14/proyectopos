// components/pos/ProductList.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { usePos } from "@/context/PosContext";

type InventoryRow = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export function ProductList() {
  const [products, setProducts] = useState<InventoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem } = usePos();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select("id, name, quantity, price")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando inventario POS", error);
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border border-blue-100 rounded-xl bg-white shadow-sm">
      <div className="p-3 border-b border-blue-100 flex gap-2 items-center">
        <input
          className="flex-1 border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-900 placeholder:text-blue-300 outline-none focus:ring-2 focus:ring-blue-500/70"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-xs rounded-md border border-blue-300 bg-white px-3 py-2 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          {loading ? "..." : "Actualizar"}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="p-3 text-sm text-blue-800/80">
            Cargando productos...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-3 text-sm text-blue-800/80">
            No se encontraron productos.
          </div>
        )}

        {!loading &&
          filtered.map((p) => {
            const disabled = p.quantity <= 0;
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  addItem({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                  })
                }
                className={`w-full flex justify-between items-center px-3 py-2 border-b text-sm ${
                  disabled
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "hover:bg-blue-50 text-blue-900"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[11px] text-blue-800/70">
                    Stock: {p.quantity}
                  </span>
                </div>
                <span className="font-semibold">
                  $
                  {Number(p.price).toLocaleString("es-CL", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
