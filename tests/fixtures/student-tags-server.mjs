import { createServer } from "vite";
import path from "node:path";

const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.resolve("node_modules/.vite-student-tags"),
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "react-aria-components",
      "@tailgrids/icons",
      "sonner",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
    holdUntilCrawlEnd: false,
  },
  resolve: { alias: { "@": path.resolve("src") } },
  define: { "process.env.NEXT_PUBLIC_FRAPPE_URL": "window.location.origin" },
  server: { host: "127.0.0.1", port: 0 },
  plugins: [
    {
      name: "student-tag-test-fixture",
      resolveId(id) {
        if (id === "virtual:student-tags" || id === "next/headers")
          return `\0${id}`;
      },
      load(id) {
        if (id === "\0next/headers")
          return "export async function cookies() { return ''; }";
        if (id === "\0virtual:student-tags")
          return `
          import React from 'react';
          import { createRoot } from 'react-dom/client';
          import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
          import StudentTagsCell from '/src/app/(with-layouts)/(dashboard)/director/students/_components/student-tags-cell.tsx';
          import '/src/app/css/default.css';
          import '/src/app/css/dark.css';
          import '/src/app/globals.css';
          const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
          const editable = !new URLSearchParams(window.location.search).has('readonly');
          createRoot(document.getElementById('root')).render(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(StudentTagsCell, { studentId: 'STU-TEST', editable })));
        `;
      },
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (req.url?.split("?")[0] !== "/") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body class="bg-card-background text-text-primary"><main id="root" class="m-4 max-w-lg overflow-hidden rounded-lg border border-card-border"></main><script type="module" src="/@id/__x00__virtual:student-tags"></script></body></html>',
          );
        });
      },
    },
  ],
});
await server.listen();
const address = server.httpServer.address();
process.stdout.write("TAG_TEST_ORIGIN=http://127.0.0.1:" + address.port + "\n");
process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
