// File: src/actions/auth-actions.ts
"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  
  const email = rawEmail?.trim();
  const password = rawPassword?.trim();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Gagal login" };
    }

    // PERBAIKAN: Await cookies() sebelum memanggil .set()
    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return { success: true, role: data.data?.role };
  } catch (error) {
    return { error: "Terjadi kesalahan koneksi ke server" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Validasi password match
  if (password !== confirmPassword) {
    return { error: "Password tidak cocok" };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Gagal mendaftar" };
    }

    // Jika register sukses, langsung login
    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan koneksi ke server" };
  }
}