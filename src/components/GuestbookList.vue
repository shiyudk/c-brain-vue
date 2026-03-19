<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const guestbookEntries = ref([])
const loading = ref(true)
const error = ref(null)

// 방명록 데이터 가져오기
const fetchGuestbook = async () => {
  try {
    loading.value = true
    const { data, error: fetchError } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    guestbookEntries.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Error fetching guestbook:', err)
  } finally {
    loading.value = false
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchGuestbook()
})
</script>

<template>
  <div class="guestbook-container">
    <h2 class="guestbook-title">방명록</h2>
    
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-message">
      <p>⚠️ {{ error }}</p>
      <p class="error-hint">Please check your .env file and ensure Supabase credentials are correct.</p>
    </div>
    
    <!-- 방명록 목록 -->
    <div v-else-if="guestbookEntries.length > 0" class="guestbook-list">
      <div 
        v-for="entry in guestbookEntries" 
        :key="entry.id" 
        class="guestbook-item"
      >
        <div class="entry-header">
          <span class="author">{{ entry.author }}</span>
          <span class="timestamp">{{ formatDate(entry.created_at) }}</span>
        </div>
        <p class="content">{{ entry.content }}</p>
      </div>
    </div>
    
    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <p>아직 작성된 방명록이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.guestbook-container {
  max-width: 800px;
  margin: 4rem auto;
  padding: 2rem;
}

.guestbook-title {
  font-size: 2.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 로딩 */
.loading {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 에러 */
.error-message {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #ff6b6b;
}

.error-hint {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

/* 방명록 목록 */
.guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.guestbook-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.guestbook-item:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.author {
  font-weight: 700;
  font-size: 1.1rem;
  color: #667eea;
}

.timestamp {
  font-size: 0.85rem;
  color: #888;
}

.content {
  margin: 0;
  line-height: 1.6;
  color: #ddd;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-style: italic;
}

/* 반응형 */
@media (max-width: 768px) {
  .guestbook-container {
    padding: 1rem;
    margin: 2rem auto;
  }
  
  .guestbook-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .entry-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
