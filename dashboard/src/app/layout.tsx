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
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <div className="container fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
