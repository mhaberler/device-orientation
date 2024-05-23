import viteCompression from 'vite-plugin-compression';
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv } from 'vite'
import { qrcode } from 'vite-plugin-qrcode';

/** @type {import('vite').UserConfig} */

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    const config: string = (process.env.CONFIG === undefined) ? '' : process.env.CONFIG;
    process.env = { ...process.env, ...loadEnv(config, 'environments') };

    let foo: any =  {

        define: {
            VITE_BROKER: JSON.stringify(process.env.VITE_BROKER),
            VITE_PORT: JSON.stringify(process.env.VITE_PORT),
            VITE_APP_TITLE: JSON.stringify(process.env.VITE_APP_TITLE),
            VITE_TOPIC: JSON.stringify(process.env.VITE_TOPIC),
            VITE_USER: JSON.stringify(process.env.VITE_USER),
            VITE_PASSWORD: JSON.stringify(process.env.VITE_PASSWORD),
        },
        rollupOptions: {
            // https://rollupjs.org/configuration-options/
        },
        build: {
            target: 'esnext' //browsers can handle the latest ES features
        },
        esbuild: {
            supported: {
                'top-level-await': true //browsers can handle top-level-await features
            },
        },
        plugins: [
            // wasm(),
            viteCompression({
                algorithm: (config == 'hosted') ? 'brotliCompress' : 'gzip',
                deleteOriginFile: (config == 'embedded')
            }),
            qrcode(), // only applies in dev mode
            (config != 'embedded') &&
            basicSsl({
                /** name of certification */
                name: 'test.mah.priv.at',
                /** custom trust domains */
                domains: ['*.mah.priv.at'],
                /** custom certification directory */
                certDir: '/Users/mah/.devServer/cert'
            })
        ]
    };
    return foo;
});