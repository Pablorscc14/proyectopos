// app/(public)/page.tsx
export default function HomePage() {
  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-linear-to-b from-blue-50 via-white to-blue-50 px-4">
      <div className="max-w-3xl text-center space-y-6">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Simple · Rápido · Pensado para tu negocio
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
          POS + Inventario para tu negocio
        </h1>

        <p className="text-sm sm:text-base text-blue-800/80 leading-relaxed max-w-2xl mx-auto">
          Gestiona ventas, stock y pagos desde una sola plataforma clara y
          moderna. Controla tu inventario en tiempo real y optimiza el trabajo
          en caja sin complicaciones.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Comenzar ahora
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-blue-300 bg-white text-blue-700 px-6 py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors w-full sm:w-auto"
          >
            Ya tengo una cuenta
          </a>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-blue-900/80">
          <div className="rounded-lg bg-white/80 border border-blue-100 p-3 shadow-sm">
            <p className="font-semibold">Ventas en segundos</p>
            <p className="mt-1 text-blue-800/80">
              POS pensado para flujos rápidos: busca, agrega y cobra sin
              cambiar de pantalla.
            </p>
          </div>
          <div className="rounded-lg bg-white/80 border border-blue-100 p-3 shadow-sm">
            <p className="font-semibold">Control de stock</p>
            <p className="mt-1 text-blue-800/80">
              Stock mínimo, alertas y actualización automática en cada venta.
            </p>
          </div>
          <div className="rounded-lg bg-white/80 border border-blue-100 p-3 shadow-sm">
            <p className="font-semibold">Multi usuario</p>
            <p className="mt-1 text-blue-800/80">
              Roles de Administrador y Trabajador para separar tareas y
              permisos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
