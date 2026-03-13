"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Star, EyeOff, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { toggleBookFeatured, toggleBookHidden, deleteBookAction } from "@/actions/admin-actions";

interface AdminActionsProps {
  bookId: string;
  bookTitle?: string;
  isFeatured: boolean;
  isHidden: boolean;
}

export function AdminBookActions({ bookId, bookTitle, isFeatured, isHidden }: AdminActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleFeatured = () => {
    startTransition(async () => {
      const res = await toggleBookFeatured(bookId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleHidden = () => {
    startTransition(async () => {
      const res = await toggleBookHidden(bookId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteBookAction(bookId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <AlertDialog>
      <div className="flex justify-end gap-2">
        {/* Toggle Featured */}
        <Button
          size="sm"
          variant={isFeatured ? "default" : "outline"}
          onClick={handleFeatured}
          disabled={isPending}
          className={isFeatured ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
          title={isFeatured ? "Hapus dari Featured" : "Jadikan Featured di Homepage"}
        >
          <Star className={`w-4 h-4 ${isFeatured ? "fill-current" : ""}`} />
        </Button>

        {/* Toggle Hidden */}
        <Button
          size="sm"
          variant={isHidden ? "destructive" : "outline"}
          onClick={handleHidden}
          disabled={isPending}
          title={isHidden ? "Tampilkan Kembali" : "Sembunyikan Buku (Blacklist)"}
        >
          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>

        {/* Delete Button */}
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Hapus Buku Permanen"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
      </div>

      {/* Confirmation Dialog for Delete */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Buku Permanen?</AlertDialogTitle>
          <AlertDialogDescription>
            Buku <strong>{bookTitle || bookId}</strong> akan dihapus secara permanen dari database
            beserta semua bookmark user yang menyimpannya. Tindakan ini tidak dapat dibatalkan.
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