import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase a renommé « anon key » en « publishable key » : on accepte les
  // deux noms, faute de quoi le middleware ne rafraîchit jamais la session.
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // 1. Récupération cryptographique de la session utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 2. Protections de routes d'API
  if (path.startsWith("/api/v1")) {
    // Exemptions publiques (sinon on ne pourrait jamais se connecter/s'inscrire)
    if (
      path === "/api/v1/health" ||
      path === "/api/v1/docs" ||
      path === "/api/v1/openapi.json" ||
      path === "/api/v1/auth/login" ||
      path === "/api/v1/auth/register" ||
      path === "/api/v1/auth/logout" ||
      (path === "/api/v1/donors" && request.method === "POST") ||
      (path === "/api/v1/donations" && request.method === "POST") ||
      path.startsWith("/api/v1/verify") ||
      path.startsWith("/api/v1/search")
    ) {
      return response;
    }

    // Protection des endpoints privés
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: "unauthorized",
            message: "Authentification requise pour accéder à cette ressource.",
          },
        },
        { status: 401 },
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any static file extension (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
