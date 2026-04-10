import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/mall',
    name: 'mall',
    component: () => import('../views/MallView.vue')
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('../views/SupportView.vue')
  },
  {
    path: '/recruit',
    name: 'recruit',
    component: () => import('../views/RecruitView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue')
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: () => import('../views/MyPageView.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/AuthView.vue')
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('../views/DetailView.vue')
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue')
  },
  {
    path: '/success',
    name: 'success',
    component: () => import('../views/SuccessView.vue')
  },
  {
    path: '/fail',
    name: 'fail',
    component: () => import('../views/FailView.vue')
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
