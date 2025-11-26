import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Sistema de Ventas e Inventario',
  description: 'Gestión de repuestos para camiones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen bg-gray-100 text-gray-800">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
