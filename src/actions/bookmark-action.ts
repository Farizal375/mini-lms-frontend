"use server";

import { cookies } from "next/headers";
import { Book } from "@/types";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

export async function toggleBookmark(book: Book) {
  try {
    const token = await getToken();

    if (!token) {
      return { success: false, message: "Anda harus login terlebih dahulu" };
    }

    // Call backend API to toggle bookmark
    const res = await fetch(`${API_URL}/bookmarks/toggle`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        openLibraryId: book.openLibraryId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        description: book.description,
        publishYear: book.publishYear,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message || "Terjadi kesalahan" };
    }

    const data = await res.json();
    revalidatePath("/my-books");
    return { 
      success: true, 
      isBookmarked: data.isBookmarked, 
      message: data.message || "Bookmark berhasil diperbarui" 
    };
  } catch (error) {
    console.error("Bookmark Error:", error);
    return { success: false, message: "Terjadi kesalahan pada sistem" };
  }
}

// Fungsi pembantu untuk cek status awal (dipakai di halaman Detail Buku)
export async function checkBookmarkStatus(openLibraryId: string) {
  try {
    const token = await getToken();
    
    if (!token) return false;

    const res = await fetch(
      `${API_URL}/bookmarks/check?openLibraryId=${openLibraryId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return false;

    const data = await res.json();
    return data.isBookmarked || false;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}