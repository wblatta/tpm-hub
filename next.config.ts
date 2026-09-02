import type { NextConfig } from "next";

/**
 * Static export: `next build` emits an `out/` directory of plain HTML/CSS/JS
 * that serves from any web server with no Node runtime.
 *
 * Set BASE_PATH when hosting from a subdirectory, e.g. BASE_PATH=/tpm-hub.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
