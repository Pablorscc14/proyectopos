'use client';

import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryTable from '@/components/inventory/InventoryTable';

export default function InventoryPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white shadow-md p-5 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Agregar Producto</h2>
          <InventoryForm />
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-md p-5 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Inventario</h2>
          <InventoryTable />
        </div>
      </div>
    </div>
  );
}
