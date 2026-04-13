<script setup lang="ts">
import type { SpeciesSummary } from '../types';

defineProps<{
    item: SpeciesSummary;
    tag: string;
    bodyMode: 'description' | 'region';
}>();
</script>

<template>
    <article class="species-card">
        <img :src="item.images.thumb" :alt="item.name_ja" loading="lazy" />
        <div class="species-card__body">
            <p class="chip">{{ tag }}</p>
            <h3>{{ item.name_ja }}</h3>
            <p class="latin">{{ item.name_latin }}</p>
            <p v-if="bodyMode === 'description'" class="clamp">{{ item.description }}</p>
            <p v-else>{{ item.region.join(' / ') }}</p>
            <a :href="`/species/${item.slug}/`">詳細を見る</a>
        </div>
    </article>
</template>
