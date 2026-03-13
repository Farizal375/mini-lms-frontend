import { cookies } from "next/headers";

export interface JWTPayload {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  iat: number;
  exp: number;
}

/**
 * Decode JWT token dari cookie
 * Mengembalikan payload jika valid, undefined jika token tidak ada/invalid
 */
export async function getJWTFromCookie(): Promise<JWTPayload | undefined> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return undefined;
    }

    // Decode JWT secara manual
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload) as JWTPayload;
    return payload;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return undefined;
  }
}

/**
 * Get user ID dari JWT cookie
 */
export async function getUserIdFromCookie(): Promise<string | undefined> {
  const payload = await getJWTFromCookie();
  return payload?.id;
}

/**
 * Get user role dari JWT cookie
 */
export async function getUserRoleFromCookie(): Promise<string | undefined> {
  const payload = await getJWTFromCookie();
  return payload?.role;
}

/**
 * Check apakah user adalah admin
 */
export async function isAdminFromCookie(): Promise<boolean> {
  const payload = await getJWTFromCookie();
  return payload?.role === "ADMIN";
}
