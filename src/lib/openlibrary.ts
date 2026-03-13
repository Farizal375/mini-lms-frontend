import { 
  Book, 
  OpenLibSearchResponse, 
  OpenLibSubjectResponse, 
  OpenLibDoc, 
  OpenLibWork 
} from "@/types";


const BASE_URL = "https://openlibrary.org";
const COVER_URL = "https://covers.openlibrary.org/b/id";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// --- Helpers: Mapping Data Mentah ke Tipe 'Book' ---

// Mapping untuk hasil SEARCH
const mapSearchToBook = (doc: OpenLibDoc): Book => ({
  id: doc.key.replace("/works/", ""), 
  openLibraryId: doc.key.replace("/works/", ""), 
  title: doc.title,
  author: doc.author_name?.[0] || "Unknown Author",
  coverUrl: doc.cover_i 
    ? `${COVER_URL}/${doc.cover_i}-L.jpg` 
    : "/images/book-placeholder.png",
  publishYear: doc.first_publish_year || 0,
  isFeatured: false,
});

// Mapping untuk hasil TRENDING (Subject)
const mapWorkToBook = (work: OpenLibWork): Book => ({
  id: work.key.replace("/works/", ""), 
  openLibraryId: work.key.replace("/works/", ""), 
  title: work.title,
  author: work.authors?.[0]?.name || "Unknown Author",
  coverUrl: work.cover_id 
    ? `${COVER_URL}/${work.cover_id}-L.jpg` 
    : "/images/book-placeholder.png",
  publishYear: work.first_publish_year || 0,
  isFeatured: false,
});

// --- Main Functions ---

/**
 * 1. Mencari buku berdasarkan query
 */
export async function searchBooks(query: string, limit = 12): Promise<Book[]> {
  if (!query) return [];
  
  try {
    const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
    
    // TAMBAHAN: Tambahkan options headers agar tidak dianggap bot jahat
    const res = await fetch(url, {
      headers: {
        "User-Agent": "MuzLib-Project/1.0 (Student Education Project)"
      }
    });
    
    // PERBAIKAN: Jangan throw Error, tapi return array kosong & log errornya
    if (!res.ok) {
      console.error(`Gagal mengambil data buku: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const data: OpenLibSearchResponse = await res.json();
    
    return data.docs
      .filter((doc) => doc.cover_i) 
      .map(mapSearchToBook);
      
  } catch (error) {
    console.error("Error searching books:", error);
    return []; // Return kosong agar halaman tidak "Crash" (layar putih)
  }
}

/**
 * 2. Mengambil buku trending
 */
export async function getTrendingBooks(): Promise<Book[]> {
  try {
    // Ambil limit dari backend API
    let limit = 10; // Default
    try {
      const configRes = await fetch(`${API_URL}/admin/config/trending-limit`, {
        cache: "force-cache",
        next: { revalidate: 3600 }
      });
      if (configRes.ok) {
        const configData = await configRes.json();
        limit = parseInt(configData.value || "10", 10);
      }
    } catch (err) {
      console.warn("Could not fetch trending limit from API, using default:", err);
    }

    const res = await fetch("https://openlibrary.org/trending/daily.json", {
      next: { revalidate: 3600 }, 
    });

    if (!res.ok) throw new Error("Failed to fetch trending books");

    const data = await res.json();

    // Mapping data
    return data.works.slice(0, limit).map((work: any) => ({
      openLibraryId: work.key.replace("/works/", ""),
      title: work.title,
      author: work.author_name?.[0] || "Unknown Author",
      coverUrl: work.cover_i
        ? `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg`
        : null,
      publishYear: work.first_publish_year || 0,
      description: "", 
    }));
    
  } catch (error) {
    console.error("Error fetching trending books:", error);
    return []; // Karena sudah di-set Promise<Book[]>, array kosong ini aman
  }
}
/**
 * 3. Mengambil detail satu buku (UPDATED)
 */
export async function getBookDetail(key: string): Promise<Book | null> {
  try {
    // Pastikan key bersih dari "/works/" (Double check)
    const cleanKey = key.replace("/works/", "");
    const url = `${BASE_URL}/works/${cleanKey}.json`;
    
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();

    // Fetch Author Name with timeout to avoid hanging
    let authorName = "Unknown Author";
    if (data.authors && data.authors.length > 0) {
      try {
        const authorKey = data.authors[0].author?.key?.replace("/authors/", "");
        if (authorKey) {
          const authorRes = await fetch(`${BASE_URL}/authors/${authorKey}.json`, {
            next: { revalidate: 86400 },
            signal: AbortSignal.timeout(5000), // 5-second timeout
          });
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            authorName = authorData.name || "Unknown Author";
          }
        }
      } catch (err) {
        console.warn("Could not fetch author, using fallback:", err);
      }
    }

    return {
      id: cleanKey,
      openLibraryId: cleanKey,
      title: data.title,
      author: authorName,
      coverUrl: data.covers?.[0] 
        ? `${COVER_URL}/${data.covers[0]}-L.jpg` 
        : "/images/book-placeholder.png",
      publishYear: parseInt(data.created?.value?.substring(0, 4)) || 0,
      description: typeof data.description === 'string' 
        ? data.description 
        : data.description?.value || "Tidak ada deskripsi untuk buku ini.",
    };

  } catch (error) {
    console.error("Error fetching book detail:", error);
    return null;
  }
}