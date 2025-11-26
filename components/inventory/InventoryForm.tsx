'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function InventoryForm() {
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    min_stock: '',
    price: '',
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const { error } = await supabase.from('inventory').insert({
      name: form.name,
      quantity: Number(form.quantity),
      min_stock: Number(form.min_stock),
      price: Number(form.price),
    });

    if (error) {
      setMsg('Error al registrar el producto');
      setLoading(false);
      return;
    }

    setMsg('Producto agregado correctamente ✔️');
    setForm({ name: '', quantity: '', min_stock: '', price: '' });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nombre"
        className="w-full border p-3 rounded"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Cantidad"
        className="w-full border p-3 rounded"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Stock mínimo"
        className="w-full border p-3 rounded"
        value={form.min_stock}
        onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Precio"
        className="w-full border p-3 rounded"
        step="0.01"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
      >
        {loading ? 'Guardando...' : 'Agregar Producto'}
      </button>

      {msg && <p className="text-sm text-green-600">{msg}</p>}
    </form>
  );
}
