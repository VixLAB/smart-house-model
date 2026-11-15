/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trang chủ là public/nha-iot.html, hiện ngay tại "/" (không chuyển hướng, địa chỉ vẫn là "/").
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/nha-iot.html" }] };
  },
  // Link cũ /nha-iot.html về trang chủ, để chỉ có một địa chỉ
  async redirects() {
    return [{ source: "/nha-iot.html", destination: "/", permanent: false }];
  },
};

export default nextConfig;
