// components/inventory/InventoryForm.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FormErrors = {
  name?: string;
  quantity?: string;
  minStock?: string;
  price?: string;
  categoryId?: string;
  general?: string;
};

type Category = {
  id: number;
  name: string;
};

type InventoryFormProps = {
  onSuccess?: () => void; // se usa para cerrar modal desde el padre
};

export function InventoryForm({ onSuccess }: InventoryFormProps) {
  const [name, setName] = useState("");
  // manejo como string para evitar NaN raros
  const [quantity, setQuantity] = useState<string>("");
  const [minStock, setMinStock] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar categorías desde Supabase
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error cargando categorías:", error);
        setCategories([]);
      } else {
        setCategories(data || []);
      }

      setCategoriesLoading(false);
    };

    loadCategories();
  }, []);

  const validate = () => {
    const newErrors: FormErrors = {};

    const q = Number(quantity);
    const m = Number(minStock);
    const p = Number(price);
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!quantity) {
      newErrors.quantity = "La cantidad es obligatoria.";
    } else if (isNaN(q) || !Number.isInteger(q)) {
      newErrors.quantity = "La cantidad debe ser un número entero.";
    } else if (q < 0) {
      newErrors.quantity = "La cantidad no puede ser negativa.";
    }

    if (!minStock) {
      newErrors.minStock = "El stock mínimo es obligatorio.";
    } else if (isNaN(m) || !Number.isInteger(m)) {
      newErrors.minStock = "El stock mínimo debe ser un número entero.";
    } else if (m < 0) {
      newErrors.minStock = "El stock mínimo no puede ser negativo.";
    } else if (!isNaN(q) && m > q) {
      newErrors.minStock = "El stock mínimo no puede ser mayor al stock actual.";
    }

    if (!price) {
      newErrors.price = "El precio es obligatorio.";
    } else if (isNaN(p)) {
      newErrors.price = "El precio debe ser un número.";
    } else if (p <= 0) {
      newErrors.price = "El precio debe ser mayor que 0.";
    }

    if (!categoryId) {
      newErrors.categoryId = "La categoría es obligatoria.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatusMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const q = Number(quantity);
    const m = Number(minStock);
    const p = Number(price);
    const catId = Number(categoryId);

    setLoading(true);

    const { error } = await supabase.from("inventory").insert({
      name: name.trim(),
      quantity: q,
      min_stock: m,
      price: p,
      category_id: catId,
    });

    if (error) {
      console.error(error);
      setErrors({
        general: "Error al crear producto. Intenta nuevamente.",
      });
      setLoading(false);
      return;
    }

    setStatusMessage("Producto creado correctamente.");
    setName("");
    setQuantity("");
    setMinStock("");
    setPrice("");
    setCategoryId("");
    setLoading(false);

    // si viene onSuccess (por ejemplo desde el modal), se ejecuta
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-blue-100 rounded-xl bg-white p-4 flex flex-wrap gap-3 items-start text-sm shadow-sm"
    >
      {/* Nombre */}
      <div className="flex flex-col min-w-[180px] flex-1">
        <label className="text-xs font-semibold text-blue-900 mb-1">
          Nombre del producto
        </label>
        <input
          className={`border rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70 ${
            errors.name ? "border-red-300" : "border-blue-200"
          }`}
          placeholder="Ej: Polera básica negra"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <span className="text-[11px] text-red-600 mt-1">
            {errors.name}
          </span>
        )}
      </div>

      {/* Categoría */}
      <div className="flex flex-col min-w-[180px]">
        <label className="text-xs font-semibold text-blue-900 mb-1">
          Categoría
        </label>
        <select
          className={`border rounded-md px-3 py-2 text-sm outline-none text-blue-900 focus:ring-2 focus:ring-blue-500/70 ${
            errors.categoryId ? "border-red-300" : "border-blue-200"
          }`}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={categoriesLoading || categories.length === 0}
        >
          <option value="">
            {categoriesLoading
              ? "Cargando categorías..."
              : categories.length === 0
              ? "No hay categorías (crea una primero)"
              : "Selecciona una categoría"}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span className="text-[11px] text-red-600 mt-1">
            {errors.categoryId}
          </span>
        )}
      </div>

      {/* Cantidad */}
      <div className="flex flex-col w-[120px]">
        <label className="text-xs font-semibold text-blue-900 mb-1">
          Cantidad
        </label>
        <input
          type="number"
          className={`border rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70 ${
            errors.quantity ? "border-red-300" : "border-blue-200"
          }`}
          placeholder="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {errors.quantity && (
          <span className="text-[11px] text-red-600 mt-1">
            {errors.quantity}
          </span>
        )}
      </div>

      {/* Stock mínimo */}
      <div className="flex flex-col w-[130px]">
        <label className="text-xs font-semibold text-blue-900 mb-1">
          Stock mínimo
        </label>
        <input
          type="number"
          className={`border rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70 ${
            errors.minStock ? "border-red-300" : "border-blue-200"
          }`}
          placeholder="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
        />
        {errors.minStock && (
          <span className="text-[11px] text-red-600 mt-1">
            {errors.minStock}
          </span>
        )}
      </div>

      {/* Precio */}
      <div className="flex flex-col w-[140px]">
        <label className="text-xs font-semibold text-blue-900 mb-1">
          Precio (CLP)
        </label>
        <input
          type="number"
          className={`border rounded-md px-3 py-2 text-sm outline-none text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500/70 ${
            errors.price ? "border-red-300" : "border-blue-200"
          }`}
          placeholder="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        {errors.price && (
          <span className="text-[11px] text-red-600 mt-1">
            {errors.price}
          </span>
        )}
      </div>

      {/* Botón + mensajes */}
      <div className="flex flex-col justify-end gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Guardando..." : "Guardar producto"}
        </button>
        {errors.general && (
          <span className="text-[11px] text-red-600">{errors.general}</span>
        )}
        {statusMessage && (
          <span className="text-[11px] text-green-700">{statusMessage}</span>
        )}
      </div>
    </form>
  );
}
