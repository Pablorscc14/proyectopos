// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type NavbarProps = {
  variant?: "public" | "dashboard";
};

export function Navbar({ variant = "public" }: NavbarProps) {
  const { user, signOut } = useAuth();

  const isPublic = variant === "public";

  return (
    <header
      className={
        isPublic
          ? "w-full border-b border-blue-100 bg-white/90 backdrop-blur"
          : "w-full border-b border-blue-900 bg-blue-950/95 backdrop-blur"
      }
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        {/* Logo / nombre */}
        <Link
          href="/"
          className={
            isPublic
              ? "font-semibold text-lg text-blue-700 tracking-tight"
              : "font-semibold text-lg text-white tracking-tight"
          }
        >
          POS<span className="text-blue-500">+</span>Inventario
        </Link>

        {/* NAV PÚBLICO */}
        {isPublic && (
          <nav className="flex items-center gap-3">
            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="rounded-md border border-blue-300 text-blue-700 px-3 py-1.5 text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Ir al panel
              </Link>
            )}
          </nav>
        )}

        {/* NAV DASHBOARD */}
        {!isPublic && (
          <nav className="flex items-center gap-3 text-sm">
            {user && (
              <span className="text-blue-100 text-xs sm:text-sm truncate max-w-[180px]">
                {user.email}
              </span>
            )}
            <button
              onClick={signOut}
              className="rounded-md bg-red-500/90 text-white px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
