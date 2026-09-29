import { NextResponse, type NextRequest } from "next/server";

/**
 * Bezpečnostní hlavičky pro celý web. V Next.js 16 se soubor jmenuje
 * proxy.ts, dřív to byl middleware.ts. Chování je stejné.
 *
 * Pravidla jsou v AGENTS.md, sekce Bezpečnostní pravidla. Politika se
 * nikdy nezeslabuje proto, aby něco začalo fungovat. Když knihovna žádá
 * unsafe-inline nebo unsafe-eval, mění se knihovna, ne politika.
 *
 * Každá doména navíc musí mít řádek v .claude/security/CSP-LOG.md.
 */
export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const nonce = crypto.randomUUID().replaceAll("-", "");

  const csp = [
    "default-src 'self'",
    // strict-dynamic: skripty, které načte skript s platným nonce, projdou.
    // unsafe-eval je jen ve vývoji, React ho tam potřebuje na stopy chyb.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Zatím bez unsafe-inline. Až Motion začne vkládat styly za běhu,
    // ověří se to a teprve pak se rozhodne (viz Otevřené otázky).
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  // Nula je záměr. Starý XSS filtr prohlížečů sám tvořil zranitelnosti.
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  );

  // HSTS dává smysl jen přes HTTPS. preload až po měsíci čistého provozu.
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
  }

  return response;
}

export const config = {
  matcher: [
    {
      // Statické soubory hlavičku s nonce nepotřebují a prefetch by si
      // odnesl nonce, který v okamžiku vykreslení už neplatí.
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
