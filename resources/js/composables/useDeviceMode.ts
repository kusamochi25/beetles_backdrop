import { ref, computed } from 'vue'

export function useDeviceMode() {
  const isMobile = ref(false)
  const isLiteMode = ref(false)
  const autoLiteEnabled = ref(true)
  const loadStart = performance.now()

  // 画面サイズ or UA からモバイル判定
  function detectDevice() {
    if (window.innerWidth < 768 || /Mobile|Android|iPhone/i.test(navigator.userAgent)) {
      isMobile.value = true
    } else {
      isMobile.value = false
    }
  }

  // 軽量版へ切り替え
  function enableLiteMode(auto = false) {
    isLiteMode.value = true
    localStorage.setItem('liteMode', auto ? 'auto' : 'true')
  }

  //軽量モードOFF
  function disableLiteMode() {
    isLiteMode.value = false
    localStorage.removeItem('liteMode')
  }

  //自動切替オプトアウト
  function disableAutoLite() {
    autoLiteEnabled.value = false
    localStorage.setItem('disableAutoLite', 'true')
  }

  // 設定を復元
  function restoreSettings() {
    const lite = localStorage.getItem('liteMode')
    const disableAuto = localStorage.getItem('disableAutoLite') === 'true'

    if (lite === 'true' || lite === 'auto') {
      isLiteMode.value = true
    }
    if (disableAuto) {
      autoLiteEnabled.value = false
    }
  }

  //自動判定
  function autoDetectLiteMode() {
    //ページロード後に実行
    window.addEventListener('load', () => {
      if (!isMobile.value)
        return // PCは無視。
      const loadTime = performance.now() - loadStart
      if (loadTime > 5000 && !isLiteMode.value) {
        console.log('Load time is ${Math.round(loadTime)}ms. Changed Lite Mode because it takes over 5 seconds to load')
        enableLiteMode(true)
        window.location.reload()
      }
    })
  }

  // 初期化
  detectDevice()
  restoreSettings()
  autoDetectLiteMode()

  const mode = computed(() => {
    if (!isMobile.value) return 'pc'
    if (isLiteMode.value) return 'lite'
    return 'mobile'
  })

  return {
    mode,
    isMobile,
    isLiteMode,
    autoLiteEnabled,
    enableLiteMode,
    disableLiteMode,
    disableAutoLite}
}