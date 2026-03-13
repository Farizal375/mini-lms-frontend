"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, ShieldCheck, UserX, Trash2, Plus, Edit2, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { updateUserRoleAction, deleteUserAction, createUserAction, updateUserAction } from "@/actions/admin-user-actions";

interface AdminUserActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: "ADMIN" | "USER";
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}

export function AdminUserActions({ userId, userName, userEmail, currentRole }: AdminUserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: userName || "",
    email: userEmail,
    password: "",
    role: currentRole,
  });

  const handleRoleChange = (newRole: "ADMIN" | "USER") => {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      if (result.success) {
        toast.success(result.message || `Role ${userEmail} diubah menjadi ${newRole}`);
      } else {
        toast.error(result.error || "Gagal mengubah role");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        toast.success(result.message || `User ${userEmail} berhasil dihapus`);
      } else {
        toast.error(result.error || "Gagal menghapus user");
      }
    });
  };

  const handleEditUser = () => {
    startTransition(async () => {
      const updateData: any = {};
      if (formData.name !== userName) updateData.name = formData.name || null;
      if (formData.email !== userEmail) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;

      if (Object.keys(updateData).length === 0) {
        toast.info("Tidak ada perubahan");
        return;
      }

      const result = await updateUserAction(userId, updateData);
      if (result.success) {
        toast.success(result.message || "User berhasil diperbarui");
        setIsEditDialogOpen(false);
      } else {
        toast.error(result.error || "Gagal mengupdate user");
      }
    });
  };

  return (
    <AlertDialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Aksi untuk {userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Edit2 className="h-4 w-4 text-blue-600" />
                Edit User
              </DropdownMenuItem>
            </DialogTrigger>
            {currentRole === "USER" ? (
              <DropdownMenuItem onClick={() => handleRoleChange("ADMIN")} className="gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Jadikan Admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleRoleChange("USER")} className="gap-2">
                <UserX className="h-4 w-4 text-orange-500" />
                Turunkan ke User
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Hapus Permanen
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit User Dialog */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Perbarui informasi user {userEmail}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama (Opsional)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama lengkap user"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@email.com"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password Baru (Kosongkan untuk tidak mengubah)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                disabled={isPending}
              />
              <p className="text-xs text-slate-500">
                Password lama akan tetap berlaku jika tidak diisi
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isPending}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus User Permanen?</AlertDialogTitle>
          <AlertDialogDescription>
            Akun <strong>{userEmail}</strong> dan semua data bookmark-nya akan dihapus secara permanen dan tidak
            dapat dipulihkan kembali.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Ya, Hapus Sekarang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Component untuk Create User Dialog (ditampilkan di header)
export function CreateUserDialog() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const validateForm = (): string | null => {
    if (!formData.email?.trim()) {
      return "Email tidak boleh kosong";
    }

    if (!formData.password?.trim()) {
      return "Password tidak boleh kosong";
    }

    if (formData.password.length < 6) {
      return "Password minimal 6 karakter";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Format email tidak valid (contoh: user@email.com)";
    }

    return null;
  };

  const handleCreateUser = () => {
    // Clear previous error
    setError("");

    // Validasi form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      console.warn("[CreateUserDialog] Validation error:", validationError);
      return;
    }

    console.log("[CreateUserDialog] Creating user:", { email: formData.email, role: formData.role });

    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        console.log("[CreateUserDialog] User created successfully:", result.data);
        toast.success(result.message || "User baru berhasil dibuat ✓");
        setIsOpen(false);
        setFormData({ name: "", email: "", password: "", role: "USER" });
        setError("");
      } else {
        console.error("[CreateUserDialog] Failed to create user:", result.error);
        setError(result.error || "Gagal membuat user. Silakan coba lagi.");
      }
    });
  };

  // Handle enter key to submit form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isPending) {
      handleCreateUser();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError("");
      setFormData({ name: "", email: "", password: "", role: "USER" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Buat User Baru
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat User Baru</DialogTitle>
          <DialogDescription>Tambahkan user baru ke sistem MuzLib</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">Validasi Gagal</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Nama Field */}
          <div className="space-y-2">
            <Label htmlFor="create-name">Nama <span className="text-slate-400">(Opsional)</span></Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap user"
              disabled={isPending}
              onKeyDown={handleKeyDown}
            />
            <p className="text-xs text-slate-500">Gunakan nama yang mudah dikenali</p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="create-email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="create-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (error) setError(""); // Clear error when user types
              }}
              placeholder="user@email.com"
              disabled={isPending}
              onKeyDown={handleKeyDown}
              className={error?.includes("email") || error?.includes("Email") ? "border-red-500" : ""}
            />
            <p className="text-xs text-slate-500">Format: email@domain.com</p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="create-password">Password <span className="text-red-500">*</span></Label>
            <Input
              id="create-password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (error) setError(""); // Clear error when user types
              }}
              placeholder="••••••••"
              disabled={isPending}
              onKeyDown={handleKeyDown}
              className={error?.includes("Password") || error?.includes("password") ? "border-red-500" : ""}
            />
            <p className="text-xs text-slate-500">Minimal 6 karakter, gunakan kombinasi huruf & angka untuk keamanan lebih baik</p>
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="create-role">Role</Label>
            <select
              id="create-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "USER" })}
              disabled={isPending}
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-md text-sm bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User Biasa</option>
              <option value="ADMIN">Admin</option>
            </select>
            <p className="text-xs text-slate-500">
              {formData.role === "ADMIN" ? "Admin dapat mengelola user, buku, dan pengaturan" : "User hanya dapat membaca dan membuat bookmark"}
            </p>
          </div>
        </div>

        {/* Button Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handleCreateUser}
            disabled={isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Membuat...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Buat User
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
