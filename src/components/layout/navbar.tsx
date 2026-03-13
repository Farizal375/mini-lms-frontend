"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ShieldCheck, ShoppingBag, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useReadingList } from "@/store/use-reading-list";
import { logoutAction } from "@/actions/auth-actions";

interface NavbarProps {
  userRole?: string | null;
}

export function Navbar({ userRole }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { items, toggleOpen } = useReadingList();

  // State untuk menangani Hydration Mismatch dan auth status
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has token (simple check)
    // Token valid jika userRole sudah dipass dari layout
    setIsLoggedIn(!!userRole || false);
  }, [userRole]);

  // Sembunyikan Navbar pada halaman Admin untuk menghindari duplikasi layout
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const res = await logoutAction();
      if (res?.success) {
        toast.success("Logout berhasil!");
        router.push("/sign-in");
        router.refresh();
      }
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- LOGO SECTION --- */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            MuzLib
          </span>
        </Link>

        {/* --- NAVIGATION LINKS (DESKTOP) --- */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Beranda
          </Link>
          <Link href="/search" className="hover:text-blue-600 transition-colors">
            Cari Buku
          </Link>
          {isMounted && isLoggedIn && (
            <Link href="/my-books" className="hover:text-blue-600 transition-colors">
              Koleksi Saya
            </Link>
          )}
        </div>

        {/* --- RIGHT ACTION MENU --- */}
        <div className="flex items-center gap-3">
          
          {/* 1. Reading List Trigger (Zustand) */}
          {isMounted && isLoggedIn && (
            <button 
              onClick={toggleOpen} 
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors group"
              aria-label="Buka Reading List"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              
              {/* Badge Counter */}
              {items.length > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {items.length}
                </span>
              )}
            </button>
          )}

          {/* 2. Authentication Actions */}
          {!isMounted || !isLoggedIn ? (
            // User belum login
            <Link href="/sign-in">
              <Button size="sm" className="font-semibold">
                Masuk
              </Button>
            </Link>
          ) : (
            // User sudah login
            <div className="flex items-center gap-3">
              {userRole === "ADMIN" && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors group"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}