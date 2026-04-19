<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { state, t, isAdmin, logout, fetchAdminData, fetchUserDashboardData } from '../store.js'

// In the old SPA, navigation was handled by this local currentView
const currentView = ref('home')
const selectedDetailProduct = ref(null)
const previousView = ref('home')
const savedScrollY = ref(0)
const selectedProduct = ref('')
const checkoutAmount = ref(0)
const currentAuthMode = ref('login')

// Navigation functions from old App.vue
const goHome = () => {
  currentView.value = 'home'
  previousView.value = 'home'
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    const appEl = document.getElementById('app');
    if (appEl) appEl.scrollTo({ top: 0, behavior: 'smooth' });
    const cont = document.querySelector('.mobile-spa-container');
    if (cont && typeof cont.scrollTo === 'function') cont.scrollTo({ top: 0, behavior: 'smooth' });
  };
  scrollToTop();
  setTimeout(scrollToTop, 50);
}

const goToDetail = (productName) => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  selectedDetailProduct.value = productName
  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

const goToAuth = (mode = 'login') => {
  currentAuthMode.value = mode
  if (state.isMobileMenuOpen) {
    state.isMobileMenuOpen = false
    document.body.style.overflow = ''
  }
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'auth'
  window.scrollTo(0, 0)
}

const goToSupport = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'support'
  window.scrollTo(0, 0)
}

const goToJobs = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'recruit'
  window.scrollTo(0, 0)
}

const goToMall = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'mall'
  window.scrollTo(0, 0)
}

const goToMyPage = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'mypage'
  fetchUserDashboardData()
  window.scrollTo(0, 0)
}

const goToCart = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'cart'
  window.scrollTo(0, 0)
}

const goToAdmin = () => {
  currentView.value = 'admin'
  fetchAdminData()
}

const goToCheckout = (productName, amount = 0) => {
  if (currentView.value === 'home' || currentView.value === 'mall' || currentView.value === 'cart') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  selectedProduct.value = productName
  checkoutAmount.value = amount
  currentView.value = 'checkout'
  window.scrollTo(0, 0)
}

const scrollToConsulting = () => {
  if (state.isMobileMenuOpen) {
    state.isMobileMenuOpen = false
    document.body.style.overflow = ''
  }
  if (currentView.value !== 'home') {
    goHome()
    setTimeout(() => {
      const el = document.getElementById('consulting-boxes')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (el.getBoundingClientRect().height / 2) - 50, behavior: 'smooth' })
    }, 100)
    return
  }
  const el = document.getElementById('consulting-boxes')
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (el.getBoundingClientRect().height / 2) - 50, behavior: 'smooth' })
  }
}

const scrollToPhilosophy = () => {
  if (state.isMobileMenuOpen) {
    state.isMobileMenuOpen = false
    document.body.style.overflow = ''
  }
  if (currentView.value !== 'home') {
    goHome()
    setTimeout(() => {
      const el = document.getElementById('philosophy')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
    }, 100)
    return
  }
  const el = document.getElementById('philosophy')
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
  }
}

// Components from previous logic
import HomeView from './HomeView.vue'
import MallView from './MallView.vue'
import SupportView from './SupportView.vue'
import RecruitView from './RecruitView.vue'
import DetailView from './DetailView.vue'
import CartView from './CartView.vue'
import AuthView from './AuthView.vue'
import CheckoutView from './CheckoutView.vue'
import MyPageView from './MyPageView.vue'
import AdminView from './AdminView.vue'

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show')
      }
    })
  }, { threshold: 0.1 })
  const hiddenElements = document.querySelectorAll('.animate-hidden')
  hiddenElements.forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="mobile-spa-container">
    <!-- Mobile Header -->
    <header class="navbar mobile-navbar">
      <div class="nav-content">
        <a href="/" class="logo" @click.prevent="goHome" style="position: relative; z-index: 9999; cursor: pointer;">
          <img src="/logo_new.png?v=9" alt="Brain Design" class="nav-logo-img" />
        </a>
        <div class="nav-actions">
           <div class="lang-toggle">
            <button @click="state.currentLang = 'ko'" :class="{ active: state.currentLang === 'ko' }" class="lang-btn">KR</button>
            <span style="color:rgba(255,255,255,0.2)">|</span>
            <button @click="state.currentLang = 'en'" :class="{ active: state.currentLang === 'en' }" class="lang-btn">EN</button>
          </div>
          <button class="mobile-menu-btn" @click="state.isMobileMenuOpen = !state.isMobileMenuOpen">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    </header>

    <div class="mobile-overlay" :class="{ 'is-open': state.isMobileMenuOpen }" @click="state.isMobileMenuOpen = false"></div>
    <div class="mobile-slide-menu" :class="{ 'is-open': state.isMobileMenuOpen }">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">MENU</span>
        <button class="close-menu-btn" @click="state.isMobileMenuOpen = false">??/button>
      </div>
      <nav class="mobile-nav-links">
        <a href="#" @click.prevent="scrollToPhilosophy">{{ t.nav.company }}</a>
        <a href="#" @click.prevent="scrollToConsulting">{{ t.nav.personal }}</a>
        <a href="#" @click.prevent="scrollToConsulting">{{ t.nav.ai }}</a>
        <a href="#" @click.prevent="scrollToConsulting">{{ t.nav.kids }}</a>

        <div class="mobile-secondary-links">
          <a href="#" @click.prevent="goToSupport">{{ t.nav.support }}</a>
          <a href="#" @click.prevent="goToJobs">{{ t.nav.jobs }}</a>
          <template v-if="state.currentUser">
            <a href="#" @click.prevent="goToMyPage">{{ state.currentLang === 'ko' ? '마이?�이지' : 'My Page' }}</a>
          </template>
          <template v-else>
            <a href="#" @click.prevent="goToAuth('signup')">{{ t.nav.signup }}</a>
            <a href="#" @click.prevent="goToAuth('login')">{{ state.currentLang === 'ko' ? '로그?? : 'Login' }}</a>
          </template>
          <a href="#" @click.prevent="goToCart" class="accent-link">{{ t.cart.title }}</a>
          <a href="#" @click.prevent="goToMall" class="accent-link">{{ t.nav.mall }}</a>
          <a href="#" v-if="isAdmin" @click.prevent="goToAdmin" style="color: #ff6b6b;">ADMIN</a>
          <a href="#" v-if="state.currentUser" @click.prevent="logout" style="color: #ff6b6b; opacity: 0.8; margin-top: 10px;">{{ state.currentLang === 'ko' ? '로그?�웃' : 'Logout' }}</a>
        </div>
      </nav>
    </div>

    <!-- Main Content for Mobile SPA -->
    <main class="main-content">
      <HomeView v-if="currentView === 'home'" @detail="goToDetail" />
      <MallView v-else-if="currentView === 'mall'" @detail="goToDetail" />
      <SupportView v-else-if="currentView === 'support'" />
      <RecruitView v-else-if="currentView === 'recruit'" />
      <DetailView v-else-if="currentView === 'detail'" @checkout="goToCheckout" @back="goHome" />
      <CartView v-else-if="currentView === 'cart'" @checkout="goToCheckout" />
      <AuthView v-else-if="currentView === 'auth'" />
      <CheckoutView v-else-if="currentView === 'checkout'" />
      <MyPageView v-else-if="currentView === 'mypage'" />
      <AdminView v-else-if="currentView === 'admin'" />
    </main>
  </div>
</template>

<style scoped>
/* Replicating old App.vue styles for mobile SPA if needed, 
   but most are already in main.css */
.mobile-navbar {
  height: 65px;
  top: 0 !important;
  background: var(--tech-bg) !important;
}
</style>

