/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* mupdf ships a wasm binary. Leaving it external keeps the .wasm file next to the
     lambda instead of being inlined by the bundler, which breaks its loader. */
  serverExternalPackages: ["mupdf"]
};

export default nextConfig;
