/**
 * Next.js build configuration, including the root used for server file tracing.
 */
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Next's file tracing inside this app instead of scanning the parent
  // home directory, which contains an unrelated package-lock.json.
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
