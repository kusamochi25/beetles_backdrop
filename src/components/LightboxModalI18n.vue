<script setup lang="ts">
defineProps<{
    image: { src: string; alt: string } | null;
    closeLabel: string;
}>();

defineEmits<{
    close: [];
}>();
</script>

<template>
    <div v-if="image" class="lightbox" role="dialog" aria-modal="true" @click.self="$emit('close')">
        <button type="button" class="lightbox__close" @click="$emit('close')">{{ closeLabel }}</button>
        <img :src="image.src" :alt="image.alt" />
    </div>
</template>
