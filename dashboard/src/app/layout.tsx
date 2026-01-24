import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard Escuela",
  description: "Gestión de asignaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: '280px', padding: '2rem', minHeight: '100vh' }}>
            <div className="container fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
