import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/");
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return Response.json({ success: true });
}
