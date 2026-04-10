<script setup>
import { onMounted } from 'vue'
import { state, t } from '../store'
import { useRouter } from 'vue-router'
import h2Image from '../assets/h2.png'

const router = useRouter()

const scrollToPhilosophy = () => {
  const el = document.getElementById('quote-target')
  if (el) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

const scrollToConsulting = () => {
  const el = document.getElementById('consulting-boxes')
  if (el) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
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
          <h1 class="main-title hero-fade-in">CONTINUUM</h1>
          <h2 class="sub-title hero-fade-in delay-1">by BRAIN DESIGN</h2>
          <p class="hero-desc hero-fade-in delay-2" v-html="t.hero.crisisDesc1"></p>
          <div class="hero-buttons hero-fade-in delay-3">
            <button class="outline-btn" @click="scrollToPhilosophy">{{ t.nav.company }}</button>
            <a href="#" class="link-btn" @click.prevent="scrollToPhilosophy">{{ state.currentLang === 'ko' ? '시스템 철학 →' : 'System Philosophy →' }}</a>
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
    
        <div class="full-screen-section">
          <div class="crop-bg slide2-crop"></div>
          <div class="dark-overlay"></div>
          <div class="phil-text-content">
            <h3 class="animate-hidden delay-1">{{ t.hero.crisisTitle }}</h3>
            <p class="animate-hidden delay-2">{{ t.hero.crisisDesc1 }}</p>
            <p class="animate-hidden delay-3" v-html="t.hero.crisisDesc2"></p>
          </div>
        </div>
    
        <div class="full-screen-section">
          <div class="crop-bg slide3-crop"></div>
          <div class="dark-overlay"></div>
          <div class="phil-text-content">
            <h3 class="animate-hidden delay-1">{{ t.hero.waverTitle }}</h3>
            <h4 class="sub-heading animate-hidden delay-2">{{ t.hero.waverSub }}</h4>
            <p class="animate-hidden delay-3" v-html="t.hero.waverDesc"></p>
            <div class="phil-box animate-hidden delay-4">
              <p v-html="t.hero.waverBox"></p>
            </div>
          </div>
        </div>
    
        <div class="full-screen-section">
          <div class="crop-bg slide4-crop"></div>
          <div class="dark-overlay"></div>
          <div class="phil-text-content animate-hidden">
            <h3>{{ t.hero.signalTitle }}</h3>
            <ul class="phil-list">
              <li>
                <span class="icon">⚠️</span>
                <p v-html="t.hero.signalList1"></p>
              </li>
              <li>
                <span class="icon">⚖️</span>
                <p v-html="t.hero.signalList2"></p>
              </li>
              <li>
                <span class="icon">🛡️</span>
                <p v-html="t.hero.signalList3"></p>
              </li>
            </ul>
          </div>
        </div>
    
        <div class="full-screen-section">
          <div class="crop-bg slide5-crop"></div>
          <div class="dark-overlay"></div>
          <div class="phil-text-content animate-hidden">
            <h3 class="giant-title" v-html="t.hero.systemTitle"></h3>
            <h4 class="sub-heading">{{ t.hero.systemSub }}</h4>
            <p>{{ t.hero.systemDesc1 }}</p>
            <p>{{ t.hero.systemDesc2 }}</p>
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
