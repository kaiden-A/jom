import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react(), mdx()],
  redirects: {
    "/lessons/gallery-blog": "/projek/gallery-blog/gambaran-besar",
    "/projek/safelight": "/projek/kedai",
    "/projek/safelight/the-big-picture": "/projek/kedai/one-seller-one-of-one",
    "/projek/safelight/design-the-shop-window":
      "/projek/kedai/design-the-shop-window",
    "/projek/safelight/trust-boundary-blueprint": "/projek/kedai/the-blueprint",
    "/projek/safelight/scaffold-and-health":
      "/projek/kedai/scaffold-and-health",
    "/projek/safelight/the-order-is-the-source-of-truth":
      "/projek/kedai/the-item-is-the-unit-of-stock",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
