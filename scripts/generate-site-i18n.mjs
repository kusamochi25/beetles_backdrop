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
        slug: 'koganemushi',
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
familyGroups[3].description.ja = 'どの大分類にも属しないものが対象です。';
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
    if (fs.existsSync(generatedPagesDir)) {
        fs.rmSync(generatedPagesDir, { recursive: true, force: true });
    }
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
            description: homeDescription,
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

const infoPages = [
    {
        slug: 'privacy',
        title: localized('プライバシーポリシー', 'Privacy Policy', '隐私政策', '개인정보처리방침', 'Política de privacidad', 'นโยบายความเป็นส่วนตัว', 'Politique de confidentialité'),
        lead: localized('', '', '', '', '', '', ''),
        body: [
            localized(
                '本サイトでは、お問い合わせや写真応募の際に、必要に応じてお名前、SNSアカウント名、連絡内容などの情報をご提供いただく場合があります。これらの情報は、お問い合わせへの対応、掲載可否の確認、必要なご連絡のために利用します。',
                'When you contact us or submit photos, we may ask for information such as your name, social media account, and message details. We use this information to respond to inquiries, confirm publication, and communicate when needed.',
                '当您联系我们或提交照片时，我们可能会请求您提供姓名、社交媒体账号及联系内容等信息。这些信息将用于回复咨询、确认是否刊登以及进行必要联系。',
                '문의나 사진 응모 시 이름, SNS 계정명, 연락 내용 등의 정보를 제공받을 수 있습니다. 이러한 정보는 문의 대응, 게재 여부 확인, 필요한 연락을 위해 사용됩니다.',
                'Cuando nos contacte o envíe fotografías, podremos solicitar datos como su nombre, cuenta de redes sociales y contenido del mensaje. Esta información se utilizará para responder consultas, confirmar publicaciones y realizar comunicaciones necesarias.',
                'เมื่อมีการติดต่อหรือส่งภาพถ่ายเข้ามา เราอาจขอข้อมูล เช่น ชื่อ บัญชีโซเชียลมีเดีย และรายละเอียดการติดต่อ ข้อมูลเหล่านี้จะใช้เพื่อตอบกลับ ตรวจสอบการเผยแพร่ และติดต่อกลับเมื่อจำเป็น',
                'Lorsque vous nous contactez ou soumettez des photos, nous pouvons vous demander des informations telles que votre nom, votre compte sur les réseaux sociaux et le contenu de votre message. Ces informations sont utilisées pour répondre aux demandes, confirmer la publication et vous contacter si nécessaire.',
            ),
            localized(
                'ご提供いただいた写真は、本サイト内の図鑑ページおよび写真集ページでの掲載を目的として使用します。応募いただいた写真を本サイト以外の用途で利用する場合は、必要に応じてあらためて確認を行います。',
                'Submitted photos are used for publication on this site, including species pages and the gallery. If we wish to use a submitted photo for any purpose outside this site, we will contact you again when necessary.',
                '您提供的照片将用于本网站内的图鉴页面与照片集页面。如需将投稿照片用于本网站以外的用途，我们会在必要时再次征求您的确认。',
                '제공해 주신 사진은 본 사이트의 종 페이지 및 사진집 페이지 게재를 목적으로 사용됩니다. 본 사이트 외의 용도로 사용하려는 경우에는 필요에 따라 다시 확인을 드립니다.',
                'Las fotografías enviadas se utilizarán para su publicación dentro de este sitio, incluidas las páginas de especies y la galería. Si deseamos usarlas fuera de este sitio, volveremos a consultarlo cuando sea necesario.',
                'ภาพถ่ายที่ส่งมาจะใช้เพื่อเผยแพร่ภายในเว็บไซต์นี้ เช่น หน้าชนิดและหน้ารวมภาพ หากต้องการนำภาพไปใช้นอกเว็บไซต์นี้ เราจะติดต่อเพื่อยืนยันอีกครั้งตามความเหมาะสม',
                'Les photos fournies sont utilisées pour une publication sur ce site, notamment sur les pages d’espèces et la galerie. Si nous souhaitons utiliser une photo soumise en dehors de ce site, nous vous recontacterons si nécessaire.',
            ),
            localized(
                '本サイトでは、アクセス状況の把握や広告配信のために、Cookie 等の技術を利用する場合があります。今後、Google AdSense などの広告サービスを利用する場合、広告配信事業者が Cookie を使用して利用者の興味に応じた広告を表示することがあります。',
                'This site may use cookies and similar technologies for analytics and advertising. If we use advertising services such as Google AdSense in the future, advertising providers may use cookies to show ads based on user interests.',
                '本网站可能会为访问分析与广告投放使用 Cookie 等技术。若未来使用 Google AdSense 等广告服务，广告提供商可能会使用 Cookie 来展示与用户兴趣相关的广告。',
                '본 사이트는 접근 분석 및 광고 제공을 위해 쿠키 등의 기술을 사용할 수 있습니다. 향후 Google AdSense 등의 광고 서비스를 이용할 경우, 광고 제공자가 쿠키를 사용해 이용자 관심사에 맞는 광고를 표시할 수 있습니다.',
                'Este sitio puede utilizar cookies y tecnologías similares para análisis de acceso y publicidad. Si en el futuro usamos servicios como Google AdSense, los proveedores de anuncios podrán utilizar cookies para mostrar anuncios según los intereses del usuario.',
                'เว็บไซต์นี้อาจใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อการวิเคราะห์การเข้าชมและการแสดงโฆษณา หากมีการใช้บริการอย่าง Google AdSense ในอนาคต ผู้ให้บริการโฆษณาอาจใช้คุกกี้เพื่อแสดงโฆษณาตามความสนใจของผู้ใช้',
                'Ce site peut utiliser des cookies et des technologies similaires pour l’analyse d’audience et la diffusion publicitaire. Si nous utilisons à l’avenir des services publicitaires tels que Google AdSense, les régies pourront utiliser des cookies pour afficher des annonces adaptées aux centres d’intérêt des utilisateurs.',
            ),
            localized(
                'ご提供いただく写真は、応募者ご本人が権利を有するもの、または掲載に必要な許可を得ているものに限ります。掲載内容や個人情報の取り扱いに関するご相談、掲載画像の修正・削除のご希望がある場合は、お問い合わせ窓口または案内しているSNSアカウントまでご連絡ください。',
                'Photos must be submitted by the rights holder or with the necessary permission for publication. If you have questions about posted content or personal information, or if you would like an image corrected or removed, please contact us through the inquiry page or the social media account listed on this site.',
                '投稿照片须由投稿者本人拥有权利，或已取得刊登所需许可。如对刊登内容、个人信息处理方式，或图片修改、删除有任何疑问，请通过联系我们页面或本站公布的社交媒体账号与我们联系。',
                '제공되는 사진은 응모자 본인이 권리를 보유하고 있거나 게재에 필요한 허가를 받은 것에 한합니다. 게재 내용이나 개인정보 처리, 이미지 수정·삭제 요청이 있는 경우에는 문의 창구 또는 안내된 SNS 계정으로 연락해 주세요.',
                'Las fotografías deben enviarse por la persona titular de los derechos o con la autorización necesaria para su publicación. Si tiene consultas sobre el contenido publicado, el tratamiento de datos personales o desea corregir o retirar una imagen, contáctenos por la página de contacto o mediante la cuenta de redes sociales indicada en este sitio.',
                'ภาพถ่ายที่ส่งมาจะต้องเป็นผลงานที่ผู้ส่งมีสิทธิ์ในภาพหรือได้รับอนุญาตให้เผยแพร่แล้ว หากมีข้อสงสัยเกี่ยวกับเนื้อหาที่เผยแพร่ การจัดการข้อมูลส่วนบุคคล หรือประสงค์จะแก้ไขหรือลบภาพ กรุณาติดต่อผ่านหน้าติดต่อเราหรือบัญชีโซเชียลมีเดียที่ระบุไว้ในเว็บไซต์',
                'Les photos soumises doivent appartenir à la personne qui les envoie ou avoir reçu l’autorisation nécessaire pour leur publication. Pour toute question concernant les contenus publiés, le traitement des données personnelles, ou pour demander la correction ou la suppression d’une image, veuillez nous contacter via la page de contact ou le compte de réseau social indiqué sur ce site.',
            ),
            localized(
                '掲載時にSNSアカウント名をリンク紐づけ形式で表示する場合があります。掲載後に当該アカウントが削除されていることを確認した場合は、運営判断で匿名表記へ切り替えることがあります。',
                'When publishing a photo, we may display the social media account name as a linked attribution. If we later confirm that the account has been deleted, we may change the attribution to an anonymous label at our discretion.',
                '刊登照片时，我们可能会以链接形式显示社交媒体账号名称。若之后确认该账号已被删除，我们可能会自行改为匿名标注。',
                '사진 게재 시 SNS 계정명을 링크된 표기 형태로 표시할 수 있습니다. 이후 해당 계정이 삭제된 것을 확인한 경우 운영 판단에 따라 익명 표기로 변경할 수 있습니다.',
                'Al publicar una fotografía, podremos mostrar la cuenta de redes sociales en forma de enlace. Si posteriormente confirmamos que la cuenta ha sido eliminada, podremos cambiar esa mención a una etiqueta anónima a nuestro criterio.',
                'เมื่อเผยแพร่ภาพถ่าย เราอาจแสดงชื่อบัญชีโซเชียลมีเดียในรูปแบบลิงก์ หากภายหลังตรวจพบว่าบัญชีนั้นถูกลบไปแล้ว เราอาจเปลี่ยนเป็นการระบุแบบไม่เปิดเผยชื่อได้ตามดุลยพินิจของผู้ดูแล',
                'Lors de la publication d’une photo, nous pouvons afficher le nom d’un compte de réseau social sous forme de lien. Si nous constatons par la suite que ce compte a été supprimé, nous pouvons remplacer cette mention par une indication anonyme à notre discrétion.',
            ),
            localized(
                '本ポリシーは、必要に応じて内容を見直し、予告なく変更することがあります。',
                'This policy may be reviewed and updated without prior notice when necessary.',
                '本政策可能会在必要时进行修订，并可能在不另行通知的情况下更新。',
                '본 정책은 필요에 따라 검토 및 수정될 수 있으며, 사전 고지 없이 변경될 수 있습니다.',
                'Esta política podrá revisarse y actualizarse cuando sea necesario, sin previo aviso.',
                'นโยบายนี้อาจมีการทบทวนและแก้ไขตามความจำเป็นโดยไม่ต้องแจ้งให้ทราบล่วงหน้า',
                'Cette politique peut être révisée et mise à jour si nécessaire, sans préavis.',
            ),
        ],
    },
    {
        slug: 'contact',
        title: localized('お問い合わせ', 'Contact', '联系我们', '문의하기', 'Contacto', 'ติดต่อเรา', 'Contact'),
        lead: localized('', '', '', '', '', '', ''),
        body: [
            localized(
                '本サイトへのお問い合わせは、案内しているXアカウントまたはメールアドレスまでお願いします。',
                'For inquiries about this site, please contact us via the listed X account or email address.',
                '如需就本网站进行咨询，请通过页面列出的 X 账号或电子邮箱与我们联系。',
                '본 사이트에 대한 문의는 안내된 X 계정 또는 이메일 주소로 부탁드립니다.',
                'Para consultas sobre este sitio, contáctenos mediante la cuenta de X indicada o la dirección de correo electrónico.',
                'หากต้องการติดต่อเกี่ยวกับเว็บไซต์นี้ กรุณาติดต่อผ่านบัญชี X ที่ระบุไว้หรือทางอีเมล',
                'Pour toute question concernant ce site, veuillez nous contacter via le compte X indiqué ou par e-mail.',
            ),
            localized(
                '写真応募、掲載内容の修正依頼、掲載画像の削除相談、その他のご連絡を受け付けています。',
                'We accept photo submissions, correction requests, image removal requests, and other inquiries.',
                '我们接受照片投稿、刊登内容修正请求、图片删除咨询及其他联系事项。',
                '사진 응모, 게재 내용 수정 요청, 이미지 삭제 문의 및 기타 연락을 받고 있습니다.',
                'Aceptamos envíos de fotografías, solicitudes de corrección, consultas sobre eliminación de imágenes y otras comunicaciones.',
                'เรารับการส่งภาพถ่าย คำขอแก้ไขเนื้อหา คำขอลบภาพ และการติดต่ออื่น ๆ',
                'Nous acceptons les soumissions de photos, les demandes de correction, les demandes de suppression d’images et les autres messages.',
            ),
            localized(
                '写真応募の際は、種名が分かる場合はあわせてお知らせください。撮影地や飼育個体・野外個体の別など、分かる範囲の情報を添えていただけると助かります。',
                'When submitting photos, please include the species name if known. It also helps if you can share any available information such as location and whether the specimen was wild or captive-bred.',
                '投稿照片时，如知道种名请一并注明。如能附上拍摄地点、野外个体或饲育个体等信息，将更有帮助。',
                '사진을 응모할 때 종명을 알고 있다면 함께 알려 주세요. 촬영지나 야외 개체/사육 개체 여부 등 알 수 있는 범위의 정보를 덧붙여 주시면 도움이 됩니다.',
                'Al enviar fotografías, indique el nombre de la especie si lo conoce. También ayuda incluir datos como la localidad y si se trata de un ejemplar silvestre o criado en cautividad.',
                'เมื่อส่งภาพถ่าย หากทราบชื่อชนิดโปรดแจ้งมาด้วย และหากมีข้อมูล เช่น สถานที่ถ่าย หรือเป็นตัวจากธรรมชาติหรือเพาะเลี้ยง ก็จะเป็นประโยชน์มาก',
                'Lorsque vous soumettez des photos, veuillez indiquer le nom de l’espèce si vous le connaissez. Il est également utile de préciser le lieu et s’il s’agit d’un individu sauvage ou élevé en captivité.',
            ),
            localized(
                '内容によっては返信までお時間をいただく場合があります。また、すべてのお問い合わせに返信をお約束するものではありませんので、あらかじめご了承ください。',
                'Depending on the content, replies may take some time. Please also note that we may not be able to respond to every inquiry.',
                '根据内容不同，回复可能需要一些时间。另请理解，并非所有咨询都会逐一回复。',
                '문의 내용에 따라 답변까지 시간이 걸릴 수 있습니다. 또한 모든 문의에 반드시 답변드리는 것은 아닌 점 양해 부탁드립니다.',
                'Según el contenido, la respuesta puede tardar. Tenga en cuenta también que no podemos garantizar una respuesta a todas las consultas.',
                'ขึ้นอยู่กับเนื้อหา การตอบกลับอาจใช้เวลาสักระยะ และโปรดเข้าใจว่าเราอาจไม่สามารถตอบกลับทุกข้อความได้',
                'Selon la nature du message, la réponse peut prendre du temps. Veuillez également noter que nous ne pouvons pas garantir une réponse à toutes les demandes.',
            ),
            localized(
                'X: @B1010P\nメールアドレス: ',
                'X: @B1010P\nEmail: ',
                'X：@B1010P\n电子邮箱：',
                'X: @B1010P\n이메일: ',
                'X: @B1010P\nCorreo electrónico: ',
                'X: @B1010P\nอีเมล: ',
                'X : @B1010P\nE-mail : ',
            ),
        ],
    },
    {
        slug: 'faq',
        title: localized('よくあるご質問', 'FAQ', '常见问题', '자주 묻는 질문', 'Preguntas frecuentes', 'คำถามที่พบบ่อย', 'FAQ'),
        lead: localized('', '', '', '', '', '', ''),
        faqItems: [
            {
                question: localized('写真は誰でも応募できますか', 'Can anyone submit photos?', '任何人都可以投稿照片吗？', '사진은 누구나 응모할 수 있나요?', '¿Cualquiera puede enviar fotografías?', 'ใครก็ส่งภาพถ่ายเข้ามาได้ไหม', 'Tout le monde peut-il soumettre des photos ?'),
                answer: [
                    localized('はい、応募できます。', 'Yes, anyone can submit photos.', '可以，任何人都可以投稿。', '네, 누구나 응모할 수 있습니다.', 'Sí, cualquiera puede enviarlas.', 'ได้ ทุกคนสามารถส่งภาพได้', 'Oui, tout le monde peut en soumettre.'),
                ],
            },
            {
                question: localized('飼育個体でも応募できますか', 'Can captive-bred specimens also be submitted?', '饲育个体也可以投稿吗？', '사육 개체도 응모할 수 있나요?', '¿También se pueden enviar ejemplares criados en cautividad?', 'ส่งภาพจากตัวที่เพาะเลี้ยงได้ไหม', 'Peut-on aussi soumettre des individus élevés en captivité ?'),
                answer: [
                    localized('応募可能です。', 'Yes.', '可以。', '가능합니다.', 'Sí.', 'ได้', 'Oui.'),
                    localized('図鑑として作っているページは、できるだけ野外個体をベースに掲載したいと考えています。ただし、日本では飼育個体の流通が多いこと、野外個体は小型が多いこと、野外個体の標本が十分に集まらないことなどから、飼育個体を図鑑ページに登録する場合もあります。', 'For the catalog pages, we would ideally like to present mainly wild specimens. However, captive-bred individuals may also be added to the catalog because captive material is widely circulated in Japan, wild specimens are often smaller, and enough wild reference material is not always available.', '图鉴页面原则上仍希望尽量以野外个体为基础进行展示。不过，由于日本流通的饲育个体较多、野外个体往往较小、且野外标本不易充分收集等原因，图鉴页面中也可能收录饲育个体。', '도감 페이지는 가능하면 야외 개체를 기준으로 구성하고 싶습니다. 다만 일본에서는 사육 개체의 유통이 많고, 야외 개체는 소형이 많은 편이며, 야외 표본이 충분히 모이지 않는 경우도 있어 사육 개체를 도감 페이지에 등록하는 경우도 있습니다.', 'En las páginas del catálogo preferimos, en lo posible, basarnos en ejemplares silvestres. Sin embargo, también podemos registrar ejemplares criados en cautividad, ya que en Japón circulan muchos, los ejemplares silvestres suelen ser más pequeños y no siempre es posible reunir suficientes referencias de campo.', 'สำหรับหน้าสารานุกรม เราอยากใช้ตัวจากธรรมชาติเป็นหลักเท่าที่ทำได้ อย่างไรก็ตาม ในญี่ปุ่นมีตัวเพาะเลี้ยงหมุนเวียนอยู่มาก ตัวจากธรรมชาติมักมีขนาดเล็ก และบางครั้งก็รวบรวมตัวอย่างจากธรรมชาติได้ไม่เพียงพอ จึงอาจมีการลงทะเบียนตัวเพาะเลี้ยงในหน้าสารานุกรมด้วย', 'Pour les pages du catalogue, nous souhaitons idéalement nous baser autant que possible sur des individus sauvages. Toutefois, des individus élevés en captivité peuvent aussi être ajoutés, car ils circulent largement au Japon, les individus sauvages sont souvent plus petits, et il n’est pas toujours possible de réunir suffisamment de spécimens de terrain.'),
                    localized('なお、ギャラリーについては飼育個体・野外個体を問わず募集しています。', 'For the gallery, we welcome both captive-bred and wild specimens.', '至于照片集，则无论是饲育个体还是野外个体都欢迎投稿。', '갤러리는 사육 개체와 야외 개체를 가리지 않고 모집하고 있습니다.', 'En la galería aceptamos tanto ejemplares criados en cautividad como ejemplares silvestres.', 'ส่วนแกลเลอรีนั้น รับทั้งตัวเพาะเลี้ยงและตัวจากธรรมชาติ', 'Pour la galerie, nous acceptons aussi bien les individus élevés en captivité que les individus sauvages.'),
                ],
            },
            {
                question: localized('種名が分からなくても応募できますか', 'Can I submit photos even if I do not know the species name?', '即使不知道种名也可以投稿吗？', '종명을 몰라도 응모할 수 있나요?', '¿Puedo enviar fotos aunque no conozca el nombre de la especie?', 'ถ้าไม่ทราบชื่อชนิดยังส่งได้ไหม', 'Puis-je soumettre des photos même si je ne connais pas le nom de l’espèce ?'),
                answer: [
                    localized('応募可能です。', 'Yes.', '可以。', '가능합니다.', 'Sí.', 'ได้', 'Oui.'),
                    localized('産地情報や、複数の角度から撮影した画像など、判断材料になる情報があれば同定できる場合があります。', 'If you can provide useful clues such as locality information or multiple photos from different angles, identification may still be possible.', '如果附上产地信息或多个角度的照片等有助于判断的资料，仍有可能进行同定。', '산지 정보나 여러 각도에서 촬영한 사진 등 판단에 도움이 되는 정보가 있으면 동정이 가능할 수도 있습니다.', 'Si aporta pistas útiles, como la localidad o varias imágenes desde distintos ángulos, puede ser posible identificarla.', 'หากมีข้อมูลอย่างแหล่งที่พบหรือภาพหลายมุมที่ช่วยในการพิจารณา ก็อาจสามารถระบุชนิดได้', 'Si vous fournissez des informations utiles, comme la localité ou plusieurs photos sous différents angles, une identification peut être possible.'),
                ],
            },
            {
                question: localized('掲載時の名前はどう表示されますか', 'How will my name be shown when a photo is published?', '刊登时姓名会如何显示？', '게재 시 이름은 어떻게 표시되나요?', '¿Cómo se mostrará mi nombre al publicar una foto?', 'เวลาลงภาพจะระบุชื่ออย่างไร', 'Comment mon nom sera-t-il affiché lors de la publication ?'),
                answer: [
                    localized('掲載時のお名前は、@sample_link のような形で表示します。', 'Your name will be displayed in a format such as @sample_link.', '刊登时会以 @sample_link 这类形式显示。', '게재 시 이름은 @sample_link 와 같은 형식으로 표시됩니다.', 'Se mostrará en un formato como @sample_link.', 'ชื่อจะแสดงในรูปแบบเช่น @sample_link', 'Il sera affiché sous une forme comme @sample_link.'),
                    localized('詳しくはギャラリーページの掲載例をご確認ください。', 'Please see the gallery page for examples of how credits are shown.', '具体示例请参见照片集页面。', '자세한 예시는 갤러리 페이지를 확인해 주세요.', 'Consulte la galería para ver ejemplos.', 'ดูตัวอย่างได้ที่หน้าแกลเลอรี', 'Veuillez consulter la galerie pour voir des exemples.'),
                ],
            },
            {
                question: localized('掲載後に削除や修正はお願いできますか', 'Can I ask for deletion or correction after publication?', '刊登后还能请求删除或修改吗？', '게재 후에도 삭제나 수정을 요청할 수 있나요?', '¿Se puede pedir una eliminación o corrección después de la publicación?', 'หลังเผยแพร่แล้วสามารถขอแก้ไขหรือลบได้ไหม', 'Peut-on demander une suppression ou une correction après la publication ?'),
                answer: [
                    localized('削除や修正のご相談は、掲載後でも可能です。', 'Yes, you can contact us about deletion or correction even after publication.', '可以，刊登后仍可咨询删除或修改事宜。', '네, 게재 후에도 삭제나 수정에 대해 상담하실 수 있습니다.', 'Sí, puede consultarlo incluso después de la publicación.', 'ได้ สามารถปรึกษาเรื่องแก้ไขหรือลบได้ภายหลัง', 'Oui, vous pouvez nous contacter même après la publication.'),
                    localized('ただし、他に代わりとなる画像がない場合など、対応が難しいことがあります。', 'However, in some cases it may be difficult to comply, for example if there is no substitute image available.', '但如果没有可替代的图片等情况下，也可能难以处理。', '다만 대체할 이미지가 없는 경우 등에는 대응이 어려울 수 있습니다.', 'Sin embargo, en algunos casos puede ser difícil atender la solicitud, por ejemplo si no hay otra imagen disponible.', 'อย่างไรก็ตาม หากไม่มีภาพอื่นมาทดแทน ก็อาจดำเนินการได้ยาก', 'Cependant, cela peut être difficile dans certains cas, par exemple s’il n’existe pas d’image de remplacement.'),
                ],
            },
            {
                question: localized('送った写真はこのサイト以外でも使われますか', 'Will the photos I send be used outside this site?', '我提交的照片会被用于本站以外的用途吗？', '보낸 사진이 이 사이트 외의 곳에도 사용되나요?', '¿Las fotos que envío se utilizarán fuera de este sitio?', 'ภาพที่ส่งมาจะถูกนำไปใช้นอกเว็บไซต์นี้หรือไม่', 'Les photos que j’envoie seront-elles utilisées en dehors de ce site ?'),
                answer: [
                    localized('プライバシーポリシーに記載しているとおり、本サイト用に応募された写真は本サイト内でのみ使用します。', 'As stated in the privacy policy, photos submitted for this site are used only within this site.', '如隐私政策所述，投稿给本站的照片仅用于本站内。', '개인정보처리방침에 적혀 있듯이, 이 사이트용으로 응모된 사진은 이 사이트 안에서만 사용됩니다.', 'Tal como se indica en la política de privacidad, las fotos enviadas para este sitio se utilizan solo dentro de este sitio.', 'ตามที่ระบุไว้ในนโยบายความเป็นส่วนตัว ภาพที่ส่งมาสำหรับเว็บไซต์นี้จะใช้ภายในเว็บไซต์นี้เท่านั้น', 'Comme indiqué dans la politique de confidentialité, les photos soumises pour ce site sont utilisées uniquement sur ce site.'),
                    localized('別の用途で利用する場合は、事前に確認を行います。', 'If we wish to use them for any other purpose, we will ask in advance.', '如需用于其他用途，我们会事先确认。', '다른 용도로 사용하려는 경우에는 사전에 확인을 드립니다.', 'Si deseamos usarlas para otro fin, lo consultaremos previamente.', 'หากต้องการนำไปใช้อย่างอื่น เราจะสอบถามล่วงหน้า', 'Si nous souhaitons les utiliser à d’autres fins, nous demanderons votre accord au préalable.'),
                ],
            },
            {
                question: localized('返信にはどれくらいかかりますか', 'How long does it usually take to receive a reply?', '通常多久可以收到回复？', '답변은 어느 정도 걸리나요?', '¿Cuánto suele tardar una respuesta?', 'ปกติใช้เวลาตอบกลับนานแค่ไหน', 'Combien de temps faut-il généralement pour recevoir une réponse ?'),
                answer: [
                    localized('返信のみであれば、早ければ1時間程度で対応できる場合があります。', 'If it is only a reply, we may be able to respond in as little as about one hour.', '如果只是回复消息，最快可能约 1 小时内处理。', '단순 답변만이라면 빠르면 1시간 정도 안에 대응할 수 있는 경우가 있습니다.', 'Si solo se trata de responder, a veces podemos hacerlo en alrededor de una hora.', 'หากเป็นเพียงการตอบกลับอย่างเดียว บางครั้งอาจตอบได้เร็วสุดประมาณ 1 ชั่วโมง', 'S’il s’agit simplement de répondre, nous pouvons parfois le faire en environ une heure.'),
                    localized('仕事の都合ですぐに返信できない場合でも、通常は10時間以内、多忙な場合でも2日以内の返信を目安にしています。', 'Even when work prevents an immediate response, we usually aim to reply within 10 hours, and within 2 days even during busy periods.', '即使因工作无法立即回复，通常也会以 10 小时内、繁忙时 2 天内回复为目标。', '업무 사정으로 바로 답변하지 못하더라도 보통은 10시간 이내, 바쁠 때도 2일 이내 답변을 목표로 하고 있습니다.', 'Incluso cuando el trabajo impide una respuesta inmediata, normalmente intentamos responder en 10 horas, y en periodos ocupados dentro de 2 días.', 'แม้จะไม่สามารถตอบได้ทันทีเพราะงาน โดยทั่วไปเราตั้งเป้าไว้ภายใน 10 ชั่วโมง และในช่วงที่ยุ่งมากก็ภายใน 2 วัน', 'Même si le travail empêche une réponse immédiate, nous visons en général une réponse sous 10 heures, et sous 2 jours même en période chargée.'),
                    localized('3日以上返信がない場合は見落としている可能性がありますので、再度ご連絡いただけると助かります。', 'If you do not hear back for more than 3 days, we may have missed your message, so a reminder would be appreciated.', '如果 3 天以上没有回复，可能是我们漏看了消息，烦请再次联系。', '3일 이상 답변이 없으면 놓쳤을 가능성이 있으니 다시 한 번 연락해 주시면 도움이 됩니다.', 'Si no recibe respuesta en más de 3 días, es posible que no hayamos visto el mensaje, así que agradeceremos un recordatorio.', 'หากเกิน 3 วันแล้วยังไม่ได้รับการตอบกลับ อาจเป็นไปได้ว่าเรามองข้ามข้อความไป จึงขอความกรุณาติดต่อซ้ำอีกครั้ง', 'Si vous n’avez pas de réponse au bout de 3 jours, il est possible que nous ayons manqué votre message ; un rappel serait alors apprécié.'),
                ],
            },
        ],
    },
];

for (const infoPage of infoPages) {
    writeGeneratedText(
        path.join(infoPage.slug, 'index.html'),
        renderPage({
            kind: 'info',
            meta: {
                title: localized(
                    `${infoPage.title.ja} | 昆虫図鑑ベータ`,
                    `${infoPage.title.en} | Insect Atlas Beta`,
                    `${infoPage.title.zh} | 昆虫图鉴测试版`,
                    `${infoPage.title.ko} | 곤충 도감 베타`,
                    `${infoPage.title.es} | Atlas de Insectos Beta`,
                    `${infoPage.title.th} | สารานุกรมแมลง เบตา`,
                    `${infoPage.title.fr} | Atlas des Insectes Bêta`,
                ),
                description: infoPage.body?.[0] ?? infoPage.lead,
            },
            title: infoPage.title,
            lead: infoPage.lead,
            body: infoPage.body,
            faqItems: infoPage.faqItems,
        }),
    );
}

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

