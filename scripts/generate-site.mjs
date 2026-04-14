import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generatedPagesDir = path.join(root, 'generated-pages');
const publicDir = path.join(root, 'public');

const familyGroups = [
    {
        slug: 'kabutomushi',
        label: 'カブトムシ',
        description: '大型で迫力のある角を持つ仲間をまとめた一覧です。',
    },
    {
        slug: 'kuwagata',
        label: 'クワガタムシ',
        description: '大あごが目立つ仲間をまとめた一覧です。',
    },
    {
        slug: 'koganemushi',
        label: 'コガネムシ',
        description: '光沢や色彩が特徴的な仲間をまとめた一覧です。',
    },
    {
        slug: 'others',
        label: 'その他',
        description: '将来の拡張を見据えて、その他の昆虫を置ける受け皿です。',
    },
];

function resetGeneratedPages() {
    fs.mkdirSync(generatedPagesDir, { recursive: true });
}

function ensureDirectory(directory) {
    fs.mkdirSync(directory, { recursive: true });
}

function readJsonFiles(directory) {
    const absoluteDirectory = path.join(root, directory);
    const filenames = fs.existsSync(absoluteDirectory)
        ? fs.readdirSync(absoluteDirectory).filter((file) => file.endsWith('.json'))
        : [];

    return filenames.map((filename) => {
        const raw = fs.readFileSync(path.join(absoluteDirectory, filename), 'utf8');
        const normalized = raw.replace(/^\uFEFF/, '');
        return JSON.parse(normalized);
    });
}

function writeGeneratedText(relativePath, value) {
    const filePath = path.join(generatedPagesDir, relativePath);
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, value, 'utf8');
}

function writeGeneratedJson(relativePath, value) {
    writeGeneratedText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writePublicText(relativePath, value) {
    const filePath = path.join(publicDir, relativePath);
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, value, 'utf8');
}

function sanitizeColor(seed) {
    const palette = {
        kabutomushi: ['#4b2e05', '#8f5b11', '#f6d67f'],
        kuwagata: ['#2d3136', '#5f6b73', '#d3dce2'],
        koganemushi: ['#0f5132', '#1f9d73', '#c9f4da'],
        others: ['#1f3a5f', '#4f86c6', '#d6ecff'],
        gallery: ['#6a3f13', '#b8752c', '#f8dcb0'],
    };

    return palette[seed] ?? ['#3f3f46', '#71717a', '#e4e4e7'];
}

function createPlaceholderSvg(label, seed, size) {
    const [base, accent, highlight] = sanitizeColor(seed);
    const [width, height] = size;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${base}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="28" fill="url(#bg)" />
  <circle cx="${Math.round(width * 0.76)}" cy="${Math.round(height * 0.24)}" r="${Math.round(width * 0.16)}" fill="${highlight}" opacity="0.28" />
  <path d="M${Math.round(width * 0.34)} ${Math.round(height * 0.25)} C${Math.round(width * 0.28)} ${Math.round(height * 0.42)}, ${Math.round(width * 0.28)} ${Math.round(height * 0.65)}, ${Math.round(width * 0.5)} ${Math.round(height * 0.76)} C${Math.round(width * 0.72)} ${Math.round(height * 0.65)}, ${Math.round(width * 0.72)} ${Math.round(height * 0.42)}, ${Math.round(width * 0.66)} ${Math.round(height * 0.25)}" fill="${highlight}" opacity="0.42" />
  <text x="50%" y="49%" text-anchor="middle" fill="#ffffff" font-size="${Math.round(width / 14)}" font-family="Verdana, sans-serif" letter-spacing="1">${label}</text>
  <text x="50%" y="64%" text-anchor="middle" fill="#ffffff" fill-opacity="0.86" font-size="${Math.round(width / 28)}" font-family="Verdana, sans-serif">${size[0]}x${size[1]}</text>
</svg>
`;
}

function writePlaceholderImage(relativeUrl, label, seed, size) {
    const relativePath = relativeUrl.replace(/^\//, '');
    writePublicText(relativePath, createPlaceholderSvg(label, seed, size));
}

function renderPage(pageData) {
    const serialized = JSON.stringify(pageData).replace(/</g, '\\u003c');

    return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageData.meta.title}</title>
    <meta name="description" content="${pageData.meta.description}" />
    <script type="module" src="/src/main.ts"></script>
  </head>
  <body>
    <div id="app"></div>
    <script id="page-data" type="application/json">${serialized}</script>
  </body>
</html>
`;
}

resetGeneratedPages();

const species = readJsonFiles('data/species').sort((left, right) => left.name_latin.localeCompare(right.name_latin));
const gallery = readJsonFiles('data/gallery');
const speciesBySlug = new Map(species.map((item) => [item.slug, item]));

const genusMap = new Map();
for (const item of species) {
    const genusSlug = item.genus.toLowerCase();
    const current = genusMap.get(genusSlug) ?? { slug: genusSlug, name: item.genus, species: [] };
    current.species.push(item);
    genusMap.set(genusSlug, current);
}

const genusList = [...genusMap.values()].sort((left, right) => left.name.localeCompare(right.name));

const groupSummaries = familyGroups.map((group) => {
    const items = species.filter((item) => item.family_group === group.slug);
    return {
        ...group,
        count: items.length,
        sampleSpecies: items.slice(0, 3).map((item) => ({
            slug: item.slug,
            name_ja: item.name_ja,
            name_latin: item.name_latin,
        })),
    };
});

const searchIndex = species.map((item) => ({
    slug: item.slug,
    name_latin: item.name_latin,
    name_ja: item.name_ja,
    genus: item.genus,
    family_group: item.family_group,
    aliases: item.aliases ?? [],
    thumb: item.images.thumb,
    href: `/species/${item.slug}/`,
}));

writeGeneratedJson('search-index.json', searchIndex);

for (const item of species) {
    writePlaceholderImage(item.images.thumb, item.name_ja, item.family_group, [480, 320]);
    writePlaceholderImage(item.images.medium, item.name_ja, item.family_group, [960, 640]);
    writePlaceholderImage(item.images.large, item.name_ja, item.family_group, [1600, 1100]);
}

for (const entry of gallery) {
    writePlaceholderImage(entry.images.thumb, entry.title, 'gallery', [480, 320]);
    writePlaceholderImage(entry.images.medium, entry.title, 'gallery', [960, 640]);
    writePlaceholderImage(entry.images.large, entry.title, 'gallery', [1600, 1100]);
}

writeGeneratedText(
    'index.html',
    renderPage({
        kind: 'home',
        meta: {
            title: '昆虫図鑑ベータ',
            description: '甲虫を中心に、種ごとの特徴や写真記録をまとめた図鑑サイトです。地域差や個体差も含めて、見比べながら楽しめる記録を少しずつ集めていきます。',
        },
        stats: {
            speciesCount: species.length,
            genusCount: genusList.length,
            galleryCount: gallery.length,
        },
        featuredSpecies: species.slice(0, 3),
        groups: groupSummaries,
        latestGallery: gallery.slice(0, 3).map((entry) => ({
            ...entry,
            species_name: speciesBySlug.get(entry.species_slug)?.name_ja ?? entry.species_slug,
        })),
    }),
);

writeGeneratedText(
    path.join('search', 'index.html'),
    renderPage({
        kind: 'search',
        meta: {
            title: '検索 | 昆虫図鑑ベータ',
            description: '学名、和名、属名、別名からフロントエンドのみで検索できます。',
        },
        groups: groupSummaries,
    }),
);

writeGeneratedText(
    path.join('gallery', 'index.html'),
    renderPage({
        kind: 'gallery',
        meta: {
            title: 'みんなの写真集 | 昆虫図鑑ベータ',
            description: '公開用画像をサイズ別に持つギャラリーの最小サンプルです。',
        },
        entries: gallery.map((entry) => ({
            ...entry,
            species_name: speciesBySlug.get(entry.species_slug)?.name_ja ?? entry.species_slug,
            species_href: `/species/${entry.species_slug}/`,
        })),
    }),
);

for (const group of familyGroups) {
    const items = species.filter((item) => item.family_group === group.slug);
    writeGeneratedText(
        path.join('groups', group.slug, 'index.html'),
        renderPage({
            kind: 'group',
            meta: {
                title: `${group.label}一覧 | 昆虫図鑑ベータ`,
                description: `${group.label}グループの一覧ページです。検索ページへの導線付きです。`,
            },
            group: {
                ...group,
                count: items.length,
            },
            species: items,
        }),
    );
}

for (const genus of genusList) {
    const items = [...genus.species].sort((left, right) => left.name_latin.localeCompare(right.name_latin));
    writeGeneratedText(
        path.join('genus', genus.slug, 'index.html'),
        renderPage({
            kind: 'genus',
            meta: {
                title: `${genus.name} 属 | 昆虫図鑑ベータ`,
                description: `${genus.name} 属に属する種の一覧ページです。`,
            },
            genus: {
                slug: genus.slug,
                name: genus.name,
                count: items.length,
            },
            species: items,
        }),
    );
}

for (const item of species) {
    const siblings = [...(genusMap.get(item.genus.toLowerCase())?.species ?? [])].sort((left, right) =>
        left.name_latin.localeCompare(right.name_latin),
    );
    const index = siblings.findIndex((candidate) => candidate.slug === item.slug);
    const previous = index > 0 ? siblings[index - 1] : null;
    const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
    const relatedSpecies = siblings
        .filter((candidate) => candidate.slug !== item.slug)
        .slice(0, 3)
        .map((related) => ({
            slug: related.slug,
            name_ja: related.name_ja,
            name_latin: related.name_latin,
            thumb: related.images.thumb,
        }));

    writeGeneratedText(
        path.join('species', item.slug, 'index.html'),
        renderPage({
            kind: 'species',
            meta: {
                title: `${item.name_ja} | 昆虫図鑑ベータ`,
                description: item.description,
            },
            species: item,
            genusHref: `/genus/${item.genus.toLowerCase()}/`,
            previous: previous ? { slug: previous.slug, name_ja: previous.name_ja, name_latin: previous.name_latin } : null,
            next: next ? { slug: next.slug, name_ja: next.name_ja, name_latin: next.name_latin } : null,
            relatedSpecies,
        }),
    );
}
