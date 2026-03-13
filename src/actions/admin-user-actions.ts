"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value;
  } catch (error) {
    console.error("Error getting token:", error);
    return undefined;
  }
}

export async function getAllUsersAction() {
  try {
    const token = await getToken();
    if (!token) throw new Error("Akses ditolak: Anda belum login");

    const res = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Gagal mengambil data user");
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function updateUserRoleAction(userId: string, newRole: "ADMIN" | "USER") {
  try {
    const token = await getToken();
    if (!token) throw new Error("Akses ditolak: Anda belum login");

    const res = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Gagal mengubah role user");
    }

    revalidatePath("/admin/users");
    return { success: true, message: result.message };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function createUserAction(data: { name?: string; email: string; password: string; role?: string }) {
  try {
    // Validasi di sisi client
    if (!data.email?.trim()) {
      return { success: false, error: "Email tidak boleh kosong" };
    }

    if (!data.password?.trim()) {
      return { success: false, error: "Password tidak boleh kosong" };
    }

    if (data.password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter" };
    }

    // Format email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Format email tidak valid" };
    }

    const token = await getToken();
    if (!token) {
      return { success: false, error: "Sesi berakhir. Silakan login kembali" };
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const endpoint = `${API_URL}/users`;

    console.log("[createUserAction] Sending POST request to:", endpoint);
    console.log("[createUserAction] Headers:", {
      "Content-Type": "application/json",
      "Authorization": "Bearer [TOKEN]",
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name?.trim() || null,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        role: data.role || "USER",
      }),
    });

    console.log("[createUserAction] Response status:", res.status, res.statusText);

    // Handle network error
    let errorMessage = "Gagal membuat user";
    
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      
      // Specific error status codes
      if (res.status === 401) {
        errorMessage = "Sesi berakhir atau akses ditolak. Silakan login kembali";
      } else if (res.status === 403) {
        errorMessage = "Anda tidak memiliki izin untuk membuat user";
      } else if (res.status === 404) {
        errorMessage = `Endpoint tidak ditemukan (${endpoint}). Pastikan backend running di port 5000`;
      } else if (res.status === 409) {
        errorMessage = "Email sudah terdaftar di sistem";
      } else if (res.status === 500) {
        errorMessage = "Terjadi kesalahan pada server. Silakan hubungi administrator";
      } else if (res.status >= 500) {
        errorMessage = `Server error (${res.status}). Silakan coba lagi nanti`;
      }
      
      // Try to get better error message from JSON response
      if (contentType?.includes("application/json")) {
        try {
          const result = await res.json();
          console.log("[createUserAction] Server response:", result);
          if (result.message) {
            errorMessage = result.message;
          }
        } catch (e) {
          // JSON parse failed, use default message
          console.error("[createUserAction] Failed to parse JSON error response:", e);
        }
      } else if (contentType?.includes("text/html")) {
        // Server returned HTML (likely error page)
        console.warn("[createUserAction] Server returned HTML instead of JSON");
        errorMessage = `Server error (${res.status}). Hubungi administrator jika masalah berlanjut`;
      }

      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await res.json();
      console.log("[createUserAction] Success response:", result);
    } catch (e) {
      console.error("Failed to parse response:", e);
      throw new Error("Respons server tidak valid. Silakan coba lagi");
    }

    if (!result.success) {
      throw new Error(result.message || "Gagal membuat user");
    }

    revalidatePath("/admin/users");
    return { success: true, message: result.message, data: result.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Terjadi kesalahan internal pada sistem. Silakan coba lagi" };
  }
}

export async function updateUserAction(userId: string, data: { name?: string; email?: string; password?: string }) {
  try {
    // Validasi minimal - harus ada setidaknya satu field yang akan diupdate
    if (!data.name && !data.email && !data.password) {
      return { success: false, error: "Tidak ada data yang akan diupdate" };
    }

    // Validasi email jika ada
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, error: "Format email tidak valid" };
      }
    }

    // Validasi password jika ada
    if (data.password && data.password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter" };
    }

    const token = await getToken();
    if (!token) throw new Error("Akses ditolak: Anda belum login");

    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name !== undefined ? (data.name?.trim() || null) : undefined,
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        password: data.password || undefined,
      }),
    });

    let errorMessage = "Gagal mengupdate user";

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        try {
          const result = await res.json();
          errorMessage = result.message || errorMessage;
        } catch {
          errorMessage = "Terjadi kesalahan pada server (response tidak valid)";
        }
      } else {
        errorMessage = `Server error (${res.status}): Hubungi administrator jika masalah berlanjut`;
      }

      throw new Error(errorMessage);
    }

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || "Gagal mengupdate user");
    }

    revalidatePath("/admin/users");
    return { success: true, message: result.message, data: result.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Terjadi kesalahan internal pada sistem" };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const token = await getToken();
    if (!token) throw new Error("Akses ditolak: Anda belum login");

    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Gagal menghapus user");
    }

    revalidatePath("/admin/users");
    return { success: true, message: result.message };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}