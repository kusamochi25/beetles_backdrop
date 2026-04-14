<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import LightboxModalI18n from './components/LightboxModalI18n.vue';
import SiteHeaderI18n from './components/SiteHeaderI18n.vue';
import SpeciesCardI18n from './components/SpeciesCardI18n.vue';
import {
    createTranslator,
    getLocalizedText,
    groupLabels,
    LANGUAGE_STORAGE_KEY,
    normalizeLocale,
} from './i18n';
import type { GalleryEntry, ImageSet, Locale, LocalizedText, PageData, SearchItem, SpeciesImage, SpeciesReference, SpeciesSummary } from './types';

type GroupSummary = {
    slug: string;
    label: LocalizedText;
    description: LocalizedText;
    count: number;
};

type NeighborLink = {
    slug: string;
    name: LocalizedText;
    name_latin: string;
};

type RelatedSpeciesCard = {
    slug: string;
    name: LocalizedText;
    name_latin: string;
    thumb: string;
};

type GalleryFilterChip = {
    key: string;
    label: string;
};

type GalleryPrimaryFilter = {
    key: string;
    label: string;
};

const props = defineProps<{ pageData: PageData }>();

const currentLanguage = ref<Locale>('ja');
const searchQuery = ref('');
const searchItems = ref<SearchItem[]>([]);
const searchLoaded = ref(false);
const searchError = ref('');
const visibleCount = ref(10);
const lightboxImage = ref<{ src: string; alt: string } | null>(null);
const selectedGalleryFilters = ref<string[]>([]);
const selectedGalleryGenusPrimary = ref('');
const selectedGalleryGenusSecondary = ref('');
const selectedSpeciesImageIndex = ref(0);
const selectedGroupGenus = ref('');

const page = computed(() => props.pageData);
const t = computed(() => createTranslator(currentLanguage.value));
const metaTitle = computed(() => getLocalizedText(page.value.meta.title, currentLanguage.value));
const speciesList = computed(() => ((page.value.species as SpeciesSummary[]) ?? []));
const homeGroups = computed(() => ((page.value.groups as GroupSummary[]) ?? []));
const homeFeatured = computed(() => ((page.value.featuredSpecies as SpeciesSummary[]) ?? []));
const galleryEntries = computed(() => ((page.value.entries as GalleryEntry[]) ?? []));
const latestGallery = computed(() => ((page.value.latestGallery as GalleryEntry[]) ?? []));
const relatedSpecies = computed(() => ((page.value.relatedSpecies as RelatedSpeciesCard[]) ?? []));
const currentSpecies = computed(() => (page.value.species as SpeciesSummary | undefined));
const currentReferences = computed(() => ((currentSpecies.value?.references as SpeciesReference[] | undefined) ?? []));
const currentSpeciesImages = computed<SpeciesImage[]>(() => {
    if (!currentSpecies.value) {
        return [];
    }

    const images = currentSpecies.value.images as ImageSet | SpeciesImage[];

    if (Array.isArray(images)) {
        return images;
    }

    return [images];
});
const activeSpeciesImage = computed<SpeciesImage | null>(() => {
    if (currentSpeciesImages.value.length === 0) {
        return null;
    }

    return currentSpeciesImages.value[Math.min(selectedSpeciesImageIndex.value, currentSpeciesImages.value.length - 1)] ?? currentSpeciesImages.value[0];
});
const currentGroup = computed(() => (page.value.group as GroupSummary | undefined));
const currentGenus = computed(() => (page.value.genus as { name: string; count: number } | undefined));
const previousSpecies = computed(() => (page.value.previous as NeighborLink | null | undefined));
const nextSpecies = computed(() => (page.value.next as NeighborLink | null | undefined));
const currentInfoTitle = computed(() => (page.value.title as LocalizedText | undefined));
const currentInfoLead = computed(() => (page.value.lead as LocalizedText | undefined));
const currentInfoBody = computed(() => ((page.value.body as LocalizedText[] | undefined) ?? []));
const currentFaqItems = computed(() => ((page.value.faqItems as { question: LocalizedText; answer: LocalizedText[] }[] | undefined) ?? []));
const groupGenusOptions = computed<GalleryFilterChip[]>(() => {
    const genusSet = new Set(speciesList.value.map((item) => item.genus).filter(Boolean));

    return [...genusSet]
        .sort((left, right) => String(left).localeCompare(String(right)))
        .map((genus) => ({
            key: String(genus),
            label: `${genus} ${t.value('genusLabel')}`,
        }));
});
const filteredGroupSpecies = computed(() => {
    if (!selectedGroupGenus.value) {
        return speciesList.value;
    }

    return speciesList.value.filter((item) => item.genus === selectedGroupGenus.value);
});
const visibleSpecies = computed(() => filteredGroupSpecies.value.slice(0, visibleCount.value));
const groupTabs = computed(() => homeGroups.value.length > 0 ? homeGroups.value : [
    { slug: 'kabutomushi', label: groupLabels.kabutomushi, description: groupLabels.kabutomushi, count: 0 },
    { slug: 'kuwagata', label: groupLabels.kuwagata, description: groupLabels.kuwagata, count: 0 },
    { slug: 'koganemushi', label: groupLabels.koganemushi, description: groupLabels.koganemushi, count: 0 },
    { slug: 'others', label: groupLabels.others, description: groupLabels.others, count: 0 },
]);
const aboutContent: Record<Locale, Record<string, string>> = {
    ja: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionBody1: '大きく羽化した個体はもちろん、小さな個体でも価値があります。地域によって変異がある種もあり、そういった変異を掲載できるのはWEB図鑑ならではではないでしょうか。もっと色々な甲虫が見たい、そう思えるようなサイト作りを心がけています。',
        operationsTitle: '運営',
        photoSubmissionTitle: '写真応募',
        photoSubmissionBody1: '野外で見たもの、飼育で羽化したものなど、飼育品・野外品問わず写真を常時募集しています。提供いただいた写真は図鑑ページに掲載する場合があります。',
        photoSubmissionBody2: '※種名が分かる場合は併記していただけると助かります。',
        photoSubmissionBody3: '※応募はXのメンションまたはDMにてお願いします。',
    },
    en: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionBody1: 'Large adults are valuable, of course, but smaller individuals also matter. Some species may show regional variation, and being able to document those differences is one of the strengths of a web-based insect catalog. We want to build a site that makes people want to see more kinds of beetles.',
        operationsTitle: 'Operated By',
        photoSubmissionTitle: 'Photo Submission',
        photoSubmissionBody1: 'We are always accepting insect photos, whether they were found in the wild or emerged in captivity. Submitted images may be featured on species pages.',
        photoSubmissionBody2: 'Please include the species name if you know it.',
        photoSubmissionBody3: 'Please send submissions through X mentions or direct messages.',
    },
    zh: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionTitle: '网站说明',
        siteDescriptionBody1: '不仅大型羽化个体有价值，体型较小的个体同样值得记录。有些物种可能存在地域变异，而能够持续收录这些差异，正是网页图鉴的优势之一。',
        operationsTitle: '运营',
        photoSubmissionTitle: '照片投稿',
        photoSubmissionBody1: '我们正在征集昆虫照片，包括羽化个体、饲育个体、野外采集个体等。提供的照片可能会刊载在图鉴页面中。',
        photoSubmissionBody2: '如果知道种名，请一并注明。',
        photoSubmissionBody3: '投稿请通过 X 的提及或私信发送。',
    },
    ko: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionTitle: '사이트 소개',
        siteDescriptionBody1: '크게 우화한 개체는 물론이고, 작은 개체 역시 충분한 가치가 있습니다. 지역에 따라 변이가 나타나는 종도 있으며, 그런 변이를 계속 기록할 수 있다는 점은 웹 도감만의 장점이라고 생각합니다.',
        operationsTitle: '운영',
        photoSubmissionTitle: '사진 모집',
        photoSubmissionBody1: '우화 개체, 사육 개체, 야외 채집 개체 등 곤충 사진을 모집하고 있습니다. 제공해 주신 사진은 도감 페이지에 실릴 수 있습니다.',
        photoSubmissionBody2: '종명을 알고 있다면 함께 적어 주세요.',
        photoSubmissionBody3: '제보는 X 멘션 또는 DM으로 부탁드립니다.',
    },
    es: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionTitle: 'Sobre el sitio',
        siteDescriptionBody1: 'Los ejemplares grandes recién emergidos son valiosos, pero los individuos pequeños también tienen valor. Algunas especies pueden mostrar variaciones regionales, y poder registrar esas diferencias es una de las ventajas de un catálogo web.',
        operationsTitle: 'Operación',
        photoSubmissionTitle: 'Envío de fotos',
        photoSubmissionBody1: 'Buscamos fotos de insectos, ya sean ejemplares recién emergidos, criados en cautividad o recolectados en el campo. Las fotos enviadas pueden aparecer en páginas del catálogo.',
        photoSubmissionBody2: 'Si conoces el nombre de la especie, inclúyelo también.',
        photoSubmissionBody3: 'Envía tus aportes mediante menciones o mensajes directos en X.',
    },
    th: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionTitle: 'เกี่ยวกับเว็บไซต์',
        siteDescriptionBody1: 'ไม่ใช่แค่ตัวเต็มวัยขนาดใหญ่เท่านั้นที่มีคุณค่า ตัวขนาดเล็กก็มีคุณค่าเช่นกัน บางชนิดอาจมีความแปรผันตามภูมิภาค และความสามารถในการบันทึกความแตกต่างเหล่านั้นคือจุดเด่นอย่างหนึ่งของสารานุกรมแบบเว็บ',
        operationsTitle: 'ผู้ดูแล',
        photoSubmissionTitle: 'ส่งภาพถ่าย',
        photoSubmissionBody1: 'เรากำลังเปิดรับภาพแมลง ทั้งตัวที่เพิ่งออกจากดักแด้ ตัวที่เลี้ยงไว้ และตัวที่เก็บจากภาคสนาม ภาพที่ส่งมาอาจถูกนำไปลงในหน้าสารานุกรม',
        photoSubmissionBody2: 'หากทราบชื่อชนิด กรุณาระบุไว้ด้วย',
        photoSubmissionBody3: 'กรุณาส่งผ่านการเมนชันหรือ DM บน X',
    },
    fr: {
        eyebrow: 'PROJECT',
        title: 'About Us',
        siteDescriptionTitle: 'À propos du site',
        siteDescriptionBody1: 'Les grands individus fraîchement émergés ont bien sûr de la valeur, mais les petits individus en ont aussi. Certaines espèces peuvent présenter des variations régionales, et le fait de pouvoir les documenter est l’un des atouts d’un catalogue web.',
        operationsTitle: 'Gestion',
        photoSubmissionTitle: 'Envoi de photos',
        photoSubmissionBody1: 'Nous recherchons des photos d’insectes, qu’il s’agisse d’individus fraîchement émergés, élevés en captivité ou collectés sur le terrain. Les photos envoyées peuvent être publiées sur les pages du catalogue.',
        photoSubmissionBody2: 'Si vous connaissez le nom de l’espèce, merci de l’indiquer.',
        photoSubmissionBody3: 'Merci d’envoyer vos contributions via des mentions ou des messages privés sur X.',
    },
};
const about = computed(() => aboutContent[currentLanguage.value]);
const aboutSiteDescriptionPrimary = computed(() =>
    currentLanguage.value === 'ja'
        ? '甲虫を中心に、種ごとの特徴や写真記録をまとめた図鑑サイトです。地域差や個体差も含めて、見比べながら楽しめる記録を少しずつ集めていきます。'
        : about.value.siteDescriptionBody1,
);
const galleryPrimaryFilters = computed<GalleryPrimaryFilter[]>(() => {
    const availableGroups = new Set(galleryEntries.value.map((entry) => entry.family_group).filter(Boolean));
    const availableTags = new Set(galleryEntries.value.flatMap((entry) => entry.tags ?? []));
    const orderedFilters = [
        { key: 'group:kabutomushi', label: groupLabel('kabutomushi') },
        { key: 'group:kuwagata', label: groupLabel('kuwagata') },
        { key: 'group:koganemushi', label: groupLabel('koganemushi') },
        { key: 'group:others', label: groupLabel('others') },
        { key: 'tag:wild', label: galleryTagLabel('wild') },
        { key: 'tag:bred', label: galleryTagLabel('bred') },
        { key: 'tag:adult', label: galleryTagLabel('adult') },
        { key: 'tag:larva', label: galleryTagLabel('larva') },
    ];

    return orderedFilters.filter((filter) => {
        const [kind, value] = filter.key.split(':');

        if (kind === 'group') {
            return availableGroups.has(value);
        }

        return availableTags.has(value);
    });
});
const galleryGenusOptions = computed<GalleryFilterChip[]>(() => {
    const genusSet = new Set(galleryEntries.value.map((entry) => entry.genus).filter(Boolean));

    return [...genusSet]
        .sort((left, right) => String(left).localeCompare(String(right)))
        .map((genus) => ({
            key: String(genus),
            label: `${genus} ${t.value('genusLabel')}`,
        }));
});
const filteredGalleryEntries = computed(() => {
    return galleryEntries.value.filter((entry) => {
        const matchesPrimary = selectedGalleryFilters.value.every((filterKey) => {
            const [kind, value] = filterKey.split(':');

            if (kind === 'tag') {
                return (entry.tags ?? []).includes(value);
            }

            if (kind === 'group') {
                return entry.family_group === value;
            }

            return false;
        });

        const selectedGenera = [selectedGalleryGenusPrimary.value, selectedGalleryGenusSecondary.value].filter(Boolean);
        const matchesGenus = selectedGenera.length === 0 || selectedGenera.includes(entry.genus ?? '');

        return matchesPrimary && matchesGenus;
    });
});

const filteredSearchResults = computed(() => {
    const normalized = searchQuery.value.trim().toLowerCase();

    const haystacks = (item: SearchItem) => [item.name_latin, item.genus, ...Object.values(item.name), ...Object.values(item.aliases).flat()]
        .filter(Boolean)
        .map((entry) => entry.toLowerCase());

    if (!normalized) {
        return searchItems.value.slice(0, 20);
    }

    return searchItems.value.filter((item) => haystacks(item).some((entry) => entry.includes(normalized))).slice(0, 50);
});

function setLanguage(language: Locale) {
    currentLanguage.value = language;
}

function groupLabel(group: string) {
    return getLocalizedText(groupLabels[group], currentLanguage.value);
}

function taxonomyLabel(group: string, genus: string) {
    return `${groupLabel(group)} > ${genus} ${t.value('genusLabel')}`;
}

function localizedText(value: LocalizedText | undefined) {
    return getLocalizedText(value, currentLanguage.value);
}

function galleryTagLabel(tag: string) {
    const labels: Record<string, Record<Locale, string>> = {
        wild: {
            ja: '野外品',
            en: 'Wild',
            zh: '野外个体',
            ko: '야외품',
            es: 'Silvestre',
            th: 'ภาคสนาม',
            fr: 'Terrain',
        },
        bred: {
            ja: '飼育品',
            en: 'Captive',
            zh: '饲育个体',
            ko: '사육품',
            es: 'Cría',
            th: 'เลี้ยง',
            fr: 'Élevage',
        },
        adult: {
            ja: '成虫',
            en: 'Adult',
            zh: '成虫',
            ko: '성충',
            es: 'Adulto',
            th: 'ตัวเต็มวัย',
            fr: 'Adulte',
        },
        larva: {
            ja: '幼虫',
            en: 'Larva',
            zh: '幼虫',
            ko: '유충',
            es: 'Larva',
            th: 'ตัวอ่อน',
            fr: 'Larve',
        },
    };

    return labels[tag]?.[currentLanguage.value] ?? tag;
}

function toggleGalleryFilter(filterKey: string) {
    if (selectedGalleryFilters.value.includes(filterKey)) {
        selectedGalleryFilters.value = selectedGalleryFilters.value.filter((item) => item !== filterKey);
        return;
    }

    selectedGalleryFilters.value = [...selectedGalleryFilters.value, filterKey];
}

function detailedFilterLabel() {
    const labels: Record<Locale, string> = {
        ja: '詳細絞込',
        en: 'Detailed Filter',
        zh: '详细筛选',
        ko: '상세 필터',
        es: 'Filtro detallado',
        th: 'ตัวกรองแบบละเอียด',
        fr: 'Filtre détaillé',
    };

    return labels[currentLanguage.value];
}

function allGenusLabel() {
    const labels: Record<Locale, string> = {
        ja: 'すべての属',
        en: 'All genera',
        zh: '全部属',
        ko: '모든 속',
        es: 'Todos los géneros',
        th: 'ทุกสกุล',
        fr: 'Tous les genres',
    };

    return labels[currentLanguage.value];
}

function groupDetailedFilterLabel() {
    const labels: Record<Locale, string> = {
        ja: '詳細絞込',
        en: 'Detailed Filter',
        zh: '详细筛选',
        ko: '상세 필터',
        es: 'Filtro detallado',
        th: 'ตัวกรองแบบละเอียด',
        fr: 'Filtre détaillé',
    };

    return labels[currentLanguage.value];
}

function detailedFilterSecondaryLabel() {
    const labels: Record<Locale, string> = {
        ja: '詳細絞込 2',
        en: 'Detailed Filter 2',
        zh: '详细筛选 2',
        ko: '상세 필터 2',
        es: 'Filtro detallado 2',
        th: 'ตัวกรองแบบละเอียด 2',
        fr: 'Filtre détaillé 2',
    };

    return labels[currentLanguage.value];
}

function genusOptionsForSecondary() {
    return galleryGenusOptions.value.filter((option) => option.key !== selectedGalleryGenusPrimary.value);
}

function galleryEntryChips(entry: GalleryEntry) {
    const chips: string[] = [];

    for (const tag of entry.tags ?? []) {
        chips.push(galleryTagLabel(tag));
    }

    if (entry.family_group) {
        chips.push(groupLabel(entry.family_group));
    }

    if (entry.genus) {
        chips.push(`${entry.genus} ${t.value('genusLabel')}`);
    }

    return [...new Set(chips)];
}

function photoCreditLabel() {
    const labels: Record<Locale, string> = {
        ja: '写真提供',
        en: 'Photo by',
        zh: '照片提供',
        ko: '사진 제공',
        es: 'Foto de',
        th: 'ภาพโดย',
        fr: 'Photo fournie par',
    };

    return labels[currentLanguage.value];
}

function galleryCredit(entry: GalleryEntry) {
    return entry.credit?.name ?? entry.photographer ?? '';
}

function galleryCreditUrl(entry: GalleryEntry) {
    return entry.credit?.url ?? '';
}

function referencesTitle() {
    const labels: Record<Locale, string> = {
        ja: '参考文献',
        en: 'References',
        zh: '参考文献',
        ko: '참고문헌',
        es: 'Referencias',
        th: 'เอกสารอ้างอิง',
        fr: 'Références',
    };

    return labels[currentLanguage.value];
}

function speciesImageAlt(index: number) {
    if (!currentSpecies.value) {
        return '';
    }

    const image = currentSpeciesImages.value[index];

    if (!image) {
        return localizedText(currentSpecies.value.name);
    }

    const caption = image.caption ? localizedText(image.caption) : '';
    const name = localizedText(currentSpecies.value.name);

    return caption ? `${name} - ${caption}` : name;
}

function selectSpeciesImage(index: number) {
    selectedSpeciesImageIndex.value = index;
}

function openLightbox(src: string, alt: string) {
    lightboxImage.value = { src, alt };
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightboxImage.value = null;
    document.body.style.overflow = '';
}

async function loadSearchIndex() {
    if (searchLoaded.value) {
        return;
    }

    try {
        const response = await fetch('/search-index.json');

        if (!response.ok) {
            throw new Error(`Failed to load search index: ${response.status}`);
        }

        searchItems.value = (await response.json()) as SearchItem[];
        searchLoaded.value = true;
        searchError.value = '';
    } catch (error) {
        searchError.value = error instanceof Error ? error.message : t.value('loadSearchError');
    }
}

onMounted(() => {
    const savedLanguage = normalizeLocale(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
    currentLanguage.value = savedLanguage;
    document.documentElement.lang = savedLanguage;
    document.title = metaTitle.value;

    if (page.value.kind === 'search') {
        const currentQuery = new URLSearchParams(window.location.search).get('q');
        searchQuery.value = currentQuery ?? '';
        void loadSearchIndex();
    }
});

watch(currentSpecies, () => {
    selectedSpeciesImageIndex.value = 0;
});

watch(currentLanguage, (value) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    document.documentElement.lang = value;
    document.title = metaTitle.value;
});

watch(metaTitle, (value) => {
    document.title = value;
});

watch(searchQuery, (value) => {
    if (page.value.kind !== 'search') {
        return;
    }

    const url = new URL(window.location.href);

    if (value.trim()) {
        url.searchParams.set('q', value.trim());
    } else {
        url.searchParams.delete('q');
    }

    window.history.replaceState({}, '', url);
});

watch(currentLanguage, () => {
    selectedGalleryFilters.value = [];
    selectedGalleryGenusPrimary.value = '';
    selectedGalleryGenusSecondary.value = '';
    selectedGroupGenus.value = '';
});

watch(selectedGalleryGenusPrimary, (value) => {
    if (value && selectedGalleryGenusSecondary.value === value) {
        selectedGalleryGenusSecondary.value = '';
    }
});

watch(selectedGroupGenus, () => {
    visibleCount.value = 10;
});

watch(currentGroup, () => {
    selectedGroupGenus.value = '';
    visibleCount.value = 10;
});
</script>

<template>
    <div class="site-shell">
        <SiteHeaderI18n
            :current-language="currentLanguage"
            :eyebrow="t('headerEyebrow')"
            :brand="t('brand')"
            :nav-search="t('navSearch')"
            :nav-list="t('navList')"
            :nav-gallery="t('navGallery')"
            @language-change="setLanguage"
        />

        <main class="site-main">
            <section v-if="page.kind === 'home'" class="hero">
                <div>
                    <p class="eyebrow">{{ about.eyebrow }}</p>
                    <h1>{{ about.title }}</h1>
                    <div class="about-copy">
                        <div class="about-block">
                            <p class="lead">{{ aboutSiteDescriptionPrimary }}</p>
                            <p v-if="currentLanguage !== 'ja'" class="lead">{{ about.siteDescriptionBody2 }}</p>
                        </div>
                        <div class="about-block">
                            <h2>{{ about.photoSubmissionTitle }}</h2>
                            <p class="lead">{{ about.photoSubmissionBody1 }}</p>
                            <p class="lead">{{ about.photoSubmissionBody2 }}</p>
                            <p class="lead">{{ about.photoSubmissionBody3 }}</p>
                        </div>
                        <div class="about-block">
                            <h2>{{ about.operationsTitle }}</h2>
                            <p class="about-line">BOOM INSECT</p>
                            <p class="about-line">X @B1010P</p>
                        </div>
                    </div>
                    <div class="hero-actions">
                        <a class="button button--primary" href="/groups/kabutomushi/">{{ t('viewByGroup') }}</a>
                        <a class="button" href="/search/">{{ t('searchAction') }}</a>
                    </div>
                    <div class="hero-links">
                        <a href="/privacy/">{{ t('footerPrivacy') }}</a>
                        <a href="/contact/">{{ t('footerContact') }}</a>
                        <a href="/faq/">{{ t('footerFaq') }}</a>
                    </div>
                </div>
                <div class="hero-stats">
                    <div class="stat-card">
                        <span>{{ t('speciesCount') }}</span>
                        <strong>{{ page.stats?.speciesCount }}</strong>
                    </div>
                    <div class="stat-card">
                        <span>{{ t('genusCount') }}</span>
                        <strong>{{ page.stats?.genusCount }}</strong>
                    </div>
                    <div class="stat-card">
                        <span>{{ t('galleryCount') }}</span>
                        <strong>{{ page.stats?.galleryCount }}</strong>
                    </div>
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">{{ t('groupsEyebrow') }}</p>
                        <h2>{{ t('groupsTitle') }}</h2>
                    </div>
                    <a class="text-link" href="/search/">{{ t('searchPageLink') }}</a>
                </div>
                <div class="group-grid">
                    <article v-for="group in homeGroups" :key="group.slug" class="group-card">
                        <p class="group-card__count">{{ group.count }} {{ t('resultCount') }}</p>
                        <h3>{{ localizedText(group.label) }}</h3>
                        <p>{{ localizedText(group.description) }}</p>
                        <a :href="`/groups/${group.slug}/`">{{ t('listView') }}</a>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">{{ t('photosEyebrow') }}</p>
                        <h2>{{ t('photosTitle') }}</h2>
                    </div>
                    <a class="text-link" href="/gallery/">{{ t('galleryLink') }}</a>
                </div>
                <div class="gallery-grid">
                    <article v-for="entry in latestGallery" :key="entry.id" class="gallery-card">
                        <img :src="entry.images.thumb" :alt="localizedText(entry.title)" loading="lazy" />
                        <div class="gallery-card__body">
                            <div v-if="entry.tags?.length" class="tag-row">
                                <span v-for="tag in entry.tags" :key="tag" class="chip">{{ galleryTagLabel(tag) }}</span>
                            </div>
                            <h3>{{ localizedText(entry.title) }}</h3>
                            <p>{{ localizedText(entry.species_name) }} / {{ localizedText(entry.location) }}</p>
                        </div>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">{{ t('featuredEyebrow') }}</p>
                        <h2>{{ t('featuredTitle') }}</h2>
                    </div>
                </div>
                <div class="card-grid">
                    <SpeciesCardI18n
                        v-for="item in homeFeatured"
                        :key="item.slug"
                        :item="item"
                        :taxonomy-label="taxonomyLabel(item.family_group, item.genus)"
                        :current-language="currentLanguage"
                        :detail-label="t('detailLink')"
                        body-mode="description"
                    />
                </div>
            </section>

            <section v-if="page.kind === 'group'" class="section">
                <p class="eyebrow">{{ t('groupsEyebrow') }}</p>
                <h1>{{ localizedText(currentGroup?.label) }}</h1>
                <p class="lead">{{ localizedText(currentGroup?.description) }}</p>
                <div class="group-tabs filter-row" role="tablist" :aria-label="t('groupsTitle')">
                    <a
                        v-for="group in groupTabs"
                        :key="group.slug"
                        :href="`/groups/${group.slug}/`"
                        class="group-tabs__item filter-chip"
                        :class="{ 'is-active': currentGroup?.slug === group.slug }"
                    >
                        {{ localizedText(group.label) }}
                    </a>
                    <a href="/search/" class="group-tabs__item group-tabs__item--search filter-chip">
                        {{ t('navSearch') }}
                    </a>
                </div>
                <label v-if="groupGenusOptions.length > 0" class="gallery-select">
                    <span>{{ groupDetailedFilterLabel() }}</span>
                    <select v-model="selectedGroupGenus">
                        <option value="">{{ allGenusLabel() }}</option>
                        <option v-for="genus in groupGenusOptions" :key="genus.key" :value="genus.key">
                            {{ genus.label }}
                        </option>
                    </select>
                </label>
                <p class="section-note">{{ t('initialTwenty') }}</p>
                <div class="card-grid">
                    <SpeciesCardI18n
                        v-for="item in visibleSpecies"
                        :key="item.slug"
                        :item="item"
                        :taxonomy-label="taxonomyLabel(item.family_group, item.genus)"
                        :current-language="currentLanguage"
                        :detail-label="t('detailLink')"
                        body-mode="region"
                    />
                </div>
                <button v-if="filteredGroupSpecies.length > visibleCount" class="button" type="button" @click="visibleCount += 10">
                    {{ t('loadMore') }}
                </button>
            </section>

            <section v-if="page.kind === 'genus'" class="section">
                <p class="eyebrow">{{ t('genusEyebrow') }}</p>
                <h1>{{ currentGenus?.name }} {{ t('genusLabel') }}</h1>
                <p class="lead">{{ t('genusLead') }}</p>
                <div class="card-grid">
                    <SpeciesCardI18n
                        v-for="item in speciesList"
                        :key="item.slug"
                        :item="item"
                        :taxonomy-label="taxonomyLabel(item.family_group, item.genus)"
                        :current-language="currentLanguage"
                        :detail-label="t('detailLink')"
                        body-mode="description"
                    />
                </div>
            </section>

            <section v-if="page.kind === 'species' && currentSpecies" class="section section--detail">
                <div class="detail-grid">
                    <div>
                        <p class="eyebrow">{{ t('speciesEyebrow') }}</p>
                        <h1>{{ localizedText(currentSpecies.name) }}</h1>
                        <p class="latin latin--large">{{ currentSpecies.name_latin }}</p>
                        <p class="lead">{{ localizedText(currentSpecies.description) }}</p>
                        <dl class="meta-list">
                            <div>
                                <dt>{{ t('genusLabel') }}</dt>
                                <dd><a :href="String(page.genusHref)">{{ currentSpecies.genus }}</a></dd>
                            </div>
                            <div>
                                <dt>{{ t('familyLabel') }}</dt>
                                <dd>{{ groupLabel(currentSpecies.family_group) }}</dd>
                            </div>
                            <div>
                                <dt>{{ t('regionLabel') }}</dt>
                                <dd>{{ localizedText(currentSpecies.region) }}</dd>
                            </div>
                        </dl>
                        <div v-if="currentReferences.length > 0" class="reference-block">
                            <h2>{{ referencesTitle() }}</h2>
                            <ol class="reference-list">
                                <li v-for="(reference, index) in currentReferences" :key="reference.citation + index">
                                    <a v-if="reference.url" :href="reference.url" target="_blank" rel="noreferrer">
                                        {{ reference.citation }}
                                    </a>
                                    <span v-else>{{ reference.citation }}</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div class="detail-visuals">
                        <button
                            v-if="activeSpeciesImage"
                            type="button"
                            class="image-button"
                            @click="openLightbox(activeSpeciesImage.large, speciesImageAlt(selectedSpeciesImageIndex))"
                        >
                            <img :src="activeSpeciesImage.medium" :alt="speciesImageAlt(selectedSpeciesImageIndex)" loading="lazy" />
                            <span>{{ t('clickToZoom') }}</span>
                        </button>
                        <div class="thumb-row">
                            <button
                                v-for="(image, index) in currentSpeciesImages"
                                :key="`${currentSpecies.slug}-${index}`"
                                type="button"
                                class="thumb-button"
                                :class="{ 'is-active': index === selectedSpeciesImageIndex }"
                                @click="selectSpeciesImage(index)"
                            >
                                <img :src="image.thumb" :alt="speciesImageAlt(index)" loading="lazy" />
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="relatedSpecies.length > 0" class="related-block">
                    <div class="section-heading">
                        <div>
                            <p class="eyebrow">{{ t('relatedEyebrow') }}</p>
                            <h2>{{ t('relatedTitle') }}</h2>
                        </div>
                    </div>
                    <div class="card-grid card-grid--compact">
                        <article v-for="item in relatedSpecies" :key="item.slug" class="species-card">
                            <img :src="item.thumb" :alt="localizedText(item.name)" loading="lazy" />
                            <div class="species-card__body">
                                <h3>{{ localizedText(item.name) }}</h3>
                                <p class="latin">{{ item.name_latin }}</p>
                                <a :href="`/species/${item.slug}/`">{{ t('detailLink') }}</a>
                            </div>
                        </article>
                    </div>
                </div>

                <div class="pager">
                    <a v-if="previousSpecies" :href="`/species/${previousSpecies.slug}/`">← {{ localizedText(previousSpecies.name) }}</a>
                    <span v-else>{{ t('firstInGenus') }}</span>
                    <a v-if="nextSpecies" :href="`/species/${nextSpecies.slug}/`">{{ localizedText(nextSpecies.name) }} →</a>
                    <span v-else>{{ t('lastInGenus') }}</span>
                </div>
            </section>

            <section v-if="page.kind === 'search'" class="section">
                <p class="eyebrow">{{ t('searchEyebrow') }}</p>
                <h1>{{ t('searchTitle') }}</h1>
                <p class="lead">{{ t('searchLead') }}</p>
                <label class="search-box">
                    <span>{{ t('searchKeyword') }}</span>
                    <input v-model="searchQuery" type="search" :placeholder="t('searchPlaceholder')" />
                </label>
                <p v-if="searchError" class="error-text">{{ searchError }}</p>
                <div class="search-result-meta">
                    <span>{{ filteredSearchResults.length }} {{ t('resultCount') }}</span>
                    <span>{{ t('searchTargets') }}</span>
                </div>
                <div class="card-grid">
                    <article v-for="item in filteredSearchResults" :key="item.slug" class="species-card">
                        <img :src="item.thumb" :alt="localizedText(item.name)" loading="lazy" />
                        <div class="species-card__body">
                            <p class="chip">{{ taxonomyLabel(item.family_group, item.genus) }}</p>
                            <h3>{{ localizedText(item.name) }}</h3>
                            <p class="latin">{{ item.name_latin }}</p>
                            <a :href="item.href">{{ t('detailLink') }}</a>
                        </div>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'gallery'" class="section">
                <p class="eyebrow">{{ t('galleryEyebrow') }}</p>
                <h1>{{ t('galleryTitle') }}</h1>
                <p class="lead">{{ t('galleryLead') }}</p>
                <div v-if="galleryPrimaryFilters.length > 0" class="filter-row">
                    <button
                        v-for="filter in galleryPrimaryFilters"
                        :key="filter.key"
                        type="button"
                        class="filter-chip"
                        :class="{ 'is-active': selectedGalleryFilters.includes(filter.key) }"
                        @click="toggleGalleryFilter(filter.key)"
                    >
                        {{ filter.label }}
                    </button>
                </div>
                <div v-if="galleryGenusOptions.length > 0" class="gallery-select-row">
                    <label class="gallery-select">
                        <span>{{ detailedFilterLabel() }}</span>
                        <select v-model="selectedGalleryGenusPrimary">
                            <option value="">{{ allGenusLabel() }}</option>
                            <option v-for="genus in galleryGenusOptions" :key="genus.key" :value="genus.key">
                                {{ genus.label }}
                            </option>
                        </select>
                    </label>
                    <label v-if="galleryGenusOptions.length > 1" class="gallery-select">
                        <span>{{ detailedFilterSecondaryLabel() }}</span>
                        <select v-model="selectedGalleryGenusSecondary">
                            <option value="">{{ allGenusLabel() }}</option>
                            <option v-for="genus in genusOptionsForSecondary()" :key="genus.key" :value="genus.key">
                                {{ genus.label }}
                            </option>
                        </select>
                    </label>
                </div>
                <div class="gallery-grid gallery-grid--wide">
                    <article v-for="entry in filteredGalleryEntries" :key="entry.id" class="gallery-card">
                        <button type="button" class="gallery-button" @click="openLightbox(entry.images.large, localizedText(entry.title))">
                            <img :src="entry.images.medium" :alt="localizedText(entry.title)" loading="lazy" />
                        </button>
                        <div class="gallery-card__body">
                            <div v-if="galleryEntryChips(entry).length" class="tag-row">
                                <span v-for="tag in galleryEntryChips(entry)" :key="tag" class="chip">{{ tag }}</span>
                            </div>
                            <h3>{{ localizedText(entry.title) }}</h3>
                            <p>{{ localizedText(entry.caption) }}</p>
                            <p>{{ localizedText(entry.location) }}</p>
                            <p v-if="galleryCredit(entry)">
                                {{ photoCreditLabel() }}:
                                <a v-if="galleryCreditUrl(entry)" :href="galleryCreditUrl(entry)" target="_blank" rel="noreferrer">
                                    {{ galleryCredit(entry) }}
                                </a>
                                <template v-else>{{ galleryCredit(entry) }}</template>
                            </p>
                            <a :href="entry.species_href">{{ t('detailLink') }}</a>
                        </div>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'info'" class="section">
                <h1>{{ localizedText(currentInfoTitle) }}</h1>
                <p v-if="currentInfoLead" class="lead">{{ localizedText(currentInfoLead) }}</p>
                <div v-if="currentFaqItems.length > 0" class="faq-list">
                    <article v-for="(item, index) in currentFaqItems" :key="index" class="faq-item">
                        <h2 class="faq-question">Q{{ index + 1 }}. {{ localizedText(item.question) }}</h2>
                        <p
                            v-for="(answerParagraph, answerIndex) in item.answer"
                            :key="`${index}-${answerIndex}`"
                            class="lead"
                        >
                            {{ localizedText(answerParagraph) }}
                        </p>
                    </article>
                </div>
                <div v-if="currentInfoBody.length > 0" class="info-copy">
                    <p
                        v-for="(paragraph, index) in currentInfoBody"
                        :key="index"
                        class="lead"
                        :class="{ 'lead--preline': localizedText(paragraph).includes('\n') }"
                    >
                        {{ localizedText(paragraph) }}
                    </p>
                </div>
            </section>
        </main>

        <footer class="site-footer">
            <p>{{ t('footer') }}</p>
            <nav class="footer-links" aria-label="Footer links">
                <a href="/privacy/">{{ t('footerPrivacy') }}</a>
                <a href="/contact/">{{ t('footerContact') }}</a>
                <a href="/faq/">{{ t('footerFaq') }}</a>
            </nav>
        </footer>

        <LightboxModalI18n :image="lightboxImage" :close-label="t('close')" @close="closeLightbox" />
    </div>
</template>
