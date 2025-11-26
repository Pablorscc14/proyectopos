'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: ''
  });

  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Crear usuario en Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setError('Error inesperado: usuario no creado.');
      return;
    }

    // 2. Insertar usuario en tu tabla "users"
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,               // UUID correctísimo
      username: form.username,
      role: 'Trabajador'         // Puedes cambiar si quieres
    });

    if (insertError) {
      setError('Error al crear usuario en tabla users: ' + insertError.message);
      return;
    }

    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">Crear Cuenta</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 bg-gray-700 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Nombre de usuario"
            className="w-full p-3 bg-gray-700 rounded"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 bg-gray-700 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 py-2 rounded hover:bg-green-700 font-semibold"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-300">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="text-blue-400 font-semibold">Inicia sesión</a>
        </p>

      </div>
    </div>
  );
}
