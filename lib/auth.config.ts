import type { NextAuthConfig } from "next-auth";

/**
 * Edge-uyğun konfiqurasiya — middleware burada istifadə olunur.
 * ⚠️ Prisma və bcrypt buraya DAXIL EDİLMİR (Edge runtime-da işləməz).
 * Provider-lər və DB sorğuları auth.ts-dədir.
 */

// Rola görə qorunan route prefiksləri
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin"],
  SELLER: ["/seller/dashboard"],
  USER: ["/dashboard"],
};

const PUBLIC_AUTH_PAGES = ["/login", "/register"];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [], // auth.ts-də doldurulur
  callbacks: {
    /** Route guard — middleware bunu çağırır */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role ?? "USER";
      const path = nextUrl.pathname;

      // Giriş etmiş istifadəçi login/register-ə girməsin → dashboard-a yönləndir
      if (isLoggedIn && PUBLIC_AUTH_PAGES.includes(path)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Admin route-ları
      if (path.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }
      // İstifadəçi dashboard
      if (path.startsWith("/dashboard")) {
        return isLoggedIn;
      }
      // Satıcı paneli
      if (path.startsWith("/seller/dashboard")) {
        return isLoggedIn && (role === "SELLER" || role === "ADMIN");
      }
      // Satıcı məhsul idarəetməsi və profil qurma — login tələb olunur
      if (path.startsWith("/seller/products") || path === "/seller/setup") {
        return isLoggedIn;
      }

      return true; // qalan route-lar açıqdır
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export { ROLE_ROUTES };
