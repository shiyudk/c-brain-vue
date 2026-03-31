<script setup>
import { ref, onMounted, computed } from 'vue';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { supabase } from '../supabase.js';

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

// Forms State
const buyer = ref({
  name: '',
  phone: '',
  email: ''
});

const shipping = ref({
  receiver: '',
  phone: '',
  zipCode: '',
  address: '',
  detailAddress: ''
});

const isWidgetLoaded = ref(false);
const paymentWidget = ref(null);
const paymentMethodWidget = ref(null);

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

const requestPayment = async () => {
  if (!buyer.value.name || !shipping.value.receiver || !shipping.value.address) {
    alert('모든 배송 정보를 입력해주세요.');
    return;
  }

  try {
    // 1. Supabase에 주문 기록 (결제 요청 전)
    if (supabase) {
      const fullAddress = `${shipping.value.address} ${shipping.value.detailAddress}`;
      await supabase.from('orders').insert([{
        user_email: buyer.value.email,
        product_name: props.productName,
        total_amount: totalAmount.value,
        order_status: 'payment_finished', // 테스트를 위해 바로 완료로 표시 (실제 환경은 PG사 콜백 필요)
        delivery_status: 'preparing',
        shipping_address: fullAddress,
        receiver_name: shipping.value.receiver,
        receiver_phone: shipping.value.phone
      }]);
    }

    if (!paymentWidget.value) return;

    await paymentWidget.value.requestPayment({
      orderId: 'ORDER_' + new Date().getTime(),
      orderName: props.productName,
      successUrl: window.location.origin + '/success',
      failUrl: window.location.origin + '/fail',
      customerEmail: buyer.value.email,
      customerName: buyer.value.name,
    });
  } catch (err) {
    console.error('결제 요청 중 실패:', err);
  }
};
</script>

<template>
  <div class="checkout-wrapper">
    <div class="checkout-layout">
      <!-- Left Column: Forms -->
      <div class="checkout-main">
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
        </div>

        <div class="action-card">
          <button 
            class="pay-button" 
            :disabled="!isWidgetLoaded" 
            @click="requestPayment"
          >
            {{ isWidgetLoaded ? `결제하기` : '결제 모듈 로딩 중...' }}
          </button>
        </div>
      </aside>
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

.total {
  font-size: 1.32rem;
  font-weight: 800;
}

.total-price {
  color: #59B3D9;
}

.pay-button {
  width: 100%;
  padding: 20px;
  font-size: 1.44rem;
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
</style>
