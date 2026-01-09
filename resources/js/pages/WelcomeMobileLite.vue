<template>
  <div class="welcome-mobile-lite">
    <p class="loading-msg" :class="{ hidden: loaded }">端末に合わせて環境を準備中...</p>
    <h1>BOOM INSECTの箱庭（Lite）</h1>
    <p>軽量モード専用の表示（画像やスクリプトを最小化）</p>
        <!-- 通常モバイルに戻すボタン -->
    <button
      class="mobile-back-btn"
      @click="handleBackToMobile"
    >
      🐰通常モバイル版に戻す
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceMode } from '../composables/useDeviceMode'

const { isLiteMode } = useDeviceMode()
const loaded = ref(false)

onMounted(() => {
  setTimeout(() => loaded.value = true, 2000)
})

// 通常モバイル版に戻す
const handleBackToMobile = () => {
  // Liteモード解除
  localStorage.removeItem('liteMode')
  isLiteMode.value = false

  // ページ再描画
  window.location.reload()
}
</script>

<style scoped>
.welcome-mobile-lite {
  text-align: center;
  margin-top: 30px;
}
.loading-msg {
  transition: opacity 0.5s ease;
  user-select: text;
}
.loading-msg.hidden {
  opacity: 0;
  pointer-events: none;
  user-select: none;
}
/* 戻すボタン */
.mobile-back-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  background-color: #5555ff;
  color: white;
  border: none;
  border-radius: 4px;
  z-index: 1000;
}
.mobile-back-btn:hover {
  background-color: #3333ff;
}
</style>