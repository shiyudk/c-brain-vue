<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { state } from '../store'
import AuthPage from '../components/AuthPage.vue'

const route = useRoute()
const router = useRouter()
const currentAuthMode = computed(() => route.query.mode || 'login')

const goHome = () => {
  const redirectTo = route.query.redirect
  if (redirectTo) {
    router.push(redirectTo)
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="auth-view-container">
    <AuthPage :currentLang="state.currentLang" :initialMode="currentAuthMode" @back="goHome" />
  </div>
</template>
