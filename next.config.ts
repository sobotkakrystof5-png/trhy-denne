import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Domovská složka uživatele obsahuje vlastní package-lock.json, takže by si
  // Turbopack odvodil kořen mimo projekt. Kořen proto určujeme napevno.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
