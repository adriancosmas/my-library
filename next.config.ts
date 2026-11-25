import type { NextConfig } from "next";
import { withRedact } from '@tanstack/redact/next'

const nextConfig: NextConfig = {
   images: {
    domains: ['favicon.is'],
  },
  /* config options here */
};

export default withRedact({nextConfig});
