<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from './supabase.js'
import { 
  state, t, isAdmin, 
  fetchAdminData, fetchUserDashboardData, 
  logout 
} from './store'

const router = useRouter()
const route = useRoute()

const formatContent = (text) => {
  if (!text) return ''
  let safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  safeText = safeText.replace(/\[FILE:([^|]+)\|([^\]]+)\]/g, '<a href="$2" target="_blank" style="color: #59B3D9; text-decoration: underline; font-weight: bold;">📎 $1</a>');
  safeText = safeText.replace(/(^|[^"'])((https?):\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" style="color: #59B3D9; text-decoration: underline;">$2</a>');
  return safeText.replace(/\n/g, '<br/>')
}

const handleLogout = async () => {
  await logout()
  router.push({ name: 'home' })
}

const toggleMobileMenu = () => {
  state.isMobileMenuOpen = !state.isMobileMenuOpen
  document.body.style.overflow = state.isMobileMenuOpen ? 'hidden' : ''
}

const goHome = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'home' })
}

const goToMall = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'mall' })
}

const goToMyPage = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  if (!state.currentUser) {
    router.push({ name: 'auth', query: { mode: 'login' } })
    return
  }
  fetchUserDashboardData()
  router.push({ name: 'mypage' })
}

const goToCart = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'cart' })
}

const goToSupport = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'support' })
}

const goToJobs = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'recruit' })
}

const goToAuth = (mode = 'login') => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'auth', query: { mode } })
}

const goToAdmin = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  router.push({ name: 'admin' })
}

const scrollToPhilosophy = () => {
  if (route.name !== 'home') {
    router.push({ name: 'home', hash: '#philosophy' })
  } else {
    const el = document.getElementById('philosophy')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToConsulting = () => {
  if (state.isMobileMenuOpen) toggleMobileMenu()
  if (route.name !== 'home') {
    router.push({ name: 'home', hash: '#consulting-boxes' })
  } else {
    const el = document.getElementById('consulting-boxes')
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

const closeDetailModal = () => {
  state.showDetailModal = false
  state.selectedItemDetail = null
  state.adminReplyText = ''
}

const submitAdminReply = async (id) => {
  if (!supabase || !isAdmin.value) return
  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ admin_reply: state.adminReplyText, status: 'completed' })
      .eq('id', id)
      
    if (error) {
      alert("데이터베이스 오류: " + error.message)
      return
    }
    
    alert('답변이 저장되었습니다.')
    if (state.selectedItemDetail) {
      state.selectedItemDetail.admin_reply = state.adminReplyText
      state.selectedItemDetail.status = 'completed'
    }
    const item = state.adminInquiries.find(i => i.id === id)
    if (item) {
      item.admin_reply = state.adminReplyText
      item.status = 'completed'
    }
  } catch (err) {
    alert("오류 발생: " + err.message)
  }
}

const copyEmail = () => {
  navigator.clipboard.writeText('contact@c-braindesign.com')
  alert(state.currentLang === 'ko' ? '이메일 주소가 복사되었습니다!' : 'Email address copied!')
}

const triggerMailApp = () => {
  const mailToLink = document.createElement('a')
  mailToLink.href = 'mailto:contact@c-braindesign.com'
  mailToLink.click()
}

onMounted(() => {
  // 강제 상단 고정 (다중 시도)
  window.scrollTo(0, 0);
  setTimeout(() => window.scrollTo(0, 0), 50);
  setTimeout(() => window.scrollTo(0, 0), 300);
  
  const observer = new IntersectionObserver((entries) => {entries.forEach((entry) => {if (entry.isIntersecting) {entry.target.classList.add('show');}});}, { threshold: 0.1 });
  const hiddenElements = document.querySelectorAll('.animate-hidden');
  hiddenElements.forEach((el) => observer.observe(el));
});

watch(() => route.hash, (newHash) => {
  if (newHash) {
    setTimeout(() => {
      const el = document.querySelector(newHash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 500)
  }
})
</script>

<template>
  <div class="app-container">
    <!-- Top Utility Bar -->
    <div class="top-utility-bar">
      <div class="utility-content">
        <a href="#" @click.prevent="goToMall" style="margin-right: 1.5rem; font-weight: 700; color: #59B3D9;">{{ t.nav.mall }}</a>
        <a href="#" @click.prevent="goToSupport">{{ t.nav.support }}</a>
        <a href="#" @click.prevent="goToJobs">{{ t.nav.jobs }}</a>
        <a href="#" v-if="isAdmin" @click.prevent="goToAdmin" style="color: #ff6b6b; font-weight: 700; margin-left: 1rem;">ADMIN</a>
        <template v-if="state.currentUser">
           <a href="#" @click.prevent="handleLogout">로그아웃</a>
        </template>
        <template v-else>
          <a href="#" @click.prevent="goToAuth('signup')">{{ t.nav.signup }}</a>
        </template>
      </div>
    </div>

    <!-- Navbar -->
    <header class="navbar">
      <div class="nav-content">
        <a href="#" class="logo" @click.prevent="goHome">
          <img src="/logo_new.png?v=9" alt="Brain Design" class="nav-logo-img" loading="eager" />
        </a>
        <nav class="nav-links">
          <a href="#" @click.prevent="scrollToPhilosophy">{{ t.nav.company }}</a>
          <a href="#" @click.prevent="scrollToConsulting">{{ t.nav.personal }}</a>
          <a href="#" @click.prevent="scrollToConsulting">{{ t.nav.ai }}</a>
          <a href="#" @click.prevent="scrollToConsulting">{{ t.nav.kids }}</a>
        </nav>

        <div class="nav-actions">
          <div class="lang-toggle">
            <button @click="state.currentLang = 'ko'" :class="{ active: state.currentLang === 'ko' }" class="lang-btn">KR</button>
            <span style="color:rgba(255,255,255,0.2)">|</span>
            <button @click="state.currentLang = 'en'" :class="{ active: state.currentLang === 'en' }" class="lang-btn">EN</button>
          </div>
          <a href="#" class="icon-btn hide-mobile" @click.prevent="goToCart">
            🛒 <span v-if="state.cart.length > 0" class="cart-badge">{{ state.cart.length }}</span>
          </a>
          <a href="#" class="icon-btn hide-mobile my-page-icon-wrapper" @click.prevent="goToMyPage">
            <span class="icon-emoji">👤</span>
            <span class="my-text-label">MY</span>
          </a>
          <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Slide Menu -->
    <div class="mobile-overlay" :class="{ 'is-open': state.isMobileMenuOpen }" @click="toggleMobileMenu"></div>
    <div class="mobile-slide-menu" :class="{ 'is-open': state.isMobileMenuOpen }">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">MENU</span>
        <button class="close-menu-btn" @click="toggleMobileMenu">✕</button>
      </div>
      <nav class="mobile-nav-links">
        <a href="#" @click.prevent="scrollToPhilosophy()">{{ t.nav.company }}</a>
        <a href="#" @click.prevent="scrollToConsulting()">{{ t.nav.personal }}</a>
        <a href="#" @click.prevent="scrollToConsulting()">{{ t.nav.ai }}</a>
        <a href="#" @click.prevent="scrollToConsulting()">{{ t.nav.kids }}</a>
        <a href="#" @click.prevent="goToMall()">{{ t.nav.mall }}</a>
        <a href="#" @click.prevent="goToJobs()">{{ t.nav.jobs }}</a>
        <a href="#" @click.prevent="goToCart()">장바구니 ({{ state.cart.length }})</a>
        <a href="#" @click.prevent="goToMyPage()">마이페이지</a>
        <a href="#" v-if="isAdmin" @click.prevent="goToAdmin()" style="color: #ff6b6b; font-weight: 700;">ADMIN DASHBOARD</a>
        <div class="mobile-lang-row">
            <button @click="state.currentLang = 'ko'" :class="{ active: state.currentLang === 'ko' }">KOR</button>
            <button @click="state.currentLang = 'en'" :class="{ active: state.currentLang === 'en' }">ENG</button>
        </div>
      </nav>
    </div>

    <!-- Router View for Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>{{ t.footer.company }}</p>
        <p style="white-space: pre-line;">{{ t.footer.bizNo }}</p>
        <p>{{ t.footer.contact }}</p>
        <p class="copyright">{{ t.footer.copyright }}</p>
      </div>
    </footer>

    <!-- Global Modals -->
    <div class="modal-overlay" v-if="state.showDetailModal" @click.self="closeDetailModal">
      <div class="tech-modal glass-panel">
        <div class="modal-header">
          <h3>{{ state.selectedItemDetail?.subject || state.selectedItemDetail?.product_name || 'Detail' }}</h3>
          <button @click="closeDetailModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="label">날짜/일시:</span>
            <span>{{ new Date(state.selectedItemDetail?.created_at).toLocaleString() }}</span>
          </div>

          <!-- Order Type Details -->
          <div v-if="state.selectedItemDetail?.order_status" class="order-detail-container">
            <div class="detail-section">
              <h4 class="detail-sec-title">📦 상품 정보</h4>
              <div class="detail-data-box">
                <div class="data-row"><span>상품명:</span> <strong>{{ state.selectedItemDetail.product_name }}</strong></div>
                <div class="data-row"><span>결제금액:</span> <strong>{{ state.selectedItemDetail.total_amount?.toLocaleString() }}원</strong></div>
                <div class="data-row"><span>배송상태:</span> <span class="status-tag" :class="state.selectedItemDetail.delivery_status">{{ state.selectedItemDetail.delivery_status === 'preparing' ? '배송준비' : state.selectedItemDetail.delivery_status === 'shipping' ? '배송중' : '배송완료' }}</span></div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="detail-sec-title">👤 주문자 정보</h4>
              <div class="detail-data-box">
                <div class="data-row"><span>이메일:</span> {{ state.selectedItemDetail.user_email }}</div>
                <div class="data-row" v-if="state.selectedItemDetail.buyer_name"><span>이름:</span> {{ state.selectedItemDetail.buyer_name }}</div>
                <div class="data-row" v-if="state.selectedItemDetail.buyer_phone"><span>연락처:</span> {{ state.selectedItemDetail.buyer_phone }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h4 class="detail-sec-title">🚚 배송지 정보</h4>
              <div class="detail-data-box">
                <div class="data-row"><span>수령인:</span> {{ state.selectedItemDetail.receiver_name }}</div>
                <div class="data-row"><span>연락처:</span> {{ state.selectedItemDetail.receiver_phone }}</div>
                <div class="data-row"><span>주소:</span> {{ state.selectedItemDetail.shipping_address }}</div>
              </div>
            </div>
          </div>

          <!-- Inquiry/Recruitment Type Details -->
          <template v-else>
            <div class="detail-content-box" v-html="formatContent(state.selectedItemDetail?.content || state.selectedItemDetail?.product_name || '')"></div>
            
            <div v-if="isAdmin && state.selectedItemDetail?.category" class="admin-reply-section">
              <textarea v-model="state.adminReplyText" placeholder="답변을 입력하세요..."></textarea>
              <button @click="submitAdminReply(state.selectedItemDetail.id)" class="primary-btn">답변 저장</button>
            </div>
            <div v-else-if="state.selectedItemDetail?.admin_reply" class="user-reply-box">
               <h4>Admin Reply:</h4>
               <p v-html="formatContent(state.selectedItemDetail.admin_reply)"></p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="state.showContactModal" @click.self="state.showContactModal = false">
      <div class="tech-modal glass-panel small-modal">
        <div class="modal-header">
          <h3>{{ t.modal.title }}</h3>
          <button @click="state.showContactModal = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body" style="text-align: center;">
          <p style="margin-bottom: 25px; opacity: 0.8; line-height: 1.6;">{{ t.modal.desc }}</p>
          <div class="contact-email">contact@c-braindesign.com</div>
          <div class="modal-actions-grid">
            <button class="primary-btn" @click="copyEmail">{{ t.modal.copy }}</button>
            <button class="outline-btn" @click="triggerMailApp">{{ t.modal.app }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 테크 기반 프리미엄 다크 테마 변수 */
:root {
  --tech-bg: #02040a; /* 요청하신 이미지 톤에 맞춘 깊은 다크 네이비 블랙 */
  --tech-nav-bg: #02040a;
  --tech-text: #FFFFFF;
  --tech-muted: #9DA1B4;
  --tech-border: rgba(255, 255, 255, 0.15);
}

html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  background-color: var(--tech-bg) !important;
  color: var(--tech-text);
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
}

html {
  scroll-behavior: smooth;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.primary-btn {
  background: #59B3D9;
  color: #111;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.outline-btn {
  background: transparent;
  border: 1px solid #59B3D9;
  color: #59B3D9;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.outline-btn:hover {
  background: rgba(89, 179, 217, 0.1);
  transform: translateY(-2px);
}

.huge-btn {
  width: 100%;
  padding: 18px !important;
  font-size: 1.15rem !important;
  border-radius: 40px !important;
}

.back-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  border-radius: 30px;
  color: #D3D5DF;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13.4px;
  font-weight: 600;
}

.back-btn:hover {
  background: #fff;
  color: #111;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 140px 4rem 0;
}

/* Navbar & Logo styles moved to main.css to prevent version conflict flickering */

.icon-btn {
  color: #fff;
  text-decoration: none;
  font-size: 1.44rem;
  opacity: 0.9;
  position: relative;
  display: inline-flex;
  align-items: center;
}

.icon-btn:hover {
  opacity: 1;
}

.my-page-icon-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.2s;
  padding: 5px;
}

.my-page-icon-wrapper:hover {
  transform: scale(1.1);
}

.my-page-icon-wrapper .icon-emoji {
  font-size: 1.4rem;
  filter: brightness(1.5);
}

.my-page-icon-wrapper .my-text-label {
  position: absolute;
  bottom: 4px; /* 조금 더 위로 올려서 아이콘과 더 많이 겹치게 조정 */
  right: -2px; 
  font-size: 10px;
  font-weight: 900;
  color: #fff;
  background: rgba(0,0,0,0.4); 
  padding: 0px 2px;
  border-radius: 3px;
  letter-spacing: -0.2px;
  line-height: 1;
  z-index: 2;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  background: white;
  color: #1A1B26;
  font-size: 11px;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Utility Bar */
.top-utility-bar {
  background-color: var(--tech-nav-bg);
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 1001;
  padding: 8px 0;
}

.utility-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  padding: 0 4rem;
}

.utility-content a {
  color: var(--tech-text);
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Hero & Philosophy Sections are strictly managed in main.css */

.crop-bg {
  position: absolute;
  width: 200%;
  height: 100%;
  background-size: cover;
  z-index: 1;
}

.slide2-crop { background-image: url('/philosophy/slide2.png'); left: -100%; background-position: right; }
.slide3-crop { background-image: url('/philosophy/slide3.png'); left: 0; background-position: left; }
.slide4-crop { background-image: url('/philosophy/slide4.png'); left: -100%; background-position: right; }
.slide5-crop { background-image: url('/philosophy/slide5.png'); left: -100%; background-position: right; }

.dark-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(22, 24, 38, 0.7);
  z-index: 2;
}

.phil-text-content {
  position: relative;
  z-index: 3;
  text-align: center;
  max-width: 900px;
  padding: 2rem;
}

/* Products */
.products-section {
  background: #12131C;
  padding: 6rem 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.tech-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.tech-card:hover { transform: translateY(-5px); }

.card-img-placeholder {
  width: 100%;
  aspect-ratio: 4/3;
  background: #1B1E2B;
}

/* Footer */
.app-footer {
  padding: 3rem 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  color: var(--tech-muted);
}

/* Mobile Slide Menu */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
}

.hamburger-line {
  width: 22px;
  height: 2px;
  background: #fff;
}

.mobile-slide-menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 260px;
  height: 100vh;
  background: var(--tech-bg);
  z-index: 2001;
  transition: right 0.4s ease;
}

.mobile-slide-menu.is-open { right: 0; }

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1.5rem;
}

.mobile-lang-row {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.mobile-lang-row button {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
}

.mobile-lang-row button.active {
    border-color: #59B3D9;
    color: #59B3D9;
}

/* Animate */
.animate-hidden {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s ease;
}

.animate-hidden.show {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-links { display: none; }
  .mobile-menu-btn { display: flex; }
}

@media (max-width: 768px) {
  .top-utility-bar { display: none; }
  .navbar { height: 70px; top: 0; }
  .main-content { padding-top: 70px; }
  .hero-section { padding-left: 0; justify-content: center; text-align: center; }
  .grid-container { grid-template-columns: 1fr; }
  .footer-content { font-size: 0.65rem; }
  .nav-logo-img { height: 36px; }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tech-modal {
  background: #1A1B26;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 2.5rem;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-row .label {
  color: var(--tech-muted);
  font-weight: 600;
}

/* Order Detail Styles */
.order-detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.08);
}

.detail-sec-title {
  font-size: 1rem;
  font-weight: 700;
  color: #59B3D9;
  margin: 0 0 12px;
  border-bottom: 1px solid rgba(89, 179, 217, 0.2);
  padding-bottom: 8px;
}

.detail-data-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  line-height: 1.4;
}

.data-row span {
  opacity: 0.7;
}

.detail-content-box {
  background: rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
  line-height: 1.6;
  white-space: pre-line;
}

.admin-reply-section textarea {
  width: 100%;
  background: rgba(0,0,0,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  height: 100px;
}

.status-tag {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
}
.status-tag.preparing { background: rgba(255, 171, 0, 0.1); color: #ffab00; }
.status-tag.shipping { background: rgba(54, 179, 126, 0.1); color: #36b37e; }
.status-tag.delivered { background: rgba(0, 101, 255, 0.1); color: #0065ff; }
</style>