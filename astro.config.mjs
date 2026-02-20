import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

const isProd = process.env.NODE_ENV === "production";

// https://astro.build/config
export default defineConfig({
  // Update this to your production URL
  site: "https://dayma.hasanat.dev",

  // i18n configuration
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  // Disable dev toolbar
  devToolbar: { enabled: false },

  integrations: [
    react(),
    // Only include sitemap in production builds
    ...(isProd
      ? [
          sitemap({
            i18n: {
              defaultLocale: "en",
              locales: {
                en: "en",
                ar: "ar",
              },
            },
          }),
        ]
      : []),
  ],

  // Hybrid rendering: pages opt-in to prerender (default: server)
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  // Performance optimizations - Prefetch links for instant navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  // Build optimizations
  build: {
    inlineStylesheets: "auto",
  },

  // Vite configuration
  vite: {
    plugins: [
      tailwindcss(),
      ...(isProd
        ? [
            import("rollup-plugin-visualizer").then((m) =>
              m.visualizer({
                filename: "stats.html",
                open: false,
                gzipSize: true,
                brotliSize: true,
                template: "treemap",
              }),
            ),
          ]
        : []),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: [
        // Force react-dom/server to use the edge build (uses setTimeout)
        // instead of the browser build (uses MessageChannel, unavailable in Workers)
        {
          find: "react-dom/server",
          replacement: fileURLToPath(
            new URL("./node_modules/react-dom/server.edge.js", import.meta.url),
          ),
        },
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react/compiler-runtime",
        "@astrojs/react/client.js",
        "framer-motion",
        "lucide-react",
        "clsx",
        "tailwind-merge",
      ],
    },
    build: {
      cssMinify: true,
    },
    ssr: {
      noExternal: ["clsx", "tailwind-merge"],
      resolve: {
        // IMPORTANT: 'workerd' must come before 'browser'/'worker' so React 19
        // resolves to server.edge.js (uses setTimeout) instead of
        // server.browser.js (uses MessageChannel, unavailable in Workers)
        conditions: ["workerd", "worker", "browser", "import", "module", "default"],
        externalConditions: ["workerd", "worker", "node", "import", "module", "default"],
      },
    },
  },
});
