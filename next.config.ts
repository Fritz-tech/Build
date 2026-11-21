   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     async rewrites() {
       return [
         {
           source: "/api/auth-service/:path*",
           destination: "https://cloudhike.dev/api/auth-service/:path*",
         },
       ];
     },
   };

   export default nextConfig;