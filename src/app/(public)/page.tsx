import { redirect } from "next/navigation";
import { getTrendingBooks } from "@/lib/openlibrary";
import { getJWTFromCookie, isAdminFromCookie } from "@/lib/jwt-utils";
import { BookCard } from "@/components/features/book-card"; 
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, BookOpen } from "lucide-react";

// Revalidate data setiap 1 jam (ISR)
export const revalidate = 3600;

async function getFeaturedBooks() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/books/featured`, {
      method: "GET",
      cache: "force-cache",
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching featured books:", error);
    return [];
  }
}

export default async function Home() {

  // 1. LOGIKA TRAFFIC CONTROLLER (REDIRECT ADMIN)
  const isAdmin = await isAdminFromCookie();

  // PENTING: Redirect harus dilakukan DI LUAR try-catch
  if (isAdmin) {
    redirect("/admin/dashboard");
  }

  
  // 2. DATA FETCHING (PARALLEL)

  const [trendingBooks, featuredBooks] = await Promise.all([
    getTrendingBooks(),
    getFeaturedBooks(),
  ]);

  const heroBook = featuredBooks && featuredBooks.length > 0 ? featuredBooks[0] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
          
          {/* KOLOM KIRI: TEKS */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {heroBook ? (
              // --- TAMPILAN JIKA ADA BUKU FEATURED DARI ADMIN ---
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mx-auto md:mx-0">
                  <Star className="w-4 h-4 fill-current" />
                  Pilihan Editor Hari Ini
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {heroBook.title}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto md:mx-0">
                  {heroBook.description 
                    ? heroBook.description.slice(0, 150) + "..." 
                    : `Temukan wawasan baru dari karya ${heroBook.author}. Buku ini telah dikurasi khusus oleh tim MuzLib sebagai bacaan wajib minggu ini.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                  <Link href={`/book/${heroBook.openLibraryId}`}>
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold px-8">
                      Baca Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              // --- TAMPILAN DEFAULT (JIKA BELUM ADA BUKU FEATURED) ---
              <>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Jelajahi Ribuan <br />
                  <span className="text-blue-600">Koleksi Pengetahuan</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto md:mx-0">
                  MuzLib adalah platform perpustakaan digital modern. Temukan buku, simpan ke koleksi, dan bangun wawasan Anda sekarang.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                  <Link href="/search">
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold px-8">
                      Mulai Menjelajah <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* KOLOM KANAN: GAMBAR */}
          <div className="flex-1 relative w-full max-w-md mx-auto md:max-w-full flex justify-center">
            <div className="relative w-64 md:w-80 aspect-[2/3] shadow-2xl rounded-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500">
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-50 -z-10" />

              {heroBook ? (
                <Image
                  src={heroBook.coverUrl || "/images/book-placeholder.png"}
                  alt={heroBook.title}
                  fill
                  className="object-cover w-full h-full"
                  priority
                  unoptimized // Mencegah error 403 dari OpenLibrary
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-6 text-center border-2 border-dashed border-slate-300">
                  <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">Belum ada buku featured</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* TRENDING SECTION */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Star className="w-5 h-5 text-rose-600 fill-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sedang Trending</h2>
          </div>
          <Link href="/search?sort=trending">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Lihat Semua <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {trendingBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {trendingBooks.map((book) => (
              <BookCard key={book.openLibraryId} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">Belum ada data trending saat ini.</p>
          </div>
        )}
      </section>
    </div>
  );
}