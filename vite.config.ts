import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function uploadPortraitPlugin(): Plugin {
  return {
    name: 'upload-portrait-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-portrait', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data && data.image) {
                // Remove data URL prefix if present
                const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                const publicDir = path.resolve(__dirname, 'public');
                const assetsDir = path.resolve(publicDir, 'assets');
                if (!fs.existsSync(assetsDir)) {
                  fs.mkdirSync(assetsDir, { recursive: true });
                }

                // Write to all expected permanent locations
                fs.writeFileSync(path.resolve(assetsDir, 'FB_IMG_1790800525155.jpg'), buffer);
                fs.writeFileSync(path.resolve(publicDir, 'FB_IMG_1790800525155.jpg'), buffer);
                fs.writeFileSync(path.resolve(assetsDir, 'ghulam_portrait.jpg'), buffer);
                fs.writeFileSync(path.resolve(publicDir, 'ghulam_portrait.jpg'), buffer);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, path: '/assets/FB_IMG_1790800525155.jpg' }));
                return;
              }
            } catch (err) {
              console.error('Failed to save uploaded portrait', err);
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Failed to process image' }));
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), uploadPortraitPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
