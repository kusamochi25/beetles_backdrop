<template>
  <!-- 背景ラッパー -->
  <div class="bgWrap">

    <!-- 共通ローディング -->
    <LoadingPopup :visible="!loaded">
      端末に合わせて環境を準備中...
    </LoadingPopup>

    <!-- 中央コンテンツ -->
    <div class="welcome-pc">

      <h1>BOOM INSECTの箱庭</h1>
      <p>世界中の甲虫たちに出会う図鑑サイト</p>

      <!-- ここから下にカードUIなどを追加していく -->

    </div>

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

/* ===== 背景 ===== */
.bgWrap{
  min-height: 100vh;
  background: url('/images/wallpaper.png') center top / cover no-repeat;
  position: relative;
}

/* 薄い白フィルター */
.bgWrap::before{
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.25);
  pointer-events: none;
}

/* ===== 中身 ===== */
.welcome-pc{
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 24px;
  text-align: center;
}

h1{
  font-size: 40px;
  margin-bottom: 12px;
}

p{
  font-size: 16px;
  color: #555;
}

</style>