<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import LightboxModal from './components/LightboxModal.vue';
import SiteHeader from './components/SiteHeader.vue';
import SpeciesCard from './components/SpeciesCard.vue';
import type { GalleryEntry, PageData, SearchItem, SpeciesSummary } from './types';

type GroupSummary = {
    slug: string;
    label: string;
    description: string;
    count: number;
};

type SpeciesDetail = SpeciesSummary & {
    aliases?: string[];
};

type NeighborLink = {
    slug: string;
    name_ja: string;
    name_latin: string;
};

type RelatedSpeciesCard = {
    slug: string;
    name_ja: string;
    name_latin: string;
    thumb: string;
};

const props = defineProps<{ pageData: PageData }>();

const groupLabelMap: Record<string, string> = {
    kabutomushi: 'カブトムシ',
    kuwagata: 'クワガタムシ',
    koganemushi: 'コガネムシ',
    others: 'その他',
};

const searchQuery = ref('');
const searchItems = ref<SearchItem[]>([]);
const searchLoaded = ref(false);
const searchError = ref('');
const visibleCount = ref(20);
const lightboxImage = ref<{ src: string; alt: string } | null>(null);

const page = computed(() => props.pageData);
const speciesList = computed(() => ((page.value.species as SpeciesSummary[]) ?? []));
const homeGroups = computed(() => ((page.value.groups as GroupSummary[]) ?? []));
const homeFeatured = computed(() => ((page.value.featuredSpecies as SpeciesSummary[]) ?? []));
const galleryEntries = computed(() => ((page.value.entries as GalleryEntry[]) ?? []));
const latestGallery = computed(() => ((page.value.latestGallery as Array<GalleryEntry & { species_name: string }>) ?? []));
const relatedSpecies = computed(() => ((page.value.relatedSpecies as RelatedSpeciesCard[]) ?? []));
const currentSpecies = computed(() => (page.value.species as SpeciesDetail | undefined));
const currentGroup = computed(() => (page.value.group as GroupSummary | undefined));
const currentGenus = computed(() => (page.value.genus as { name: string; count: number } | undefined));
const previousSpecies = computed(() => (page.value.previous as NeighborLink | null | undefined));
const nextSpecies = computed(() => (page.value.next as NeighborLink | null | undefined));

const filteredSearchResults = computed(() => {
    const normalized = searchQuery.value.trim().toLowerCase();

    if (!normalized) {
        return searchItems.value.slice(0, 20);
    }

    return searchItems.value
        .filter((item) => {
            const fields = [item.name_latin, item.name_ja, item.genus, ...(item.aliases ?? [])].map((entry) =>
                entry.toLowerCase(),
            );
            return fields.some((entry) => entry.includes(normalized));
        })
        .slice(0, 50);
});

const visibleSpecies = computed(() => speciesList.value.slice(0, visibleCount.value));

function groupLabel(group: string) {
    return groupLabelMap[group] ?? group;
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
        searchError.value = error instanceof Error ? error.message : '検索インデックスの読み込みに失敗しました。';
    }
}

onMounted(() => {
    document.title = page.value.meta.title;

    if (page.value.kind === 'search') {
        const currentQuery = new URLSearchParams(window.location.search).get('q');
        searchQuery.value = currentQuery ?? '';
        void loadSearchIndex();
    }
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
</script>

<template>
    <div class="site-shell">
        <SiteHeader />

        <main class="site-main">
            <section v-if="page.kind === 'home'" class="hero">
                <div>
                    <p class="eyebrow">Static Insect Atlas</p>
                    <h1>JSON とビルド生成で公開する静的な昆虫図鑑</h1>
                    <p class="lead">
                        サーバー側検索やDBを使わず、Cloudflare Pages にそのまま配置できる最小構成です。
                        一覧、検索、詳細表示、写真集までを確認できるサンプルとして組んでいます。
                    </p>
                    <div class="hero-actions">
                        <a class="button button--primary" href="/groups/kabutomushi/">分類から見る</a>
                        <a class="button" href="/search/">検索する</a>
                    </div>
                </div>
                <div class="hero-stats">
                    <div class="stat-card">
                        <span>掲載種数</span>
                        <strong>{{ page.stats?.speciesCount }}</strong>
                    </div>
                    <div class="stat-card">
                        <span>属ページ</span>
                        <strong>{{ page.stats?.genusCount }}</strong>
                    </div>
                    <div class="stat-card">
                        <span>写真</span>
                        <strong>{{ page.stats?.galleryCount }}</strong>
                    </div>
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">分類一覧</p>
                        <h2>4つのグループ</h2>
                    </div>
                    <a class="text-link" href="/search/">検索ページへ</a>
                </div>
                <div class="group-grid">
                    <article v-for="group in homeGroups" :key="group.slug" class="group-card">
                        <p class="group-card__count">{{ group.count }} 種</p>
                        <h3>{{ group.label }}</h3>
                        <p>{{ group.description }}</p>
                        <a :href="`/groups/${group.slug}/`">一覧を見る</a>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">注目種</p>
                        <h2>サンプル種</h2>
                    </div>
                </div>
                <div class="card-grid">
                    <SpeciesCard
                        v-for="item in homeFeatured"
                        :key="item.slug"
                        :item="item"
                        :tag="groupLabel(item.family_group)"
                        body-mode="description"
                    />
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">みんなの写真</p>
                        <h2>ギャラリーのサンプル</h2>
                    </div>
                    <a class="text-link" href="/gallery/">写真集を見る</a>
                </div>
                <div class="gallery-grid">
                    <article v-for="entry in latestGallery" :key="entry.id" class="gallery-card">
                        <img :src="entry.images.thumb" :alt="entry.title" loading="lazy" />
                        <div class="gallery-card__body">
                            <h3>{{ entry.title }}</h3>
                            <p>{{ entry.species_name }} / {{ entry.location }}</p>
                        </div>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'group'" class="section">
                <p class="eyebrow">分類一覧</p>
                <h1>{{ currentGroup?.label }} 一覧</h1>
                <p class="lead">{{ currentGroup?.description }}</p>
                <div class="inline-actions">
                    <a class="button button--primary" :href="`/search/?q=${currentGroup?.label ?? ''}`">この分類を検索</a>
                    <a class="button" href="/search/">検索ページへ</a>
                </div>
                <p class="section-note">最初は20件表示し、多い場合だけ段階的に続きを表示します。</p>
                <div class="card-grid">
                    <SpeciesCard
                        v-for="item in visibleSpecies"
                        :key="item.slug"
                        :item="item"
                        :tag="`${item.genus} 属`"
                        body-mode="region"
                    />
                </div>
                <button v-if="speciesList.length > visibleCount" class="button" type="button" @click="visibleCount += 20">
                    もっと見る
                </button>
            </section>

            <section v-if="page.kind === 'genus'" class="section">
                <p class="eyebrow">属ページ</p>
                <h1>{{ currentGenus?.name }} 属</h1>
                <p class="lead">同じ属に属する種をまとめて確認できます。学名ベースの導線で前後ページにもつなぎやすい構成です。</p>
                <div class="card-grid">
                    <SpeciesCard
                        v-for="item in speciesList"
                        :key="item.slug"
                        :item="item"
                        :tag="groupLabel(item.family_group)"
                        body-mode="description"
                    />
                </div>
            </section>

            <section v-if="page.kind === 'species' && currentSpecies" class="section section--detail">
                <div class="detail-grid">
                    <div>
                        <p class="eyebrow">種詳細</p>
                        <h1>{{ currentSpecies.name_ja }}</h1>
                        <p class="latin latin--large">{{ currentSpecies.name_latin }}</p>
                        <p class="lead">{{ currentSpecies.description }}</p>
                        <dl class="meta-list">
                            <div>
                                <dt>属</dt>
                                <dd><a :href="String(page.genusHref)">{{ currentSpecies.genus }}</a></dd>
                            </div>
                            <div>
                                <dt>分類</dt>
                                <dd>{{ groupLabel(currentSpecies.family_group) }}</dd>
                            </div>
                            <div>
                                <dt>分布</dt>
                                <dd>{{ currentSpecies.region.join(' / ') }}</dd>
                            </div>
                        </dl>
                    </div>
                    <div class="detail-visuals">
                        <button
                            type="button"
                            class="image-button"
                            @click="openLightbox(currentSpecies.images.large, currentSpecies.name_ja)"
                        >
                            <img :src="currentSpecies.images.medium" :alt="currentSpecies.name_ja" loading="lazy" />
                            <span>クリックで拡大</span>
                        </button>
                        <div class="thumb-row">
                            <button
                                type="button"
                                class="thumb-button"
                                @click="openLightbox(currentSpecies.images.large, currentSpecies.name_ja)"
                            >
                                <img :src="currentSpecies.images.thumb" :alt="currentSpecies.name_ja" loading="lazy" />
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="relatedSpecies.length > 0" class="related-block">
                    <div class="section-heading">
                        <div>
                            <p class="eyebrow">関連種</p>
                            <h2>同じ属のサンプル</h2>
                        </div>
                    </div>
                    <div class="card-grid card-grid--compact">
                        <article v-for="item in relatedSpecies" :key="item.slug" class="species-card">
                            <img :src="item.thumb" :alt="item.name_ja" loading="lazy" />
                            <div class="species-card__body">
                                <h3>{{ item.name_ja }}</h3>
                                <p class="latin">{{ item.name_latin }}</p>
                                <a :href="`/species/${item.slug}/`">詳細を見る</a>
                            </div>
                        </article>
                    </div>
                </div>

                <div class="pager">
                    <a v-if="previousSpecies" :href="`/species/${previousSpecies.slug}/`">← {{ previousSpecies.name_ja }}</a>
                    <span v-else>この属で最初の種です</span>
                    <a v-if="nextSpecies" :href="`/species/${nextSpecies.slug}/`">{{ nextSpecies.name_ja }} →</a>
                    <span v-else>この属で最後の種です</span>
                </div>
            </section>

            <section v-if="page.kind === 'search'" class="section">
                <p class="eyebrow">検索ページ</p>
                <h1>フロント検索</h1>
                <p class="lead">
                    `search-index.json` をブラウザだけで読み込み、学名、和名、属名、aliases を対象に検索します。
                </p>
                <label class="search-box">
                    <span>キーワード</span>
                    <input
                        v-model="searchQuery"
                        type="search"
                        placeholder="例: dynastes, ヘラクレス, カナブン"
                    />
                </label>
                <p v-if="searchError" class="error-text">{{ searchError }}</p>
                <div class="search-result-meta">
                    <span>{{ filteredSearchResults.length }} 件表示</span>
                    <span>対象: 学名 / 和名 / 属名 / aliases</span>
                </div>
                <div class="card-grid">
                    <article v-for="item in filteredSearchResults" :key="item.slug" class="species-card">
                        <img :src="item.thumb" :alt="item.name_ja" loading="lazy" />
                        <div class="species-card__body">
                            <p class="chip">{{ item.genus }} 属</p>
                            <h3>{{ item.name_ja }}</h3>
                            <p class="latin">{{ item.name_latin }}</p>
                            <p>{{ groupLabel(item.family_group) }}</p>
                            <a :href="item.href">詳細を見る</a>
                        </div>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'gallery'" class="section">
                <p class="eyebrow">みんなの写真集</p>
                <h1>公開用画像を並べるギャラリー</h1>
                <p class="lead">ギャラリーJSONを別管理にしているので、将来的に写真だけを増やす運用にも広げやすい構成です。</p>
                <div class="gallery-grid gallery-grid--wide">
                    <article v-for="entry in galleryEntries" :key="entry.id" class="gallery-card">
                        <button
                            type="button"
                            class="gallery-button"
                            @click="openLightbox(entry.images.large, entry.title)"
                        >
                            <img :src="entry.images.medium" :alt="entry.title" loading="lazy" />
                        </button>
                        <div class="gallery-card__body">
                            <h3>{{ entry.title }}</h3>
                            <p>{{ entry.caption }}</p>
                            <p>{{ entry.location }} / {{ entry.photographer }}</p>
                            <a :href="entry.species_href">種詳細を見る</a>
                        </div>
                    </article>
                </div>
            </section>
        </main>

        <footer class="site-footer">
            <p>静的公開 / JSON 管理 / Cloudflare Pages を前提にした最小構成</p>
        </footer>

        <LightboxModal :image="lightboxImage" @close="closeLightbox" />
    </div>
</template>
