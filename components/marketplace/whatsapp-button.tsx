"use client";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppButton({ phone, productTitle }: { phone?: string | null; productTitle: string }) {
  if (!phone) return null;
  const text = encodeURIComponent(`Salam! "${productTitle}" məhsulu ilə maraqlanıram. Hələ də mövcuddur?`);
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      <Button size="lg" className="w-full !bg-[#25D366] !text-[#04121a] hover:!bg-[#1fb855]">
        <MessageCircle size={18} /> WhatsApp ilə əlaqə
      </Button>
    </a>
  );
}
