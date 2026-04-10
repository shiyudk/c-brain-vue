<script setup>
import { useRouter } from 'vue-router'
import { state, t } from '../store'
import CheckoutPage from '../components/CheckoutPage.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="checkout-view-container" style="padding-top: 140px;">
    <CheckoutPage :productName="state.selectedProduct" :amount="state.checkoutAmount" />
    
  </div>
</template>
