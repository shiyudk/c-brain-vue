<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { state, t } from '../store'
import emailjs from '@emailjs/browser'

const route = useRoute()
const router = useRouter()
const orderDetails = ref(null)
const isLoading = ref(true)
const emailStatus = ref('')

onMounted(async () => {
  const { orderId, paymentKey, amount } = route.query
  
  if (!orderId) {
    isLoading.ref = false
    return
  }

  try {
    // 1. Fetch order details from Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.replace('ORDER_', '')) // Assuming orderId was prefixed
        .single()
      
      // If not found by ID, try generic search or just use what we have
      if (data) {
        orderDetails.value = data
      }
    }

    // 2. Send Checkout Confirmation Email
    const templateParams = {
      order_id: orderId,
      product_name: orderDetails.value?.product_name || 'Brain Design 상품',
      amount: amount || orderDetails.value?.total_amount || 0,
      buyer_name: orderDetails.value?.buyer_name || '고객님',
      buyer_email: orderDetails.value?.user_email || '입력된 이메일',
      shipping_address: orderDetails.value?.shipping_address || '배송지 정보 없음',
      receiver_name: orderDetails.value?.receiver_name || '',
      time: new Date().toLocaleString(),
      title: '[Brain Design] 주문이 완료되었습니다.'
    }

    const targetEmail = orderDetails.value?.user_email || ''
    if (targetEmail) {
      emailStatus.value = '이메일 발송 중...'
      await emailjs.send('service_9dms7il', 'template_6umfzgp', {
        ...templateParams,
        to_email: targetEmail, // Ensure template has this field
        message: `주문이 성공적으로 완료되었습니다.\n상품명: ${templateParams.product_name}\n결제금액: ${templateParams.amount}원\n배송지: ${templateParams.shipping_address}`
      }, '5-NmkSe__nzMYraLo')
      emailStatus.value = '이메일 발송 완료'
    }

  } catch (err) {
    console.error('Success page error:', err)
    emailStatus.value = '이메일 발송 실패 (상세내역은 관리자에게 문의바랍니다)'
  } finally {
    isLoading.value = false
  }
})

const goHome = () => router.push('/')
const goToMyPage = () => router.push('/mypage')
</script>

<template>
  <div class="success-view-container container" style="padding-top: 160px; text-align: center;">
    <div class="success-card glass-panel" style="max-width: 600px; margin: 0 auto; padding: 60px 40px;">
      <div class="success-icon">🎉</div>
      <h2 style="font-size: 2rem; margin-bottom: 10px;">결제가 완료되었습니다!</h2>
      <p style="opacity: 0.7; margin-bottom: 40px;">주문해주셔서 감사합니다. 상세 내역은 입력하신 이메일로 발송되었습니다.</p>
      
      <div v-if="isLoading" class="loading-box">
        데이터를 처리 중입니다...
      </div>
      
      <div v-else class="order-summary-box" style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; margin-bottom: 40px; text-align: left;">
        <div class="summary-line"><span>주문번호:</span> <strong>{{ route.query.orderId }}</strong></div>
        <div class="summary-line"><span>결제금액:</span> <strong>{{ Number(route.query.amount).toLocaleString() }}원</strong></div>
        <div class="summary-line"><span>발송상태:</span> <span style="color: #59B3D9;">{{ emailStatus }}</span></div>
      </div>

      <div class="button-group" style="display: flex; gap: 15px; justify-content: center;">
        <button class="primary-btn" @click="goHome">홈으로 돌아가기</button>
        <button class="outline-btn" @click="goToMyPage">마이페이지에서 확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: bounce 1s ease infinite alternate;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 1.1rem;
}
.summary-line span { opacity: 0.6; }

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}
</style>
