<script setup>
import { state, t, cartItemsTotal, cartTotal, shippingFee, removeFromCart, updateQuantity } from '../store'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMall = () => {
  router.push({ name: 'mall' })
}

const checkoutFromCart = (isGuest = false) => {
  const selectedItems = state.cart.filter(item => item.selected)
  if (selectedItems.length === 0) {
    alert(state.currentLang === 'ko' ? '결제할 상품을 선택해주세요.' : 'Please select items to checkout.')
    return
  }

  if (!isGuest && !state.currentUser) {
    alert(state.currentLang === 'ko' ? '로그인 후 결제가 가능합니다.' : 'Please login to proceed with checkout.')
    router.push({ name: 'auth', query: { mode: 'login', redirect: 'cart' } })
    return
  }
  
  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const multiName = selectedItems.length > 1 
    ? `${selectedItems[0].name} 외 ${selectedItems.length - 1}건`
    : selectedItems[0].name
    
  state.selectedProduct = multiName
  state.checkoutAmount = total
  router.push({ name: 'checkout' })
}
</script>

<template>
  <div class="cart-view-container">
    <div class="detail-header" style="display: flex; align-items: center; justify-content: center; position: relative;">
      <button @click="router.back()" class="back-btn" style="position: absolute; left: 0;">{{ t.detail.backBtn }}</button>
      <h2>{{ t.cart.title }}</h2>
    </div>
    
    <section class="cart-section container-narrow">
      <div v-if="state.cart.length === 0" class="empty-cart">
        <p>{{ t.cart.empty }}</p>
        <button class="primary-btn" @click="goToMall">{{ t.nav.mall }}</button>
      </div>
      
      <div v-else class="cart-list glass-panel">
        <div v-for="item in state.cart" :key="item.id" class="cart-item">
          <input type="checkbox" v-model="item.selected" />
          <div class="item-info">
            <h3>{{ item.name === '케익칼' ? t.products.cakeKnife : item.name === '딥소스' ? t.products.dipSauce : item.name }}</h3>
            <p>{{ (item.price * item.quantity).toLocaleString() }} 원</p>
            <div class="qty-control">
              <button class="qty-btn" @click="updateQuantity(item.id, -1)">-</button>
              <span class="qty-val">{{ item.quantity }}</span>
              <button class="qty-btn" @click="updateQuantity(item.id, 1)">+</button>
            </div>
          </div>
          <button class="del-btn" @click="removeFromCart(item.id)">{{ t.cart.delete }}</button>
        </div>
        
        <div class="cart-summary">
          <div class="summary-row" style="font-size: 1rem; opacity: 0.8; margin-bottom: 0.5rem;">
            <span>상품 합계</span>
            <span>{{ cartItemsTotal.toLocaleString() }} 원</span>
          </div>
          <div class="summary-row" style="font-size: 1rem; opacity: 0.8; margin-bottom: 1rem;">
            <span>배송비</span>
            <span>+{{ shippingFee.toLocaleString() }} 원</span>
          </div>
          <div class="summary-row">
            <span>{{ t.cart.total }}</span>
            <span class="total-price">{{ cartTotal.toLocaleString() }} 원</span>
          </div>
          <div class="check-actions-row">
             <button class="primary-btn huge-btn" @click="checkoutFromCart(false)">{{ t.cart.checkout }}</button>
             <button v-if="!state.currentUser" class="outline-btn huge-btn" @click="checkoutFromCart(true)" style="margin-top: 10px;">{{ t.cart.guest }}</button>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>
