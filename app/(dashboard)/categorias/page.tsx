"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Role = "Administrador" | "Trabajador";

type Category = {
  id: number;
  name: string;
  description: string | null;
};

export default function CategoriasPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Cargar rol del usuario
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      setRoleLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error obteniendo rol:", error.message);
        setRole(null);
      } else {
        setRole(data?.role as Role);
      }
      setRoleLoading(false);
    };

    fetchRole();
  }, [user]);

  // Cargar categorías existentes
  const loadCategories = async () => {
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando categorías:", error.message);
      setCategoriesLoading(false);
      return;
    }

    setCategories(data || []);
    setCategoriesLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setErrorMessage("El nombre de la categoría es obligatorio.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("categories").insert([
      {
        name: trimmedName,
        description: trimmedDesc || null,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        setErrorMessage("Ya existe una categoría con ese nombre.");
      } else {
        setErrorMessage("Ocurrió un error al guardar la categoría.");
        console.error(error);
      }
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccessMessage("Categoría creada correctamente.");
    setName("");
    setDescription("");
    loadCategories();
  };

  if (authLoading || roleLoading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-blue-900">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-blue-900">
          Debes iniciar sesión para acceder a esta página.
        </p>
      </div>
    );
  }

  if (role !== "Administrador") {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-2 text-blue-900">
          Acceso denegado
        </h1>
        <p className="text-sm text-blue-900/80">
          No tienes permisos para acceder a la administración de categorías.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 text-sm text-blue-900">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">
          Administración de categorías
        </h1>
        <p className="text-xs md:text-sm text-blue-900/70">
          Crea y gestiona las categorías para organizar tu inventario y el POS.
        </p>
      </header>

      {/* Contenido principal: formulario + listado */}
      <main className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Formulario para crear categoría */}
        <section className="w-full lg:w-1/3">
          <div className="border border-blue-100 rounded-xl bg-white shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold">
                Nueva categoría
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nombre */}
              <div className="space-y-1">
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wide text-blue-900/80"
                  htmlFor="name"
                >
                  Nombre de la categoría
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70"
                  placeholder="Ej: Bebidas, Abarrotes, Limpieza..."
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wide text-blue-900/80"
                  htmlFor="description"
                >
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70"
                  placeholder="Describe brevemente la categoría."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Mensajes */}
              {errorMessage && (
                <p className="text-[11px] text-red-600">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-[11px] text-green-700">{successMessage}</p>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  {...({ disabled: saving } as any)}
                  className="text-xs md:text-sm"
                >
                  {saving ? "Guardando..." : "Crear categoría"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Listado de categorías */}
        <section className="w-full lg:w-2/3">
          <div className="border border-blue-100 rounded-xl bg-white shadow-sm p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold">
                Categorías existentes
              </h2>
              {categoriesLoading && (
                <span className="text-[11px] text-blue-900/70">
                  Actualizando...
                </span>
              )}
            </div>

            {categories.length === 0 && !categoriesLoading ? (
              <p className="text-xs md:text-sm text-blue-900/70">
                Aún no hay categorías registradas. Crea la primera en el
                formulario de la izquierda.
              </p>
            ) : (
              <div className="border border-blue-50 rounded-lg overflow-hidden max-h-[420px]">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="text-left px-3 py-2 border-b border-blue-100 font-semibold">
                        ID
                      </th>
                      <th className="text-left px-3 py-2 border-b border-blue-100 font-semibold">
                        Nombre
                      </th>
                      <th className="text-left px-3 py-2 border-b border-blue-100 font-semibold">
                        Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-blue-50/60 transition-colors"
                      >
                        <td className="px-3 py-2 border-b border-blue-50 align-top text-[11px] md:text-xs text-blue-900/80">
                          {cat.id}
                        </td>
                        <td className="px-3 py-2 border-b border-blue-50 align-top font-medium">
                          {cat.name}
                        </td>
                        <td className="px-3 py-2 border-b border-blue-50 align-top text-blue-900/80">
                          {cat.description || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
