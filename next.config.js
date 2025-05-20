/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification which relies on platform-specific binaries
  // This can help with cross-platform build issues
  swcMinify: false,
  
  // Configure webpack to handle CSS processing
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
