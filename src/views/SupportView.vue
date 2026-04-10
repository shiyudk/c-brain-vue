<script setup>
import { ref } from 'vue'
import { state, t, fetchUserDashboardData } from '../store'
import { supabase } from '../supabase.js'
import emailjs from '@emailjs/browser'

const supportForm = ref({ name: '', email: '', category: '', subject: '', content: '' })

const handleSupportSubmit = async () => {
  let emailSuccess = false
  let dbSuccess = false
  let errorMsg = ''

  const now = new Date().toLocaleString()
  const templateParams = {
    name: supportForm.value.name,
    email: supportForm.value.email,
    category: supportForm.value.category,
    subject: supportForm.value.subject,
    message: supportForm.value.content,
    title: `고객 문의: ${supportForm.value.subject}`,
    time: now
  }

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
      const { error } = await supabase.from('inquiries').insert([{
        name: supportForm.value.name,
        email: supportForm.value.email,
        category: supportForm.value.category,
        subject: supportForm.value.subject,
        content: supportForm.value.content
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
      alert(state.currentLang === 'ko' ? '문의가 접수되었습니다. 곧 답변해 드리겠습니다!' : 'Inquiry received. We will respond shortly!')
    }
    supportForm.value = { name: '', email: '', category: '', subject: '', content: '' }
  } else {
    alert(state.currentLang === 'ko' ? `전송 실패: ${errorMsg}` : `Submission failed: ${errorMsg}`)
  }
}
</script>

<template>
  <div class="recruit-view-container support-view">
     <div class="recruit-header">
          <h2>{{ t.support.title }}</h2>
          <p>{{ t.support.desc }}</p>
     </div>
     
     <form class="recruit-form glass-panel container-narrow" @submit.prevent="handleSupportSubmit">
       <div class="recruit-input-group">
         <label>{{ t.support.name }}</label>
         <input type="text" v-model="supportForm.name" required />
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.support.email }}</label>
         <input type="email" v-model="supportForm.email" required />
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.support.category }}</label>
         <select required class="support-select" v-model="supportForm.category">
            <option value="">{{ t.support.category }}</option>
            <option>{{ t.support.cat1 }}</option>
            <option>{{ t.support.cat2 }}</option>
            <option>{{ t.support.cat3 }}</option>
         </select>
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.support.subject }}</label>
         <input type="text" v-model="supportForm.subject" required />
       </div>
       
       <div class="recruit-input-group">
         <label>{{ t.support.content }}</label>
         <textarea rows="8" v-model="supportForm.content" required></textarea>
       </div>
       
       <button type="submit" class="recruit-submit-btn">{{ t.support.submit }}</button>
     </form>
  </div>
</template>
