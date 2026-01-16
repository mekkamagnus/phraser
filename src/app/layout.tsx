import type { Metadata } from "next";
import "./globals.css";
import { ensureMigrations } from "@/lib/db-init";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/Toast";

// Run migrations on app startup
ensureMigrations().catch((err) => {
  console.error('Failed to run migrations:', err);
});

export const metadata: Metadata = {
  title: "Phraser - Language Learning Tool",
  description: "Translate, save, and review phrases with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <Header />
          <main>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
