<template>

  <!-- 背景ラッパー -->
  <div class="bgWrap">

    <div class="welcome-mobile">

      <p class="loading-msg" :class="{ hidden: loaded }">
        端末に合わせて環境を準備中...
      </p>

      <h1>BOOM INSECTの箱庭</h1>
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

  </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceMode } from '../composables/useDeviceMode'

const { mode, isMobile, enableLiteMode } = useDeviceMode()

const loaded = ref(false)
const showLiteButton = ref(false)

onMounted(() => {
  setTimeout(() => loaded.value = true, 2000)

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

/* ===== 背景 ===== */
.bgWrap{
  min-height: 100vh;
  background: url('/images/wallpaper.png') center top / cover no-repeat;
  position: relative;
}

.bgWrap::before{
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.25);
  pointer-events: none;
}

/* ===== 中身 ===== */
.welcome-mobile{
  position: relative;
  max-width: 640px;
  margin: 0 auto;
  padding: 60px 16px;
  text-align: center;
}

.loading-msg {
  transition: opacity 0.5s ease;
}
.loading-msg.hidden {
  opacity: 0;
  pointer-events: none;
}

.lite-toggle-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  padding: 8px 14px;
  background-color: #ff5555;
  color: white;
  border: none;
  border-radius: 6px;
  z-index: 1000;
}
.lite-toggle-btn:hover {
  background-color: #ff3333;
}

h1{
  font-size: 28px;
  margin-bottom: 8px;
}

p{
  font-size: 14px;
  color: #555;
}

</style>