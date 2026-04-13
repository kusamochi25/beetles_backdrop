import fs from 'node:fs';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';

const rootDir = process.cwd();
const generatedPagesDir = path.join(rootDir, 'generated-pages');

function collectHtmlInputs() {
    const inputs = new Map();

    if (!fs.existsSync(generatedPagesDir)) {
        return {};
    }

    const queue = [generatedPagesDir];

    while (queue.length > 0) {
        const current = queue.shift();

        if (!current) {
            continue;
        }

        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const absolutePath = path.join(current, entry.name);

            if (entry.isDirectory()) {
                queue.push(absolutePath);
                continue;
            }

            if (entry.isFile() && entry.name === 'index.html') {
                const relativePath = path.relative(generatedPagesDir, absolutePath);
                const key = relativePath.replaceAll(/[\\/]/g, '-').replace('.html', '');
                inputs.set(key, absolutePath);
            }
        }
    }

    return Object.fromEntries(inputs);
}

function resolveGeneratedHtml(urlPath: string) {
    const trimmedPath = urlPath.replace(/^\//, '');
    if (trimmedPath === '') {
        const rootIndexPath = path.join(generatedPagesDir, 'index.html');
        return fs.existsSync(rootIndexPath) ? rootIndexPath : null;
    }

    const normalizedPath = trimmedPath;
    const candidates = [path.join(normalizedPath, 'index.html')];

    if (!normalizedPath.endsWith('/')) {
        candidates.unshift(`${normalizedPath}.html`);
    }

    for (const candidate of candidates) {
        const absolutePath = path.join(generatedPagesDir, candidate);

        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }
    }

    return null;
}

function sendFile(server: ViteDevServer, absolutePath: string, urlPath: string, res: any) {
    const content = fs.readFileSync(absolutePath, 'utf8');
    return server.transformIndexHtml(urlPath, content).then((html) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
    });
}

function generatedArtifactsPlugin(): Plugin {
    let outDir = path.join(rootDir, 'dist');

    return {
        name: 'generated-artifacts',
        configResolved(config) {
            outDir = path.resolve(config.root, config.build.outDir);
        },
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = req.url ? new URL(req.url, 'http://localhost') : null;
                const pathname = url?.pathname ?? '/';

                if (req.method !== 'GET') {
                    next();
                    return;
                }

                if (pathname === '/search-index.json') {
                    const jsonPath = path.join(generatedPagesDir, 'search-index.json');

                    if (!fs.existsSync(jsonPath)) {
                        next();
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.end(fs.readFileSync(jsonPath, 'utf8'));
                    return;
                }

                if (pathname === '/' || !path.extname(pathname)) {
                    const htmlPath = resolveGeneratedHtml(pathname);

                    if (!htmlPath) {
                        next();
                        return;
                    }

                    await sendFile(server, htmlPath, pathname, res);
                    return;
                }

                next();
            });
        },
        closeBundle() {
            const builtPagesPath = path.join(outDir, 'generated-pages');
            const searchIndexPath = path.join(generatedPagesDir, 'search-index.json');

            if (fs.existsSync(builtPagesPath)) {
                fs.cpSync(builtPagesPath, outDir, { recursive: true, force: true });
                fs.rmSync(builtPagesPath, { recursive: true, force: true });
            }

            if (fs.existsSync(searchIndexPath)) {
                fs.copyFileSync(searchIndexPath, path.join(outDir, 'search-index.json'));
            }
        },
    };
}

export default defineConfig({
    appType: 'mpa',
    base: '/',
    plugins: [vue(), generatedArtifactsPlugin()],
    server: {
        host: '127.0.0.1',
        strictPort: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: collectHtmlInputs(),
        },
    },
});
