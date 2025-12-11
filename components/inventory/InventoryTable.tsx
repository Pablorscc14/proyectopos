// components/inventory/InventoryTable.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type InventoryRow = {
  id: number;
  name: string;
  quantity: number;
  min_stock: number;
  price: number;
  updated_at: string | null;
  category_id: number | null;
  categories: {
    name: string;
  } | null;
};

type CategoryOption = {
  id: number;
  name: string;
};

export function InventoryTable() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // para edición
  const [editingItem, setEditingItem] = useState<InventoryRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState<string>("");
  const [editMinStock, setEditMinStock] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const [categoriesOptions, setCategoriesOptions] = useState<CategoryOption[]>(
    []
  );
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        id,
        name,
        quantity,
        min_stock,
        price,
        updated_at,
        category_id,
        categories (
          name
        )
      `
      )
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setError("Error al cargar inventario. Intenta nuevamente.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data as unknown as InventoryRow[]) ?? []);
    setLoading(false);
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando categorías:", error);
      setCategoriesOptions([]);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesOptions((data as CategoryOption[]) ?? []);
    setCategoriesLoading(false);
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const handleClickEdit = (item: InventoryRow) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQuantity(String(item.quantity));
    setEditMinStock(String(item.min_stock));
    setEditPrice(String(item.price));
    setEditCategoryId(item.category_id ? String(item.category_id) : "");
    setEditError(null);
    setEditSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditError(null);
    setEditSuccess(null);

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError("El nombre es obligatorio.");
      return;
    }

    const q = Number(editQuantity);
    const m = Number(editMinStock);
    const p = Number(editPrice);

    if (Number.isNaN(q) || !Number.isInteger(q) || q < 0) {
      setEditError("La cantidad debe ser un entero mayor o igual a 0.");
      return;
    }
    if (Number.isNaN(m) || !Number.isInteger(m) || m < 0) {
      setEditError("El stock mínimo debe ser un entero mayor o igual a 0.");
      return;
    }
    if (p <= 0 || Number.isNaN(p)) {
      setEditError("El precio debe ser mayor que 0.");
      return;
    }

    const catId = editCategoryId ? Number(editCategoryId) : null;

    setEditSaving(true);

    const { error } = await supabase
      .from("inventory")
      .update({
        name: trimmedName,
        quantity: q,
        min_stock: m,
        price: p,
        category_id: catId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingItem.id);

    if (error) {
      console.error(error);
      setEditError("Error al actualizar el producto. Intenta nuevamente.");
      setEditSaving(false);
      return;
    }

    setEditSaving(false);
    setEditSuccess("Producto actualizado correctamente.");

    // Actualizar lista local sin recargar todo si quieres
    setItems((prev) =>
      prev.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              name: trimmedName,
              quantity: q,
              min_stock: m,
              price: p,
              category_id: catId,
              categories: catId
                ? {
                    name:
                      categoriesOptions.find((c) => c.id === catId)?.name ||
                      it.categories?.name ||
                      "",
                  }
                : null,
            }
          : it
      )
    );

    // Cerrar el formulario después de un pequeño delay o de inmediato
    setTimeout(() => {
      setEditingItem(null);
    }, 700);
  };

  const handleDelete = async (item: InventoryRow) => {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar el producto "${item.name}"?`
    );
    if (!ok) return;

    setDeleteLoadingId(item.id);
    setError(null);

    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error(error);
      setError(
        "No se pudo eliminar el producto. Es posible que tenga ventas asociadas."
      );
      setDeleteLoadingId(null);
      return;
    }

    setItems((prev) => prev.filter((it) => it.id !== item.id));
    setDeleteLoadingId(null);

    // Si estabas editando ese mismo producto, cierra el formulario
    if (editingItem && editingItem.id === item.id) {
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-blue-100 rounded-xl bg-white overflow-hidden shadow-sm">
        {/* Header tabla + acciones */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/60">
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Inventario de productos
            </h2>
            <p className="text-[11px] text-blue-800/70">
              Revisa stock actual y productos con poco stock.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="text-[11px] sm:text-xs rounded-md border border-blue-300 bg-white px-3 py-1 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {/* Contenido */}
        {error && (
          <div className="px-4 py-3 text-xs text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="px-4 py-6 text-sm text-blue-800/80">
            Cargando inventario...
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="px-4 py-6 text-sm text-blue-800/80">
            No hay productos registrados todavía.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-900">
                    Producto
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-blue-900">
                    Categoría
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                    Stock
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                    Mínimo
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                    Precio
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-blue-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lowStock = item.quantity <= item.min_stock;
                  const rowBg =
                    idx % 2 === 0 ? "bg-white" : "bg-blue-50/40";

                  const categoryName =
                    item.categories?.name || "Sin categoría";

                  const deleting = deleteLoadingId === item.id;

                  return (
                    <tr key={item.id} className={rowBg}>
                      <td className="px-3 py-2 text-blue-900">
                        {item.name}
                      </td>
                      <td className="px-3 py-2 text-blue-900/90 text-xs">
                        {categoryName}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-900">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-900">
                        {item.min_stock}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-900">
                        $
                        {Number(item.price).toLocaleString("es-CL", {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {lowStock ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
                            Bajo stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Stock OK
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleClickEdit(item)}
                            className="inline-flex items-center rounded-md border border-blue-300 bg-white px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deleting}
                            className="inline-flex items-center rounded-md border border-red-300 bg-white px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {deleting ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario de edición */}
      {editingItem && (
        <div className="border border-blue-100 rounded-xl bg-white shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-900">
              Editar producto:{" "}
              <span className="font-bold">{editingItem.name}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-[11px] text-blue-700 hover:underline"
            >
              Cancelar
            </button>
          </div>

          <form
            onSubmit={handleSubmitEdit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm"
          >
            {/* Nombre */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-blue-900/80 mb-1">
                Nombre
              </label>
              <input
                className="border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>

            {/* Categoría */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-blue-900/80 mb-1">
                Categoría
              </label>
              <select
                className="border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 focus:ring-2 focus:ring-blue-500/70"
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading
                    ? "Cargando categorías..."
                    : "Sin categoría"}
                </option>
                {categoriesOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-blue-900/80 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                className="border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
              />
            </div>

            {/* Stock mínimo */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-blue-900/80 mb-1">
                Stock mínimo
              </label>
              <input
                type="number"
                className="border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70"
                value={editMinStock}
                onChange={(e) => setEditMinStock(e.target.value)}
              />
            </div>

            {/* Precio */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold text-blue-900/80 mb-1">
                Precio (CLP)
              </label>
              <input
                type="number"
                className="border border-blue-200 rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>

            {/* Mensajes + botón */}
            <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-1">
              {editError && (
                <span className="text-[11px] text-red-600">{editError}</span>
              )}
              {editSuccess && (
                <span className="text-[11px] text-green-700">
                  {editSuccess}
                </span>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-md bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {editSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
