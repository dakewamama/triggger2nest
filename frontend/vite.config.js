"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var vite_plugin_node_polyfills_1 = require("vite-plugin-node-polyfills");
var path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_react_1.default)(),
        (0, vite_plugin_node_polyfills_1.nodePolyfills)({
            include: ['buffer', 'crypto', 'stream', 'util'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
        },
    },
    define: {
        global: 'globalThis',
        'process.env': {},
    },
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
        allowedHosts: [
            'cf88a249f941.ngrok-free.app',
        ],
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    solana: ['@solana/web3.js', '@coral-xyz/anchor'],
                    ui: ['lucide-react', 'clsx', 'tailwind-merge'],
                },
            },
        },
    },
});
