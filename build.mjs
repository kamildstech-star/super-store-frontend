import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { compile } from '@vue/compiler-dom';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import ui from '@nuxt/ui/vite';

const html = readFileSync('src/index.html', 'utf8');
const template = html.match(/<div id="app" v-cloak>([\s\S]+)<\/div>\s*<noscript>/)[1];
const code = compile(template, { mode: 'module', whitespace: 'condense' }).code;
const configuredBase = process.env.POS_API_BASE_URL?.trim();
let apiBase = '';
if (configuredBase) {
  const url = new URL(configuredBase);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('POS_API_BASE_URL must be an HTTP(S) base URL without credentials, query or fragment.');
  }
  apiBase = url.toString().replace(/\/+$/, '');
}

// Keep the existing static dist output and Laravel dev proxy. Templates are compiled ahead of time.
const renderModule = 'virtual:pos-render';
await build({
  configFile: false,
  plugins: [
    {
      name: 'pos-html-template',
      resolveId(id) { if (id === renderModule) return '\0' + id; },
      load(id) { if (id === '\0' + renderModule) return code; },
    },
    vue(),
    ui({
      autoImport: false,
      components: false,
      colorMode: false,
      router: false,
      icon: { clientBundle: { icons: [
        'ri:checkbox-circle-line', 'ri:error-warning-line', 'ri:information-line', 'ri:close-line',
      ] } },
    }),
  ],
  define: { __POS_API_BASE_URL__: JSON.stringify(apiBase) },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    outDir: 'dist',
    publicDir: false,
    rollupOptions: {
      input: 'src/app.js',
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'nuxt-ui[extname]',
      },
    },
  },
});
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html.replace(template, ''));
copyFileSync('node_modules/vue/LICENSE', 'dist/vue-LICENSE.txt');
copyFileSync('node_modules/@nuxt/ui/LICENSE.md', 'dist/nuxt-ui-LICENSE.md');
copyFileSync(new URL('./src/vendor/remixicon/LICENSE.txt', import.meta.url), 'dist/remixicon-LICENSE.txt');
// Preserve the existing Tailwind 3 utilities and reset for the register UI.
execFileSync(process.execPath, ['node_modules/tailwindcss3/lib/cli.js', '-i', 'src/style.css', '-o', 'dist/style.css',
  '--content', 'src/index.html,src/app.js', '--minify'], { stdio: 'inherit' });
