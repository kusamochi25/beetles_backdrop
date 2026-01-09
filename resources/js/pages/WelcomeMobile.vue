<template>
  <div class="welcome-mobile">
    <p class="loading-msg" :class="{ hidden: loaded }">端末に合わせて環境を準備中...</p>
    <h1>BOOM INSECTの箱庭（Mobile）</h1>
    <p>モバイル用コンテンツや画像などをここに表示</p>

    <!-- Liteモード切替ボタン -->
    <button
      v-if="showLiteButton"
      @click="handleEnableLite"
      class="lite-toggle-btn"
    >
      🐢Liteモードに切り替え
    </button>

    <p v-if="mode === 'lite'">軽量モードで表示中</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceMode } from '../composables/useDeviceMode'

const { mode, isMobile, enableLiteMode } = useDeviceMode()

const loaded = ref(false)
const showLiteButton = ref(false)

onMounted(() => {
  // 読み込みメッセージフェードアウト
  setTimeout(() => loaded.value = true, 2000)

  // モバイルなら Lite ボタンを少し遅れて表示
  if (isMobile.value) {
    setTimeout(() => showLiteButton.value = true, 1000)
  }
})

const handleEnableLite = () => {
  enableLiteMode()
  window.location.reload()
}
</script>

<style scoped>
.welcome-mobile {
  text-align: center;
  margin-top: 30px;
  position: relative;
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

.lite-toggle-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  background-color: #ff5555;
  color: white;
  border: none;
  border-radius: 4px;
  z-index: 1000;
}
.lite-toggle-btn:hover {
  background-color: #ff3333;
}
</style>