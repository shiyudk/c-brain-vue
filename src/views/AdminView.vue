<script setup>
import { onMounted } from 'vue'
import { state, isAdmin, fetchAdminData } from '../store'
import { supabase } from '../supabase.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const viewDetail = (item) => {
  state.selectedItemDetail = item
  state.adminReplyText = item.admin_reply || ''
  state.showDetailModal = true
}

const deleteOrder = async (id) => {
  if (!supabase || !isAdmin.value) return
  if (!confirm('해당 주문 내역을 목록에서 삭제하시겠습니까? 관련 데이터가 영구 삭제됩니다.')) return
  
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error
    
    state.adminOrders = state.adminOrders.filter(ord => ord.id !== id)
    alert('주문 내역이 삭제되었습니다.')
  } catch (err) {
    console.error('Order delete error:', err)
    alert(`삭제 실패: ${err.message}`)
  }
}

const deleteSelected = async (type) => {
  // Debug to see if function is even called
  console.log('deleteSelected called with type:', type);
  
  if (!supabase || !isAdmin.value) {
    console.error('Missing supabase or admin privileges');
    return;
  }
  
  const selectedList = (type === 'inquiries') ? state.selectedInquiries :
                       (type === 'recruitments') ? state.selectedRecruitments :
                       (type === 'mall' || type === 'orders') ? state.selectedOrders : []
  
  const table = (type === 'inquiries') ? 'inquiries' :
                (type === 'recruitments') ? 'recruitment_applications' :
                (type === 'mall' || type === 'orders') ? 'orders' : null
  
  console.log('Target table:', table, 'Selected count:', selectedList.length);
  
  if (!table || selectedList.length === 0) {
    alert('삭제할 항목을 먼저 선택해주세요.');
    return
  }
  
  const confirmMsg = "선택한 " + selectedList.length + "개의 항목을 목록에서 영구히 삭제하시겠습니까?";
  if (!confirm(confirmMsg)) return

  
  const targetIds = [...selectedList].map(id => String(id))
  
  try {
    // Simplify delete: remove .select() which might be blocked by RLS for DELETE
    const { error } = await supabase.from(table).delete().in('id', targetIds)
    
    if (error) {
      console.error(`Delete Error:`, error)
      alert(`[삭제 실패] ${error.message}`)
      return
    }
    
    // UI Local update
    if (type === 'inquiries') {
      state.adminInquiries = state.adminInquiries.filter(i => !targetIds.includes(String(i.id)))
      state.selectedInquiries = []
    } else if (type === 'recruitments') {
      state.adminRecruitments = state.adminRecruitments.filter(i => !targetIds.includes(String(i.id)))
      state.selectedRecruitments = []
    } else if (type === 'mall' || type === 'orders') {
      state.adminOrders = state.adminOrders.filter(i => !targetIds.includes(String(i.id)))
      state.selectedOrders = []
    }
    
    alert('정상적으로 삭제되었습니다.')
    
    // Forced re-sync and reload to ensure the list is updated
    await fetchAdminData()
    location.reload()
    
  } catch (err) {
    console.error('Critical Delete error:', err)
    alert(`[오류] 삭제 중 치명적 실수가 발생했습니다: ${err.message}`)
    location.reload()
  }
}

const toggleAll = (type) => {
  const list = type === 'inquiries' 
    ? state.adminInquiries 
    : (type === 'recruitments' ? state.adminRecruitments : state.adminOrders)
    
  const selected = type === 'inquiries' 
    ? 'selectedInquiries' 
    : (type === 'recruitments' ? 'selectedRecruitments' : 'selectedOrders')
  
  if (state[selected].length === list.length) {
    state[selected] = []
  } else {
    state[selected] = list.map(item => item.id)
  }
}

const updateStatus = async (table, id, newStatus, field = 'status') => {
  if (!supabase || !isAdmin.value) {
    alert('관리자 권한이 없습니다.')
    return
  }
  
  const updateData = {}
  updateData[field] = newStatus
  
  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) {
    alert(`[치명적 오류] ${error.message}`)
    await fetchAdminData()
    return
  }

  if (!data || data.length === 0) {
    alert('서버 권한 문제로 저장이 거부되었습니다.')
    await fetchAdminData()
    return
  }

  if (table === 'inquiries') {
    const item = state.adminInquiries.find(i => i.id === id)
    if (item) item[field] = newStatus
  } else if (table === 'recruitment_applications') {
    const item = state.adminRecruitments.find(i => i.id === id)
    if (item) item[field] = newStatus
  } else if (table === 'orders') {
    const item = state.adminOrders.find(i => i.id === id)
    if (item) item[field] = newStatus
  }
}

onMounted(() => {
  if (!isAdmin.value) {
    router.push({ name: 'home' })
    return
  }
  fetchAdminData()
  
  // 초기 탭 설정
  if (!state.leadershipTeamTab) state.leadershipTeamTab = 'LEADER'
})

// Leadership Tasks Logic
const addTask = (team) => {
  if (!state.leadershipTasks[team]) state.leadershipTasks[team] = []
  state.leadershipTasks[team].unshift({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    subTasks: [
      { completed: false, detail: '', reference: '', progress: 0 }
    ],
    created_at: new Date().toISOString()
  })
  saveTasks()
}

const addSubTask = (project) => {
  project.subTasks.push({
    completed: false,
    detail: '',
    reference: '',
    progress: 0
  })
  saveTasks()
}

const removeSubTask = (project, sIdx) => {
  project.subTasks.splice(sIdx, 1)
  if (project.subTasks.length === 0) {
    addSubTask(project) // 최소 1개 유지
  }
  saveTasks()
}

const triggerDatePicker = (event) => {
  // 클릭된 컨테이너 내부의 날짜 입력을 찾음
  const container = event.currentTarget.closest('.custom-date-container')
  const input = container ? container.querySelector('input[type="date"]') : null
  
  if (input && typeof input.showPicker === 'function') {
    input.showPicker()
  } else if (input) {
    input.click()
  }
}

const autoResize = (event) => {
  const el = event.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

const getProgressColor = (val) => {
  // 0% -> RGB(255, 107, 107) [Red]
  // 100% -> RGB(144, 238, 144) [LightGreen]
  const r = Math.floor(255 - (val * 1.11)) // 255 to 144
  const g = Math.floor(107 + (val * 1.31)) // 107 to 238
  const b = Math.floor(107 + (val * 0.37)) // 107 to 144
  return `rgb(${r}, ${g}, ${b})`
}

const getDayOfWeek = (dateStr) => {
  if (!dateStr) return ''
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `(${days[d.getDay()]})`
}

const removeTask = (idx) => {
  const team = state.leadershipTeamTab
  state.leadershipTasks[team].splice(idx, 1)
  saveTasks()
}

const getCurrentTeamTasks = () => {
  if (!state.leadershipTeamTab) return []
  const team = state.leadershipTeamTab
  if (!state.leadershipTasks[team]) {
    state.leadershipTasks[team] = []
  }
  
  // 데이터 마이그레이션: 기존 단일 항목 구조를 서브태스크 구조로 자동 변환
  state.leadershipTasks[team].forEach(project => {
    if (!project.subTasks) {
      project.subTasks = [
        { 
          completed: project.completed || false, 
          detail: project.detail || '', 
          reference: project.reference || '', 
          progress: project.progress || 0 
        }
      ]
      // 구버전 필드 삭제 (선택 사항이지만 데이터 일관성을 위해 추천)
      delete project.detail
      delete project.reference
      delete project.completed
      delete project.progress
    }
  })
  
  return state.leadershipTasks[team]
}

let saveTimeout = null
const saveTasks = async () => {
  // 로컬 스토리지 백업
  localStorage.setItem('leadership_tasks', JSON.stringify(state.leadershipTasks))
  
  // Supabase 연동 (디바운스 처리)
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    if (supabase && isAdmin.value) {
      try {
        const team = state.leadershipTeamTab
        const tasks = state.leadershipTasks[team]
        if (!team) return

        // 해당 팀의 데이터를 upsert (team_name 이 PK 또는 Unique 제약조건이 있어야 함)
        const { error } = await supabase
          .from('leadership_tasks')
          .upsert({ 
            team_name: team, 
            tasks: tasks, 
            updated_at: new Date().toISOString() 
          }, { onConflict: 'team_name' })
        
        if (error) {
          console.error('Supabase sync error:', error.message)
        } else {
          console.log(`Sync success: ${team}`)
        }
      } catch (err) {
        console.error('Critical sync error:', err)
      }
    }
  }, 1000) // 1초 디바운스
}
</script>

<template>
  <div class="admin-view-container container">
    <div class="admin-header">
       <h1>Admin Control Panel</h1>
        <div class="admin-tabs">
          <button @click="state.adminActiveTab = 'inquiries'" :class="{ active: state.adminActiveTab === 'inquiries' }">고객 문의 ({{ state.adminInquiries.length }})</button>
          <button @click="state.adminActiveTab = 'recruitments'" :class="{ active: state.adminActiveTab === 'recruitments' }">채용 지원 ({{ state.adminRecruitments.length }})</button>
          <button @click="state.adminActiveTab = 'mall'" :class="{ active: state.adminActiveTab === 'mall' }">쇼핑몰 주문 ({{ state.adminOrders.length }})</button>
          <button @click="state.adminActiveTab = 'leadership'" :class="{ active: state.adminActiveTab === 'leadership' }" style="border-color: #59B3D9; color: #59B3D9;">LEADERSHIP 🚀</button>
        </div>
    </div>

    <!-- Leadership Dashboard -->
    <div v-if="state.adminActiveTab === 'leadership'" class="leadership-dashboard">
      <div class="leadership-teams-bar">
        <button v-for="team in ['LEADER', 'PRODUCT & OPERATION', 'FINANCIAL', 'LEGAL RISK', 'BRAND & MARKETING']" 
                :key="team" 
                @click="state.leadershipTeamTab = team"
                :class="{ active: state.leadershipTeamTab === team }"
                class="team-pill">
          {{ team }}
        </button>
      </div>

      <div class="leadership-content glass-panel" v-if="state.leadershipTeamTab">
        <div class="role-grid">
           <!-- LEADER Team -->
           <div v-if="state.leadershipTeamTab === 'LEADER'" class="role-card highlight">
              <div class="role-header"><h3>LEADER</h3><p>방향결정 및 최종 책임자</p></div>
              <ul class="role-list">
                <li>비전 및 전사 전략 결정</li>
                <li>C-level 성과 평가</li>
                <li>자원(돈/시간/E) 배분</li>
                <li>외부 이해관계자 대응</li>
                <li>위기 상황 최종 판단</li>
              </ul>
           </div>

           <!-- Product & Operation Team -->
           <div v-if="state.leadershipTeamTab === 'PRODUCT & OPERATION'" class="role-group">
             <div class="role-card">
                <div class="role-header"><h3>CPO</h3><p>"만들기"</p></div>
                <ul class="role-list">
                  <li>제품 기획: 정의 및 로직 설계</li>
                  <li>구조 설계: 기능/패키징 설계</li>
                  <li>경험 정의: 쉬운 사용 구조 설계</li>
                  <li>로드맵 관리: 개선 및 반복</li>
                  <li>경쟁력 유지: 차별화 포인트</li>
                </ul>
             </div>
             <div class="role-card">
                <div class="role-header"><h3>COO</h3><p>"굴리기"</p></div>
                <ul class="role-list">
                  <li>프로세스 설계: 주문~CS 구축</li>
                  <li>공급망 관리: 제조/물류 관리</li>
                  <li>업무 관리: 실행 일정 통제</li>
                  <li>리스크 관리: 품질/클레임 대응</li>
                  <li>운영 자동화: 반복 업무 최소화</li>
                </ul>
             </div>
           </div>

           <!-- Financial Team -->
           <div v-if="state.leadershipTeamTab === 'FINANCIAL'" class="role-card">
              <div class="role-header"><h3>CFO</h3><p>"돈 안 새게"</p></div>
              <ul class="role-list">
                <li>재무 현금 통제: 수입/지출 관리</li>
                <li>수익성 분석: 정량적 이익 분석</li>
                <li>비용 통제: 불필요 고정비 제거</li>
                <li>마진 설계: 원가/가격 구조 계산</li>
                <li>리스크 관리: 스탑로스 기준 설정</li>
              </ul>
           </div>

           <!-- Legal Team -->
           <div v-if="state.leadershipTeamTab === 'LEGAL RISK'" class="role-card">
              <div class="role-header"><h3>CLO</h3><p>"안전 장치"</p></div>
              <ul class="role-list">
                <li>법적 리스크: 사전 검토/대응</li>
                <li>계약 관리: 구조 설계 및 검토</li>
                <li>지식재산권: 브랜드/권리 관리</li>
                <li>분쟁 대응: 클레임 대응 기준</li>
                <li>경계선 설정: 운영 가이드라인</li>
              </ul>
           </div>

           <!-- Marketing Team -->
           <div v-if="state.leadershipTeamTab === 'BRAND & MARKETING'" class="role-group">
             <div class="role-card">
                <div class="role-header"><h3>CBO</h3><p>"신뢰구축"</p></div>
                <ul class="role-list">
                  <li>정체성 정의: 회사 규정 수립</li>
                  <li>메시지: 톤앤매너 통일</li>
                  <li>신뢰 구축: 일관성 있는 행동</li>
                  <li>자산 축적: 레퍼런스 관리</li>
                  <li>확장 전략: 정체성 유지</li>
                </ul>
             </div>
             <div class="role-card">
                <div class="role-header"><h3>CMO</h3><p>"홍보"</p></div>
                <ul class="role-list">
                  <li>고객 획득: 유입 경로 전략</li>
                  <li>채널 운영: SNS/홈페이지</li>
                  <li>콘텐츠: 메시지 결정</li>
                  <li>전환 설계: 구매 최적화</li>
                  <li>성과 분석: 효율 정밀 분석</li>
                </ul>
             </div>
           </div>
        </div>

        <!-- To-Do List Section -->
        <div class="todo-section">
          <div class="todo-header" style="justify-content: flex-start; gap: 20px;">
            <h4 style="text-align: left; margin: 0;">TEAM TO-DO LIST</h4>
            <button class="add-todo-btn" @click="addTask(state.leadershipTeamTab)">+ 새 항목 추가</button>
          </div>
          <div class="table-scroll">
            <table class="admin-table todo-table" style="width: 100%; table-layout: fixed !important; border-collapse: collapse; border-spacing: 0;">
              <thead>
                <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02);">
                  <th style="min-width: 220px !important; max-width: 220px !important; width: 220px !important; text-align: center; padding: 12px 10px; box-sizing: border-box;">업무명</th>
                  <th style="min-width: 325px !important; max-width: 325px !important; width: 325px !important; text-align: center; padding: 12px 2px; box-sizing: border-box;">프로젝트 기간</th>
                  <th style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; text-align: center; padding: 12px 10px; box-sizing: border-box;">업무 상세</th>
                  <th style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; text-align: center; padding: 12px 10px; box-sizing: border-box;">참고 사항</th>
                  <th style="min-width: 180px !important; max-width: 180px !important; width: 180px !important; text-align: center; padding: 12px 0; box-sizing: border-box;">진척도</th>
                  <th style="min-width: 100px !important; max-width: 100px !important; width: 100px !important; text-align: center; padding: 12px 0; box-sizing: border-box;">전체 관리</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(project, pIdx) in getCurrentTeamTasks()" :key="'p-' + pIdx">
                  <!-- Project Header Row: Title and Dates ONLY -->
                  <tr class="project-header-row" style="border: none !important;">
                    <td class="align-top" style="min-width: 220px !important; max-width: 220px !important; width: 220px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;">
                      <input type="text" v-model="project.title" placeholder="업무명" class="todo-input" @input="saveTasks" style="width: 100%; font-weight: bold; color: #59B3D9;" />
                    </td>
                    <td class="date-cell align-top" style="min-width: 325px !important; max-width: 325px !important; width: 325px !important; padding: 12px 2px !important; box-sizing: border-box; overflow: hidden; display: table-cell !important;">
                      <div class="date-inputs-group" style="display: flex; justify-content: center; align-items: center; margin: 0; padding: 0; gap: 4px; width: 100%;">
                        <div class="custom-date-container" style="cursor: pointer; flex-shrink: 0; width: auto !important;" @click="triggerDatePicker">
                          <input type="date" v-model="project.startDate" class="hidden-date-input" @change="saveTasks" />
                          <div class="date-display-box" style="height: 38px; display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; font-size: 0.85rem; min-width: 156px; box-sizing: border-box; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            {{ project.startDate.slice(2) }} ({{ getDayOfWeek(project.startDate).slice(1,2) }})
                            <span class="date-arrow-icon" style="font-size: 6px; margin-left: 5px;">▼</span>
                          </div>
                        </div>
                        <span class="date-sep" style="font-size: 0.8rem; color: rgba(255,255,255,0.4); flex-shrink: 0;">~</span>
                        <div class="custom-date-container" style="cursor: pointer; flex-shrink: 0; width: auto !important;" @click="triggerDatePicker">
                          <input type="date" v-model="project.endDate" class="hidden-date-input" @change="saveTasks" />
                          <div class="date-display-box" style="height: 38px; display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; font-size: 0.85rem; min-width: 156px; box-sizing: border-box; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            {{ project.endDate.slice(2) }} ({{ getDayOfWeek(project.endDate).slice(1,2) }})
                            <span class="date-arrow-icon" style="font-size: 6px; margin-left: 5px;">▼</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <!-- Fill with First Subtask if exists -->
                    <template v-if="project.subTasks && project.subTasks.length > 0">
                      <td class="align-top" style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;">
                        <div class="sub-detail-cell-content" style="display: flex; gap: 8px;">
                          <label class="check-label" style="margin-top: 5px;">
                            <input type="checkbox" v-model="project.subTasks[0].completed" @change="saveTasks" class="task-checkbox" />
                            <span class="checkmark" v-if="project.subTasks[0].completed">✅</span>
                            <span class="checkmark-empty" v-else>⬜</span>
                          </label>
                          <textarea v-model="project.subTasks[0].detail" placeholder="상세 내용" class="todo-textarea auto-grow" :class="{ 'strike': project.subTasks[0].completed }" @input="e => { autoResize(e); saveTasks(); }"></textarea>
                        </div>
                      </td>
                      <td class="align-top" style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;">
                        <textarea v-model="project.subTasks[0].reference" placeholder="참고 사항" class="todo-textarea auto-grow" @input="e => { autoResize(e); saveTasks(); }"></textarea>
                      </td>
                      <td class="align-top" style="min-width: 180px !important; max-width: 180px !important; width: 180px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;">
                        <div class="progress-container" style="margin: 0 auto; width: 120px;">
                           <input type="range" v-model="project.subTasks[0].progress" min="0" max="100" step="10" class="progress-slider" 
                                  :style="{ '--progress-color': getProgressColor(project.subTasks[0].progress), '--p-val': project.subTasks[0].progress + '%' }" 
                                  @input="saveTasks" />
                           <div class="progress-label" :style="{ color: getProgressColor(project.subTasks[0].progress), fontSize: '0.8rem' }">{{ project.subTasks[0].progress }}%</div>
                        </div>
                      </td>
                      <td class="align-top" style="min-width: 100px !important; max-width: 100px !important; width: 100px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important; text-align: center;">
                        <button @click="removeSubTask(project, 0)" class="sub-row-del-btn" style="margin: 0 auto;">×</button>
                      </td>
                    </template>
                    <template v-else>
                      <td class="align-top" style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;"></td>
                      <td class="align-top" style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;"></td>
                      <td class="align-top" style="min-width: 180px !important; max-width: 180px !important; width: 180px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;"></td>
                      <td class="align-top" style="min-width: 100px !important; max-width: 100px !important; width: 100px !important; padding: 12px 10px; box-sizing: border-box; display: table-cell !important;"></td>
                    </template>
                  </tr>

                  <!-- Subtasks Rows -->
                  <!-- Subtasks Rows (Starting from index 1) -->
                  <tr v-for="(sub, sIdx) in project.subTasks.slice(1)" :key="'s-' + (sIdx + 1)" class="subtask-row" style="border: none !important;">
                    <td style="min-width: 220px !important; max-width: 220px !important; width: 220px !important; padding: 12px 10px; box-sizing: border-box;"></td>
                    <td style="min-width: 325px !important; max-width: 325px !important; width: 325px !important; padding: 12px 2px; box-sizing: border-box;"></td>
                    <td class="align-top" style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 12px 10px; box-sizing: border-box;">
                      <div class="sub-detail-cell-content" style="display: flex; gap: 8px;">
                        <label class="check-label" style="margin-top: 5px;">
                          <input type="checkbox" v-model="sub.completed" @change="saveTasks" class="task-checkbox" />
                          <span class="checkmark" v-if="sub.completed">✅</span>
                          <span class="checkmark-empty" v-else>⬜</span>
                        </label>
                        <textarea v-model="sub.detail" placeholder="상세 내용" class="todo-textarea auto-grow" :class="{ 'strike': sub.completed }" @input="e => { autoResize(e); saveTasks(); }"></textarea>
                      </div>
                    </td>
                    <td class="align-top" style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 12px 10px; box-sizing: border-box;">
                      <textarea v-model="sub.reference" placeholder="참고 사항" class="todo-textarea auto-grow" @input="e => { autoResize(e); saveTasks(); }"></textarea>
                    </td>
                    <td class="align-top" style="min-width: 180px !important; max-width: 180px !important; width: 180px !important; text-align: center; padding: 12px 0 !important; box-sizing: border-box;">
                      <div class="progress-container" style="margin: 0 auto; width: 120px;">
                         <input type="range" v-model="sub.progress" min="0" max="100" step="10" class="progress-slider" 
                                :style="{ '--progress-color': getProgressColor(sub.progress), '--p-val': sub.progress + '%' }" 
                                @input="saveTasks" />
                         <div class="progress-label" :style="{ color: getProgressColor(sub.progress), fontSize: '0.8rem' }">{{ sub.progress }}%</div>
                      </div>
                    </td>
                    <td class="align-top" style="min-width: 100px !important; max-width: 100px !important; width: 100px !important; text-align: center; padding: 12px 0 !important; vertical-align: middle; box-sizing: border-box;">
                       <button @click="removeSubTask(project, sIdx + 1)" class="sub-row-del-btn" style="margin: 0 auto;">×</button>
                    </td>
                  </tr>

                  <tr v-if="!project.subTasks || project.subTasks.length === 0">
                    <td style="min-width: 220px !important; max-width: 220px !important; width: 220px !important; box-sizing: border-box;"></td>
                    <td style="min-width: 325px !important; max-width: 325px !important; width: 325px !important; box-sizing: border-box;"></td>
                    <td colspan="4" style="padding: 20px; text-align: left; opacity: 0.5;">업무 상세를 추가해주세요.</td>
                  </tr>

                  <!-- Project Footer Row -->
                  <tr class="project-footer-row" style="border-bottom: 2px solid rgba(255,255,255,0.2);">
                    <td style="min-width: 220px !important; max-width: 220px !important; width: 220px !important; box-sizing: border-box;"></td>
                    <td style="min-width: 325px !important; max-width: 325px !important; width: 325px !important; box-sizing: border-box;"></td>
                    <td style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; padding: 10px 0 15px 10px; background: rgba(255,255,255,0.02); box-sizing: border-box;">
                      <button class="add-sub-btn" @click="addSubTask(project)" style="border: none; background: transparent; color: #59B3D9; font-weight: bold; cursor: pointer; padding: 5px 15px;">+ 업무 상세 추가</button>
                    </td>
                    <td style="min-width: 350px !important; max-width: 350px !important; width: 350px !important; background: rgba(255,255,255,0.02); box-sizing: border-box;"></td>
                    <td style="min-width: 180px !important; max-width: 180px !important; width: 180px !important; background: rgba(255,255,255,0.02); box-sizing: border-box;"></td>
                    <td style="min-width: 100px !important; max-width: 100px !important; width: 100px !important; text-align: center; padding: 10px 0; background: rgba(255,255,255,0.02); vertical-align: middle; box-sizing: border-box;">
                      <button @click="removeTask(pIdx)" class="todo-del-btn" style="display: block; margin: 0 auto; transform: scale(0.85);">전체 삭제</button>
                    </td>
                  </tr>
                </template>
                <tr v-if="getCurrentTeamTasks().length === 0">
                  <td colspan="6" style="text-align: center; padding: 40px; opacity: 0.5;">등록된 업무가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Inquiries Admin -->
    <div v-if="state.adminActiveTab === 'inquiries'" class="admin-section glass-panel">
      <div class="admin-actions-bar" style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
        <button @click="deleteSelected('inquiries')" class="admin-del-btn" :disabled="state.selectedInquiries.length === 0">선택 삭제 ({{ state.selectedInquiries.length }})</button>
      </div>
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" :checked="state.selectedInquiries.length === state.adminInquiries.length && state.adminInquiries.length > 0" @change="toggleAll('inquiries')" /></th>
              <th>날짜</th>
              <th>이름</th>
              <th>과목</th>
              <th>제목</th>
              <th>상태</th>
              <th>기능</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inq in state.adminInquiries" :key="inq.id" @click="viewDetail(inq)" class="clickable-row">
              <td @click.stop><input type="checkbox" v-model="state.selectedInquiries" :value="inq.id" /></td>
              <td>{{ new Date(inq.created_at).toLocaleDateString() }}</td>
              <td>{{ inq.name }}</td>
              <td><span class="tag-cat">{{ inq.category }}</span></td>
              <td class="text-truncate" style="max-width: 250px;">{{ inq.subject }}</td>
              <td>
                <span class="status-tag" :class="inq.status">{{ inq.status === 'pending' ? '확인대기' : '처리완료' }}</span>
              </td>
              <td @click.stop>
                <select :value="inq.status" @change="e => updateStatus('inquiries', inq.id, e.target.value)" class="admin-select">
                  <option value="pending">확인대기</option>
                  <option value="completed">처리완료</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recruitments Admin -->
    <div v-if="state.adminActiveTab === 'recruitments'" class="admin-section glass-panel">
      <div class="admin-actions-bar" style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
        <button @click="deleteSelected('recruitments')" class="admin-del-btn" :disabled="state.selectedRecruitments.length === 0">선택 삭제 ({{ state.selectedRecruitments.length }})</button>
      </div>
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" :checked="state.selectedRecruitments.length === state.adminRecruitments.length && state.adminRecruitments.length > 0" @change="toggleAll('recruitments')" /></th>
              <th>날짜</th>
              <th>이름</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>상태</th>
              <th>기능</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in state.adminRecruitments" :key="rec.id" @click="viewDetail(rec)" class="clickable-row">
              <td @click.stop><input type="checkbox" v-model="state.selectedRecruitments" :value="rec.id" /></td>
              <td>{{ new Date(rec.created_at).toLocaleDateString() }}</td>
              <td>{{ rec.name }}</td>
              <td>{{ rec.phone }}</td>
              <td>{{ rec.email }}</td>
              <td>
                <span class="status-tag" :class="rec.status">{{ rec.status === 'pending' ? '심사중' : '심사완료' }}</span>
              </td>
              <td @click.stop>
                 <select :value="rec.status" @change="e => updateStatus('recruitment_applications', rec.id, e.target.value)" class="admin-select">
                  <option value="pending">심사중</option>
                  <option value="completed">심사완료</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Orders Admin -->
    <div v-if="state.adminActiveTab === 'mall'" class="admin-section glass-panel">
      <div class="admin-actions-bar" style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
        <button @click="deleteSelected('mall')" class="admin-del-btn" :disabled="state.selectedOrders.length === 0">선택 삭제 ({{ state.selectedOrders.length }})</button>
      </div>
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" :checked="state.selectedOrders.length === state.adminOrders.length && state.adminOrders.length > 0" @change="toggleAll('mall')" /></th>
              <th>주문일</th>
              <th>상품명</th>
              <th>구매자</th>
              <th>총액</th>
              <th>주문상태</th>
              <th>배송현황</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in state.adminOrders" :key="ord.id" @click="viewDetail(ord)" class="clickable-row">
              <td @click.stop><input type="checkbox" v-model="state.selectedOrders" :value="ord.id" /></td>
              <td>{{ new Date(ord.created_at).toLocaleDateString() }}</td>
              <td>{{ ord.product_name }}</td>
              <td>{{ ord.receiver_name || ord.user_email }}</td>
              <td>{{ ord.total_amount.toLocaleString() }}원</td>
              <td>
                 <span class="status-tag" :class="ord.order_status">{{ ord.order_status === 'payment_pending' ? '결제대기' : '결제완료' }}</span>
              </td>
              <td>
                 <select :value="ord.delivery_status" @change="e => updateStatus('orders', ord.id, e.target.value, 'delivery_status')" class="admin-select" @click.stop>
                  <option value="preparing">배송준비</option>
                  <option value="shipping">배송중</option>
                  <option value="delivered">배송완료</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leadership-dashboard {
  margin-top: 30px;
}
.leadership-teams-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.team-pill {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #9DA1B4;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s;
}
.team-pill.active {
  background: #59B3D9;
  color: #111;
  border-color: #59B3D9;
  box-shadow: 0 0 15px rgba(89, 179, 217, 0.3);
}
.leadership-content {
  padding: 30px;
  border-radius: 16px;
}
.role-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}
.role-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.role-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 24px;
  border-radius: 12px;
}
.role-card.highlight {
  border-color: #59B3D9;
  background: rgba(89, 179, 217, 0.05);
}
.role-header {
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
}
.role-header h3 {
  color: #59B3D9;
  font-size: 1.3rem;
  margin: 0;
}
.role-header p {
  font-size: 0.9rem;
  opacity: 0.6;
  margin: 5px 0 0;
}
.role-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.role-list li {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  gap: 8px;
}
.role-list li::before {
  content: '•';
  color: #59B3D9;
}

.todo-section {
  margin-top: 50px;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 30px;
}
.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.todo-header h4 {
  margin: 0;
  color: #fff;
  letter-spacing: 1px;
}
.add-todo-btn {
  background: transparent;
  border: 1px solid #59B3D9;
  color: #59B3D9;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}
.add-todo-btn:hover {
  background: #59B3D9;
  color: #111;
}

.project-border-top {
  border-top: 3px solid rgba(255,255,255,0.2) !important;
}
.subtask-row td {
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}
.project-footer-row td {
  background: rgba(255,255,255,0.02);
}
.todo-table td {
  padding: 15px 10px !important;
}
.todo-input {
  width: 100%;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 8px;
  color: #fff;
  border-radius: 4px;
  height: 38px !important;
  box-sizing: border-box;
}
.todo-textarea {
  width: 100%;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 8px;
  color: #fff;
  border-radius: 4px;
  height: 38px !important;
  min-height: 38px !important;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.4;
}
.status-select {
  width: 100% !important;
  font-weight: 700;
}
.todo-del-btn {
  background: transparent;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.7;
}
.todo-del-btn:hover {
  opacity: 1;
  text-decoration: underline;
}

.width-min {
  width: 1%;
  white-space: nowrap;
}
.leadership-th {
  text-align: left !important;
  padding-left: 50px !important;
  vertical-align: middle;
}
.leadership-td {
  padding-left: 50px !important;
}
.leadership-td.no-border {
  border-bottom: none !important;
}
.align-top {
  vertical-align: top !important;
  padding-top: 15px !important;
}

.custom-date-container {
  position: relative;
  cursor: pointer;
  width: auto;
}
.hidden-date-input {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.date-display-box {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: #fff;
  font-size: 0.85rem;
  letter-spacing: -0.5px;
  white-space: nowrap;
  gap: 4px;
}
.date-arrow-icon {
  color: #59B3D9;
  font-size: 0.6rem;
  margin-left: 2px;
  opacity: 0.6;
}
.custom-date-container:hover .date-display-box {
  border-color: rgba(89, 179, 217, 0.4);
  background: rgba(255,255,255,0.02);
}

.date-inputs-group {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
.date-sep {
  opacity: 0.5;
  font-size: 0.9rem;
  font-weight: 700;
}

.no-padding {
  padding: 0 !important;
}
.subtasks-container {
  display: flex;
  flex-direction: column;
}
.subtask-item {
  display: flex; /* grid 대신 flex로 정렬 정밀 조정 */
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding: 10px 0;
}
.subtask-item:last-child {
  border-bottom: none;
}

.sub-detail-col { flex-shrink: 0; display: flex; gap: 10px; padding: 0 15px; }
.sub-ref-col { flex-shrink: 0; padding: 0 15px; }
.sub-progress-col { flex-shrink: 0; display: flex; align-items: flex-start; justify-content: center; padding: 0 15px; }
.sub-action-col { flex: 1; display: flex; align-items: flex-start; justify-content: center; min-width: 40px; }

.auto-grow {
  min-height: 38px;
  overflow: hidden;
  line-height: 1.5;
}

.sub-row-del-btn {
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  color: #ff6b6b;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}
.sub-row-del-btn:hover {
  background: #ff6b6b;
  color: #fff;
}

.add-sub-btn {
  background: rgba(255,255,255,0.03);
  border: none;
  border-top: 1px dashed rgba(255,255,255,0.1);
  padding: 8px;
  cursor: pointer;
  color: #59B3D9;
  font-weight: 700;
  font-size: 0.8rem;
}
.add-sub-btn:hover {
  background: rgba(89, 179, 217, 0.1);
}

.sub-del-btn {
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.5;
}
.sub-del-btn:hover {
  opacity: 1;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.custom-date-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
  height: 38px; /* 업무명 input과 높이 맞춤 */
}
.date-input {
  border: none !important;
  background: transparent !important;
  font-size: 0.8rem !important;
  padding: 5px !important;
  color: #fff;
  width: 105px;
}
.date-arrow {
  background: rgba(255,255,255,0.05);
  border: none;
  border-left: 1px solid rgba(255,255,255,0.1);
  color: #59B3D9;
  font-size: 0.6rem;
  padding: 0 6px;
  cursor: pointer;
  height: 100%;
}
.date-arrow:hover {
  background: rgba(89, 179, 217, 0.2);
}

.detail-cell {
  position: relative;
}
.completion-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.check-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-top: 5px;
}
.task-checkbox {
  display: none;
}
.checkmark { font-size: 1.2rem; filter: drop-shadow(0 0 5px #36b37e); }
.checkmark-empty { font-size: 1.2rem; opacity: 0.3; }

.todo-textarea.strike {
  text-decoration: line-through;
  opacity: 0.5;
}
.row-completed {
  background: rgba(54, 179, 126, 0.05) !important;
}

.progress-cell {
  vertical-align: middle;
}
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  min-width: 140px;
}
.progress-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 10px;
  /* 왼쪽부터 채워지는 그라데이션 적용 */
  background: linear-gradient(to right, 
    var(--progress-color) 0%, 
    var(--progress-color) var(--p-val), 
    rgba(255,255,255,0.1) var(--p-val), 
    rgba(255,255,255,0.1) 100%);
  outline: none;
  border: 1px solid rgba(255,255,255,0.05);
}
.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0,0,0,0.8);
  border: 2px solid var(--progress-color);
  margin-top: -1px; /* Center align with track */
}
.progress-label {
  font-size: 0.85rem;
  font-weight: 900;
  text-shadow: 0 0 5px rgba(0,0,0,0.5);
}

/* Override global border styles for consistent internal borderless view */
.todo-table td {
  border-bottom: none !important;
}
.project-footer-row td {
  border-bottom: 2px solid rgba(255,255,255,0.2) !important;
}

@media (max-width: 768px) {
  .role-group, .role-list {
    grid-template-columns: 1fr;
  }
}
</style>
