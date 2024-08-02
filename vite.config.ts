import { defineConfig, loadEnv } from 'vite'
import { qrcode } from 'vite-plugin-qrcode';

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    const config: string = (process.env.CONFIG === undefined) ? '' : process.env.CONFIG;
    process.env = { ...process.env, ...loadEnv(config, 'environments') };

    let cfg: any =  {

        define: {
            VITE_BROKER: JSON.stringify(process.env.VITE_BROKER),
            VITE_PORT: JSON.stringify(process.env.VITE_PORT),
            VITE_APP_TITLE: JSON.stringify(process.env.VITE_APP_TITLE),
            VITE_TOPIC: JSON.stringify(process.env.VITE_TOPIC),
            VITE_USER: JSON.stringify(process.env.VITE_USER),
            VITE_PASSWORD: JSON.stringify(process.env.VITE_PASSWORD),
        },
        // base: '/device-orientation', // <--- 👀
        rollupOptions: {
            // https://rollupjs.org/configuration-options/
        },
        build: {
            target: 'esnext', //browsers can handle the latest ES features
        },
        esbuild: {
            supported: {
                'top-level-await': true //browsers can handle top-level-await features
            },
        },
        plugins: [
            qrcode(), // only applies in dev mode
        ]
    };
    return cfg;
});