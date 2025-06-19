"use strict";

// next.config.js
var nextConfig = {
  images: {
    domains: ["survivalofthefeature.com"],
    unoptimized: true
  },
  experimental: {
    serverActions: true
  }
};
module.exports = nextConfig;
