'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1️⃣ Login Supabase Auth
    const { data: authData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

    if (loginError) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    const user = authData.user;
    if (!user) {
      setError("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    // 2️⃣ Consultar tu tabla users usando el UUID del usuario
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userRecord) {
      setError("Error: el usuario existe en Auth pero no en tabla users.");
      setLoading(false);
      return;
    }

    // ✔ Si todo está bien -> Dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">Iniciar sesión</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            className="w-full p-3 bg-gray-700 rounded text-white"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 bg-gray-700 rounded text-white"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded hover:bg-blue-700 transition font-semibold"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-300">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-blue-400 font-semibold">Registrarse</a>
        </p>

      </div>
    </div>
  );
}
