import { redirect } from "next/navigation";
import { getUserIdFromCookie } from "@/lib/jwt-utils";
import { BookCard } from "@/components/features/book-card";
import { Book } from "@/types";

// Metadata untuk SEO & Tab Browser
export const metadata = {
  title: "Koleksi Saya | MuzLib",
  description: "Daftar buku favorit yang telah Anda simpan.",
};

async function getUserBookmarks(userId: string): Promise<Book[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    // Get token from cookies untuk include di request
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/bookmarks`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const result = await res.json();
    // API returns: [{ id, userId, bookId, createdAt, book: { ... } }]
    // We need to extract the nested .book object and map to Book type
    const bookmarks = result.data || [];
    return bookmarks
      .filter((item: any) => item.book != null)
      .map((item: any) => ({
        id: item.book.openLibraryId,
        openLibraryId: item.book.openLibraryId,
        title: item.book.title,
        author: item.book.author,
        coverUrl: item.book.coverUrl || "/images/book-placeholder.png",
        publishYear: item.book.publishYear,
        description: item.book.description,
        isFeatured: item.book.isFeatured ?? false,
        isHidden: item.book.isHidden ?? false,
      }));
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

export default async function MyBooksPage() {
  // 1. Cek User Login (Proteksi Halaman)
  const userId = await getUserIdFromCookie();

  // Jika belum login, tendang ke halaman login
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Ambil data dari Backend API
  const myBooks = await getUserBookmarks(userId);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-slate-50">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Koleksi Saya</h1>
        <p className="text-slate-500 mt-2">
          Anda memiliki <span className="font-bold text-blue-600">{myBooks.length}</span> buku tersimpan.
        </p>
      </div>

      {myBooks.length === 0 ? (
        // TAMPILAN JIKA KOSONG (Empty State)
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Belum ada koleksi</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Anda belum menyimpan buku apapun. Cari buku menarik dan simpan di sini.
          </p>
          <a href="/search" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Mulai Cari Buku
          </a>
        </div>
      ) : (
        // GRID BUKU (Jika Ada Datanya)
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {myBooks.map((book) => (
            <BookCard key={book.openLibraryId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}