'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  min_stock: number;
  price: number;
  updated_at: string;
}

export default function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: true });

    if (!error) setItems(data as InventoryItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) return <p>Cargando inventario...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-3">Nombre</th>
            <th className="p-3">Cantidad</th>
            <th className="p-3">Stock Mínimo</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Actualizado</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.quantity}</td>
              <td className="p-3">
                {item.min_stock}
                {item.quantity <= item.min_stock && (
                  <span className="text-red-600 font-semibold ml-2">
                    ⚠ Bajo stock
                  </span>
                )}
              </td>
              <td className="p-3">${item.price.toFixed(2)}</td>
              <td className="p-3">
                {new Date(item.updated_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <p className="text-center text-gray-500 py-4">No hay productos aún.</p>
      )}
    </div>
  );
}
