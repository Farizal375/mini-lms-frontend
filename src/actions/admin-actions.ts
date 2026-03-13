"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

// Helper: Cek apakah user adalah ADMIN menggunakan JWT dari cookies
async function checkAdmin() {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized");

  try {
    // Decode JWT secara manual
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    if (payload.role !== "ADMIN") {
      throw new Error("Forbidden: Access denied");
    }
    return true;
  } catch (error) {
    throw new Error("Unauthorized");
  }
}

// 1. Ambil Statistik Dashboard dari Backend API
export async function getAdminStats() {
  try {
    await checkAdmin();
    
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/stats`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil statistik dashboard");
    }

    const responseData = await res.json();
    return responseData.data || responseData;
  } catch (error) {
    throw error;
  }
}

// 2. Toggle Status Featured (Untuk Hero Section Homepage)
export async function toggleBookFeatured(bookId: string) {
  try {
    await checkAdmin();
    
    const token = await getToken();
    const res = await fetch(`${API_URL}/books/${bookId}/featured`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message || "Buku tidak ditemukan" };
    }

    revalidatePath("/"); // Refresh Homepage
    revalidatePath("/admin/books"); // Refresh Admin Books Page
    revalidatePath("/admin/dashboard"); // Refresh Admin Dashboard (featured stats)
    return { success: true, message: `Status Featured berhasil diubah.` };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan pada sistem" };
  }
}

// 3. Toggle Status Hidden (Blacklist - Hilang dari pencarian)
export async function toggleBookHidden(bookId: string) {
  try {
    await checkAdmin();
    
    const token = await getToken();
    const res = await fetch(`${API_URL}/books/${bookId}/hidden`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message || "Buku tidak ditemukan" };
    }

    revalidatePath("/search"); // Refresh Search Page
    revalidatePath("/admin/books");
    return { success: true, message: `Status Hidden (Blacklist) berhasil diubah.` };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan pada sistem" };
  }
}

// 4. Hapus Buku dari Database Lokal (Admin Only)
export async function deleteBookAction(bookId: string) {
  try {
    await checkAdmin();

    const token = await getToken();
    const res = await fetch(`${API_URL}/books/${bookId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message || "Gagal menghapus buku" };
    }

    revalidatePath("/admin/books");
    revalidatePath("/");
    return { success: true, message: "Buku berhasil dihapus dari database" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan pada sistem" };
  }
}