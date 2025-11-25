import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            rollupTypes: true,
            tsconfigPath: "./tsconfig.app.json",
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ['react', 'react/jsx-runtime'],
        },
        // sourcemap: true,
    },
});
