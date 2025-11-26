export default function HomePage() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-gray-800">
        Bienvenido al Sistema de Ventas e Inventario
      </h1>
      <p className="text-gray-500 mt-2">
        Inicia sesión para continuar o regístrate si eres nuevo.
      </p>
      <div className="mt-6 space-x-4">
        <a
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Iniciar sesión
        </a>
        <a
          href="/register"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          Registrarse
        </a>
      </div>
    </div>
  );
}
