// app/(dashboard)/inventory/page.tsx
"use client";

import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { InventoryTable } from "@/components/inventory/InventoryTable";

export default function InventoryPage() {
  // Solo Administrador puede entrar
  useRequireAuth(["Administrador"]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleOpenModal = () => setShowCreateModal(true);
  const handleCloseModal = () => setShowCreateModal(false);

  return (
    <div className="p-4 md:p-6 space-y-4 text-sm text-blue-900">
      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            Gestión de inventario
          </h1>
          <p className="text-xs md:text-sm text-blue-900/70">
            Administra tus productos, stock y categorías.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-xs md:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Agregar producto
        </button>
      </div>

      {/* Tabla de inventario */}
      <InventoryTable />

      {/* Modal para agregar producto */}
      {showCreateModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl mx-4 bg-white rounded-xl shadow-lg border border-blue-100">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/60 rounded-t-xl">
              <h2 className="text-sm md:text-base font-semibold text-blue-900">
                Agregar nuevo producto
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-xs text-blue-800 hover:text-blue-900"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Contenido del modal: formulario */}
            <div className="p-4">
              <InventoryForm onSuccess={handleCloseModal} />
              <p className="mt-2 text-[11px] text-blue-900/70">
                Después de crear un producto, puedes actualizar la tabla con el
                botón <strong>"Actualizar"</strong> en la parte superior del
                inventario.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
