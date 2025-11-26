'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setSessionUser(user);

      // Traer rol desde tabla users
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id) // MATCH PERFECTO (UUID === UUID)
        .single();

      if (error || !userData) {
        router.push('/login');
        return;
      }

      setRole(userData.role);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <p className="text-lg mb-4">
        Bienvenido, <span className="font-semibold">{sessionUser.email}</span>
      </p>

      <p className="text-md mb-8">
        Rol: <span className="bg-blue-600 px-3 py-1 rounded">{role}</span>
      </p>

      {/* ADMIN */}
      {role === 'Administrador' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/usuarios" className="bg-gray-800 p-6 rounded hover:bg-gray-700">
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            <p className="text-gray-300">Crear, editar, eliminar usuarios.</p>
          </a>

          <a href="/inventario" className="bg-gray-800 p-6 rounded hover:bg-gray-700">
            <h2 className="text-xl font-bold">Inventario</h2>
            <p className="text-gray-300">Administrar stock.</p>
          </a>

          <a href="/pos" className="bg-gray-800 p-6 rounded hover:bg-gray-700">
            <h2 className="text-xl font-bold">POS</h2>
            <p className="text-gray-300">Punto de venta.</p>
          </a>

          <a href="/ventas" className="bg-gray-800 p-6 rounded hover:bg-gray-700">
            <h2 className="text-xl font-bold">Historial de Ventas</h2>
            <p className="text-gray-300">Revisar ventas.</p>
          </a>
        </div>
      )}

      {/* TRABAJADOR */}
      {role === 'Trabajador' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <a href="/pos" className="bg-gray-800 p-6 rounded hover:bg-gray-700">
            <h2 className="text-xl font-bold">POS</h2>
            <p className="text-gray-300">Registrar ventas.</p>
          </a>

          <a href="/inventario" className="bg-gray-800 p-6 rounded hover:bg-gray-700">
            <h2 className="text-xl font-bold">Inventario</h2>
            <p className="text-gray-300">Consultar stock.</p>
          </a>

        </div>
      )}

    </div>
  );
}
