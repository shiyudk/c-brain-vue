<script setup>
import { ref, onMounted, computed } from 'vue';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';

const props = defineProps({
  productName: {
    type: String,
    default: '상품'
  }
});

const widgetClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
const customerKey = 'test_customer_key_' + Math.random().toString(36).substring(2, 10);

const amount = computed(() => {
  if (props.productName === '케익칼') return 2000;
  if (props.productName === '딥소스') return 8000;
  if (props.productName === '동화책') return 39000;
  return 50000;
});

// ----------------------------------------------------
// UI State
// ----------------------------------------------------
const isWidgetLoaded = ref(false);
const paymentWidget = ref(null);
const paymentMethodWidget = ref(null);

onMounted(async () => {
  try {
    paymentWidget.value = await loadPaymentWidget(widgetClientKey, customerKey);

    paymentMethodWidget.value = paymentWidget.value.renderPaymentMethods(
      '#payment-method', 
      { value: amount.value },
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
      customerEmail: 'contact@c-braindesign.com',
      customerName: '고객',
    });
  } catch (err) {
    console.error('결제 요청 중 실패 (사용자 취소 등):', err);
  }
};
</script>

<template>
  <div class="checkout-container">
    <div class="header">
      <h2>결제하기</h2>
      <p class="subtitle">{{ props.productName }} 구매</p>
    </div>

    <div class="product-info box">
      <h3>주문 정보</h3>
      <div class="item">
        <span>{{ props.productName }}</span>
        <span class="price">{{ amount.toLocaleString() }} 원</span>
      </div>
      <div class="total-row">
        <span>총 결제금액</span>
        <span class="total-price">{{ amount.toLocaleString() }} 원</span>
      </div>
    </div>

    <!-- 결제 UI가 그려질 영역 -->
    <div class="payment-widget-area box">
      <div id="payment-method"></div>
      <div id="agreement"></div>
    </div>

    <button 
      class="pay-button" 
      :disabled="!isWidgetLoaded" 
      @click="requestPayment"
    >
      {{ isWidgetLoaded ? `${amount.toLocaleString()}원 결제하기` : '결제 모듈 불러오는 중...' }}
    </button>
  </div>
</template>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 25.2px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14.7px;
}

.box {
  background: #f9f9fc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #ebf0f5;
}

.product-info h3 {
  font-size: 16.8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #444;
}

.price {
  font-weight: 500;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #ccc;
  font-weight: bold;
  font-size: 18.9px;
  color: #3182f6; /* Toss Blue */
}

.pay-button {
  width: 100%;
  padding: 16px;
  font-size: 18.9px;
  font-weight: bold;
  color: white;
  background-color: #3182f6; /* Toss Primary Blue */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 10px;
}

.pay-button:hover:not(:disabled) {
  background-color: #1b64da;
}

.pay-button:disabled {
  background-color: #a0c3f5;
  cursor: not-allowed;
}

/* 다크모드 대응 (원한다면) */
@media (prefers-color-scheme: dark) {
  .checkout-container {
    background: #1a1a1a;
    color: #eee;
  }
  .box {
    background: #2a2a2a;
    border-color: #444;
  }
  .item { color: #ccc; }
}
</style>
