import { LayoutDashboard, Users, Package, Store, Sparkles, MessageCircle, BarChart3, FileText, DollarSign } from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin", label: "İcmal", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analitika", icon: BarChart3 },
  { href: "/admin/users", label: "İstifadəçilər", icon: Users },
  { href: "/admin/products", label: "Məhsullar", icon: Package },
  { href: "/admin/sellers", label: "Satıcılar", icon: Store },
  { href: "/admin/revenue", label: "Gəlir", icon: DollarSign },
  { href: "/admin/reports", label: "Hesabatlar", icon: FileText },
  { href: "/admin/ai-logs", label: "AI Logları", icon: Sparkles },
  { href: "/admin/chat-logs", label: "Chat Logları", icon: MessageCircle },
];
