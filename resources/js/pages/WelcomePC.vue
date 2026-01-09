<template>
  <div class="welcome-pc">
    <!-- 共通ローディングコンポーネント -->
    <LoadingPopup :visible="!loaded">
      端末に合わせて環境を準備中...
    </LoadingPopup>

    <!-- メインコンテンツ -->
    <h1>BOOM INSECTの箱庭（PC）</h1>
    <p>PC専用のコンテンツや画像などをここに表示</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadingPopup from '../components/LoadingPopup.vue'

const loaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    loaded.value = true
  }, 2000)
})
</script>

<style scoped>
.welcome-pc {
  text-align: center;
  margin-top: 50px;
  position: relative;
}
</style>