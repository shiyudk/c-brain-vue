<script setup>
import { ref, onMounted } from 'vue'
import CheckoutPage from './components/CheckoutPage.vue'

const currentView = ref('home')
const selectedProduct = ref(null)
const isMobileMenuOpen = ref(false)
const savedScrollY = ref(0)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const goToCheckout = (productName) => {
  savedScrollY.value = window.scrollY
  selectedProduct.value = productName
  currentView.value = 'checkout'
  window.scrollTo(0, 0)
}

const goHome = () => {
  currentView.value = 'home'
  setTimeout(() => window.scrollTo(0, savedScrollY.value), 0)
}

const showContactModal = ref(false)

const sendMail = () => {
  showContactModal.value = true
}

const copyEmail = () => {
  navigator.clipboard.writeText('contact@c-braindesign.com')
  alert('이메일 주소가 복사되었습니다!')
}

const triggerMailApp = () => {
  const mailToLink = document.createElement('a')
  mailToLink.href = 'mailto:contact@c-braindesign.com'
  mailToLink.click()
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
    <div class="top-utility-bar" v-show="currentView === 'home'">
      <div class="utility-content">
        <a href="#">고객지원</a>
        <a href="#">채용정보</a>
        <a href="#">회원가입</a>
      </div>
    </div>

    <!-- 메인 네비게이션 바 -->
    <header class="navbar" v-show="currentView === 'home'">
      <div class="nav-content">
        <a href="#" class="logo">
          <img src="/logo.jpg" alt="Brain Design" class="nav-logo-img" />
        </a>
        <nav class="nav-links">
          <a href="#company">회사소개</a>
          <a href="#products">AI로봇 컨설팅</a>
          <a href="#products">퍼스널 컨설팅</a>
          <a href="#products">키즈 컨설팅</a>
        </nav>
        <div class="nav-actions">
          <!-- 둥근 검색창 -->
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="검색" />
          </div>
          <a href="#cart" class="icon-btn hide-mobile">🛒</a>
          <a href="#login" class="icon-btn hide-mobile">👤</a>
          <!-- 햄버거 메뉴 버튼 -->
          <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Slide-out Menu -->
    <div class="mobile-overlay" :class="{ 'is-open': isMobileMenuOpen }" @click="toggleMobileMenu"></div>
    <div class="mobile-slide-menu" :class="{ 'is-open': isMobileMenuOpen }">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">MENU</span>
        <button class="close-menu-btn" @click="toggleMobileMenu">✕</button>
      </div>
      <nav class="mobile-nav-links">
        <a href="#company" @click="toggleMobileMenu">회사소개</a>
        <a href="#products" @click="toggleMobileMenu">AI로봇 컨설팅</a>
        <a href="#products" @click="toggleMobileMenu">퍼스널 컨설팅</a>
        <a href="#products" @click="toggleMobileMenu">키즈 컨설팅</a>
      </nav>
    </div>

    <main class="main-content">
      <!-- HOME VIEW (Tech Landing Page) -->
      <div v-show="currentView === 'home'">
        


        <!-- Philosophy Introduction (Clarity over Impulse) -->
        <section id="philosophy" class="philosophy-section">

            <!-- Part 1: Dynamic Full-Screen Quote -->
            <div class="full-screen-quote intro-fade-in">
              <div class="quote-content">
                <span class="quote-mark">“</span>
                <h2 class="quote-text">"시스템은 자유를 제한하는 것이 아니라,<br>더 큰 자유로 가는 길을 여는 것입니다."</h2>
                <p class="quote-eyebrow align-right">— Clarity over Impulse Philosophy</p>
              </div>
            </div>
        
            <!-- Part 2: 현대인의 의사결정 위기 -->
            <div class="full-screen-section">
              <div class="crop-bg slide2-crop"></div>
              <div class="dark-overlay"></div>
              <div class="phil-text-content animate-hidden">
                <h3>현대인의 의사결정 위기</h3>
                <p>우리는 매 순간 수많은 정보와 감정의 파도 속에서 결정을 내립니다. 하지만 그 결정이 정말 당신의 의지에 의한 것입니까?</p>
                <p><strong>파편화된 선택과 순간의 충동</strong>은 우리의 삶을 불안정한 궤도로 몰아넣고 있습니다.</p>
              </div>
            </div>
        
            <!-- Part 3: 왜 우리는 항상 흔들리는가 -->
            <div class="full-screen-section">
              <div class="crop-bg slide3-crop"></div>
              <div class="dark-overlay"></div>
              <div class="phil-text-content animate-hidden">
                <h3>왜 우리는 항상 흔들리는가</h3>
                <h4 class="sub-heading">신경계 구조의 관점</h4>
                <p>우리의 뇌는 <strong>불확실성</strong>을 생존의 위협으로 간주합니다. 기준이 없는 선택은 뇌의 '편도체'를 자극하여 불안을 증폭시킵니다.</p>
                <div class="phil-box">
                  <p>🧠 <strong>감정 vs 시스템:</strong> 감정은 위험을 알리는 '신호'일 뿐이며, 의사결정의 '기준'이 되어서는 안 됩니다.</p>
                </div>
              </div>
            </div>
        
            <!-- Part 4: 감정은 신호지, 기준이 아니다 -->
            <div class="full-screen-section">
              <div class="crop-bg slide4-crop"></div>
              <div class="dark-overlay"></div>
              <div class="phil-text-content animate-hidden">
                <h3>감정은 신호지, 기준이 아니다</h3>
                <ul class="phil-list">
                  <li>
                    <span class="icon">⚠️</span>
                    <p><strong>생각이 많을수록 인생이 느려지는 이유:</strong> 기준 없이 감정에 매몰되어 '생각의 루프'에 갇히기 때문입니다.</p>
                  </li>
                  <li>
                    <span class="icon">⚖️</span>
                    <p><strong>불안한 사람일수록 기준이 필요하다:</strong> 외부 환경이 흔들릴 때 나를 잡아줄 수 있는 것은 오직 명확한 '판단 기준'뿐입니다.</p>
                  </li>
                  <li>
                    <span class="icon">🛡️</span>
                    <p><strong>치유가 아닌 설계:</strong> 불안을 달래는 힐링보다, 불안 속에서도 작동하는 사고 구조를 만드는 것이 핵심입니다.</p>
                  </li>
                </ul>
              </div>
            </div>
        
            <!-- Part 5: SYSTEM BEFORE EMOTIONS -->
            <div class="full-screen-section">
              <div class="crop-bg slide5-crop"></div>
              <div class="dark-overlay"></div>
              <div class="phil-text-content animate-hidden">
                <h3 class="giant-title">SYSTEM BEFORE<br>EMOTIONS</h3>
                <h4 class="sub-heading">시스템이 감정을 앞섭니다</h4>
                <p>인간의 의지력은 고갈되는 자원입니다. 우리는 감정에 의존하지 않아도 일관된 성과를 낼 수 있는 실행 프로세스를 구축합니다.</p>
                <p>기분이 좋지 않아도, 의지가 약해져도 작동하는 견고한 시스템이 당신의 일상을 보호합니다.</p>
              </div>
            </div>
        
        </section>

        <!-- 디테일 상품 라인업 섹션 -->
        <section id="products" class="products-section">
          <div class="section-container animate-hidden">
            <div class="grid-container">
              <!-- Product 1: AI (reordered) -->
              <div class="tech-card" @click="sendMail">
                <div class="card-img-placeholder" style="background-image: url('/images/ai.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>AI로봇 기반 컨설팅</h3>
                  <button>견적문의</button>
                </div>
              </div>

              <!-- Product 2: Personal (reordered) -->
              <div class="tech-card" @click="sendMail">
                <div class="card-img-placeholder" style="background-image: url('/images/personal.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>하이엔드 퍼스널 컨설팅</h3>
                  <button>견적문의</button>
                </div>
              </div>

              <!-- Product 3: Kids (reordered) -->
              <div class="tech-card" @click="sendMail">
                <div class="card-img-placeholder" style="background-image: url('/images/kids.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>프리미엄 키즈 컨설팅</h3>
                  <button>견적문의</button>
                </div>
              </div>
            </div>

            <div class="section-divider">
              <h2>Brain Design 기타 제품</h2>
            </div>

            <div class="grid-container">
              <!-- Product 4: Cake Knife -->
              <div class="tech-card" @click="goToCheckout('케익칼')">
                <div class="card-img-placeholder" style="background-image: url('/images/cake_knife.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>케익칼</h3>
                  <button>구매하기</button>
                </div>
              </div>

              <!-- Product 5: Deep Sauce -->
              <div class="tech-card" @click="goToCheckout('딥소스')">
                <div class="card-img-placeholder" style="background-image: url('/images/dip_sauce.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>딥소스</h3>
                  <button>구매하기</button>
                </div>
              </div>


            </div>
          </div>
        </section>

      </div>
      
      <!-- CHECKOUT VIEW (결제 페이지) -->
      <template v-if="currentView === 'checkout'">
        <div class="checkout-header">
          <button @click="goHome" class="back-btn">← 뒤로가기</button>
          <h2>{{ selectedProduct }} 결제/상담예약</h2>
        </div>
        <CheckoutPage :productName="selectedProduct" />
      </template>
    </main>

    <!-- 견적문의 모달 팝업 -->
    <div class="modal-overlay" v-show="showContactModal" @click="showContactModal = false">
      <div class="modal-content" @click.stop>
        <h3>견적 및 상담 문의</h3>
        <p class="modal-desc">아래 이메일로 편하게 문의를 남겨주시면 빠르게 답변해 드리겠습니다.</p>
        <div class="email-box">
          <strong>contact@c-braindesign.com</strong>
        </div>
        <div class="modal-actions">
          <button class="outline-btn" @click="copyEmail">주소 복사하기</button>
          <button class="primary-btn" @click="triggerMailApp">메일 앱 열기</button>
        </div>
        <button class="close-btn" @click="showContactModal = false">✕</button>
      </div>
    </div>

    <!-- Footer Section -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>상호명: 컨티뉴엄 브레인 디자인 (CBD) | 대표자명: 윤신희</p>
        <p>사업자등록번호: 746-36-01588 | 사업장 주소: 서울특별시 동대문구 한천로 46길 85-6</p>
        <p>대표문의: contact@c-braindesign.com | 대표번호: 010-7567-7189</p>
        <p class="copyright">&copy; 2026 Continuum Brain Design. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* 테크 기반 프리미엄 다크 테마 변수 */
:root {
  --tech-bg: #1A1B26; /* 매우 깊은 네이비/보라빛 배경 */
  --tech-nav-bg: #1A1B26; /* 배경과 완벽히 동일한 색상으로 블렌딩 */
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
.app-footer {
  background: var(--tech-bg);
  padding: 3rem 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
}
.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  color: var(--tech-muted);
  font-size: 0.85rem;
  line-height: 1.6;
}
.footer-content p {
  margin: 0.3rem 0;
}
.copyright {
  margin-top: 1rem !important;
  opacity: 0.6;
  font-size: 0.75rem;
}

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
  height: 90px;
  background: var(--tech-nav-bg); /* #1A1B26 */
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

.nav-logo-img {
  height: 68px; /* 1.5배 크기로 상향 */
  vertical-align: middle;
  /* CSS Magic: 압도적인 대비로 JPG 아티팩트를 완벽 블랙으로 눌러 투명처리 */
  filter: grayscale(1) invert(1) contrast(1000%) brightness(150%);
  mix-blend-mode: screen;
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
   Philosophy Section (Dynamic Scroll Full-bleed)
-------------------------------------- */
.philosophy-section {
  padding: 0 0 4rem 0;
  background: var(--tech-bg);
  position: relative;
  width: 100%;
}

.full-screen-quote {
  width: 100vw;
  min-height: 85vh; /* 스크롤 다운을 유도하기 위해 100vh에서 85vh로 줄임 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tech-bg); /* Current background color */
  margin-left: calc(-50vw + 50%); /* Full bleed override */
  position: relative;
  overflow: hidden;
}

/* Subtle glowing background orb for extra dynamic feel */
.full-screen-quote::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(108,130,248,0.04) 0%, transparent 60%);
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
}

.quote-content {
  max-width: 900px;
  padding: 0 4rem;
  position: relative;
  z-index: 2;
  text-align: left;
  margin-top: 3rem; /* 글자 세로 한 줄 크기만큼 딱 내려서 시각적 중앙 재정렬 */
}

.quote-mark {
  font-size: 4.8rem;
  color: rgba(255, 255, 255, 0.08); /* Very faint watermark quote */
  position: absolute;
  top: -2.5rem;
  left: -1.5rem;
  font-family: Georgia, serif;
  line-height: 1;
  user-select: none;
}

.quote-text {
  font-size: clamp(1.44rem, 2.8vw, 2.0rem); /* 100% -> 80% 사이즈 축소 */
  font-weight: 300;
  line-height: 1.7;
  font-style: italic;
  margin: 0 0 2rem 0;
  color: #fff;
  letter-spacing: -0.5px;
}

.quote-eyebrow {
  color: var(--tech-muted);
  font-size: 0.95rem;
  letter-spacing: 1px;
  font-style: italic;
}

.align-right {
  text-align: right;
  display: block;
}

@keyframes slowFadeUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.intro-fade-in {
  animation: slowFadeUp 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes slowZoomCrop {
  0% { transform: scale(1.4); }
  100% { transform: scale(1.55); }
}

.full-screen-section {
  position: relative;
  width: 100vw;
  min-height: 85vh; /* 화면 크기에 맞게 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-left: calc(-50vw + 50%); /* 강제로 100% 가로 확장 보장 */
}

/* 이미지 내 텍스트 크롭을 위해 너비를 200%로 설정 (가로 비율 무시하고 강제 절반 크롭) */
.crop-bg {
  position: absolute;
  top: 0;
  width: 200%; 
  height: 100%;
  background-size: cover;
  z-index: 1;
  animation: slowZoomCrop 15s infinite alternate ease-in-out; /* 25s -> 15s로 속도 개선 */
}

/* 슬라이드 2: 그림이 오른쪽. 박스의 우측 절반 활용, 백그라운드도 우측 고정, 스케일 중심축 우측 중앙(75%) */
.slide2-crop { 
  left: -100%; 
  background-image: url('/philosophy/slide2.png'); 
  background-position: right center;
  transform-origin: 75% 50%;
}
/* 슬라이드 3: 그림이 왼쪽. 박스의 좌측 활용, 스케일 중심축 좌측 중앙(25%) */
.slide3-crop { 
  left: 0; 
  background-image: url('/philosophy/slide3.png'); 
  background-position: left center;
  transform-origin: 25% 50%;
}
/* 슬라이드 4: 그림이 오른쪽. */
.slide4-crop { 
  left: -100%; 
  background-image: url('/philosophy/slide4.png'); 
  background-position: right center;
  transform-origin: 75% 50%;
}
/* 슬라이드 5: 구조물 그림이 오른쪽. */
.slide5-crop { 
  left: -100%; 
  background-image: url('/philosophy/slide5.png'); 
  background-position: right center;
  transform-origin: 75% 50%;
}

.dark-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(22, 24, 38, 0.70); /* 가독성을 위한 오버레이 */
  z-index: 2;
}

.phil-text-content {
  position: relative;
  z-index: 3;
  color: white;
  text-align: center; /* 텍스트 영역 중앙 정렬 */
  padding: 4rem 2rem;
  max-width: 900px;
  width: 100%;
}

.phil-text-content h3 {
  font-size: clamp(1.4rem, 2vw, 1.8rem); /* 글씨 크기 크게 축소 */
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #fff;
  letter-spacing: -1px;
}

.phil-text-content h3.giant-title {
  font-size: clamp(1.8rem, 2.5vw, 2.6rem);
  line-height: 1.1;
  color: #59B3D9; /* 채도를 30% 낮춘 부드러운 스카이블루 */
}

.phil-text-content p {
  font-size: 0.95rem; /* 약 70% 폰트 사이즈 */
  line-height: 1.8;
  color: #D3D5DF;
  margin-bottom: 1rem;
  word-break: keep-all;
}

.phil-text-content p strong {
  color: #fff;
  font-weight: bold;
}

.sub-heading {
  font-size: 1.1rem;
  color: #59B3D9; /* 채도를 30% 낮춘 부드러운 스카이블루 */
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.phil-box {
  background: rgba(89, 179, 217, 0.1); /* 톤다운된 하늘색 배경 */
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 2rem;
  border-left: 4px solid #59B3D9; /* 톤다운된 하늘색 보더 */
  text-align: left;
}

.phil-box p {
  margin: 0;
  font-size: 0.9rem;
}

.phil-list {
  list-style: none;
  padding: 0;
  margin-top: 2rem;
  text-align: left;
}

.phil-list li {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.05); /* 테크 스타일 박스 내부 처리 */
  padding: 1.2rem;
  border-radius: 10px;
}
.phil-list li p { margin: 0; font-size: 0.9rem; }

.phil-list .icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  /* No overrides needed, geometric crop math works perfectly on mobile now */
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

.section-divider {
  text-align: center;
  margin: 4rem 0 2rem;
  padding-top: 4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.section-divider h2 {
  font-size: 1.8rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .grid-container {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .grid-container {
    gap: 1rem;
  }
}

.tech-card {
  width: calc(33.333% - 1.34rem);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}

@media (max-width: 1024px) {
  .tech-card {
    width: calc(50% - 0.75rem);
  }
}

@media (max-width: 768px) {
  .tech-card {
    width: 100%;
  }
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
  /* 모바일 네비게이션 최적화 */
  .navbar {
    height: 65px;
    top: 0 !important;
    background: var(--tech-bg) !important;
  }
  .nav-content {
    padding: 0 1.2rem;
  }
  .nav-logo-img {
    height: 40px; /* 모바일에 맞게 로고 축소 */
  }
  .top-utility-bar {
    display: none; /* 공간 확보를 위해 유틸바 숨김 */
  }
  .quote-content {
    padding: 0 2rem;
  }
  .quote-text {
    font-size: 1.2rem;
  }
}

/* Mobile Slide Menu Styles */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1002;
  padding: 5px 10px;
}

.hamburger-line {
  width: 22px;
  height: 2px;
  background-color: var(--tech-text);
  transition: all 0.3s ease;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 2000;
  backdrop-filter: blur(3px);
}

.mobile-overlay.is-open {
  opacity: 1;
  visibility: visible;
}

.mobile-slide-menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 260px;
  height: 100vh;
  background: var(--tech-bg);
  box-shadow: -5px 0 30px rgba(0,0,0,0.5);
  z-index: 2001;
  transition: right 0.4s cubic-bezier(0.77, 0, 0.175, 1);
  display: flex;
  flex-direction: column;
}

.mobile-slide-menu.is-open {
  right: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid var(--tech-border);
}

.mobile-menu-title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--tech-text);
}

.close-menu-btn {
  background: none;
  border: none;
  color: var(--tech-text);
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1.5rem;
}

.mobile-nav-links a {
  color: var(--tech-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.2s;
}

.mobile-nav-links a:hover {
  color: var(--tech-muted);
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
  .search-bar {
    width: 100px; /* 기존 150px에서 2/3 사이즈로 축소 */
  }
  .mobile-menu-btn {
    margin-right: 10px; /* 검색창이 줄어듦에 따라 아이콘도 자연스럽게 왼쪽으로 이동 */
  }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: var(--tech-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.modal-content h3 {
  margin-top: 0;
  font-size: 1.4rem;
  color: #fff;
  margin-bottom: 1rem;
}
.modal-desc {
  color: var(--tech-muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
.email-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #59B3D9;
  user-select: all;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.modal-actions button {
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  border: none;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
.modal-actions button:hover {
  opacity: 0.8;
}
.modal-actions .outline-btn {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}
.modal-actions .primary-btn {
  background: #59B3D9;
  color: #111;
}
.close-btn {
  position: absolute;
  top: 1rem; right: 1rem;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}
</style>
