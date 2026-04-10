<script setup>
import { state, t, addToCart } from '../store'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDetail = (id) => {
  router.push({ name: 'detail', params: { id } })
}
</script>

<template>
  <div class="mall-view-container">
    <div class="detail-header mall-header">
      <h2>{{ t.nav.mall }}</h2>
    </div>
    
    <section class="products-section mall-view" style="padding-top: 40px;">
      <div class="section-container">
        <div class="grid-container flex-center">
          <div class="tech-card" @click="goToDetail('케익칼')">
            <div class="card-img-placeholder" style="background-image: url('/images/cake_knife.png'); background-size: cover; background-position: center;">
              <span class="glow"></span>
            </div>
            <div class="tech-card-info">
              <h3>{{ t.products.cakeKnife }}</h3>
              <div class="btn-group-row">
                <button class="small-btn" @click="goToDetail('케익칼')">{{ t.products.purchaseBtn }}</button>
                <button class="small-btn outline-btn" @click.stop="addToCart('케익칼')">{{ t.cart.addBtn }}</button>
              </div>
            </div>
          </div>

          <div class="tech-card" @click="goToDetail('딥소스')">
            <div class="card-img-placeholder" style="background-image: url('/images/dip_sauce.png'); background-size: cover; background-position: center;">
              <span class="glow"></span>
            </div>
            <div class="tech-card-info">
              <h3>{{ t.products.dipSauce }}</h3>
              <div class="btn-group-row">
                <button class="small-btn" @click="goToDetail('딥소스')">{{ t.products.purchaseBtn }}</button>
                <button class="small-btn outline-btn" @click.stop="addToCart('딥소스')">{{ t.cart.addBtn }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
