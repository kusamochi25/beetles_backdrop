import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generatedPagesDir = path.join(root, 'generated-pages');
const publicDir = path.join(root, 'public');

const locales = ['ja', 'en', 'zh', 'ko', 'es', 'th', 'fr'];

function localized(ja, en, zh, ko, es, th, fr) {
    return { ja, en, zh, ko, es, th, fr };
}

const familyGroups = [
    {
        slug: 'kabutomushi',
        label: localized('カブトムシ', 'Rhinoceros Beetles', '兜虫', '장수풍뎅이류', 'Escarabajos rinoceronte', 'ด้วงกว่าง', 'Scarabées rhinocéros'),
        description: localized(
            '大型で迫力のある角を持つ仲間をまとめた一覧です。',
            'A group page for large species with striking horns.',
            '汇总拥有显著角的大型昆虫。',
            '큰 뿔이 돋보이는 종들을 모은 분류입니다.',
            'Una lista de especies grandes con cuernos llamativos.',
            'หน้ารวมกลุ่มแมลงขนาดใหญ่ที่มีเขาเด่นชัด',
            'Une liste d’espèces imposantes aux cornes remarquables.',
        ),
    },
    {
        slug: 'kuwagata',
        label: localized('クワガタムシ', 'Stag Beetles', '锹形虫', '사슴벌레류', 'Escarabajos ciervo', 'ด้วงคีม', 'Lucanes'),
        description: localized(
            '大あごが目立つ仲間をまとめた一覧です。',
            'A list focused on species with prominent mandibles.',
            '汇总拥有发达大颚的昆虫。',
            '큰 턱이 특징인 종들을 모은 분류입니다.',
            'Una lista centrada en especies con mandíbulas prominentes.',
            'หน้ารวมแมลงที่มีกรามเด่นชัด',
            'Une liste centrée sur les espèces aux mandibules marquées.',
        ),
    },
    {
        slug: 'kanabun',
        label: localized('コガネムシ', 'Scarab Beetles', '金龟子类', '풍뎅이류', 'Escarabajos escarabeidos', 'ด้วงกว่างวงศ์กว่าง', 'Scarabées'),
        description: localized(
            '光沢や色彩が特徴的な仲間をまとめた一覧です。',
            'A group page for glossy and colorful beetles.',
            '汇总色彩和光泽显著的种类。',
            '광택과 색채가 돋보이는 종들을 모은 분류입니다.',
            'Una lista de especies con brillo y color llamativos.',
            'หน้ารวมแมลงที่มีสีสันและความมันวาวเด่น',
            'Une liste d’espèces remarquables par leur éclat et leurs couleurs.',
        ),
    },
    {
        slug: 'others',
        label: localized('その他', 'Others', '其他', '기타', 'Otros', 'อื่น ๆ', 'Autres'),
        description: localized(
            '将来の拡張を見据えて、その他の昆虫を置ける受け皿です。',
            'A flexible bucket for species outside the main beetle groups.',
            '为主分组之外的昆虫预留的灵活分类。',
            '주요 그룹 밖의 종을 담아둘 수 있는 유연한 분류입니다.',
            'Un contenedor flexible para especies fuera de los grupos principales.',
            'หมวดที่ยืดหยุ่นสำหรับแมลงนอกกลุ่มหลัก',
            'Une catégorie souple pour les espèces hors des groupes principaux.',
        ),
    },
];

familyGroups[0].description.ja = '広義のカブトムシをまとめました。角がない種もいます。';
familyGroups[0].description.en = 'A broader rhinoceros beetle category that also includes species without horns.';
familyGroups[0].description.zh = '这里汇总的是广义的兜虫类，其中也包括没有角的种类。';
familyGroups[0].description.ko = '넓은 의미의 장수풍뎅이류를 모았습니다. 뿔이 없는 종도 포함됩니다.';
familyGroups[0].description.es = 'Aquí se agrupan los escarabajos rinoceronte en sentido amplio, incluidas especies sin cuernos.';
familyGroups[0].description.th = 'หมวดนี้รวบรวมด้วงกว่างในความหมายกว้าง และรวมชนิดที่ไม่มีเขาด้วย';
familyGroups[0].description.fr = 'Cette catégorie regroupe les scarabées rhinocéros au sens large, y compris des espèces sans cornes.';
familyGroups[1].description.ja = 'クワガタムシ科の仲間をまとめました。';
familyGroups[1].description.en = 'This category brings together members of the stag beetle family.';
familyGroups[1].description.zh = '这里汇总的是锹甲科的种类。';
familyGroups[1].description.ko = '사슴벌레과에 속하는 종들을 모았습니다.';
familyGroups[1].description.es = 'Aquí se agrupan las especies de la familia Lucanidae.';
familyGroups[1].description.th = 'หมวดนี้รวบรวมชนิดในวงศ์ด้วงกว่างคีม';
familyGroups[1].description.fr = 'Cette catégorie regroupe les espèces de la famille des Lucanidae.';
familyGroups[2].description.ja = 'カブトムシ以外のコガネムシ科をまとめました。カナブン、ハナムグリ、コガネムシが対象です。';
familyGroups[2].description.en = 'This category covers scarab beetles other than rhinoceros beetles, including flower chafers and shining leaf chafers.';
familyGroups[2].description.zh = '这里汇总的是除兜虫以外的金龟科种类，包括金龟子、花金龟等。';
familyGroups[2].description.ko = '장수풍뎅이를 제외한 풍뎅이과를 모았습니다. 카나분, 꽃무지, 금풍뎅이류가 대상입니다.';
familyGroups[2].description.es = 'Aquí se agrupan los escarabajos de la familia Scarabaeidae distintos de los rinoceronte, incluidos cetónidos y otros escarabajos brillantes.';
familyGroups[2].description.th = 'หมวดนี้รวบรวมด้วงกว่างวงศ์กว่างที่ไม่ใช่ด้วงกว่างเขา รวมถึงคานาบุน ฮานามูกุริ และโคกาเนะมุชิ';
familyGroups[2].description.fr = 'Cette catégorie regroupe les Scarabaeidae autres que les scarabées rhinocéros, y compris les cétoines et d’autres scarabées dorés.';
familyGroups[3].description.ja = 'ゴミムシダマシ等、飼育はされているがどの大分類にも属しないものが対象です。';
familyGroups[3].description.en = 'This category is for insects such as darkling beetles that are kept in captivity but do not fit any of the main categories.';
familyGroups[3].description.zh = '这里收录的是如拟步甲等虽有饲养例、但不属于任何主要大分类的昆虫。';
familyGroups[3].description.ko = '거저리과 등 사육되지만 어느 주요 대분류에도 속하지 않는 곤충을 위한 분류입니다.';
familyGroups[3].description.es = 'Esta categoría reúne insectos como los tenebriónidos, que se crían en cautividad pero no encajan en ninguna de las categorías principales.';
familyGroups[3].description.th = 'หมวดนี้สำหรับแมลงอย่างด้วงดาร์กลิงที่มีการเพาะเลี้ยง แต่ไม่อยู่ในหมวดหลักใด ๆ';
familyGroups[3].description.fr = 'Cette catégorie concerne des insectes comme les ténébrions, élevés en captivité mais ne relevant d’aucune des grandes catégories.';

function ensureDirectory(directory) {
    fs.mkdirSync(directory, { recursive: true });
}

function resetGeneratedPages() {
    ensureDirectory(generatedPagesDir);
}

function readJsonFiles(directory) {
    const absoluteDirectory = path.join(root, directory);
    const filenames = fs.existsSync(absoluteDirectory)
        ? fs.readdirSync(absoluteDirectory).filter((file) => file.endsWith('.json'))
        : [];
    const preferred = filenames.filter((file) => file.endsWith('.i18n.json'));
    const targets = preferred.length > 0 ? preferred : filenames;

    return targets.map((filename) => {
        const raw = fs.readFileSync(path.join(absoluteDirectory, filename), 'utf8');
        return JSON.parse(raw.replace(/^\uFEFF/, ''));
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

function replaceGeneratedText(relativePath, searchValue, replaceValue) {
    const filePath = path.join(generatedPagesDir, relativePath);

    if (!fs.existsSync(filePath)) {
        return;
    }

    const current = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, current.split(searchValue).join(replaceValue), 'utf8');
}

function writePublicText(relativePath, value) {
    const filePath = path.join(publicDir, relativePath);
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, value, 'utf8');
}

function normalizePublicAssetPath(assetPath) {
    if (!assetPath || typeof assetPath !== 'string') {
        return null;
    }

    const trimmed = assetPath.trim();

    if (!trimmed) {
        return null;
    }

    return trimmed.replace(/^\/+/, '').replace(/^public[\\/]+/, '');
}

function sanitizeColor(seed) {
    const palette = {
        kabutomushi: ['#4b2e05', '#8f5b11', '#f6d67f'],
        kuwagata: ['#2d3136', '#5f6b73', '#d3dce2'],
        kanabun: ['#0f5132', '#1f9d73', '#c9f4da'],
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
    const relativePath = normalizePublicAssetPath(relativeUrl);

    if (!relativePath) {
        return;
    }

    if (path.extname(relativePath).toLowerCase() !== '.svg') {
        return;
    }

    writePublicText(relativePath, createPlaceholderSvg(label, seed, size));
}

function normalizeSpeciesImages(item) {
    return Array.isArray(item.images) ? item.images : [item.images];
}

function primarySpeciesImage(item) {
    return normalizeSpeciesImages(item)[0];
}

function renderPage(pageData) {
    const serialized = JSON.stringify(pageData).replace(/</g, '\\u003c');

    return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageData.meta.title.ja}</title>
    <meta name="description" content="${pageData.meta.description.ja}" />
    <meta property="og:title" content="${pageData.meta.title.ja}" />
    <meta property="og:description" content="${pageData.meta.description.ja}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageData.meta.title.ja}" />
    <meta name="twitter:description" content="${pageData.meta.description.ja}" />
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
const homeDescription = localized(
    '甲虫を中心に、種ごとの特徴や写真記録をまとめた図鑑サイトです。地域差や個体差も含めて、見比べながら楽しめる記録を少しずつ集めていきます。',
    'An insect catalog centered on beetles, collecting species notes and photo records with room for regional and individual variation.',
    '这是一个以甲虫为中心的图鉴网站，持续整理各物种的特征与照片记录，也会逐步收录地域差异和个体差异。',
    '딱정을 중심으로 종별 특징과 사진 기록을 정리해 나가는 도감 사이트입니다. 지역차와 개체차도 함께 비교하며 볼 수 있도록 조금씩 기록을 모아갑니다.',
    'Es un catálogo de insectos centrado en escarabajos, con fichas y registros fotográficos que también recogen variaciones regionales e individuales.',
    'นี่คือเว็บไซต์สารานุกรมแมลงที่เน้นด้วงเป็นหลัก รวบรวมลักษณะของแต่ละชนิดและบันทึกภาพถ่าย รวมถึงความแตกต่างตามถิ่นอาศัยและความแตกต่างของแต่ละตัวด้วย',
    'Il s’agit d’un catalogue d’insectes centré sur les coléoptères, réunissant des notes d’identification et des archives photo, avec les variations régionales et individuelles.',
);
const legacyHomeDescriptionJa = 'JSON データをもとにビルド時生成する静的な昆虫図鑑サイトの最小構成です。';
const featuredSpecies = [...species]
    .sort((left, right) => {
        const leftUpdatedAt = left.updated_at ?? '1970-01-01';
        const rightUpdatedAt = right.updated_at ?? '1970-01-01';
        return rightUpdatedAt.localeCompare(leftUpdatedAt) || left.name_latin.localeCompare(right.name_latin);
    })
    .slice(0, 3);

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
    };
});

const searchIndex = species.map((item) => ({
    slug: item.slug,
    name_latin: item.name_latin,
    name: item.name,
    genus: item.genus,
    family_group: item.family_group,
    aliases: item.aliases,
    thumb: primarySpeciesImage(item).thumb,
    href: `/species/${item.slug}/`,
}));

writeGeneratedJson('search-index.json', searchIndex);

for (const item of species) {
    for (const image of normalizeSpeciesImages(item)) {
        writePlaceholderImage(image.thumb, item.name_latin, item.family_group, [480, 320]);
        writePlaceholderImage(image.medium, item.name_latin, item.family_group, [960, 640]);
        writePlaceholderImage(image.large, item.name_latin, item.family_group, [1600, 1100]);
    }
}

for (const entry of gallery) {
    writePlaceholderImage(entry.images.thumb, entry.species_slug, 'gallery', [480, 320]);
    writePlaceholderImage(entry.images.medium, entry.species_slug, 'gallery', [960, 640]);
    writePlaceholderImage(entry.images.large, entry.species_slug, 'gallery', [1600, 1100]);
}

writeGeneratedText(
    'index.html',
    renderPage({
        kind: 'home',
        meta: {
            title: localized('昆虫図鑑ベータ', 'Insect Atlas Beta', '昆虫图鉴测试版', '곤충 도감 베타', 'Atlas de Insectos Beta', 'สารานุกรมแมลง เบตา', 'Atlas des Insectes Bêta'),
            description: localized(
                'JSON データをもとにビルド時生成する静的な昆虫図鑑サイトの最小構成です。',
                'A minimal static insect atlas generated from JSON at build time.',
                '基于 JSON 在构建时生成的静态昆虫图鉴最小结构。',
                'JSON 기반으로 빌드 시 생성되는 정적 곤충 도감의 최소 구성입니다.',
                'Una estructura mínima de atlas de insectos estático generado desde JSON.',
                'โครงสร้างขั้นต่ำของสารานุกรมแมลงแบบสแตติกที่สร้างจาก JSON ตอน build',
                'Une structure minimale d’atlas d’insectes statique généré depuis JSON.',
            ),
        },
        stats: {
            speciesCount: species.length,
            genusCount: genusList.length,
            galleryCount: gallery.length,
        },
        featuredSpecies,
        groups: groupSummaries,
        latestGallery: gallery.slice(0, 3).map((entry) => ({
            ...entry,
            family_group: speciesBySlug.get(entry.species_slug)?.family_group,
            genus: speciesBySlug.get(entry.species_slug)?.genus,
            species_name: speciesBySlug.get(entry.species_slug)?.name,
            species_href: `/species/${entry.species_slug}/`,
        })),
    }),
);

replaceGeneratedText('index.html', legacyHomeDescriptionJa, homeDescription.ja);

writeGeneratedText(
    path.join('search', 'index.html'),
    renderPage({
        kind: 'search',
        meta: {
            title: localized('検索 | 昆虫図鑑ベータ', 'Search | Insect Atlas Beta', '搜索 | 昆虫图鉴测试版', '검색 | 곤충 도감 베타', 'Buscar | Atlas de Insectos Beta', 'ค้นหา | สารานุกรมแมลง เบตา', 'Recherche | Atlas des Insectes Bêta'),
            description: localized(
                '学名、和名、各言語名、属名、別名からフロントエンドのみで検索できます。',
                'Search scientific names, localized names, genus names, and aliases on the frontend only.',
                '仅通过前端搜索学名、各语言名称、属名与别名。',
                '학명, 각 언어 이름, 속명, 별칭을 프런트엔드만으로 검색합니다.',
                'Busca nombres científicos, nombres localizados, género y alias solo en el frontend.',
                'ค้นหาชื่อวิทยาศาสตร์ ชื่อหลายภาษา ชื่อสกุล และชื่อเรียกอื่น ๆ ได้ที่ฝั่งฟรอนต์เอนด์เท่านั้น',
                'Recherche par nom scientifique, noms localisés, genre et alias uniquement côté client.',
            ),
        },
    }),
);

writeGeneratedText(
    path.join('gallery', 'index.html'),
    renderPage({
        kind: 'gallery',
        meta: {
            title: localized('みんなの写真集 | 昆虫図鑑ベータ', 'Photo Gallery | Insect Atlas Beta', '大家的照片集 | 昆虫图鉴测试版', '사진집 | 곤충 도감 베타', 'Galería | Atlas de Insectos Beta', 'แกลเลอรีภาพ | สารานุกรมแมลง เบตา', 'Galerie photo | Atlas des Insectes Bêta'),
            description: localized(
                '公開用画像をサイズ別に持つギャラリーの最小サンプルです。',
                'A minimal gallery sample with public image variants.',
                '带有多尺寸公开图片的图库最小示例。',
                '공개용 이미지 사이즈를 나눈 갤러리의 최소 샘플입니다.',
                'Una muestra mínima de galería con variantes públicas de imagen.',
                'ตัวอย่างขั้นต่ำของแกลเลอรีที่มีภาพเผยแพร่หลายขนาด',
                'Un exemple minimal de galerie avec images publiques en plusieurs tailles.',
            ),
        },
        entries: gallery.map((entry) => ({
            ...entry,
            family_group: speciesBySlug.get(entry.species_slug)?.family_group,
            genus: speciesBySlug.get(entry.species_slug)?.genus,
            species_name: speciesBySlug.get(entry.species_slug)?.name,
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
                title: localized(
                    `${group.label.ja}一覧 | 昆虫図鑑ベータ`,
                    `${group.label.en} | Insect Atlas Beta`,
                    `${group.label.zh} | 昆虫图鉴测试版`,
                    `${group.label.ko} | 곤충 도감 베타`,
                    `${group.label.es} | Atlas de Insectos Beta`,
                    `${group.label.th} | สารานุกรมแมลง เบตา`,
                    `${group.label.fr} | Atlas des Insectes Bêta`,
                ),
                description: group.description,
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
                title: localized(
                    `${genus.name} 属 | 昆虫図鑑ベータ`,
                    `${genus.name} genus | Insect Atlas Beta`,
                    `${genus.name} 属 | 昆虫图鉴测试版`,
                    `${genus.name} 속 | 곤충 도감 베타`,
                    `Género ${genus.name} | Atlas de Insectos Beta`,
                    `${genus.name} | สารานุกรมแมลง เบตา`,
                    `Genre ${genus.name} | Atlas des Insectes Bêta`,
                ),
                description: localized(
                    `${genus.name} 属に属する種の一覧ページです。`,
                    `A list of species in the genus ${genus.name}.`,
                    `${genus.name} 属的物种列表页面。`,
                    `${genus.name} 속에 속한 종 목록입니다.`,
                    `Una lista de especies del género ${genus.name}.`,
                    `หน้ารายการชนิดในสกุล ${genus.name}`,
                    `Une liste des espèces du genre ${genus.name}.`,
                ),
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
            name: related.name,
            name_latin: related.name_latin,
            thumb: related.images.thumb,
        }));

    writeGeneratedText(
        path.join('species', item.slug, 'index.html'),
        renderPage({
            kind: 'species',
            meta: {
                title: localized(
                    `${item.name.ja} | 昆虫図鑑ベータ`,
                    `${item.name.en} | Insect Atlas Beta`,
                    `${item.name.zh} | 昆虫图鉴测试版`,
                    `${item.name.ko} | 곤충 도감 베타`,
                    `${item.name.es} | Atlas de Insectos Beta`,
                    `${item.name.th} | สารานุกรมแมลง เบตา`,
                    `${item.name.fr} | Atlas des Insectes Bêta`,
                ),
                description: item.description,
            },
            species: item,
            genusHref: `/genus/${item.genus.toLowerCase()}/`,
            previous: previous ? { slug: previous.slug, name: previous.name, name_latin: previous.name_latin } : null,
            next: next ? { slug: next.slug, name: next.name, name_latin: next.name_latin } : null,
            relatedSpecies,
        }),
    );
}
