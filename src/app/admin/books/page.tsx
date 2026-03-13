import { cookies } from "next/headers";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AdminBookActions } from "./admin-book-actions";

export const metadata = { title: "Kelola Buku | Admin" };

interface Book {
  id: string;
  openLibraryId: string;
  title: string;
  author: string;
  coverUrl: string;
  isFeatured: boolean;
  isHidden: boolean;
  _count: {
    bookmarks: number;
  };
}

async function getAdminBooks(): Promise<Book[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return [];

    const res = await fetch(`${API_URL}/books`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

export default async function AdminBooksPage() {
  // Ambil semua buku dari Backend API
  const books = await getAdminBooks();

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Manajemen Buku</h1>
        <Badge variant="outline" className="text-sm md:text-base px-3 py-1">
          {books.length} Buku Tersimpan
        </Badge>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* WRAPPER RESPONSIVE (PENTING!) */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4">Cover</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Judul & Penulis</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-center">Status</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-center">Popularitas</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books && books.length > 0 ? (
                books.map((book: Book) => (
                  <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 md:px-6 md:py-4 w-16 md:w-20">
                      <div className="relative h-12 w-9 md:h-16 md:w-12 bg-slate-200 rounded overflow-hidden">
                        <Image 
                          src={book.coverUrl || "/images/book-placeholder.png"} 
                          alt={book.title} 
                          fill 
                          className="object-cover"
                          unoptimized 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 max-w-[200px] truncate">
                      <p className="font-semibold text-slate-900 truncate" title={book.title}>{book.title}</p>
                      <p className="text-slate-500 text-xs truncate">{book.author}</p>
                      <p className="text-slate-400 text-[10px] mt-1 font-mono hidden md:block">{book.openLibraryId}</p>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center space-y-1">
                      {book.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 text-[10px] md:text-xs">
                          Featured
                        </Badge>
                      )}
                      {book.isHidden && (
                        <Badge variant="destructive" className="text-[10px] md:text-xs">Hidden</Badge>
                      )}
                      {!book.isFeatured && !book.isHidden && (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                      <Badge variant="secondary" className="text-[10px] md:text-xs">
                        {book._count?.bookmarks || 0} User
                      </Badge>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                      <AdminBookActions 
                        bookId={book.id}
                        bookTitle={book.title}
                        isFeatured={Boolean(book.isFeatured)} 
                        isHidden={Boolean(book.isHidden)} 
                      />
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>
        
        {!books || books.length === 0 && (
          <div className="p-8 md:p-12 text-center text-slate-500 text-sm">
            Belum ada buku di database lokal.
          </div>
        )}
      </div>
    </div>
  );
}