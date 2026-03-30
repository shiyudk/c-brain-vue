<script setup>
import { ref, onMounted, computed } from 'vue';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';

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
  name: '김토스',
  phone: '010-0000-0000',
  email: 'contact@c-braindesign.com'
});

const shipping = ref({
  name: '김토스',
  phone: '010-0000-0000',
  address: '서울특별시 동대문구 한천로 46길 85-6',
  zipCode: '12345'
});

const isWidgetLoaded = ref(false);
const paymentWidget = ref(null);
const paymentMethodWidget = ref(null);

onMounted(async () => {
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

const requestPayment = async () => {
  try {
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
          <div class="section-header">
            <h2 class="section-title">주문자 정보</h2>
            <button class="edit-btn">수정</button>
          </div>
          <div class="info-card glass-panel">
            <p class="info-text"><strong>{{ buyer.name }}</strong></p>
            <p class="info-text">{{ buyer.phone }}</p>
            <p class="info-text">{{ buyer.email }}</p>
          </div>
        </section>

        <section class="checkout-section">
          <div class="section-header">
            <h2 class="section-title">배송 정보</h2>
            <button class="edit-btn">변경</button>
          </div>
          <div class="info-card glass-panel">
            <p class="info-text"><strong>{{ shipping.name }}</strong></p>
            <p class="info-text">{{ shipping.phone }}</p>
            <p class="info-text">{{ shipping.address }}</p>
            <p class="info-text">({{ shipping.zipCode }})</p>
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
            {{ isWidgetLoaded ? `결제하기` : '준비 중...' }}
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 1.44rem;
  font-weight: 700;
  margin: 0 0 15px;
  color: var(--tech-accent, #59B3D9);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
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

.info-text {
  margin: 5px 0;
  line-height: 1.5;
  opacity: 0.9;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.payment-widget-area {
  padding: 0;
  overflow: hidden;
}

#payment-method, #agreement {
  background: #fff; /* 위젯은 하얀 배경이 기본적으로 깔끔함 */
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
