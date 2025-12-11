// app/(public)/layout.tsxx
import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-blue-50 via-white to-blue-50">
      <Navbar variant="public" />
      <main className="flex-1 flex items-stretch justify-center">
        {children}
      </main>
    </div>
  );
}
