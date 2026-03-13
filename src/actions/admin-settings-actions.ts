"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DEFAULT_LIMIT = 10;

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

// Helper: Cek Admin dari JWT token
async function checkAdmin() {
  const token = await getToken();
  
  if (!token) throw new Error("Unauthorized");

  try {
    // Decode JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    if (payload.role !== "ADMIN") throw new Error("Forbidden");
  } catch (error) {
    throw new Error("Unauthorized");
  }
}

// 1. GET: Ambil Limit saat ini dari Backend API
export async function getTrendingLimit(): Promise<number> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/config/trending-limit`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return DEFAULT_LIMIT;
    }

    const data = await res.json();
    return parseInt(data.value || DEFAULT_LIMIT, 10);
  } catch (error) {
    console.error("Gagal mengambil config:", error);
    return DEFAULT_LIMIT; // Fallback aman
  }
}

// 2. UPDATE: Ubah Limit melalui Backend API
export async function updateTrendingLimit(newLimit: number) {
  try {
    await checkAdmin();

    if (newLimit < 4 || newLimit > 100) {
      return { success: false, message: "Jumlah harus antara 4 sampai 100." };
    }

    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/config/trending-limit`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: newLimit }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message || "Gagal menyimpan pengaturan." };
    }

    // Revalidate Homepage agar perubahan langsung terlihat
    revalidatePath("/"); 
    revalidatePath("/admin/settings");
    
    return { success: true, message: "Pengaturan berhasil disimpan." };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: "Gagal menyimpan pengaturan." };
  }
}