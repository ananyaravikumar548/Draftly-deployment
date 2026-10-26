/**
 * Next.js build configuration, including the root used for server file tracing.
 */
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Next's file tracing inside this app instead of scanning the parent
  // home directory, which contains an unrelated package-lock.json.
  outputFileTracingRoot: path.resolve(process.cwd()),
  // PDFKit loads its standard font modules dynamically, so the trace does not
  // discover them from the resume rendering routes unless they are included.
  outputFileTracingIncludes: {
    '/api/resume-preview': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
    '/api/applications/[id]/pdf': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
    '/api/gmail/draft': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
  },
};

export default nextConfig;
