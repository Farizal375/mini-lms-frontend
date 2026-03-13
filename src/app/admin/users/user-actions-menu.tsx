"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Shield, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { updateUserRoleAction, deleteUserAction } from "@/actions/admin-user-actions";
import { toast } from "sonner";

interface UserActionsMenuProps {
  userId: string;
  currentRole: "ADMIN" | "USER";
}

export function UserActionsMenu({ userId, currentRole }: UserActionsMenuProps) {
  const [isPending, startTransition] = useTransition();
  
  // State untuk mengontrol Dialog mana yang terbuka
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  
  // State untuk menyimpan role target sementara sebelum dikonfirmasi
  const [pendingRole, setPendingRole] = useState<"ADMIN" | "USER" | null>(null);

  // 1. Fungsi Persiapan (Saat menu diklik)
  const initiateRoleChange = (newRole: "ADMIN" | "USER") => {
    setPendingRole(newRole); // Simpan dulu role yang diinginkan
    setShowRoleDialog(true); // Buka dialog konfirmasi
  };

  const initiateDelete = () => {
    setShowDeleteDialog(true); // Buka dialog konfirmasi hapus
  };

  // 2. Fungsi Eksekusi (Saat tombol "Lanjutkan" di Dialog diklik)
  const executeRoleChange = () => {
    if (!pendingRole) return;

    startTransition(async () => {
      const result = await updateUserRoleAction(userId, pendingRole);
      setShowRoleDialog(false); // Tutup dialog
      
      if (result.success) {
        toast.success("Role Berhasil Diubah", {
          description: result.message, // Pesan detail: "User jadi Admin"
          duration: 4000, 
        });
      } else {
        toast.error("Gagal", { description: result.message });
      }
    });
  };

  const executeDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      setShowDeleteDialog(false); // Tutup dialog

      if (result.success) {
        toast.success("User Dihapus", {
          description: "Data pengguna dan bookmark telah dihapus permanen.",
          duration: 4000,
        });
      } else {
        toast.error("Gagal", { description: result.message });
      }
    });
  };

  return (
    <>
      {/* --- MENU DROPDOWN UTAMA --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi Akun</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Opsi Role */}
          {currentRole === "USER" ? (
            <DropdownMenuItem onClick={() => initiateRoleChange("ADMIN")}>
              <Shield className="mr-2 h-4 w-4 text-purple-600" />
              Promosikan jadi Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => initiateRoleChange("USER")}>
              <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" />
              Turunkan jadi User
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Opsi Hapus */}
          <DropdownMenuItem 
            onClick={initiateDelete} 
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus User Permanen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>


      {/* --- DIALOG 1: KONFIRMASI UBAH ROLE --- */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Hak Akses User?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRole === "ADMIN" 
                ? "User ini akan mendapatkan akses penuh ke halaman Admin, termasuk mengelola buku dan user lain."
                : "Akses Admin user ini akan dicabut. Mereka hanya bisa mengakses fitur standar."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Mencegah dialog menutup otomatis sebelum action selesai
                executeRoleChange();
              }}
              disabled={isPending}
              className={pendingRole === "ADMIN" ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
              {pendingRole === "ADMIN" ? "Jadikan Admin" : "Turunkan Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* --- DIALOG 2: KONFIRMASI HAPUS USER --- */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Apakah Anda yakin mutlak?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Akun user ini akan dihapus secara permanen dari database beserta seluruh data koleksi (bookmark) mereka.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
              {isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}