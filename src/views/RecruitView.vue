<script setup>
import { ref } from 'vue'
import { state, t, fetchUserDashboardData } from '../store'
import { supabase } from '../supabase.js'
import emailjs from '@emailjs/browser'

const recruitForm = ref({ name: '', email: '', phone1: '010', phone2: '', phone3: '', content: '' })
const selectedCvFile = ref(null)

const handleCvFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.")
      e.target.value = ''
      selectedCvFile.value = null
      return
    }
    selectedCvFile.value = file
  } else {
    selectedCvFile.value = null
  }
}

const handleRecruitSubmit = async () => {
  let emailSuccess = false
  let dbSuccess = false
  let errorMsg = ''

  const fullPhone = `${recruitForm.value.phone1}-${recruitForm.value.phone2}-${recruitForm.value.phone3}`
  const now = new Date().toLocaleString()
  const templateParams = {
    name: recruitForm.value.name,
    email: recruitForm.value.email,
    phone: fullPhone,
    message: recruitForm.value.content,
    title: '채용 지원 (Recruitment)',
    time: now
  }

  let cvUrl = ''
  if (selectedCvFile.value) {
    if (!supabase) { alert('Supabase 연결 오류로 파일을 업로드할 수 없습니다.'); return }
    try {
      const fileExt = selectedCvFile.value.name.split('.').pop()
      const fileName = `${Date.now()}_cv.${fileExt}`
      const { data, error } = await supabase.storage.from('resumes').upload(fileName, selectedCvFile.value)
      if (error) {
        alert("이력서 업로드 실패. Supabase에 'resumes' 라는 Public 버킷이 있는지 확인해주세요. 에러: " + error.message)
        return
      }
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName)
      cvUrl = urlData.publicUrl
    } catch (err) {
      alert("파일 처리 중 오류: " + err.message)
      return
    }
  }

  const finalContent = cvUrl 
    ? `${recruitForm.value.content}\n\n[첨부된 문서 다운로드]\n[FILE:${selectedCvFile.value.name}|${cvUrl}]`
    : recruitForm.value.content
    
  templateParams.message = finalContent

  // 1. EmailJS Attempt
  try {
    await emailjs.send('service_9dms7il', 'template_6umfzgp', templateParams, '5-NmkSe__nzMYraLo')
    emailSuccess = true
  } catch (err) {
    console.error('EmailJS Error:', err)
    errorMsg += `[Email Error: ${err.text || err.message || 'Unknown'}] `
  }

  // 2. Supabase Attempt
  try {
    if (supabase) {
      const { error } = await supabase.from('recruitment_applications').insert([{
        name: recruitForm.value.name,
        email: recruitForm.value.email,
        phone: fullPhone,
        content: finalContent
      }])
      if (error) throw error
      dbSuccess = true
      if (state.currentUser) fetchUserDashboardData()
    }
  } catch (err) {
    console.error('Database Error:', err)
    errorMsg += `[DB Error: ${err.message || 'Table not found? Check SQL setup'}] `
  }

  if (emailSuccess || dbSuccess) {
    if (emailSuccess && !dbSuccess) {
      alert(state.currentLang === 'ko' ? '메일은 발송되었으나, 내역 저장(DB)에 실패했습니다. SQL 설정을 확인해주세요.' : 'Email sent, but DB save failed. Check SQL setup.')
    } else {
      alert(state.currentLang === 'ko' ? '지원되었습니다.' : 'Applied successfully.')
    }
    recruitForm.value = { name: '', email: '', phone1: '010', phone2: '', phone3: '', content: '' }
    selectedCvFile.value = null
    const fileInput = document.getElementById('cvFileInput')
    if (fileInput) fileInput.value = ''
  } else {
    alert(state.currentLang === 'ko' ? `전송 실패: ${errorMsg}` : `Submission failed: ${errorMsg}`)
  }
}
</script>

<template>
  <div class="recruit-view-container">
     <div class="recruit-header">
          <h2>{{ t.recruit.title }}</h2>
          <p>{{ t.recruit.desc }}</p>
     </div>
     
     <form class="recruit-form glass-panel container-narrow" @submit.prevent="handleRecruitSubmit">
       <div class="recruit-input-group">
         <label>{{ t.recruit.name }}</label>
         <input type="text" v-model="recruitForm.name" required />
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.recruit.phone }}</label>
         <div class="phone-inputs">
            <input type="tel" maxlength="3" v-model="recruitForm.phone1" required /> <span>-</span>
            <input type="tel" maxlength="4" v-model="recruitForm.phone2" required /> <span>-</span>
            <input type="tel" maxlength="4" v-model="recruitForm.phone3" required />
         </div>
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.recruit.email }}</label>
         <input type="email" v-model="recruitForm.email" required />
       </div>
       
       <div class="recruit-input-group">
         <label>{{ state.currentLang === 'ko' ? '이력서/포트폴리오 첨부 (PDF, Word, ZIP)' : 'Attach CV/Portfolio (PDF, Word, ZIP)' }}</label>
         <input id="cvFileInput" type="file" @change="handleCvFileChange" accept=".pdf,.doc,.docx,.zip" />
         <small style="color: #9DA1B4; margin-top:-5px;">(최대 5MB 제한)</small>
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.recruit.content }}</label>
         <textarea rows="6" v-model="recruitForm.content" required></textarea>
       </div>
       
       <button type="submit" class="recruit-submit-btn">{{ t.recruit.submit }}</button>
     </form>
  </div>
</template>
