/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    esmExternals: false,
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  // serverSourceMaps: false,
  compress: true, // Enable gzip compression for improved performance
  generateEtags: true, // Enable ETag generation for caching
  poweredByHeader: false, // Remove the X-Powered-By header for security
  optimizeFonts: true, // Optimize fonts
  trailingSlash: true, // Ensure URLs end with a slash for SEO
  outputFileTracing: true, // Enable output file tracing for reduced serverless function size
  staticPageGenerationTimeout: 60, // Increase timeout for static page generation
};

export default nextConfig;
