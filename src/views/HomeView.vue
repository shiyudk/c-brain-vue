<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { state, t } from '../store'
const router = useRouter()

// Use h2 (Company background) for the main Hero
const h2Image = '/h2.png'
const companyBg = '/company3.png'

const companyBgStyle = computed(() => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${companyBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}))

const scrollToIndex = (id, targetCenter = true) => {
  const el = document.getElementById(id)
  if (el) {
    const rect = el.getBoundingClientRect()
    let offsetTop;
    if (targetCenter) {
      // ElementY + ElementH/2 - ViewportH/2 - (HeaderH/2 = 74)
      offsetTop = rect.top + window.scrollY - (window.innerHeight / 2) + (rect.height / 2) - 74
    } else {
      // Offset for 148px total header (30 utility + 118 nav)
      offsetTop = rect.top + window.scrollY - 148
    }
    window.scrollTo({ top: offsetTop, behavior: 'smooth' })
  }
}

const scrollToIntro = () => {
  // Center this section in viewport as requested
  scrollToIndex('philosophy-company-section', true)
}

const scrollToPhilosophy = () => {
  scrollToIndex('quote-target', true)
}

const scrollToConsulting = () => {
  scrollToIndex('consulting-boxes', true)
}

const sendMail = () => {
  state.showContactModal = true
}

onMounted(() => {
  window.scrollTo(0, 0);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show')
      } else {
        entry.target.classList.remove('show')
      }
    })
  }, { threshold: 0.1 })
  const hiddenElements = document.querySelectorAll('.animate-hidden')
  hiddenElements.forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="home-wrapper">
    <!-- Hero Section with CBD Background -->
    <section id="hero" class="hero-section" :style="{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${h2Image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#02040a'
      }">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="main-title animate-hidden stagger-up">CONTINUUM</h1>
          <h2 class="sub-title animate-hidden stagger-up delay-1">by BRAIN DESIGN</h2>
          <p class="hero-desc animate-hidden stagger-up delay-2" v-html="t.hero.crisisDesc1"></p>
          <div class="hero-buttons animate-hidden stagger-up delay-3">
            <button class="outline-btn" @click="scrollToIntro">{{ t.nav.company }}</button>
            <a href="#" class="link-btn" @click.prevent="scrollToPhilosophy">시스템 철학 →</a>
          </div>
        </div>
    </div>
  </section>

    <!-- Philosophy Sections -->
    <section id="philosophy" class="philosophy-section">
        <div class="full-screen-quote">
          <div id="philosophy-company-section-box" class="quote-content animate-hidden">
            <div class="quote-text-wrapper">
              <span class="quote-mark">“</span>
              <h2 id="quote-target" class="quote-text" v-html="t.hero.quote1"></h2>
              <span class="quote-mark closing-quote">”</span>
            </div>
            <p class="quote-eyebrow align-right delay-2">{{ t.hero.quote2 }}</p>
          </div>
        </div>
    
        <div id="philosophy-company-section" class="full-screen-section" :style="companyBgStyle">
          <div class="phil-overlay-text quote-content">
            <div class="quote-text animate-hidden stagger-up" style="font-weight: 700;">
              <strong class="brand-white-bold">Brain Design</strong>은 즉시 복귀할 수 있는 강력한 구조적 프레임을 제공하여
            </div>
            <div class="quote-text animate-hidden stagger-up delay-s1" style="font-weight: 700;">
              지속 가능한 삶의 방식을 완성합니다
            </div>
            <div class="phil-line animate-hidden stagger-up delay-s2"></div>
            <p class="phil-subtext animate-hidden stagger-up delay-s3" v-html="t.hero.crisisDesc2"></p>
          </div>
        </div>
    </section>

    <!-- Consulting Services (3 cards) -->
    <section id="products" class="products-section">
        <div class="section-container animate-hidden">
          <div id="consulting-boxes" class="grid-container">
            <div class="tech-card" @click="sendMail">
               <div class="card-img-placeholder" style="background-image: url('/images/personal.png'); background-size: cover; background-position: center;"><div class="glow"></div></div>
               <div class="tech-card-info">
                 <h3>{{ t.products.personal }}</h3>
                 <button>{{ t.products.inquireBtn }}</button>
               </div>
            </div>
            <div class="tech-card" @click="sendMail">
              <div class="card-img-placeholder" style="background-image: url('/images/ai.png'); background-size: cover; background-position: center;"><div class="glow"></div></div>
              <div class="tech-card-info">
                <h3>{{ t.products.ai }}</h3>
                <button>{{ t.products.inquireBtn }}</button>
              </div>
            </div>
            <div class="tech-card" @click="sendMail">
              <div class="card-img-placeholder" style="background-image: url('/images/kids.png'); background-size: cover; background-position: center;"><div class="glow"></div></div>
              <div class="tech-card-info">
                <h3>{{ t.products.kids }}</h3>
                <button>{{ t.products.inquireBtn }}</button>
              </div>
            </div>
          </div>
        </div>
    </section>

  </div>
</template>
