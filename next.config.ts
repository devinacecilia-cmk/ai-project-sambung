import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Redirect the root to /login at the HTTP layer (307) so link/OG scrapers
  // follow it cleanly. A page-level redirect() renders a soft <meta refresh>
  // that JS-rendering scrapers mishandle, dropping og:* tags.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
