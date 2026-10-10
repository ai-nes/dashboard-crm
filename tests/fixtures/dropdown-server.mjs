import { createServer } from "vite";
import path from "node:path";

const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.resolve("node_modules/.vite-dropdowns"),
  esbuild: { jsx: "automatic" },
  optimizeDeps: {
    noDiscovery: true,
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "react-aria-components", "@tailgrids/icons", "class-variance-authority", "clsx", "tailwind-merge", "@tanstack/react-query"],
  },
  resolve: { alias: { "@": path.resolve("src") } },
  server: { host: "127.0.0.1", port: 0 },
  plugins: [{
    name: "dropdown-test-fixture",
    resolveId(id) { if (id === "virtual:dropdowns") return "\0" + id; },
    load(id) {
      if (id !== "\0virtual:dropdowns") return;
      return `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import { DropdownField } from '/src/components/common/dropdown-field.tsx';
        import { EditableDetailField } from '/src/components/common/editable-detail-field.tsx';
        import { CreateDialogSelect } from '/src/components/common/create-dialog-field.tsx';
        import { InfiniteSelectInput } from '/src/components/common/infinite-select-input.tsx';
        import { MajorSelector } from '/src/components/common/major-selector.tsx';
        import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectHeader } from '/src/components/tailgrids/core/select.tsx';
        import { ListBoxSection as SelectSection } from 'react-aria-components';
        import { Combobox, ComboboxItem } from '/src/components/tailgrids/core/combobox.tsx';
        import { useScrollToLoadMore } from '/src/hooks/use-scroll-to-load-more.ts';
        import { useLimitInfinityScroll } from '/src/hooks/use-limit-infinity-scroll.ts';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import '/src/app/css/default.css';
        import '/src/app/css/dark.css';
        import '/src/app/globals.css';
        const options = Array.from({ length: 200 }, (_, i) => ({ id: String(i + 1), label: 'Option ' + String(i + 1).padStart(3, '0'), groupLabel: 'Group ' + Math.floor(i / 25) }));
        const e = React.createElement;
        function App() {
          const kind = new URLSearchParams(location.search).get('kind') || 'dropdown';
          const [value, setValue] = React.useState(kind === 'selected' ? '180' : kind === 'detail' || kind === 'create' ? '1' : '');
          const [events, setEvents] = React.useState(0);
          const [calls, setCalls] = React.useState(0);
          const [pending, setPending] = React.useState(false);
          const [failed, setFailed] = React.useState(false);
          const scroll = useScrollToLoadMore({ hasMore: true, isError: failed, loadMore: async () => {
            setCalls(c => c + 1); setPending(true);
            await new Promise(r => setTimeout(r, 100));
            setPending(false);
            if (kind === 'failure') { setFailed(true); throw new Error('fixture next page error'); }
          }});
          const [remoteSearch, setRemoteSearch] = React.useState('');
          const remote = useLimitInfinityScroll({
            queryKey: ['fixture-options', remoteSearch],
            enabled: kind === 'remote' || kind === 'remote-failure',
            fetchPage: async ({ limit }, signal) => {
              const response = await fetch('/api/options?limit=' + limit + '&search=' + encodeURIComponent(remoteSearch), { signal });
              if (!response.ok) throw new Error('next page unavailable');
              return response.json();
            },
            getItems: response => response,
          });
          const base = { ariaLabel: 'Options', options, value, onChange: setValue };
          let control;
          if (kind === 'select' || kind === 'selected' || kind === 'grouped') {
            const items = options.map(o => e(SelectItem, { key: o.id, id: o.id, textValue: o.label }, o.label));
            const content = kind === 'grouped'
              ? Array.from({ length: 8 }, (_, group) => e(SelectSection, { key: group, 'aria-label': 'Group ' + group }, e(SelectHeader, null, 'Group ' + group), items.slice(group * 25, group * 25 + 25)))
              : items;
            control = e(Select, { value: value || undefined, onChange: setValue, 'aria-label': 'Options', placeholder: 'Choose' },
              e(SelectTrigger, { 'aria-label': 'Options' }, e(SelectValue)), e(SelectContent, null, content));
          } else if (kind === 'multiple') {
            control = e(Select, { selectionMode: 'multiple', value: value ? value.split(',') : [], onChange: values => setValue(values.join(',')), 'aria-label': 'Options' },
              e(SelectTrigger, { 'aria-label': 'Options' }, 'Choose'), e(SelectContent, null, options.map(o => e(SelectItem, { key: o.id, id: o.id, textValue: o.label }, o.label))));
          } else if (kind === 'combobox') {
            control = e(Combobox, { value: value || null, onChange: setValue, 'aria-label': 'Options', placeholder: 'Search options' }, options.map(o => e(ComboboxItem, { key: o.id, id: o.id, textValue: o.label }, o.label)));
          } else if (kind === 'major') {
            control = e(MajorSelector, { ...base, allowClear: true });
          } else if (kind === 'detail') {
            control = e('dl', null, e(EditableDetailField, { label: 'Options', options, value, onChange: setValue, isEditing: true, searchable: true, dropdownClassName: '!max-h-64', searchPlaceholder: 'Search options' }));
          } else if (kind === 'create') {
            control = e(CreateDialogSelect, { label: 'Options', options, value, onChange: setValue, searchable: true, searchPlaceholder: 'Search options' });
          } else if (kind === 'native') {
            control = e('form', { id: 'test-form', onSubmit: event => { event.preventDefault(); setValue(new FormData(event.currentTarget).get('choice')); } },
              e(InfiniteSelectInput, { name: 'choice', 'aria-label': 'Options', required: true, defaultValue: '', onChange: event => { setEvents(c => c + 1); setValue(event.target.value); } },
                e('option', { value: '' }, 'Choose'), options.map(o => e('option', { key: o.id, value: o.id }, o.label))),
              e('button', { type: 'submit' }, 'Submit'), e('button', { type: 'reset' }, 'Reset'));
          } else if (kind === 'guard' || kind === 'failure') {
            control = e('div', { 'data-testid': 'scroller', onScroll: scroll.onScrollToLoadMore, style: { height: 100, overflow: 'auto' } }, e('div', { style: { height: 1000 } }, 'Scroll'));
          } else {
            const isRemote = kind === 'remote' || kind === 'remote-failure';
            control = e(DropdownField, { ...base, options: isRemote ? remote.items : options,
              pagination: isRemote ? { ...remote.pagination, onSearchChange: setRemoteSearch } : undefined,
              isSearchable: true, contentClassName: '!max-h-64', searchPlaceholder: 'Search options' });
          }
          return e('main', { className: 'm-4 mt-8 w-[335px] max-w-[calc(100vw-2rem)]' }, control,
            e('output', { 'data-testid': 'value' }, value),
            e('output', { 'data-testid': 'events' }, events),
            e('output', { 'data-testid': 'calls' }, calls),
            e('output', { 'data-testid': 'pending' }, String(pending)),
            e('output', { 'data-testid': 'failed' }, String(failed)));
        }
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        createRoot(document.getElementById('root')).render(e(QueryClientProvider, { client }, e(App)));
      `;
    },
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/") return next();
        res.setHeader("Content-Type", "text/html");
        res.end('<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body class="bg-background-white-secondary text-text-primary"><div id="root"></div><script type="module" src="/@id/__x00__virtual:dropdowns"></script></body></html>');
      });
    },
  }],
});
await server.listen();
process.stdout.write("DROPDOWN_TEST_ORIGIN=http://127.0.0.1:" + server.httpServer.address().port + "\n");
process.on("SIGTERM", async () => { await server.close(); process.exit(0); });
