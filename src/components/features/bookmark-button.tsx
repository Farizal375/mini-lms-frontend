"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react"; // 1. Import Loader2 (Ikon Spinner)
import { toast } from "sonner";
import { toggleBookmark } from "@/actions/bookmark-action";
import { Book } from "@/types";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  book: Book;
  initialState?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline" | "secondary";
  showText?: boolean;
  className?: string;
}

export function BookmarkButton({ 
  book, 
  initialState = false, 
  size = "default",
  variant = "default",
  showText = true,
  className = "" 
}: BookmarkButtonProps) {
  
  const [isBookmarked, setIsBookmarked] = useState(initialState);
  const [isPending, startTransition] = useTransition(); // Ini mendeteksi status loading server
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic Update: Kita simpan state sebelumnya jaga-jaga kalau gagal
    const previousState = isBookmarked;

    // Mulai transisi server action
    startTransition(async () => {
      // Panggil Server Action
      const result = await toggleBookmark(book);
      
      if (result.success) {
        toast.success(result.message);
        if (result.isBookmarked !== undefined) {
          setIsBookmarked(result.isBookmarked);
        }
      } else {
        // Check if error is due to not being logged in
        if (result.message?.includes("login") || result.message?.includes("Unauthorized")) {
          toast.error("Silakan login terlebih dahulu!");
          router.push("/sign-in");
        } else {
          // Balikkan state jika gagal
          setIsBookmarked(previousState);
          toast.error(result.message);
        }
      }
    });
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
      disabled={isPending} // Disable tombol saat loading
      className={`${isBookmarked && !isPending ? "text-blue-600" : ""} ${className}`} 
    >
      {/* LOGIKA IKON: Jika loading tampilkan Loader2, jika tidak tampilkan Bookmark */}
      {isPending ? (
        <Loader2 className={`w-4 h-4 animate-spin ${showText ? "mr-2" : ""}`} />
      ) : (
        <Bookmark 
          className={`w-4 h-4 ${showText ? "mr-2" : ""} ${isBookmarked ? "fill-current" : ""}`} 
        />
      )}

      {/* LOGIKA TEKS */}
      {showText && (
        isPending 
          ? "Menyimpan..." 
          : (isBookmarked ? "Disimpan" : "Simpan")
      )}
    </Button>
  );
}