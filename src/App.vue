<script setup>
import { ref, onMounted } from 'vue'
import CheckoutPage from './components/CheckoutPage.vue'

const currentView = ref('home')
const selectedProduct = ref(null)

const goToCheckout = (productName) => {
  selectedProduct.value = productName
  currentView.value = 'checkout'
  window.scrollTo(0, 0)
}

// 스크롤 시 부드럽게 나타나는 애니메이션 설정
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
  <div class="app-container">
    
    <!-- 최상단 유틸리티 바 (고객지원, 비즈니스 등) -->
    <div class="top-utility-bar" v-if="currentView === 'home'">
      <div class="utility-content">
        <a href="#">고객지원</a>
        <a href="#">비즈니스 ↗</a>
        <a href="#">사업자몰 ↗</a>
        <a href="#">브레인스토어</a>
        <a href="#">지속가능경영</a>
      </div>
    </div>

    <!-- 메인 네비게이션 바 -->
    <header class="navbar" v-if="currentView === 'home'">
      <div class="nav-content">
        <div class="logo">
          <!-- 삼성 폰트 느낌의 볼드 텍스트 로고 -->
          <span class="brand-text">BRAIN DESIGN</span>
        </div>
        <nav class="nav-links">
          <a href="#science">기획전</a>
          <a href="#science">과학교구</a>
          <a href="#ai">AI로봇 컨설팅</a>
          <a href="#personal">개인컨설팅</a>
          <a href="#lifestyle">리빙/굿즈</a>
          <a href="#ai-club">AI 구독클럽</a>
        </nav>
        <div class="nav-actions">
          <!-- 둥근 검색창 -->
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="AI 컨설팅 검색" />
          </div>
          <a href="#cart" class="icon-btn">🛒</a>
          <a href="#login" class="icon-btn">👤</a>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- HOME VIEW (Tech Landing Page) -->
      <template v-if="currentView === 'home'">
        
        <!-- 거대한 Hero Section (갤럭시 S26 느낌) -->
        <section id="hero" class="hero-section">
          <div class="hero-bg"></div>
          <div class="hero-content animate-hidden">
            <h1 class="main-title">Brain Design</h1>
            <h2 class="sub-title">Premium AI ✨</h2>
            <p class="hero-desc">미래를 설계하는 창의적인 교육 및 컨설팅 혜택!</p>
            <div class="hero-buttons">
              <a href="#products" class="link-btn">더 알아보기</a>
              <button @click="goToCheckout('브레인 패키지')" class="outline-btn">구매하기</button>
            </div>
          </div>
        </section>

        <!-- 디테일 상품 라인업 섹션 -->
        <section id="products" class="products-section">
          <div class="section-container animate-hidden">
            <div class="grid-container">
              <!-- Product 1 -->
              <div class="tech-card" @click="goToCheckout('2-5세 과학교구')">
                <div class="card-img-placeholder c-science">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>고등과학 2-5세 과학교구</h3>
                  <button>구매하기</button>
                </div>
              </div>

              <!-- Product 2 -->
              <div class="tech-card" @click="goToCheckout('AI로봇 컨설팅')">
                <div class="card-img-placeholder c-ai">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>AI로봇 기반 컨설팅</h3>
                  <button>구매하기</button>
                </div>
              </div>

              <!-- Product 3 -->
              <div class="tech-card" @click="goToCheckout('개인 컨설팅')">
                <div class="card-img-placeholder c-personal">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>1:1 하이엔드 멘토링</h3>
                  <button>구매하기</button>
                </div>
              </div>

              <!-- Product 4 -->
              <div class="tech-card" @click="goToCheckout('라이프스타일 굿즈')">
                <div class="card-img-placeholder c-goods">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>케익칼 · 딥소스 · 동화책</h3>
                  <button>구매하기</button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </template>
      
      <!-- CHECKOUT VIEW (결제 페이지) -->
      <template v-if="currentView === 'checkout'">
        <div class="checkout-header">
          <button @click="currentView = 'home'" class="back-btn">← 뒤로가기</button>
          <h2>{{ selectedProduct }} 결제/상담예약</h2>
        </div>
        <CheckoutPage />
      </template>
    </main>
  </div>
</template>

<style>
/* 테크 기반 프리미엄 다크 테마 변수 */
:root {
  --tech-bg: #1A1B26; /* 매우 깊은 네이비/보라빛 배경 */
  --tech-nav-bg: rgba(26, 27, 38, 0.85);
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
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 최상단 유틸리티 바 (매우 작고 연한 텍스트) */
.top-utility-bar {
  background-color: transparent;
  width: 100%;
  position: absolute;
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
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
  letter-spacing: -0.2px;
}

.utility-content a:hover {
  text-decoration: underline;
  opacity: 1;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 30px; /* 유틸리티 바 아래에 위치 */
  left: 0;
  right: 0;
  height: 70px;
  background: var(--tech-nav-bg);
  backdrop-filter: blur(12px);
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav-content {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem;
}

.logo {
  flex-shrink: 0;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: #fff;
}

/* 중앙 메뉴 링크 */
.nav-links {
  display: flex;
  gap: 1.8rem;
  align-items: center;
  flex-grow: 1;
  margin-left: 3rem;
}

.nav-links a {
  color: var(--tech-text);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  transition: opacity 0.2s;
}

.nav-links a:hover {
  opacity: 0.7;
}

/* 우측 액션 (검색창, 아이콘) */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 1rem;
  border: 1px solid transparent;
  transition: border 0.3s;
}

.search-bar:hover {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

.search-bar input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.85rem;
  width: 120px;
  outline: none;
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.icon-btn {
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;
  opacity: 0.9;
}

.icon-btn:hover {
  opacity: 1;
}

/* 스크롤 애니메이션 컴포넌트 */
.animate-hidden {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.animate-hidden.show {
  opacity: 1;
  transform: translateY(0);
}

/* -------------------------------------
   Hero Section (Samsung 갤럭시 S26 느낌)
-------------------------------------- */
.hero-section {
  position: relative;
  min-height: 100vh;
  width: 100%; /* 전체 화면 너비 차지 */
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 좌측 정렬 */
  padding-left: 10%;
  overflow: hidden;
}

/* 깊고 메탈릭한 보라/파란색 그라데이션 바탕 */
.hero-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 70% 50%, #2b305c 0%, #161723 60%, #0d0e15 100%);
  z-index: -1;
}

/* 스마트폰 렌더링 같은 엣지 효과를 주기 위한 은은한 빛 */
.hero-bg::after {
  content: '';
  position: absolute;
  right: -10vw;
  top: 20vh;
  width: 60vw;
  height: 80vh;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  border-radius: 50%;
  transform: rotate(-30deg);
  filter: blur(60px);
}

.hero-content {
  z-index: 10;
  max-width: 600px;
  margin-top: -50px;
}

.main-title {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 800;
  margin: 0;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1.1;
}

.sub-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  margin: 0.5rem 0 1.5rem 0;
  color: #fff;
  letter-spacing: -0.5px;
}

.hero-desc {
  font-size: 1.3rem;
  color: #E2E4EC;
  margin-bottom: 2.5rem;
  font-weight: 400;
  letter-spacing: -0.5px;
}

.hero-buttons {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.link-btn {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 6px;
  font-weight: 600;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.link-btn:hover {
  opacity: 0.7;
}

.outline-btn {
  background: transparent;
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.outline-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}


/* -------------------------------------
   Products Grid Section
-------------------------------------- */
.products-section {
  background: #12131C; /* 히어로 아래 깊은 어둠 */
  padding: 6rem 0;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.tech-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}

.tech-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.06);
}

.card-img-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  background: #1B1E2B;
  overflow: hidden;
}

/* 카드 내부에 메탈릭/유리 빛 들어간 구슬 느낌 효과 */
.glow {
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(108,130,248,0.4) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

.tech-card-info {
  padding: 1.5rem;
  text-align: center;
}

.tech-card-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #fff;
}

.tech-card-info button {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.tech-card-info button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* -------------------------------------
   Checkout View
-------------------------------------- */
.checkout-header {
  padding: 2rem;
  max-width: 600px;
  margin: 120px auto 30px;
  text-align: center;
}

.back-btn {
  background: transparent;
  border: 1px solid var(--tech-border);
  padding: 8px 20px;
  border-radius: 30px;
  color: var(--tech-text);
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #fff;
  color: var(--tech-bg);
}

/* Mobile Responsiveness */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding-left: 0;
    justify-content: center;
  }
  .hero-content {
    text-align: center;
  }
  .hero-buttons {
    justify-content: center;
  }
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
