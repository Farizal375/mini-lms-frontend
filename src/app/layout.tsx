// File: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cookies } from "next/headers";
import { ReadingListDrawer } from "@/components/features/reading-list-drawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MuzLib - Digital Library",
  description: "Aplikasi Perpustakaan Digital UTS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- SISTEM BARU: AMBIL ROLE DARI JWT COOKIE ---
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let userRole = null;
  let userId = null;

  if (token) {
    try {
      // Decode isi token JWT secara manual (tanpa library tambahan)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      userRole = payload.role;
      userId = payload.id;
    } catch (e) {
      console.error("Gagal membaca token JWT", e);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Oper userRole ke Navbar persis seperti yang Anda lakukan sebelumnya */}
        <Navbar userRole={userRole} />
        
        <main className="min-h-screen pt-16">
          {children}
        </main>
        
        <ReadingListDrawer />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}