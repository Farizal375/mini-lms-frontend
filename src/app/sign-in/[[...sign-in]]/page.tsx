
// File: src/app/sign-in/[[...sign-in]]/page.tsx
"use client"

import { useState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);

    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success("Login berhasil!");
      if (result.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh(); // Refresh agar layout membaca cookie JWT baru
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 bg-slate-900 absolute inset-0">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-900">Login ke MuzLib</CardTitle>
          <CardDescription className="text-slate-500">
            Masukkan email dan password untuk mengakses akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="mahasiswa@unsil.ac.id" 
                required 
                className="focus-visible:ring-blue-600 border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="focus-visible:ring-blue-600 border-slate-300"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold" type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">
              Daftar di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}