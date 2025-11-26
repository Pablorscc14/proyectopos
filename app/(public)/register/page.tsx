"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
};

type RegisterErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  general?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const validate = (values: RegisterForm): RegisterErrors => {
    const newErrors: RegisterErrors = {};
    const emailTrimmed = values.email.trim();
    const usernameTrimmed = values.username.trim();

    // Email
    if (!emailTrimmed) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^\S+@\S+\.\S+$/.test(emailTrimmed)) {
      newErrors.email = "Ingresa un correo válido.";
    }

    // Username
    if (!usernameTrimmed) {
      newErrors.username = "El nombre de usuario es obligatorio.";
    } else if (usernameTrimmed.length < 3) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres.";
    } else if (/\s/.test(usernameTrimmed)) {
      newErrors.username = "El nombre de usuario no puede tener espacios.";
    }

    // Password
    if (!values.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (values.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    // Confirm password
    if (!values.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña.";
    } else if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent) => {
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
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });

      if (authError) {
        setErrors({ general: authError.message });
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setErrors({
          general: "Error inesperado: usuario no creado.",
        });
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        username: form.username.trim(),
        role: "Trabajador", // por defecto
      });

      if (insertError) {
        setErrors({
          general:
            "Error al crear el usuario en la tabla interna: " +
            insertError.message,
        });
        setLoading(false);
        return;
      }

      router.push("/login");
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
          Crear cuenta
        </h1>
        <p className="text-center text-xs sm:text-sm text-blue-800/80 mb-6">
          Registra tu usuario para comenzar a usar el POS + Inventario.
        </p>

        {errors.general && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-blue-900">
              Nombre de usuario
            </label>
            <input
              type="text"
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 text-blue-900 placeholder:text-blue-300 ${
                errors.username
                  ? "border-red-300 focus:ring-red-400/70"
                  : "border-blue-200 bg-white focus:ring-blue-500/70"
              }`}
              placeholder="Ej: caja_local, vendedor1"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
            />
            {errors.username && (
              <p className="text-xs text-red-600">{errors.username}</p>
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

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-blue-900">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                className={`w-full rounded-md border px-3 py-2 pr-16 text-sm outline-none transition focus:ring-2 text-blue-900 placeholder:text-blue-300 ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-400/70"
                    : "border-blue-200 bg-white focus:ring-blue-500/70"
                }`}
                placeholder="Repite la contraseña"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-xs text-blue-700 hover:text-blue-900 font-medium"
              >
                {showPasswordConfirm ? "Ocultar" : "Ver"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-blue-600 text-white py-2.5 text-sm sm:text-base font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm mt-4 text-blue-800/80">
          ¿Ya tienes una cuenta?{" "}
          <a
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
