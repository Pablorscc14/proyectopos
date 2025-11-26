// app/(dashboard)/pos/page.tsx
"use client";

import { PosProvider } from "@/context/PosContext";
import { ProductList } from "@/components/pos/ProductList";
import { Cart } from "@/components/pos/Cart";
import { PaymentSection } from "@/components/pos/PaymentSection";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function PosPage() {
  // POS disponible para Admin y Trabajador
  useRequireAuth(["Administrador", "Trabajador"]);

  return (
    <PosProvider>
      <div className="h-full w-full px-4 py-4 bg-linear-to-b from-blue-50 via-white to-blue-50">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 h-[calc(100vh-140px)]">
          <ProductList />
          <div className="flex flex-col gap-3">
            <Cart />
            <PaymentSection />
          </div>
        </div>
      </div>
    </PosProvider>
  );
}
