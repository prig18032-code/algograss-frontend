/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.40:3000",
      "http://192.168.1.40:3001"
    ]
  }
};
module.exports = nextConfig;
