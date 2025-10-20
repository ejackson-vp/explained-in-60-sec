/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    dirs: ['app'],
  },
}

export default nextConfig;

