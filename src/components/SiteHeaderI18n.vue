<script setup lang="ts">
import { localeLabels } from '../i18n';
import { supportedLocales, type Locale } from '../types';

defineProps<{
    currentLanguage: Locale;
    eyebrow: string;
    brand: string;
    navSearch: string;
    navList: string;
    navGallery: string;
}>();

defineEmits<{
    languageChange: [value: Locale];
}>();
</script>

<template>
    <header class="site-header">
        <a href="/" class="site-brand">
            <span class="site-brand__eyebrow">{{ eyebrow }}</span>
            <strong>{{ brand }}</strong>
        </a>
        <div class="site-header__actions">
            <div class="language-tabs" aria-label="Language switcher">
                <button
                    v-for="locale in supportedLocales"
                    :key="locale"
                    type="button"
                    class="language-tabs__button"
                    :class="{ 'is-active': currentLanguage === locale }"
                    @click="$emit('languageChange', locale)"
                >
                    {{ localeLabels[locale] }}
                </button>
            </div>
            <nav class="site-nav">
                <a href="/search/">{{ navSearch }}</a>
                <a href="/groups/kabutomushi/">{{ navList }}</a>
                <a href="/gallery/">{{ navGallery }}</a>
            </nav>
        </div>
    </header>
</template>
