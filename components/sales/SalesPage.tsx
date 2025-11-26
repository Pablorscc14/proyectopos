// components/sales/SalesPage.tsx
"use client";

import { useState } from "react";
import { SalesTable } from "./SalesTable";
import { SaleDetail } from "./SaleDetail";

export function SalesPage() {
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  return (
    <div className="h-full w-full px-4 py-4 bg-linear-to-b from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Historial de ventas
            </h1>
            <p className="text-sm text-blue-800/80">
              Revisa las ventas registradas en el sistema.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
          <SalesTable
            selectedSaleId={selectedSaleId}
            onSelectSale={(id) => setSelectedSaleId(id)}
          />
          <SaleDetail saleId={selectedSaleId} />
        </div>
      </div>
    </div>
  );
}
