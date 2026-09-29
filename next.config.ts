import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Domovská složka uživatele obsahuje vlastní package-lock.json, takže by si
  // Turbopack odvodil kořen mimo projekt. Kořen proto určujeme napevno.
  turbopack: {
    root: path.join(__dirname),
  },

  // Neprozrazovat, čím web běží.
  poweredByHeader: false,

  /*
   * proxy.ts běží jen mimo /api, takže hlavičky, které nepotřebují nonce,
   * nastavujeme navíc i tady. Odpovědi API tak nezůstanou bez ochrany.
   */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
