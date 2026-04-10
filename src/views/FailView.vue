<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const retry = () => router.push('/mall')
const goHome = () => router.push('/')
</script>

<template>
  <div class="fail-view-container container" style="padding-top: 160px; text-align: center;">
    <div class="fail-card glass-panel" style="max-width: 600px; margin: 0 auto; padding: 60px 40px;">
      <div class="fail-icon">❌</div>
      <h2 style="font-size: 2rem; margin-bottom: 10px; color: #ff6b6b;">결제에 실패했습니다</h2>
      <p style="opacity: 0.7; margin-bottom: 20px;">처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
      
      <div class="error-msg-box" style="background: rgba(255,107,107,0.1); padding: 20px; border-radius: 12px; margin-bottom: 40px; color: #ff6b6b;">
        <strong>오류 사유:</strong> {{ route.query.message || '알 수 없는 오류' }}<br/>
        <small>(코드: {{ route.query.code || 'UNKNOWN' }})</small>
      </div>

      <div class="button-group" style="display: flex; gap: 15px; justify-content: center;">
        <button class="primary-btn" style="background: #ff6b6b; color: white;" @click="retry">다시 시도하기</button>
        <button class="outline-btn" @click="goHome">홈으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fail-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}
</style>
