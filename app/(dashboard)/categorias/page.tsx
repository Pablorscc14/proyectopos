// app/(dashboard)/categorias/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Role = "Administrador" | "Trabajador";

export default function CategoriasPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Opcional: listado simple de categorías
  const [categories, setCategories] = useState<
    { id: number; name: string; description: string | null }[]
  >([]);

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

  // Cargar categorías existentes (opcional)
  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error cargando categorías:", error.message);
      return;
    }

    setCategories(data || []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("El nombre de la categoría es obligatorio.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("categories").insert([
      {
        name: name.trim(),
        description: description.trim() || null,
      },
    ]);

    if (error) {
      // Manejo sencillo del error de nombre duplicado
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
      <div className="p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p>Debes iniciar sesión para acceder a esta página.</p>
      </div>
    );
  }

  if (role !== "Administrador") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Acceso denegado</h1>
        <p>No tienes permisos para acceder a la administración de categorías.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">Administración de categorías</h1>
        <p className="text-sm text-gray-600">
          Crea y gestiona las categorías para organizar tu inventario.
        </p>
      </header>

      {/* Formulario para crear categoría */}
      <section className="max-w-lg bg-white shadow rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">Agregar nueva categoría</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Nombre de la categoría
            </label>
            <Input
              id="name"
              placeholder="Ej: Abarrotes, Bebidas, Limpieza..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe brevemente la categoría."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Crear categoría"}
            </Button>
          </div>
        </form>
      </section>

      {/* Listado simple de categorías */}
      <section className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-3">Categorías existentes</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-600">
            Aún no hay categorías registradas.
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 border-b">ID</th>
                  <th className="text-left px-3 py-2 border-b">Nombre</th>
                  <th className="text-left px-3 py-2 border-b">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">{cat.id}</td>
                    <td className="px-3 py-2 border-b font-medium">
                      {cat.name}
                    </td>
                    <td className="px-3 py-2 border-b">
                      {cat.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

