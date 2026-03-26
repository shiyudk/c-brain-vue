<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../supabase.js'

const props = defineProps({
  currentLang: {
    type: String,
    default: 'ko'
  },
  initialMode: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['back'])

const isLogin = ref(props.initialMode === 'login')
const signupComplete = ref(false)
const registeredUserName = ref('')

watch(() => props.initialMode, (newVal) => {
  isLogin.value = newVal === 'login'
})

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const name = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  name.value = ''
}

const t = computed(() => {
  const dict = {
    ko: {
      loginTitle: '로그인',
      signupTitle: '회원가입',
      email: '이메일 주소',
      password: '비밀번호',
      passwordConfirm: '비밀번호 확인',
      name: '이름 (실명)',
      loginBtn: '로그인',
      signupBtn: '계정 만들기',
      noAccount: '아직 계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      forgotBtn: '비밀번호를 잊으셨나요?',
      backBtn: '← 뒤로가기',
      google: 'Google로 시작하기',
      kakao: '카카오로 시작하기',
      agreeTerms: '가입 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.',
      errKey: 'API 키가 설정되지 않았습니다. 가이드를 참고해 환경변수를 등록해주세요.',
      loginSuccess: '로그인 성공!',
      signupSuccess: '회원가입 성공! 등록한 이메일을 확인하여 인증해주세요.',
      pwMismatch: '비밀번호가 서로 일치하지 않습니다.'
    },
    en: {
      loginTitle: 'Welcome Back',
      signupTitle: 'Create Account',
      email: 'Email Address',
      password: 'Password',
      passwordConfirm: 'Confirm Password',
      name: 'Full Name',
      loginBtn: 'Sign In',
      signupBtn: 'Sign Up',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      forgotBtn: 'Forgot your password?',
      backBtn: '← Back',
      google: 'Continue with Google',
      kakao: 'Continue with Kakao',
      agreeTerms: 'By signing up, you agree to our Terms of Service and Privacy Policy.',
      errKey: 'API keys are missing. Please setup environment variables.',
      loginSuccess: 'Login Successful!',
      signupSuccess: 'Signup Successful! Please check your email to verify your account.',
      pwMismatch: 'Passwords do not match.'
    }
  }
  return dict[props.currentLang] || dict.ko
})

const handleSubmit = async () => {
  if (!supabase) {
    alert(t.value.errKey); return;
  }
  if (isLogin.value) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) alert(error.message)
    else { alert(t.value.loginSuccess); emit('back'); }
  } else {
    if (password.value !== passwordConfirm.value) {
      alert(t.value.pwMismatch)
      return
    }
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: { data: { full_name: name.value } }
    })
    if (error) alert(error.message)
    else { 
      registeredUserName.value = name.value || email.value.split('@')[0]
      signupComplete.value = true 
    }
  }
}

const loginWithProvider = async (providerName) => {
  if (!supabase) { alert(t.value.errKey); return; }
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: providerName,
    options: {
      redirectTo: `${window.location.origin}/`
    }
  })
  if (error) alert(error.message)
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="checkout-header">
      <button @click="$emit('back')" class="back-btn">{{ t.backBtn }}</button>
    </div>

    <div class="auth-container animate-fade" v-if="signupComplete">
      <div class="auth-box glass-panel" style="text-align: center;">
        <h2 style="font-size:32px; margin-bottom:1rem;">🎉</h2>
        <h2 style="margin-bottom:1rem;">{{ currentLang === 'ko' ? '회원가입되셨습니다!' : 'Signup Successful!' }}</h2>
        <p style="color:rgba(255,255,255,0.7); margin-bottom:2rem;">
          {{ currentLang === 'ko' ? `${registeredUserName}님, 환영합니다.` : `Welcome, ${registeredUserName}.` }}
        </p>
        <button class="submit-btn neon-border-btn" style="width:100%" @click="$emit('back')">
          {{ currentLang === 'ko' ? '홈페이지로 가기' : 'Go to Homepage' }}
        </button>
      </div>
    </div>

    <div class="auth-container animate-fade" v-else>
      <div class="auth-box glass-panel">
        <div class="auth-header">
          <h2>{{ isLogin ? t.loginTitle : t.signupTitle }}</h2>
        </div>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="input-group" v-if="!isLogin">
            <label>{{ t.name }}</label>
            <input type="text" v-model="name" required />
          </div>

          <div class="input-group">
            <label>{{ t.email }}</label>
            <input type="email" v-model="email" required />
          </div>

          <div class="input-group">
            <label>{{ t.password }}</label>
            <input type="password" v-model="password" required />
          </div>

          <div class="input-group" v-if="!isLogin">
            <label>{{ t.passwordConfirm }}</label>
            <input type="password" v-model="passwordConfirm" required />
          </div>

          <div class="form-actions" v-if="isLogin">
            <a href="#" class="forgot-link text-small" @click.prevent>{{ t.forgotBtn }}</a>
          </div>

          <button type="submit" class="submit-btn neon-border-btn">
            {{ isLogin ? t.loginBtn : t.signupBtn }}
          </button>
        </form>

        <div class="social-login">
          <div class="divider">
            <span>OR</span>
          </div>
          <button class="social-btn google" type="button" @click="loginWithProvider('google')">
            <span class="icon">G</span> {{ t.google }}
          </button>
          <button class="social-btn kakao" type="button" @click="loginWithProvider('kakao')">
            <span class="icon">K</span> {{ t.kakao }}
          </button>
        </div>

        <div class="auth-footer">
          <p class="text-small">
            {{ isLogin ? t.noAccount : t.hasAccount }}
            <button class="toggle-btn" @click="toggleMode">
              {{ isLogin ? t.signupTitle : t.loginTitle }}
            </button>
          </p>
          <p class="text-tiny terms-text" v-if="!isLogin">{{ t.agreeTerms }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.checkout-header {
  width: 100%;
  max-width: 480px;
  text-align: left;
  margin-bottom: 2rem;
  margin-top: 4rem;
}

.back-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 20px;
  border-radius: 30px;
  color: #D3D5DF;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #fff;
  color: #111;
}

.auth-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.glass-panel {
  background: rgba(25, 27, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h2 {
  font-size: 28px;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.input-group label {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  margin-left: 4px;
}

.input-group input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
  font-size: 15px;
  transition: all 0.2s ease;
  outline: none;
}

.input-group input:focus {
  border-color: #59B3D9;
  background: rgba(89, 179, 217, 0.05);
  box-shadow: 0 0 0 3px rgba(89, 179, 217, 0.15);
}

.form-actions {
  text-align: right;
  margin-top: -5px;
}

.text-small {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

.text-tiny {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 1rem;
  line-height: 1.5;
}

.forgot-link {
  color: #59B3D9;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.submit-btn {
  margin-top: 1rem;
  padding: 16px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.neon-border-btn {
  background: #59B3D9;
  color: #000;
  border: none;
  box-shadow: 0 4px 15px rgba(89, 179, 217, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.neon-border-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(89, 179, 217, 0.4);
}

.neon-border-btn:active {
  transform: translateY(0);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  font-weight: 600;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.divider span {
  padding: 0 10px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.social-btn.google:hover {
  background: rgba(255, 255, 255, 0.1);
}

.social-btn.kakao {
  background: rgba(254, 229, 0, 0.1);
  border-color: rgba(254, 229, 0, 0.2);
  color: #FEE500;
}

.social-btn.kakao:hover {
  background: rgba(254, 229, 0, 0.15);
}

.social-btn .icon {
  font-family: inherit;
  font-weight: 900;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1.5rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: #59B3D9;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
  transition: opacity 0.2s;
}

.toggle-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.animate-fade {
  animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .glass-panel {
    padding: 2rem 1.5rem;
  }
}
</style>
