import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'fix-hash-in-path',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) return null;
        const dir = path.dirname(importer);
        const resolved = path.resolve(dir, source);
        const exts = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css'];
        for (const ext of exts) {
          const fullPath = resolved + ext;
          if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
            return fullPath;
          }
        }
        return null;
      }
    },
    react()
  ],
  server: {
    port: 4000,
    open: true
  },
  preview: {
    port: 4000,
    open: true
  }
});
