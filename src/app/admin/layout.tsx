import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { getJWTFromCookie } from "@/lib/jwt-utils";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getUserInfo(userId: string) {
  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const payload = await getJWTFromCookie();
  
  if (!payload?.id || payload.role !== "ADMIN") {
    redirect("/sign-in");
  }

  // Get user info from backend API
  const user = await getUserInfo(payload.id);
  const userEmail = user?.email || payload.id;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 shadow-xl shrink-0">
        <AdminSidebar />
      </aside>

      {/* AREA UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER KHUSUS ADMIN */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 z-30 shadow-sm">
          
          {/* KIRI: Judul & Toggle Mobile */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-none">
                  <AdminSidebar />
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Panel Admin
            </h2>
          </div>
          
          {/* KANAN: PROFIL ADMIN */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Administrator
              </p>
              <p className="text-sm font-bold text-slate-900 leading-none mt-0.5">
                {userEmail.split("@")[0]} {/* Tampilkan nama depan email */}
              </p>
            </div>
            
            {/* Tombol Logout */}
            <div className="h-8 w-8 flex items-center justify-center">
              <Link 
                href="/api/auth/logout"
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* AREA KONTEN SCROLLABLE */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50/50">
          <div className="flex-1 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>

          {/* FOOTER ADMIN (KECIL) */}
          <footer className="p-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MuzLib System. Authorized Personnel Only.
          </footer>
        </main>
      </div>
    </div>
  );
}