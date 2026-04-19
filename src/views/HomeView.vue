<script setup>
import { onMounted, computed } from 'vue'
import { state, t } from '../store'
import { useRouter } from 'vue-router'
import h2Image from '../assets/h2.png'
const companyImage = "/company3'.png"

const companyBgStyle = computed(() => ({
  backgroundImage: `url("${companyImage}")`,
  backgroundSize: '92%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'var(--tech-bg)'
}))

const router = useRouter()

const scrollToIndex = (id) => {
  const el = document.getElementById(id)
  if (el) {
    const rect = el.getBoundingClientRect()
    const offsetTop = rect.top + window.scrollY - (window.innerHeight / 2) + (rect.height / 2)
    window.scrollTo({ top: offsetTop, behavior: 'smooth' })
  }
}

const scrollToPhilosophy = () => {
  scrollToIndex('philosophy-company-section')
}

const scrollToConsulting = () => {
  scrollToIndex('consulting-boxes')
}

const sendMail = () => {
  state.showContactModal = true
}

const goToDetail = (id) => {
  router.push({ name: 'detail', params: { id } })
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
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section" :style="{ 
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
            <button class="outline-btn" @click="scrollToPhilosophy">{{ t.nav.company }}</button>
            <a href="#" class="link-btn" @click.prevent="scrollToIndex('quote-target')">{{ state.currentLang === 'ko' ? '시스템 철학 →' : 'System Philosophy →' }}</a>
          </div>
        </div>
    </div>
  </section>

    <!-- Philosophy Sections -->
    <section id="philosophy" class="philosophy-section">
        <div class="full-screen-quote">
          <div class="quote-content animate-hidden">
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
            <div class="quote-text animate-hidden stagger-up">
              <strong class="brand-white-bold">Brain Design</strong><strong class="quote-subtext-match">은 즉시 복귀할 수 있는 강력한 구조적 프레임을 제공하여</strong>
            </div>
            <div class="quote-text animate-hidden stagger-up delay-s1">
              <strong class="quote-subtext-match">지속 가능한 삶의 방식을 완성합니다</strong>
            </div>
          </div>
        </div>
    </section>

    <!-- Products Grid -->
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
