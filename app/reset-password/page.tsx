"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    password2?: string;
    general?: string;
  }>({});

  const [tokenReady, setTokenReady] = useState(false);

  // Supabase necesita que el fragmento #access_token sea procesado
  useEffect(() => {
    const handleToken = async () => {
      const hash = window.location.hash; // contiene #access_token=...

      if (hash && hash.includes("access_token")) {
        await supabase.auth.exchangeCodeForSession(hash);
      }

      setTokenReady(true);
    };

    handleToken();
  }, []);

  const validatePasswords = () => {
    const newErrors: typeof errors = {};

    if (!password || password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (password2 !== password) {
      newErrors.password2 = "Las contraseñas no coinciden.";
    }

    return newErrors;
  };

  const handleReset = async () => {
    setErrors({});
    const validation = validatePasswords();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrors({ general: "No se pudo actualizar la contraseña." });
        setLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2200);
    } catch (err) {
      setErrors({ general: "Ocurrió un error inesperado." });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-900">
        Procesando enlace de restablecimiento...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 border border-blue-100 shadow-lg rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-blue-900">
          Restablecer contraseña
        </h1>

        <p className="text-center text-sm text-blue-800/80 mb-6">
          Ingresa tu nueva contraseña para continuar.
        </p>

        {errors.general && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {success ? (
          <div className="text-center py-4 text-green-700 font-medium">
            ✔ Contraseña actualizada correctamente.
            <p className="text-xs mt-2">Redirigiendo al login...</p>
          </div>
        ) : (
          <>
            {/* Nueva contraseña */}
            <div className="space-y-1 mb-4">
              <label className="text-sm font-medium text-blue-900">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition ${
                  errors.password
                    ? "border-red-300 focus:ring-red-400/70"
                    : "border-blue-200 focus:ring-blue-500/70"
                }`}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Repetir contraseña */}
            <div className="space-y-1 mb-4">
              <label className="text-sm font-medium text-blue-900">
                Repetir contraseña
              </label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition ${
                  errors.password2
                    ? "border-red-300 focus:ring-red-400/70"
                    : "border-blue-200 focus:ring-blue-500/70"
                }`}
                placeholder="Repite la contraseña"
              />
              {errors.password2 && (
                <p className="text-xs text-red-600">{errors.password2}</p>
              )}
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 text-white py-2.5 text-sm sm:text-base font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
