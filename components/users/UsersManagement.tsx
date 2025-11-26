// components/users/UsersManagement.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type Role = "Administrador" | "Trabajador";

type UserRow = {
  id: string;
  username: string;
  role: Role;
  created_at: string | null;
};

const ROLE_OPTIONS: Role[] = ["Administrador", "Trabajador"];

export function UsersManagement() {
  const { profile } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    const { data, error } = await supabase
      .from("users")
      .select("id, username, role, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setError("Error al cargar usuarios.");
      setUsers([]);
      setLoading(false);
      return;
    }

    setUsers((data as UserRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setError(null);
    setStatus(null);

    // Evitar que se quite a sí mismo el rol de Admin (opcional pero saludable)
    if (profile?.id === userId && newRole !== "Administrador") {
      setError("No puedes quitarte a ti mismo el rol de Administrador.");
      return;
    }

    setSavingId(userId);

    // Actualización optimista
    const prevUsers = [...users];
    setUsers((current) =>
      current.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
            }
          : u
      )
    );

    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error(error);
      setError("Error al actualizar el rol. Intenta nuevamente.");
      setUsers(prevUsers); // revertir
      setSavingId(null);
      return;
    }

    setStatus("Rol actualizado correctamente.");
    setSavingId(null);
  };

  return (
    <div className="h-full w-full px-4 py-4 bg-linear-to-b from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Gestión de usuarios
            </h1>
            <p className="text-sm text-blue-800/80">
              Cambia los roles de acceso al POS + Inventario.
            </p>
          </div>
          <div className="text-xs text-blue-800/80">
            Total usuarios:{" "}
            <span className="font-semibold text-blue-900">
              {users.length}
            </span>
          </div>
        </header>

        <div className="border border-blue-100 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/60">
            <div>
              <h2 className="text-sm font-semibold text-blue-900">
                Usuarios del sistema
              </h2>
              <p className="text-[11px] text-blue-800/70">
                Ajusta los roles de Administrador o Trabajador.
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="text-[11px] rounded-md border border-blue-300 bg-white px-3 py-1 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          {status && !error && (
            <div className="px-4 py-2 text-xs text-emerald-700 bg-emerald-50 border-b border-emerald-200">
              {status}
            </div>
          )}

          {loading && (
            <div className="px-4 py-4 text-sm text-blue-800/80">
              Cargando usuarios...
            </div>
          )}

          {!loading && users.length === 0 && !error && (
            <div className="px-4 py-4 text-sm text-blue-800/80">
              No hay usuarios registrados en la tabla interna.
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-blue-50 border-b border-blue-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                      Usuario
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                      Rol
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-blue-900">
                      Creado
                    </th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const rowBg =
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50/40";
                    const isSelf = profile?.id === user.id;

                    const created =
                      user.created_at && !isNaN(Date.parse(user.created_at))
                        ? new Date(user.created_at).toLocaleString(
                            "es-CL",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            }
                          )
                        : user.created_at ?? "-";

                    return (
                      <tr key={user.id} className={rowBg}>
                        <td className="px-3 py-2 text-blue-900">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {user.username}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] text-blue-600">
                                (tú)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-blue-900 max-w-[140px] truncate">
                          <span className="text-[10px]">
                            {user.id}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={user.role}
                            disabled={savingId === user.id}
                            onChange={(e) =>
                              handleRoleChange(
                                user.id,
                                e.target.value as Role
                              )
                            }
                            className="border border-blue-200 rounded-md px-2 py-1 text-[11px] text-blue-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-blue-900">
                          {created}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {savingId === user.id && (
                            <span className="text-[11px] text-blue-700">
                              Guardando...
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
