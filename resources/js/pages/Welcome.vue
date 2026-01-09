<template>
  <div>
    <!-- 動的に端末用コンポーネントを表示 -->
    <component :is="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceMode } from '../composables/useDeviceMode'

const { mode } = useDeviceMode()
const currentComponent = ref<any>(null)

onMounted(async () => {
  // 端末判定後に該当コンポーネントを動的 import
  if (mode.value === 'pc') {
    const module = await import('./WelcomePC.vue')
    currentComponent.value = module.default
  } else if (mode.value === 'lite') {
    const module = await import('./WelcomeMobileLite.vue')
    currentComponent.value = module.default
  } else {
    const module = await import('./WelcomeMobile.vue')
    currentComponent.value = module.default
  }
})
</script>