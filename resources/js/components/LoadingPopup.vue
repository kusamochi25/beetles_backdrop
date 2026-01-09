<template>
  <div class="loading-popup" :class="{ hidden: !visible }">
    <slot>読み込み中...</slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue'

const props = defineProps<{
  visible: boolean
}>()
</script>

<style scoped>
.loading-popup {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background-color: rgba(255,255,255,0.9);
  padding: 20px 0;
  text-align: center;
  transition: opacity 0.5s ease, visibility 0.5s ease;
  z-index: 1000;
}

.loading-popup.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
</style>