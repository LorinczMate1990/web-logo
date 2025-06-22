import { defineConfig } from 'vite';

const basePath = process.env.VITE_PUBLIC_URL || '/';

export default defineConfig({
  base: basePath,
});
