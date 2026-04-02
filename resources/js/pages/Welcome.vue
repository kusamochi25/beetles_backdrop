<script setup lang="ts">
import { computed } from 'vue'
import WelcomePC from './WelcomePC.vue'
import WelcomeMobile from './WelcomeMobile.vue'
import WelcomeMobileLite from './WelcomeMobileLite.vue'
import { useDeviceMode } from '../composables/useDeviceMode'

const { mode } = useDeviceMode()

const currentComponent = computed(() => {
  if (mode.value === 'pc') return WelcomePC
  if (mode.value === 'lite') return WelcomeMobileLite
  return WelcomeMobile
})
</script>

<template>
  <component :is="currentComponent" />
</template>