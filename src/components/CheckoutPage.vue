<script setup>
import { ref, onMounted, computed } from 'vue';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import { state, t } from '../store';

const props = defineProps({
  productName: {
    type: String,
    default: '상품'
  },
  amount: {
    type: Number,
    default: 0
  }
});

const router = useRouter();

const deliveryFee = 3000;
const productPrice = computed(() => {
  if (props.amount > 0) return props.amount;
  if (props.productName === '케익칼') return 2000;
  if (props.productName === '딥소스') return 8000;
  if (props.productName === '동화책') return 39000;
  return 50000;
});

const totalAmount = computed(() => productPrice.value + deliveryFee);

const widgetClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
const customerKey = 'test_customer_key_' + Math.random().toString(36).substring(2, 10);

const buyer = ref({
  name: '',
  phone: '',
  email: ''
});

const checkoutError = ref('');

const shipping = ref({
  receiver: '',
  phone: '',
  zipCode: '',
  address: '',
  detailAddress: ''
});

const isWidgetLoaded = ref(false);
const isPaymentProcessing = ref(false);
const paymentWidget = ref(null);
const paymentMethodWidget = ref(null);

const showGuestButton = ref(!state.currentUser);

// Sync showGuestButton and pre-fill data when user state changes
watch(() => state.currentUser, (nu) => {
  console.log('CheckoutPage - User state updated:', nu);
  showGuestButton.value = !nu;
  
  if (nu) {
    if (!buyer.value.name) buyer.value.name = nu.user_metadata?.full_name || nu.email?.split('@')[0];
    if (!buyer.value.email) buyer.value.email = nu.email;
    if (!buyer.value.phone) buyer.value.phone = nu.user_metadata?.phone || '';
    
    // Auto-fill shipping if matching
    if (!shipping.value.receiver) shipping.value.receiver = buyer.value.name;
    if (!shipping.value.phone) shipping.value.phone = buyer.value.phone;

    // DOM Force Removal (As a last resort for stuck browsers)
    setTimeout(() => {
      const btn = document.querySelector('.guest-pay-button');
      if (btn) {
        btn.style.display = 'none';
        btn.setAttribute('hidden', 'true');
      }
    }, 100);
  }
}, { immediate: true });


const isGuestMode = computed(() => showGuestButton.value);


onMounted(async () => {
  // Load Daum Postcode Script
  if (!window.daum) {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  }

  try {
    paymentWidget.value = await loadPaymentWidget(widgetClientKey, customerKey);

    paymentMethodWidget.value = paymentWidget.value.renderPaymentMethods(
      '#payment-method', 
      { value: totalAmount.value },
      { variantKey: 'DEFAULT' }
    );

    paymentWidget.value.renderAgreement(
      '#agreement',
      { variantKey: 'AGREEMENT' }
    );

    await paymentMethodWidget.value.on('ready', () => {
      isWidgetLoaded.value = true;
    });

  } catch (error) {
    console.error('위젯 로딩 중 에러:', error);
  }

  // Load from draft if exists
  if (state.checkoutDraft) {
    buyer.value = { ...state.checkoutDraft.buyer };
    shipping.value = { ...state.checkoutDraft.shipping };
    // Clear draft once loaded
    state.checkoutDraft = null;
    localStorage.removeItem('cbd_checkout_draft');
  }
});

const openPostcode = () => {
  if (!window.daum) {
    alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }
  new window.daum.Postcode({
    oncomplete: (data) => {
      shipping.value.address = data.roadAddress || data.jibunAddress;
      shipping.value.zipCode = data.zonecode;
      // Focus detail address field
      document.getElementById('detailAddress')?.focus();
    }
  }).open();
};

const requestPayment = async (isGuest = false) => {
  checkoutError.value = '';
  
  // Login check - only for member checkout button
  if (!isGuest && !state.currentUser) {
    // Save to draft
    state.checkoutDraft = {
      buyer: { ...buyer.value },
      shipping: { ...shipping.value }
    };
    alert('결제는 로그인이 필요합니다. 로그인 페이지로 이동합니다.');
    router.push({ name: 'auth', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  
  if (!buyer.value.name || !buyer.value.phone || !buyer.value.email) {
    checkoutError.value = '주문자 정보를 모두 입력해주세요.';
    return;
  }
  if (!shipping.value.receiver || !shipping.value.phone || !shipping.value.address) {
    checkoutError.value = '배송지 정보를 모두 입력해주세요.';
    return;
  }

  // Clear error if all good
  checkoutError.value = '';

  try {
    isPaymentProcessing.value = true;
    // 1. Supabase에 주문 기록 (결제 요청 전)
    let orderDbId = ''
    if (supabase) {
      const fullAddress = `${shipping.value.address} ${shipping.value.detailAddress}`;
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        user_email: buyer.value.email,
        product_name: props.productName,
        total_amount: totalAmount.value,
        order_status: 'payment_pending', // Initial status
        delivery_status: 'preparing',
        shipping_address: fullAddress,
        receiver_name: shipping.value.receiver,
        receiver_phone: shipping.value.phone,
        buyer_name: buyer.value.name,
        buyer_phone: buyer.value.phone
      }]).select();

      if (orderError) throw orderError;
      if (orderData && orderData.length > 0) {
        orderDbId = orderData[0].id;
      }
    }

    if (!paymentWidget.value) return;

    // Use DB ID if available, otherwise fallback to timestamp
    const uniqueOrderId = orderDbId ? `ORDER_${orderDbId}` : 'ORDER_' + new Date().getTime();

    await paymentWidget.value.requestPayment({
      orderId: uniqueOrderId,
      orderName: props.productName,
      successUrl: window.location.origin + '/success',
      failUrl: window.location.origin + '/fail',
      customerEmail: buyer.value.email,
      customerName: buyer.value.name,
    });
  } catch (err) {
    console.error('결제 요청 중 실패:', err);
    checkoutError.value = `결제 처리 중 오류가 발생했습니다: ${err.message || '세션이 만료되었거나 비정상적인 결제 요청입니다.'}`;
    isPaymentProcessing.value = false;
  }
};


</script>

<template>
  <div class="checkout-wrapper">
    <div class="checkout-layout">
      <!-- Left Column: Forms -->
      <div class="checkout-main">
        <div class="header-breadcrumb" style="margin-bottom: 20px;">
           <button @click="router.back()" class="back-btn">{{ t.detail.backBtn }}</button>
        </div>
        <div v-if="!state.currentUser" class="login-prompt-banner animate-fade">
          <div class="prompt-content">
             <span class="icon">💡</span>
             <span>이미 계정이 있으신가요? <strong>로그인</strong>하시면 주문 내역을 더 편리하게 관리하실 수 있습니다.</span>
          </div>
          <button class="small-outline-btn" @click="router.push({ name: 'auth', query: { mode: 'login', redirect: '/checkout' } })">
            로그인하기
          </button>
        </div>

        <section class="checkout-section">
          <h2 class="section-title">주문 상품 정보</h2>

          <div class="order-item-card glass-panel">
             <div class="item-img">📦</div>
             <div class="item-details">
                <div class="item-name">{{ props.productName }}</div>
                <div class="item-price">{{ productPrice.toLocaleString() }}원</div>
             </div>
          </div>
          <div class="fee-notice">배송비 {{ deliveryFee.toLocaleString() }}원</div>
        </section>

        <section class="checkout-section">
          <h2 class="section-title">주문자 정보</h2>
          <div class="form-grid glass-panel">
            <div class="input-group">
              <label>이름</label>
              <input type="text" v-model="buyer.name" placeholder="주문자 성함" />
            </div>
            <div class="input-group">
              <label>연락처</label>
              <input type="tel" v-model="buyer.phone" placeholder="010-0000-0000" />
            </div>
            <div class="input-group full-width">
              <label>이메일</label>
              <input type="email" v-model="buyer.email" placeholder="example@naver.com" />
            </div>
          </div>
        </section>

        <section class="checkout-section">
          <h2 class="section-title">배송 정보</h2>
          <div class="form-grid glass-panel">
            <div class="input-group">
              <label>수령인</label>
              <input type="text" v-model="shipping.receiver" placeholder="받으실 분 성함" />
            </div>
            <div class="input-group">
              <label>연락처</label>
              <input type="tel" v-model="shipping.phone" placeholder="010-0000-0000" />
            </div>
            <div class="input-group full-width address-search-group">
               <label>우편번호</label>
               <div class="flex-row">
                  <input type="text" v-model="shipping.zipCode" readonly placeholder="00000" />
                  <button class="search-btn" @click="openPostcode">주소 검색</button>
               </div>
            </div>
            <div class="input-group full-width">
              <label>기본 주소</label>
              <input type="text" v-model="shipping.address" readonly placeholder="검색 버튼을 눌러주세요" />
            </div>
            <div class="input-group full-width">
              <label>상세 주소</label>
              <input type="text" id="detailAddress" v-model="shipping.detailAddress" placeholder="나머지 상세 주소를 입력하세요" />
            </div>
          </div>
        </section>

        <section class="checkout-section">
          <h2 class="section-title">결제수단</h2>
          <div class="payment-widget-area glass-panel">
            <div id="payment-method"></div>
            <div id="agreement"></div>
          </div>
        </section>

        <!-- Moved Policy Section here for better alignment -->
        <section class="checkout-section policy-section">
          <h2 class="section-title">{{ t.policy.returnTitle }}</h2>
          <div class="glass-panel policy-content">
            <p class="pre-line" style="margin-bottom: 20px; opacity: 0.8; line-height: 1.6;">{{ t.policy.refundInfo }}</p>
            <div class="addr-box" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin-bottom: 5px; font-size: 0.95rem;">{{ t.policy.addrTitle }}</h4>
              <p style="opacity: 0.7; font-size: 0.9rem;">{{ t.policy.addr }}</p>
            </div>
            <p class="notice" style="color: #ff6b6b; font-size: 0.85rem;">{{ t.policy.shippingNotice }}</p>

            <div style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
              <h4 style="margin-bottom: 15px; font-size: 1.1rem; color: var(--tech-accent);">{{ t.policy.shippingTitle }}</h4>
              <p class="pre-line" style="opacity: 0.8; line-height: 1.6; font-size: 0.9rem;">{{ t.policy.shippingDetail }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Summary -->
      <aside class="checkout-sidebar">
        <div class="summary-card glass-panel">
          <h2 class="section-title">주문 요약</h2>
          <div class="summary-row">
            <span>상품가격</span>
            <span>{{ productPrice.toLocaleString() }}원</span>
          </div>
          <div class="summary-row">
            <span>배송비</span>
            <span>+{{ deliveryFee.toLocaleString() }}원</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>총 주문금액</span>
            <span class="total-price">{{ totalAmount.toLocaleString() }}원</span>
          </div>
          
          <div v-if="checkoutError" class="checkout-error-msg animate-fade">
             ⚠️ {{ checkoutError }}
          </div>
        </div>

        <div class="action-card" :class="{ 'is-logged-in': state.currentUser }">
          <div style="font-size: 8px; color: grey;">v2.0-secure</div>
          <div v-if="state.currentUser" style="color: #59B3D9; font-size: 11px; margin-bottom: 5px; text-align: center;">✓ 회원 주문 모드</div>

          <div v-else style="color: #aaa; font-size: 11px; margin-bottom: 5px; text-align: center;">! 비회원 주문 모드</div>

          <button 
            class="pay-button" 
            :disabled="!isWidgetLoaded" 
            @click="requestPayment(false)"
            :style="state.currentUser ? { background: '#59B3D9' } : {}"
          >
            {{ state.currentUser ? '회원 결제하기' : (isWidgetLoaded ? '결제하기' : '결제 모듈 로딩 중...') }}
          </button>

          <template v-if="!state.currentUser">
            <button 
              class="pay-button guest-pay-button" 
              :disabled="!isWidgetLoaded" 
              @click="requestPayment(true)"
            >
              비회원 결제하기
            </button>
          </template>




        </div>
      </aside>
    </div>
  </div>

    <!-- Rescue Exit Button (Specifically for Toss overlay) -->
    <div v-if="isPaymentProcessing" class="rescue-exit-container">
       <button class="rescue-exit-btn" @click="isPaymentProcessing = false">✕</button>
    </div>

    <!-- Error Modal Overlay -->
    <div v-if="checkoutError" class="hard-error-overlay" @click.self="checkoutError = ''">

      <div class="hard-error-card animate-hard-fade">
        <button class="hard-error-close" @click="checkoutError = ''">✕</button>
        <div class="hard-error-icon">!</div>
        <h3 class="hard-error-title">일시적인 오류가 발생했습니다.</h3>
        <p class="hard-error-msg">{{ checkoutError }}</p>
        <button class="hard-error-confirm" @click="checkoutError = ''">확인</button>
      </div>
    </div>
</template>


<style scoped>
.checkout-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 30px;
}

@media (max-width: 850px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

.checkout-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.44rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--tech-accent, #59B3D9);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 12px;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: span 2;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
}

.input-group input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 15px;
  border-radius: 6px;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #59B3D9;
  background: rgba(255, 255, 255, 0.12);
}

.address-search-group .flex-row {
  display: flex;
  gap: 10px;
}

.address-search-group input {
  flex: 1;
}

.search-btn {
  background: #59B3D9;
  color: #000;
  border: none;
  padding: 0 20px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.search-btn:hover {
  background: #4ab8e6;
}

.order-item-card {
  display: flex;
  gap: 20px;
  align-items: center;
}

.item-img {
  width: 80px;
  height: 80px;
  background: #2a2a2a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.header-breadcrumb {
  display: flex;
  align-items: center;
}

.login-prompt-banner {
  background: rgba(89, 179, 217, 0.1);
  border: 1px solid rgba(89, 179, 217, 0.2);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: #D3D5DF;
}

.prompt-content .icon {
  font-size: 1.2rem;
}

.small-outline-btn {
  background: transparent;
  border: 1px solid #59B3D9;
  color: #59B3D9;
  padding: 6px 15px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.small-outline-btn:hover {
  background: #59B3D9;
  color: #000;
}

@media (max-width: 600px) {
  .login-prompt-banner {
    flex-direction: column;
    text-align: center;
    align-items: stretch;
  }
}

.item-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.item-price {
  font-weight: 700;
  color: #59B3D9;
}

.fee-notice {
  margin-top: 10px;
  text-align: right;
  font-size: 0.9rem;
  opacity: 0.7;
}

.payment-widget-area {
  padding: 0;
  overflow: hidden;
}

#payment-method, #agreement {
  background: #fff;
  border-radius: 0;
}

/* Sidebar Styles */
.checkout-sidebar {
  position: sticky;
  top: 140px;
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1rem;
}

.summary-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 20px 0;
}

.action-card.is-logged-in .guest-pay-button {
  display: none !important;
}

.total {

  font-size: 1.32rem;
  font-weight: 800;
}

.total-price {
  color: #59B3D9;
}

.pay-button {
  width: 100%;
  padding: 18px;
  font-size: 1.15rem;
  font-weight: 800;
  background: #59B3D9;
  color: #000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 20px;
  transition: transform 0.2s, background 0.2s;
}

.pay-button:hover:not(:disabled) {
  background: #4ab8e6;
  transform: translateY(-2px);
}

.pay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.guest-pay-button {
  background: transparent !important;
  border: 1px solid #59B3D9 !important;
  color: #59B3D9 !important;
  margin-top: 10px !important;
}

.guest-pay-button:hover:not(:disabled) {
  background: rgba(89, 179, 217, 0.1) !important;
}

.checkout-error-msg {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 15px;
  text-align: center;
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.animate-fade {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hard Error Overlay */
.hard-error-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483646; /* Just below rescue button */
  padding: 20px;
}


.hard-error-card {
  background: #fff;
  width: 100%;
  max-width: 400px;
  padding: 40px 20px 30px;
  border-radius: 24px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  color: #111;
}

.hard-error-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.2s;
}

.hard-error-close:hover {
  color: #111;
}

.hard-error-icon {
  width: 60px;
  height: 60px;
  background: #FFD43B;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.22rem;
  font-weight: 800;
  margin: 0 auto 20px;
}

.hard-error-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #111;
}

.hard-error-msg {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}

.hard-error-confirm {
  width: 100%;
  padding: 14px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

.animate-hard-fade {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Rescue Exit for Toss */
.rescue-exit-container {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 2147483647; /* MAX Z-INDEX */
  display: flex;
  align-items: center;
  justify-content: center;
}

.rescue-exit-btn {
  pointer-events: auto;
  position: absolute;
  /* Approximate top-right of the Toss white box (typically 400-500px wide) */
  top: calc(50% - 220px);
  left: calc(50% + 180px);
  
  background: #fff;
  border: 2px solid #111;
  color: #111;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  transition: transform 0.2s;
}

.rescue-exit-btn:hover {
  transform: scale(1.1);
  background: #f0f0f0;
}

/* Mobile responsive rescue button */
@media (max-width: 600px) {
  .rescue-exit-btn {
    top: 20%;
    right: 5%;
    left: auto;
  }
}
</style>


