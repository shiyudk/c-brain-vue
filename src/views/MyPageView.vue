<script setup>
import { onMounted } from 'vue'
import { state, t, fetchUserDashboardData, logout } from '../store'
import { useRouter } from 'vue-router'

const router = useRouter()

const viewDetail = (item) => {
  state.selectedItemDetail = item
  state.adminReplyText = item.admin_reply || ''
  state.showDetailModal = true
}

const handleLogout = async () => {
    await logout()
    router.push({ name: 'home' })
}

const goToCart = () => {
    router.push({ name: 'cart' })
}

onMounted(() => {
  fetchUserDashboardData()
})
</script>

<template>
  <div class="mypage-view-container container">
    <div class="mypage-header" style="text-align: center; margin-bottom: 50px;">
      <h1>{{ t.mypage.title }}</h1>
      <p class="user-welcome" style="font-size: 1.1rem; color: #59B3D9; margin-top: 10px;">
        {{ state.currentUser?.user_metadata?.full_name || state.currentUser?.email?.split('@')[0] }}{{ t.mypage.welcome }}
      </p>
    </div>

    <div class="mypage-grid">
      <div class="mypage-card glass-panel">
        <div class="card-header">
          <h3>📦 {{ t.mypage.orderStatus }}</h3>
        </div>
        <div class="card-content">
          <div class="stat-row">
            <span>{{ t.mypage.totalOrders }}</span>
            <span class="stat-val">{{ state.userOrders.length }}</span>
          </div>
          <div class="stat-row">
            <span>{{ t.mypage.activeDelivery }}</span>
            <span class="stat-val">{{ state.userOrders.filter(o => o.delivery_status === 'shipping').length }}</span>
          </div>
          <div class="user-history-list" v-if="state.userOrders.length > 0">
             <div v-for="ord in state.userOrders" :key="ord.id" class="history-item clickable" @click="viewDetail(ord)">
               <span class="h-date">{{ new Date(ord.created_at).toLocaleDateString() }}</span>
               <span class="h-title" style="color: #59B3D9;">{{ ord.product_name }}</span>
               <span class="h-status" :class="ord.delivery_status">
                 {{ ord.delivery_status === 'preparing' ? '배송준비' : ord.delivery_status === 'shipping' ? '배송중' : '배송완료' }}
               </span>
             </div>
          </div>
          <p class="empty-msg" v-else>{{ t.mypage.empty }}</p>
        </div>
      </div>

      <div class="mypage-card glass-panel">
        <div class="card-header">
          <h3>🛒 {{ t.mypage.cartStatus }}</h3>
        </div>
        <div class="card-content">
          <div class="stat-row">
            <span>{{ t.mypage.itemsInCart }}</span>
            <span class="stat-val">{{ state.cart.length }}</span>
          </div>
          <button class="small-action-btn" @click="goToCart">{{ t.mypage.viewCart }}</button>
        </div>
      </div>

      <div class="mypage-card glass-panel">
        <div class="card-header">
          <h3>💬 {{ t.mypage.inquiryStatus }}</h3>
        </div>
        <div class="card-content">
          <div class="stat-row">
            <span>{{ t.mypage.myInquiries }}</span>
            <span class="stat-val">{{ state.userInquiries.length }}</span>
          </div>
          <div class="user-history-list" v-if="state.userInquiries.length > 0">
            <div v-for="inq in state.userInquiries" :key="inq.id" class="history-item clickable" @click="viewDetail(inq)">
              <span class="h-date">{{ new Date(inq.created_at).toLocaleDateString() }}</span>
              <span class="h-title">{{ inq.subject }}</span>
              <span class="h-status pending">{{ inq.status === 'pending' ? '접수완료' : '답변완료' }}</span>
            </div>
          </div>
          <p class="empty-msg" v-else>{{ t.mypage.empty }}</p>
        </div>
      </div>

      <div class="mypage-card glass-panel">
        <div class="card-header">
          <h3>📄 {{ t.mypage.recruitStatus }}</h3>
        </div>
        <div class="card-content">
          <div class="stat-row">
            <span>{{ t.mypage.myApps }}</span>
            <span class="stat-val">{{ state.userRecruitments.length }}</span>
          </div>
          <div class="user-history-list" v-if="state.userRecruitments.length > 0">
            <div v-for="app in state.userRecruitments" :key="app.id" class="history-item clickable" @click="viewDetail(app)">
              <span class="h-date">{{ new Date(app.created_at).toLocaleDateString() }}</span>
              <span class="h-title">{{ app.name }} 컨설턴트 지원</span>
              <span class="h-status" :class="app.status">{{ app.status === 'pending' ? '심사중' : '심사완료' }}</span>
            </div>
          </div>
          <p class="empty-msg" v-else>{{ t.mypage.empty }}</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <button class="logout-btn" @click="handleLogout">{{ state.currentLang === 'ko' ? '로그아웃' : 'Logout' }}</button>
    </div>
  </div>
</template>
