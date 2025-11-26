"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (values: LoginForm): LoginErrors => {
    const newErrors: LoginErrors = {};
    const emailTrimmed = values.email.trim();

    if (!emailTrimmed) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^\S+@\S+\.\S+$/.test(emailTrimmed)) {
      newErrors.email = "Ingresa un correo válido.";
    }

    if (!values.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (values.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    return newErrors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });

      if (loginError) {
        setErrors({
          general: "Correo o contraseña incorrectos.",
        });
        setLoading(false);
        return;
      }

      const user = authData.user;
      if (!user) {
        setErrors({
          general: "No se pudo obtener el usuario.",
        });
        setLoading(false);
        return;
      }

      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError || !userRecord) {
        setErrors({
          general:
            "El usuario existe en Auth pero no en la tabla interna. Contacta a un administrador.",
        });
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setErrors({
        general: "Ocurrió un error inesperado. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 border border-blue-100 shadow-lg rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-blue-900">
          Iniciar sesión
        </h1>
        <p className="text-center text-xs sm:text-sm text-blue-800/80 mb-6">
          Accede a tu panel de ventas e inventario.
        </p>

        {errors.general && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-blue-900">
              Correo electrónico
            </label>
            <input
              type="email"
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/70 text-blue-900 placeholder:text-blue-300 ${
                errors.email
                  ? "border-red-300 focus:ring-red-400/70"
                  : "border-blue-200 bg-white"
              }`}
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-blue-900">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-md border px-3 py-2 pr-16 text-sm outline-none transition focus:ring-2 text-blue-900 placeholder:text-blue-300 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-400/70"
                    : "border-blue-200 bg-white focus:ring-blue-500/70"
                }`}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-xs text-blue-700 hover:text-blue-900 font-medium"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-blue-600 text-white py-2.5 text-sm sm:text-base font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Entrando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm mt-4 text-blue-800/80">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Crear una cuenta
          </a>
        </p>
      </div>
    </div>
  );
}
