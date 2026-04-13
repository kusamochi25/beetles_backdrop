<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import LightboxModal from './components/LightboxModal.vue';
import SiteHeader from './components/SiteHeader.vue';
import SpeciesCard from './components/SpeciesCard.vue';
import type { GalleryEntry, PageData, SearchItem, SpeciesSummary } from './types';

const props = defineProps<{ pageData: PageData }>();

const page = computed(() => props.pageData);
const searchQuery = ref('');
const searchItems = ref<SearchItem[]>([]);
const searchLoaded = ref(false);
const searchError = ref('');
const visibleCount = ref(20);
const lightboxImage = ref<{ src: string; alt: string } | null>(null);

const groupLabelMap: Record<string, string> = {
    kabutomushi: 'カブトムシ',
    kuwagata: 'クワガタムシ',
    kanabun: 'カナブン',
    others: 'その他',
};

const speciesList = computed(() => {
    if (page.value.kind === 'group' || page.value.kind === 'genus') {
        return (page.value.species as SpeciesSummary[]) ?? [];
    }

    return [];
});

const filteredSearchResults = computed(() => {
    const normalized = searchQuery.value.trim().toLowerCase();

    if (!normalized) {
        return searchItems.value.slice(0, 20);
    }

    return searchItems.value
        .filter((item) => {
            const haystacks = [item.name_latin, item.name_ja, item.genus, ...(item.aliases ?? [])].map((entry) =>
                entry.toLowerCase(),
            );

            return haystacks.some((entry) => entry.includes(normalized));
        })
        .slice(0, 50);
});

const visibleSpecies = computed(() => speciesList.value.slice(0, visibleCount.value));
const homeGroups = computed(() => (page.value.groups as Array<Record<string, unknown>>) ?? []);
const homeFeatured = computed(() => (page.value.featuredSpecies as SpeciesSummary[]) ?? []);
const galleryEntries = computed(() => (page.value.entries as GalleryEntry[]) ?? []);
const relatedSpecies = computed(() => (page.value.relatedSpecies as Array<Record<string, unknown>>) ?? []);

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
    } catch (error) {
        searchError.value =
            error instanceof Error ? error.message : '検索インデックスの読み込みに失敗しました。';
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
                    <p class="eyebrow">低コスト公開を前提にした最小構成</p>
                    <h1>JSON とビルド生成で公開する静的な昆虫図鑑</h1>
                    <p class="lead">
                        サーバー側検索や DB を使わず、Cloudflare Pages に載せやすい形でトップ、
                        一覧、属、種詳細、写真集までを確認できるベース実装です。
                    </p>
                    <div class="hero-actions">
                        <a class="button button--primary" href="/groups/kabutomushi/">分類から見る</a>
                        <a class="button" href="/search/">検索する</a>
                    </div>
                </div>
                <div class="hero-stats">
                    <div class="stat-card">
                        <span>掲載種</span>
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
                        <h2>4 グループの入口</h2>
                    </div>
                    <a href="/search/" class="text-link">検索ページへ</a>
                </div>
                <div class="group-grid">
                    <article v-for="group in homeGroups" :key="String(group.slug)" class="group-card">
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
                        <h2>サンプル種詳細</h2>
                    </div>
                </div>
                <div class="card-grid">
                    <SpeciesCard
                        v-for="item in homeFeatured"
                        :key="item.slug"
                        :item="item"
                        :tag="groupLabelMap[item.family_group]"
                        body-mode="description"
                    />
                </div>
            </section>

            <section v-if="page.kind === 'home'" class="section">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">みんなの写真集</p>
                        <h2>ギャラリーのサンプル</h2>
                    </div>
                    <a href="/gallery/" class="text-link">写真集を見る</a>
                </div>
                <div class="gallery-grid">
                    <article v-for="entry in page.latestGallery" :key="entry.id" class="gallery-card">
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
                <h1>{{ page.group?.label }} 一覧</h1>
                <p class="lead">{{ page.group?.description }}</p>
                <div class="inline-actions">
                    <a class="button button--primary" :href="`/search/?q=${page.group?.label}`">
                        この分類を検索
                    </a>
                    <a class="button" href="/search/">検索ページへ</a>
                </div>
                <p class="section-note">最初の 20 件を表示し、多い場合は段階表示で拡張できます。</p>
                <div class="card-grid">
                    <SpeciesCard
                        v-for="item in visibleSpecies"
                        :key="item.slug"
                        :item="item"
                        :tag="`${item.genus} 属`"
                        body-mode="region"
                    />
                </div>
                <button
                    v-if="speciesList.length > visibleCount"
                    class="button"
                    type="button"
                    @click="visibleCount += 20"
                >
                    もっと見る
                </button>
            </section>

            <section v-if="page.kind === 'genus'" class="section">
                <p class="eyebrow">属ページ</p>
                <h1>{{ page.genus?.name }} 属</h1>
                <p class="lead">属内の種を学名順に並べています。属内の前後リンクを後から増やしやすい構成です。</p>
                <div class="card-grid">
                    <SpeciesCard
                        v-for="item in speciesList"
                        :key="item.slug"
                        :item="item"
                        :tag="groupLabelMap[item.family_group]"
                        body-mode="description"
                    />
                </div>
            </section>

            <section v-if="page.kind === 'species'" class="section section--detail">
                <div class="detail-grid">
                    <div>
                        <p class="eyebrow">種詳細</p>
                        <h1>{{ page.species?.name_ja }}</h1>
                        <p class="latin latin--large">{{ page.species?.name_latin }}</p>
                        <p class="lead">{{ page.species?.description }}</p>
                        <dl class="meta-list">
                            <div>
                                <dt>属</dt>
                                <dd><a :href="String(page.genusHref)">{{ page.species?.genus }}</a></dd>
                            </div>
                            <div>
                                <dt>分類</dt>
                                <dd>{{ groupLabelMap[String(page.species?.family_group)] }}</dd>
                            </div>
                            <div>
                                <dt>分布</dt>
                                <dd>{{ page.species?.region?.join(' / ') }}</dd>
                            </div>
                        </dl>
                    </div>
                    <div class="detail-visuals">
                        <button
                            type="button"
                            class="image-button"
                            @click="openLightbox(page.species.images.large, page.species.name_ja)"
                        >
                            <img :src="page.species.images.medium" :alt="page.species.name_ja" loading="lazy" />
                            <span>クリックで拡大</span>
                        </button>
                        <div class="thumb-row">
                            <button
                                type="button"
                                class="thumb-button"
                                @click="openLightbox(page.species.images.large, page.species.name_ja)"
                            >
                                <img :src="page.species.images.thumb" :alt="page.species.name_ja" loading="lazy" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="related-block">
                    <div class="section-heading">
                        <div>
                            <p class="eyebrow">関連種</p>
                            <h2>近い導線のサンプル</h2>
                        </div>
                    </div>
                    <div class="card-grid card-grid--compact">
                        <article v-for="item in relatedSpecies" :key="String(item.slug)" class="species-card">
                            <img :src="String(item.thumb)" :alt="String(item.name_ja)" loading="lazy" />
                            <div class="species-card__body">
                                <h3>{{ item.name_ja }}</h3>
                                <p class="latin">{{ item.name_latin }}</p>
                                <a :href="`/species/${item.slug}/`">詳細を見る</a>
                            </div>
                        </article>
                    </div>
                </div>

                <div class="pager">
                    <a v-if="page.previous" :href="`/species/${page.previous.slug}/`">← {{ page.previous.name_ja }}</a>
                    <span v-else>この属で最初の種です</span>
                    <a v-if="page.next" :href="`/species/${page.next.slug}/`">{{ page.next.name_ja }} →</a>
                    <span v-else>この属で最後の種です</span>
                </div>
            </section>

            <section v-if="page.kind === 'search'" class="section">
                <p class="eyebrow">検索ページ</p>
                <h1>フロントエンド検索</h1>
                <p class="lead">
                    `search-index.json` を読み込み、学名・和名・属名・別名に対してブラウザだけで検索します。
                </p>
                <label class="search-box">
                    <span>キーワード</span>
                    <input
                        v-model="searchQuery"
                        type="search"
                        placeholder="例: dynastes, ヘラクレス, ジュエルカナブン"
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
                            <p>{{ groupLabelMap[item.family_group] }}</p>
                            <a :href="item.href">詳細を見る</a>
                        </div>
                    </article>
                </div>
            </section>

            <section v-if="page.kind === 'gallery'" class="section">
                <p class="eyebrow">みんなの写真集</p>
                <h1>公開用画像を別管理するギャラリー</h1>
                <p class="lead">種詳細データとは分けて gallery JSON を持ち、あとから投稿導線や外部ストレージへ差し替えやすくしています。</p>
                <div class="gallery-grid gallery-grid--wide">
                    <article v-for="entry in galleryEntries" :key="String(entry.id)" class="gallery-card">
                        <button
                            type="button"
                            class="gallery-button"
                            @click="openLightbox(String(entry.images.large), String(entry.title))"
                        >
                            <img :src="String(entry.images.medium)" :alt="String(entry.title)" loading="lazy" />
                        </button>
                        <div class="gallery-card__body">
                            <h3>{{ entry.title }}</h3>
                            <p>{{ entry.caption }}</p>
                            <p>{{ entry.location }} / {{ entry.photographer }}</p>
                            <a :href="String(entry.species_href)">種詳細を見る</a>
                        </div>
                    </article>
                </div>
            </section>
        </main>

        <footer class="site-footer">
            <p>静的構成 / JSON 管理 / Cloudflare Pages を想定した最小実装</p>
        </footer>

        <LightboxModal :image="lightboxImage" @close="closeLightbox" />
    </div>
</template>
