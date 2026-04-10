<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { state, t, addToCart } from '../store'

const route = useRoute()
const router = useRouter()
const selectedDetailProduct = computed(() => route.params.id)

const goToCheckout = (productName) => {
  const amount = productName === '케익칼' ? 2000 : 8000
  state.selectedProduct = productName
  state.checkoutAmount = amount
  router.push({ name: 'checkout' })
}

const goBack = () => {
    router.back()
}
</script>

<template>
  <div class="detail-view-container">
    <div class="detail-header">
      <button @click="goBack" class="back-btn">{{ t.detail.backBtn }}</button>
      <h2>{{ selectedDetailProduct === '케익칼' ? t.products.cakeKnife : selectedDetailProduct === '딥소스' ? t.products.dipSauce : selectedDetailProduct }} {{ t.detail.detailInfo }}</h2>
    </div>
    
    <div class="product-detail-container" v-if="selectedDetailProduct === '케익칼' || selectedDetailProduct === '딥소스'">
      <div class="detail-images">
        <template v-if="selectedDetailProduct === '케익칼'">
          <img src="/images/eco_paper_cake_knife.jpg" alt="Eco Paper Cake Knife" />
        </template>
        <template v-else-if="selectedDetailProduct === '딥소스'">
          <img src="/images/dip_sauce_detail.jpg" alt="Korean Dipping Sauce" />
        </template>
      </div>
      
      <div class="shipping-info">
        <p v-html="t.detail.shipping"></p>
      </div>
      
      <div class="detail-action-bottom" style="display:flex; gap:10px;">
        <button class="primary-btn huge-btn" @click="goToCheckout(selectedDetailProduct)" style="flex:2;">
          {{ selectedDetailProduct === '케익칼' ? t.detail.payCake : t.detail.payDip }}
        </button>
        <button class="outline-btn huge-btn" @click="addToCart(selectedDetailProduct)" style="flex:1;">
          {{ t.cart.addBtn }}
        </button>
      </div>

      <div class="policy-container glass-panel">
        <div class="policy-block">
          <h3>{{ t.policy.returnTitle }}</h3>
          <p class="pre-line">{{ t.policy.refundInfo }}</p>
          <div class="addr-box">
            <h4>{{ t.policy.addrTitle }}</h4>
            <p>{{ t.policy.addr }}</p>
          </div>
          <p class="notice">{{ t.policy.shippingNotice }}</p>
        </div>
        
        <div class="policy-block">
          <h3>{{ t.policy.shippingTitle }}</h3>
          <p class="pre-line">{{ t.policy.shippingDetail }}</p>
        </div>

        <div class="policy-block">
          <h3>{{ t.policy.cancelTitle }}</h3>
          <p class="pre-line text-small">{{ t.policy.cancelDetail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
