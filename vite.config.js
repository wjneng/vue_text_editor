import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library';

  return {
    plugins: [vue()],
    build: isLibrary
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'VueTextEditor',
            fileName: (format) => `vue-text-editor.${format}.js`,
            cssFileName: 'vue-text-editor',
            formats: ['es', 'umd']
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue'
              }
            }
          }
        }
      : {
          outDir: 'demo-dist'
        }
  };
});
