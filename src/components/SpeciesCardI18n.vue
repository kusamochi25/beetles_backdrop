<script setup lang="ts">
import { computed } from 'vue';
import { getLocalizedText } from '../i18n';
import type { ImageSet, Locale, SpeciesImage, SpeciesSummary } from '../types';

const props = defineProps<{
    item: SpeciesSummary;
    taxonomyLabel: string;
    bodyMode: 'description' | 'region';
    currentLanguage: Locale;
    detailLabel: string;
}>();

const localizedName = computed(() => getLocalizedText(props.item.name, props.currentLanguage));
const localizedDescription = computed(() => getLocalizedText(props.item.description, props.currentLanguage));
const localizedRegion = computed(() => getLocalizedText(props.item.region, props.currentLanguage));
const primaryImage = computed<ImageSet>(() => {
    const images = props.item.images as ImageSet | SpeciesImage[];

    if (Array.isArray(images)) {
        return images[0];
    }

    return images;
});
</script>

<template>
    <article class="species-card">
        <img :src="primaryImage.thumb" :alt="localizedName" loading="lazy" />
        <div class="species-card__body">
            <p class="chip">{{ taxonomyLabel }}</p>
            <h3>{{ localizedName }}</h3>
            <p class="latin">{{ item.name_latin }}</p>
            <p v-if="bodyMode === 'description'" class="clamp">{{ localizedDescription }}</p>
            <p v-else>{{ localizedRegion }}</p>
            <a :href="`/species/${item.slug}/`">{{ detailLabel }}</a>
        </div>
    </article>
</template>
