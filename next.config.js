/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // basePath only needed if repo name is NOT username.github.io
  // Current setup: vypnitoo/sparkprofiler.github.io
  basePath: process.env.NODE_ENV === 'production' ? '/sparkprofiler.github.io' : '',
}

module.exports = nextConfig
