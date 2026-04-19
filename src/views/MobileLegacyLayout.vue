<!-- Terminology Update Trigger -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import CheckoutPage from './components/CheckoutPage.vue'
import AuthPage from './components/AuthPage.vue'
import { supabase } from './supabase.js'
import emailjs from '@emailjs/browser'

const currentUser = ref(null)
const isAdmin = computed(() => currentUser.value?.email === 'contact@c-braindesign.com')

const recruitForm = ref({ name: '', email: '', phone1: '010', phone2: '', phone3: '', content: '' })
const selectedCvFile = ref(null)
const supportForm = ref({ name: '', email: '', category: '', subject: '', content: '' })

const adminInquiries = ref([])
const adminRecruitments = ref([])
const adminOrders = ref([])
const adminActiveTab = ref('inquiries')

const selectedInquiries = ref([])
const selectedRecruitments = ref([])

const deleteSelected = async (type) => {
  if (!supabase || !isAdmin.value) return
  
  const selectedList = type === 'inquiries' ? selectedInquiries.value : selectedRecruitments.value
  const table = type === 'inquiries' ? 'inquiries' : 'recruitment_applications'
  
  if (selectedList.length === 0) {
    alert('???????????좏깮??�＜?몄슂.')
    return
  }
  
  if (!confirm(`?좏깮??${selectedList.length}媛쒖????????뺣쭚 ?????�떆寃좎???�퉴?`)) return
  
  try {
    const { error } = await supabase.from(table).delete().in('id', selectedList)
    if (error) throw error
    
    // Update local state
    if (type === 'inquiries') {
      adminInquiries.value = adminInquiries.value.filter(item => !selectedList.includes(item.id))
      selectedInquiries.value = []
    } else {
      adminRecruitments.value = adminRecruitments.value.filter(item => !selectedList.includes(item.id))
      selectedRecruitments.value = []
    }
    
    alert('?????��???�땲??')
  } catch (err) {
    console.error('Delete error:', err)
    alert(`??????�뙣: ${err.message}`)
  }
}

const toggleAll = (type) => {
  const list = type === 'inquiries' ? adminInquiries.value : adminRecruitments.value
  const selected = type === 'inquiries' ? selectedInquiries : selectedRecruitments
  
  if (selected.value.length === list.length) {
    selected.value = []
  } else {
    selected.value = list.map(item => item.id)
  }
}

const userInquiries = ref([])
const userRecruitments = ref([])
const userOrders = ref([])

const selectedItemDetail = ref(null)
const showDetailModal = ref(false)
const adminReplyText = ref('')

const formatContent = (text) => {
  if (!text) return ''
  // 1. XSS 諛⑹? (HTML ??�렇 ??�뒪?�??�봽)
  let safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // 2. ??�??????�� ??�렇 蹂??[FILE:???���?URL]
  safeText = safeText.replace(/\[FILE:([^|]+)\|([^\]]+)\]/g, '<a href="$2" target="_blank" style="color: #59B3D9; text-decoration: underline; font-weight: bold;">?�?$1</a>');
  
  // 3. ??�컲 ??二쇱??蹂??(?? a ??�렇 ??�쓽 href=" URL " ?뺥깭??嫄�?�??)
  safeText = safeText.replace(/(^|[^"'])((https?):\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" style="color: #59B3D9; text-decoration: underline;">$2</a>');

  return safeText.replace(/\n/g, '<br/>')
}

const viewDetail = (item) => {
  selectedItemDetail.value = item
  adminReplyText.value = item.admin_reply || ''
  showDetailModal.value = true
}

const closeDetailModal = () => {
  selectedItemDetail.value = null
  adminReplyText.value = ''
  showDetailModal.value = false
}
const handleLogout = async () => {
  if (supabase) {
    await supabase.auth.signOut()
    currentUser.value = null
    goHome()
  }
}

const currentLang = ref('ko')

const translations = {
  ko: {
    nav: { mall: '??�븨�?, support: '?�좉컼吏???, jobs: '�?��??뺣낫', signup: '???��媛??, company: '???��???��', ai: 'AI濡쒕???�⑥�??, personal: '??�뒪???�⑥�??, kids: '??�쫰 ?�⑥�??, search: '寃?? },
    recruit: {
      title: 'Brain Design ??�듃???�⑥�??�듃 ?곸떆 紐⑥�?,
      desc: '湲곗�??�먯??�??�붿�??�꾩�????�뼇??寃�?뿕�??꾨�??媛뽰???�⑥�??�듃 ?�꾨�????�쁺??�땲??',
      name: '??��?,
      phone: '?곕씫�?,
      email: '??��??,
      content: '??�슜',
      submit: '?묒꽦'
    },
    support: {
      title: '?�좉컼吏???�??�몄??,
      desc: '沅곴???�떊 ?�?��???곷떞???꾩슂??�떊 ??�슜????�꺼二쇱?�硫??뺤꽦?????????�━寃좎???�떎.',
      name: '?깊븿',
      email: '??��??二쇱??,
      phone: '?곕씫�?(?좏깮)',
      category: '?�몄???좏삎',
      cat1: '??��? ?�???�몄??,
      cat2: '?�⑥�???곷떞 ??�빟',
      cat3: '湲고? ?�몄??,
      subject: '??�ぉ',
      content: '?�몄????�슜',
      submit: '?�몄???�린'
    },
    hero: { quote1: '"??�뒪??? ?�??????�븳??�뒗 寃껋???꾨땲??<br>?????�??�?媛??湲몄??????寃껋???�떎."', quote2: '??Clarity over Impulse Philosophy', crisisTitle: '?�??몄쓽 ??�궗寃곗???꾧린', crisisDesc1: '?곕━??�???�컙 ??�쭖?? ?뺣낫?? 媛먯??????�� ??�뿉??寃곗?????�???�떎. ???�?�?寃곗????뺣쭚 ?뱀??????????�븳 寃껋???�퉴?', crisisDesc2: '<strong>??�렪?붾맂 ?좏깮????�컙???�⑸�?/strong>?? ?곕━????�쓣 ?�덉�?뺥븳 沅ㅻ룄濡?紐곗�?ｊ�???�뒿??�떎.', waverTitle: '???곕━????�??붾뱾?�щ뒗媛', waverSub: '?좉꼍???�ъ�???�??, waverDesc: '?곕━?????�� <strong>?�덊???�꽦</strong>????��???꾪삊??�줈 媛꾩�??�땲?? 湲곗?????�뒗 ?좏깮?? ???�� \'?몃룄�?'???�?��??�뿬 ?�덉�??利앺�??�궢??�떎.', waverBox: '?�?<strong>媛먯??vs ??�뒪??</strong> 媛먯??? ?꾪뿕?????��??\'?좏샇\'???�먯?�硫? ??�궗寃곗???\'湲곗?\'????�뼱??�뒗 ????�땲??', signalTitle: '媛먯??? ?좏샇吏, 湲곗????꾨땲??, signalList1: '<strong>??�컖??留롮???�줉 ?몄깮???�?��吏????��?:</strong> 湲곗? ??�씠 媛먯???留ㅻ???�뼱 \'??�컖???�⑦�?'??媛뉙?�湲??????�땲??', signalList2: '<strong>?�덉�???????�닔�?湲곗????꾩슂??�떎:</strong> ?�? ??�꼍???붾뱾??????? ??�븘�?????�뒗 寃껋? ??�쭅 紐낇???\'?�?�� 湲곗?\'?�먯???�떎.', signalList3: '<strong>移섏?�媛 ?꾨땶 ??��?</strong> ?�덉�????????�?��蹂�??? ?�덉�???�뿉??�룄 ?묐룞??�뒗 ?????�ъ“瑜?留뚮�??寃껋?????��??�땲??', systemTitle: 'SYSTEM BEFORE<br>EMOTIONS', systemSub: '??�뒪??�씠 媛먯?????�꽠??�떎', systemDesc1: '?멸컙??????μ? ?�좉�??�뒗 ?�?��??�땲?? ?곕━??媛먯?????��??? ??�븘????????깃낵????????�뒗 ??�뻾 ?꾨줈?몄뒪???�ъ텞??�땲??', systemDesc2: '湲곕????�뗭? ??�븘?? ???媛 ??��?몃룄 ?묐룞??�뒗 寃ш�????�뒪??�씠 ?뱀?????�긽??蹂댄???�땲??' },
    products: { ai: 'AI濡쒕??湲곕�??�⑥�??, personal: '??�씠?붾뱶 ??�뒪???�⑥�??, kids: '?꾨━誘몄�???�쫰 ?�⑥�??, cakeKnife: '?�????', dipSauce: '?μ???, otherProducts: 'Brain Design 湲고? ??��?', inquireBtn: '寃ъ쟻?�몄??, purchaseBtn: '?�щℓ??�린' },
    detail: { backBtn: '????�줈媛�?, detailInfo: '?곸꽭 ?뺣낫', shipping: '???<strong>諛곗????�궡:</strong> 寃곗???꾨즺 ??<strong>3????��?/strong>????�쟾??�쾶 諛곗?????�┰??�떎.', payCake: '寃곗???�린 (2,000??', payDip: '寃곗???�린 (8,000??' },
    checkout: { title: '寃곗???곷떞??�빟' },
    modal: { title: '寃ъ쟻 �??곷떞 ?�몄??, desc: '?꾨옒 ??��??�줈 ?명븯�??�몄?�瑜???�꺼二쇱?�硫???��?�寃????????�━寃좎???�떎.', copy: '二쇱??蹂듭�??�린', app: '硫붿??????�린' },
    footer: { company: '?곹샇�? ?�⑦???�뾼 ?�뚮????붿옄??(CBD) | ????�옄�? ??�떊??, bizNo: '??�?�?��濡앸�?? 746-36-01588 | ???��?�?��??�떊?�좊�?? ??026-??�슱?????0710??| ??�??二쇱?? ??�슱?밸�??????�멸????�쿇�?46�?85-6', contact: '????��?? contact@c-braindesign.com | ????�쾲?? 010-7567-7189', copyright: '�?2026 Continuum Brain Design. All rights reserved.' },
    cart: { title: '?λ�?��???, empty: '?λ�?��??�媛? ??���??�뒿??�떎.', addBtn: '?λ�?��?????�린', checkout: '?좏깮 ?곹�? 寃곗??, checkoutAll: '?꾩껜 ?곹�? 寃곗??, delete: '????, total: '??寃곗??湲덉�?, guest: '??��????�щℓ' },
    policy: {
      returnTitle: '?��???�?諛섑�??뺣낫',
      refundInfo: '/ ??�텋 & ?��???n- ??�텋 �??��???? ??�졊??�떊 ?좎쓣 ??�??�뿬 7????�뿉 ?붿껌????�＜?붿빞�?媛?ν빀??�떎. (??�럹??? ??Q&A ?묒닔)\n- ??�뿼 �?誘몄�????�궗, 李⑹????붿쟻, ??�졊 ??7????�썑 ??�텋/?��????좎껌?? ?�덇???�땲 李멸?�遺??곷뱶?�쎈???\n- ??�닚 蹂??? ?뺣났 諛곗?�鍮?5000?�?�� �????�땲??',
      addrTitle: '/ 諛섑�?二쇱??,
      addr: '??�슱?밸�??????�멸????�쿇�?46�?85-6',
      shippingNotice: '* ??�긽 ?��???�??�좉�?蹂??? ?�좉�??�???뺣났 諛곗?�鍮꾩엯??�떎. (???�利??��?????�?',
      shippingTitle: '諛곗??뺣낫',
      shippingDetail: '/ 諛곗???�궡\n諛곗?�諛?�쾿 : ??�같\n諛곗?�吏???: ?꾧뎅 吏??,
      cancelTitle: '??19�?寃곗???�⑥??& ??�텋',
      cancelDetail: '?????��?? ?�щℓ???�???�꾩�??泥닿�?????��?? ?꾨옒?? 媛숈??寃곗????????�⑥??�???�텋???붽뎄??????�뒿??�떎.\n- ??�슜?�꾩�???좎껌 ?? ???��濡쒕??곗쓽 ?곷떞????�났??? ??? 寃쎌?? 寃곗?�痍?�냼媛 媛?ν빀??�떎.\n- ???��???곷떞 ???�? ?꾨줈?꾩뭅??? 2????�긽 ??�졊??寃쎌?? ?붿뿬??�닔媛 ??? ???��????�븯????�슜 湲덉븸�??꾩빟�?10%????�쇅???�????�텋??媛?ν빀??�떎.'
    },
    mypage: {
      title: '留덉???�씠吏',
      welcome: '?? 諛섍�??�땲??',
      orderStatus: '二쇰Ц/諛곗???꾪솴',
      cartStatus: '?λ�?��????꾪솴',
      inquiryStatus: '?�몄???꾪솴',
      recruitStatus: '�?��??吏???꾪솴',
      empty: '??�뿭????�뒿??�떎.',
      viewCart: '?λ�?��???蹂닿�?,
      totalOrders: '??二쇰Ц',
      activeDelivery: '諛곗?�以?,
      itemsInCart: '??�릿 ?곹�?',
      myInquiries: '???�몄????�뿭',
      myApps: '�?��??吏????�뿭'
    }
  },
  en: {
    nav: { mall: 'Shop', support: 'Support', jobs: 'Careers', signup: 'Sign Up', company: 'Philosophy', ai: 'AI Algorithm', personal: 'Personal Core', kids: 'Kids Program', search: 'Search' },
    recruit: {
      title: 'Partner Consultants Recruitment',
      desc: 'We welcome consultants with diverse experience and expertise in corporate training and coaching!',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      content: 'Message',
      submit: 'Submit'
    },
    support: {
      title: 'Customer Support & Inquiry',
      desc: 'Please leave any questions or consultation requests, and we will respond promptly.',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone (Optional)',
      category: 'Inquiry Category',
      cat1: 'Product-related',
      cat2: 'Consultation Booking',
      cat3: 'Other Inquiries',
      subject: 'Subject',
      content: 'Message content',
      submit: 'Submit Inquiry'
    },
    hero: { quote1: '"A system does not restrict freedom,<br>but opens the path to greater freedom."', quote2: '??Clarity over Impulse Philosophy', crisisTitle: 'The Crisis of Decision Making', crisisDesc1: 'We make decisions amidst a sea of information and emotions. But are those decisions truly yours?', crisisDesc2: '<strong>Fragmented choices and momentary impulses</strong> are driving our lives into an unstable orbit.', waverTitle: 'Why We Always Waver', waverSub: 'A Nervous System Perspective', waverDesc: 'Our brains interpret <strong>uncertainty</strong> as a threat. Choices without standards stimulate the amygdala, amplifying anxiety.', waverBox: '?�?<strong>Emotion vs System:</strong> Emotion is a \'signal\' for danger, not a \'standard\' for decision making.', signalTitle: 'Emotion is a Signal, Not a Standard', signalList1: '<strong>Why overthinking slows down life:</strong> Being trapped in a \'thought loop\' without clear standards.', signalList2: '<strong>Anxiety begs standardizations:</strong> Only clear \'judgments\' can ground you when the environment shakes.', signalList3: '<strong>Design, not healing:</strong> The key is building a thought process that works even in anxiety.', systemTitle: 'SYSTEM BEFORE<br>EMOTIONS', systemSub: 'The System Precedes Emotion', systemDesc1: 'Human willpower is a depleting resource. We build execution processes that yield consistent results without relying on emotions.', systemDesc2: 'A solid system protects your daily life, even when you\'re feeling down or weak.' },
    products: { ai: 'AI Algorithm Check', personal: 'High-End Personal Core', kids: 'Premium Kids Builder', cakeKnife: 'Cake Knife', dipSauce: 'Dipping Sauce', otherProducts: 'Brain Design Other Products', inquireBtn: 'Inquire', purchaseBtn: 'Purchase' },
    detail: { backBtn: '??Back', detailInfo: 'Details', shipping: '???<strong>Shipping Info:</strong> Safe delivery within <strong>3 days</strong> of payment.', payCake: 'Checkout (2,000 KRW)', payDip: 'Checkout (8,000 KRW)' },
    checkout: { title: 'Checkout / Booking' },
    modal: { title: 'Quote & Inquiry', desc: 'Please leave inquiries via email below for a rapid response.', copy: 'Copy Address', app: 'Open Mail App' },
    footer: { company: 'Company: Continuum Brain Design (CBD) | LEADER: Shinhee Yun', bizNo: 'Business Reg: 746-36-01588 | E-Commerce Reg: ??026-??�슱?????0710??| Address: 85-6, Hancheon-ro 46-gil, Dongdaemun-gu, Seoul', contact: 'Email: contact@c-braindesign.com | Phone: 010-7567-7189', copyright: '�?2026 Continuum Brain Design. All rights reserved.' },
    cart: { title: 'Shopping Cart', empty: 'Your cart is empty.', addBtn: 'Add to Cart', checkout: 'Checkout Selected', checkoutAll: 'Checkout All', delete: 'Delete', total: 'Total Amount', guest: 'Guest Checkout' },
    policy: {
      returnTitle: 'Exchange & Return Info',
      refundInfo: '/ Refund & Exchange\n- Requests must be made within 7 days of receipt.\n- Items with stains, yarn defects, or signs of wear cannot be refunded/exchanged after 7 days.\n- A round-trip shipping fee of 5,000 KRW applies for simple change of mind.',
      addrTitle: '/ Return Address',
      addr: '85-6, Hancheon-ro 46-gil, Dongdaemun-gu, Seoul',
      shippingNotice: '* Round-trip shipping for color/size exchange or change of mind is at the customer\'s expense.',
      shippingTitle: 'Shipping Info',
      shippingDetail: '/ Shipping Guide\nMethod: Courier\nRegion: Nationwide',
      cancelTitle: 'Article 19: Cancellation & Refund',
      cancelDetail: '??Members who have entered into a contract with the company may request cancellation and refund as follows.\n- Cancellation is possible if no consultation has been provided after the application.\n- If a profile card has been received twice or more after consultation, a partial refund excluding utilized amount and a 10% penalty is possible for remaining sessions.'
    },
    mypage: {
      title: 'My Page',
      welcome: ', Welcome back.',
      orderStatus: 'Orders / Delivery',
      cartStatus: 'Shopping Cart',
      inquiryStatus: 'Support Inquiries',
      recruitStatus: 'Recruitment Status',
      empty: 'No records found.',
      viewCart: 'View Cart',
      totalOrders: 'Total Orders',
      activeDelivery: 'Shipping',
      itemsInCart: 'Items in Cart',
      myInquiries: 'Inquiry History',
      myApps: 'Application History'
    }
  }
}

const t = computed(() => translations[currentLang.value])

const currentView = ref('home')
const selectedProduct = ref('')
const selectedDetailProduct = ref(null)
const checkoutAmount = ref(0)
const currentAuthMode = ref('login')
const isMobileMenuOpen = ref(false)
const savedScrollY = ref(0)
const previousView = ref('home')

const goToDetail = (productName) => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  selectedDetailProduct.value = productName
  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

const goToAuth = (mode = 'login', isMobile = false) => {
  currentAuthMode.value = mode
  if (isMobile && isMobileMenuOpen.value) {
    toggleMobileMenu()
  }
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'auth'
  window.scrollTo(0, 0)
}

const goToSupport = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'support'
  window.scrollTo(0, 0)
}

const goToJobs = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'recruit'
  window.scrollTo(0, 0)
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
    title: '�?��??吏??(Recruitment)',
    time: now
  }

  let cvUrl = ''
  if (selectedCvFile.value) {
    if (!supabase) { alert('Supabase ?곌껐 ??�쪟�????��????�줈??�븷 ????�뒿??�떎.'); return }
    try {
      const fileExt = selectedCvFile.value.name.split('.').pop()
      const fileName = `${Date.now()}_cv.${fileExt}`
      const { data, error } = await supabase.storage.from('resumes').upload(fileName, selectedCvFile.value)
      if (error) {
        alert("??�?????�줈????�뙣. Supabase??'resumes' ??�뒗 Public 踰꾪�????�뒗吏 ?뺤씤??�＜?몄슂. ?�?��: " + error.message)
        return
      }
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName)
      cvUrl = urlData.publicUrl
    } catch (err) {
      alert("???�� 泥섎??�???�쪟: " + err.message)
      return
    }
  }

  const finalContent = cvUrl 
    ? `${recruitForm.value.content}\n\n[泥⑤????�몄�???�슫濡쒕�?\n[FILE:${selectedCvFile.value.name}|${cvUrl}]`
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
      if (currentUser.value) fetchUserDashboardData()
    }
  } catch (err) {
    console.error('Database Error:', err)
    errorMsg += `[DB Error: ${err.message || 'Table not found? Check SQL setup'}] `
  }

  if (emailSuccess || dbSuccess) {
    if (emailSuccess && !dbSuccess) {
      alert(currentLang.value === 'ko' ? '硫붿??? 諛쒖???��???�굹, ??�뿭 ????DB)????�뙣??�뒿??�떎. SQL ??�젙???뺤씤??�＜?몄슂.' : 'Email sent, but DB save failed. Check SQL setup.')
    } else {
      alert(currentLang.value === 'ko' ? '吏?�?��??�뒿??�떎.' : 'Applied successfully.')
    }
    recruitForm.value = { name: '', email: '', phone1: '010', phone2: '', phone3: '', content: '' }
    selectedCvFile.value = null
    // HTML file input ?�ъ�???꾪빐 ?�쇱??????
    const fileInput = document.getElementById('cvFileInput')
    if (fileInput) fileInput.value = ''
  } else {
    alert(currentLang.value === 'ko' ? `?꾩넚 ??�뙣: ${errorMsg}` : `Submission failed: ${errorMsg}`)
  }
}

const handleCvFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("???�� ??�??5MB ??�븯??�???�땲??")
      e.target.value = ''
      selectedCvFile.value = null
      return
    }
    selectedCvFile.value = file
  } else {
    selectedCvFile.value = null
  }
}

const fetchAdminData = async () => {
  if (!supabase || !isAdmin.value) return
  const { data: inq } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
  const { data: rec } = await supabase.from('recruitment_applications').select('*').order('created_at', { ascending: false })
  const { data: ord } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  
  adminInquiries.value = inq || []
  adminRecruitments.value = rec || []
  adminOrders.value = ord || []
}

const updateStatus = async (table, id, newStatus, field = 'status') => {
  if (!supabase || !isAdmin.value) {
    alert('?�?�ъ옄 沅뚰�????�뒿??�떎.')
    return
  }
  
  console.log(`[Updating] ${table} ID:${id} to ${newStatus}`)

  const updateData = {}
  updateData[field] = newStatus
  
  // 1. ??�쾭 ??�뜲??�듃 ??�룄
  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Update operation failed:', error)
    alert(`[移섎�????�쪟] ${error.message}`)
    await fetchAdminData()
    return
  }

  // ??�뜲??�듃???곗씠?�? ??�떎�?(RLS ?깆뿉 留됲??
  if (!data || data.length === 0) {
    console.warn('0 rows affected. RLS may be blocking.')
    alert('??�쾭 沅뚰�??�몄?�濡????μ??嫄곕???��???�땲??\nSQL Editor?�?�� DISABLE ROW LEVEL SECURITY????�뻾??�＜?몄슂.')
    await fetchAdminData()
    return
  }

  // 2. ?깃났 ??濡쒖�??곗씠?�? 利됱??媛깆???��????�� ??�씠 ?�낅�?
  if (table === 'inquiries') {
    const item = adminInquiries.value.find(i => i.id === id)
    if (item) item[field] = newStatus
  } else if (table === 'recruitment_applications') {
    const item = adminRecruitments.value.find(i => i.id === id)
    if (item) item[field] = newStatus
  } else if (table === 'orders') {
    const item = adminOrders.value.find(i => i.id === id)
    if (item) item[field] = newStatus
  }

  console.log('Update success!')
}

const submitAdminReply = async (id) => {
  if (!supabase || !isAdmin.value) return
  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ admin_reply: adminReplyText.value, status: 'completed' })
      .eq('id', id)
      
    if (error) {
      alert("?곗씠?곕쿋??�뒪??'admin_reply' (text) ?�щ읆??議댁???�뒗吏 ?뺤씤??�＜?몄슂! ?�?��: " + error.message)
      return
    }
    
    alert('????????λ�??�뒿??�떎.')
    // 濡쒖�??곗씠??媛깆??
    if (selectedItemDetail.value) {
      selectedItemDetail.value.admin_reply = adminReplyText.value
      selectedItemDetail.value.status = 'completed'
    }
    const item = adminInquiries.value.find(i => i.id === id)
    if (item) {
      item.admin_reply = adminReplyText.value
      item.status = 'completed'
    }
  } catch (err) {
    alert("??�쪟 諛쒖�? " + err.message)
  }
}

const goToAdmin = () => {
  currentView.value = 'admin'
  fetchAdminData()
}

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
    title: `?�좉�??�몄?? ${supportForm.value.subject}`,
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
      if (currentUser.value) fetchUserDashboardData()
    }
  } catch (err) {
    console.error('Database Error:', err)
    errorMsg += `[DB Error: ${err.message || 'Table not found? Check SQL setup'}] `
  }

  if (emailSuccess || dbSuccess) {
    if (emailSuccess && !dbSuccess) {
      alert(currentLang.value === 'ko' ? '硫붿??? 諛쒖???��???�굹, ??�뿭 ????DB)????�뙣??�뒿??�떎. SQL ??�젙???뺤씤??�＜?몄슂.' : 'Email sent, but DB save failed. Check SQL setup.')
    } else {
      alert(currentLang.value === 'ko' ? '?�몄?�媛? ?묒닔??��???�땲?? ?????????�━寃좎???�떎!' : 'Inquiry received. We will respond shortly!')
    }
    supportForm.value = { name: '', email: '', category: '', subject: '', content: '' }
  } else {
    alert(currentLang.value === 'ko' ? `?꾩넚 ??�뙣: ${errorMsg}` : `Submission failed: ${errorMsg}`)
  }
}

const fetchUserDashboardData = async () => {
  if (!supabase || !currentUser.value) return
  const userEmail = currentUser.value.email
  
  const { data: inq } = await supabase.from('inquiries').select('*').eq('email', userEmail).order('created_at', { ascending: false })
  const { data: rec } = await supabase.from('recruitment_applications').select('*').eq('email', userEmail).order('created_at', { ascending: false })
  const { data: ord } = await supabase.from('orders').select('*').eq('user_email', userEmail).order('created_at', { ascending: false })
  
  userInquiries.value = inq || []
  userRecruitments.value = rec || []
  userOrders.value = ord || []
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const goToCheckout = (productName, amount = 0) => {
  if (currentView.value === 'home' || currentView.value === 'mall' || currentView.value === 'cart') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  selectedProduct.value = productName
  checkoutAmount.value = amount
  currentView.value = 'checkout'
  window.scrollTo(0, 0)
}

const goBackFromCheckout = () => {
  if (previousView.value === 'cart') {
    currentView.value = 'cart'
    window.scrollTo(0, 0)
  } else if (previousView.value === 'detail') {
    currentView.value = 'detail'
    previousView.value = 'home'
    window.scrollTo(0, 0)
  } else {
    goHome()
  }
}

const goHome = (resetScroll = true) => {
  currentView.value = 'home'
  previousView.value = 'home'
  
  const scrollToTop = () => {
    window.scrollTo({ top: resetScroll ? 0 : savedScrollY.value, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: resetScroll ? 0 : savedScrollY.value, behavior: 'smooth' });
    document.body.scrollTo({ top: resetScroll ? 0 : savedScrollY.value, behavior: 'smooth' });
    const appEl = document.getElementById('app');
    if (appEl) appEl.scrollTo({ top: resetScroll ? 0 : savedScrollY.value, behavior: 'smooth' });
    const cont = document.querySelector('.app-container');
    if (cont && typeof cont.scrollTo === 'function') cont.scrollTo({ top: resetScroll ? 0 : savedScrollY.value, behavior: 'smooth' });
  };
  scrollToTop();
  setTimeout(scrollToTop, 50);
}

const goToMall = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'mall'
  window.scrollTo(0, 0)
}

const goToMyPage = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'mypage'
  fetchUserDashboardData()
  window.scrollTo(0, 0)
}

const scrollToPhilosophy = () => {
  const el = document.getElementById('philosophy')
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
  }
}

const scrollToConsulting = (isMobile = false) => {
  if (isMobile && isMobileMenuOpen.value) {
    toggleMobileMenu()
  }
  if (currentView.value !== 'home') {
    goHome()
    setTimeout(() => {
      const el = document.getElementById('consulting-boxes')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (el.getBoundingClientRect().height / 2) - 45, behavior: 'smooth' })
    }, 100)
    return
  }
  const el = document.getElementById('consulting-boxes')
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (el.getBoundingClientRect().height / 2) - 45, behavior: 'smooth' })
  }
}

// ----------------------------------------------------
// Cart Logic
// ----------------------------------------------------
const cart = ref(JSON.parse(localStorage.getItem('cbd_cart') || '[]'))

watch(cart, (newVal) => {
  localStorage.setItem('cbd_cart', JSON.stringify(newVal))
}, { deep: true })

const addToCart = (productName) => {
  const price = productName === '?�????' ? 2000 : 8000
  const existingItem = cart.value.find(item => item.name === productName)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({
      id: Date.now(),
      name: productName,
      price: price,
      quantity: 1,
      selected: true
    })
  }
  alert(currentLang.value === 'ko' ? '?λ�?��??????�꼈??�땲??' : 'Added to cart!')
}

const removeFromCart = (id) => {
  cart.value = cart.value.filter(item => item.id !== id)
}

const updateQuantity = (id, delta) => {
  const item = cart.value.find(i => i.id === id)
  if (item) {
    const newQty = item.quantity + delta
    if (newQty > 0) item.quantity = newQty
  }
}

const shippingFee = 3000

const cartItemsTotal = computed(() => {
  return cart.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const cartTotal = computed(() => {
  const base = cartItemsTotal.value
  return base > 0 ? base + shippingFee : 0
})

const goToCart = () => {
  if (currentView.value === 'home') {
    savedScrollY.value = window.scrollY
  }
  previousView.value = currentView.value
  currentView.value = 'cart'
  window.scrollTo(0, 0)
}

const checkoutFromCart = (isGuest = false) => {
  const selectedItems = cart.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    alert(currentLang.value === 'ko' ? '寃곗????곹�????좏깮??�＜?몄슂.' : 'Please select items to checkout.')
    return
  }

  if (!isGuest && !currentUser.value) {
    alert(currentLang.value === 'ko' ? '濡쒓?????寃곗?�媛? 媛?ν빀??�떎.' : 'Please login to proceed with checkout.')
    goToAuth('login')
    return
  }
  
  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const multiName = selectedItems.length > 1 
    ? `${selectedItems[0].name} ??${selectedItems.length - 1}�?
    : selectedItems[0].name
    
  goToCheckout(multiName, total)
}

const showContactModal = ref(false)

const sendMail = () => {
  showContactModal.value = true
}

const copyEmail = () => {
  navigator.clipboard.writeText('contact@c-braindesign.com')
  alert(currentLang.value === 'ko' ? '??��??二쇱?�媛? 蹂듭�??��???�땲??' : 'Email address copied!')
}

const triggerMailApp = () => {
  const mailToLink = document.createElement('a')
  mailToLink.href = 'mailto:contact@c-braindesign.com'
  mailToLink.click()
}

onMounted(() => {
  if (supabase) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUser.value = session?.user || null
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser.value = session?.user || null
      // 濡쒓???????�쟾???λ�?��??????��???�㈃ ??�떆 ?λ�?��??�濡???��?
      if (session?.user && currentView.value === 'auth' && previousView.value === 'cart') {
        currentView.value = 'cart'
      }
    })
  }

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
  <div class="app-container">
    <div class="top-utility-bar">
      <div class="utility-content">
        <a href="#" @click.prevent="goToMall" style="margin-right: 1.5rem; font-weight: 700; color: #59B3D9;">{{ t.nav.mall }}</a>
        <a href="#" @click.prevent="goToSupport">{{ t.nav.support }}</a>
        <a href="#" @click.prevent="goToJobs">{{ t.nav.jobs }}</a>
        <a href="#" v-if="isAdmin" @click.prevent="goToAdmin" style="color: #ff6b6b; font-weight: 700; margin-left: 1rem;">ADMIN</a>
        <template v-if="currentUser">
          <a href="#" @click.prevent="handleLogout">濡쒓??꾩썐</a>
        </template>
        <template v-else>
          <a href="#" @click.prevent="goToAuth('signup', false)">{{ t.nav.signup }}</a>
        </template>
      </div>
    </div>

    <header class="navbar">
      <div class="nav-content">
        <a href="/" class="logo" @click.prevent="goHome(true)" style="position: relative; z-index: 9999; cursor: pointer;">
          <img src="/logo_new.png?v=9" alt="Brain Design" class="nav-logo-img" />
        </a>
        <nav class="nav-links">
          <a href="#" @click.prevent="currentView === 'home' ? scrollToPhilosophy() : (goHome(), setTimeout(scrollToPhilosophy, 0))">{{ t.nav.company }}</a>
          <a href="#" @click.prevent="currentView === 'home' ? scrollToConsulting(false) : (goHome(), setTimeout(() => scrollToConsulting(false), 0))">{{ t.nav.personal }}</a>
          <a href="#" @click.prevent="currentView === 'home' ? scrollToConsulting(false) : (goHome(), setTimeout(() => scrollToConsulting(false), 0))">{{ t.nav.ai }}</a>
          <a href="#" @click.prevent="currentView === 'home' ? scrollToConsulting(false) : (goHome(), setTimeout(() => scrollToConsulting(false), 0))">{{ t.nav.kids }}</a>
        </nav>

        <div class="nav-actions">
          <div class="lang-toggle">
            <button @click="currentLang = 'ko'" :class="{ active: currentLang === 'ko' }" class="lang-btn">KR</button>
            <span style="color:rgba(255,255,255,0.2)">|</span>
            <button @click="currentLang = 'en'" :class="{ active: currentLang === 'en' }" class="lang-btn">EN</button>
          </div>
          <a href="#" class="icon-btn hide-mobile" @click.prevent="goToCart">???<span v-if="cart.length > 0" class="cart-count">{{ cart.length }}</span></a>
          <a href="#" class="icon-btn hide-mobile" @click.prevent="currentUser ? goToMyPage() : goToAuth('login', false)">?뫀</a>
          <button class="mobile-menu-btn" @click="toggleMobileMenu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    </header>

    <div class="mobile-overlay" :class="{ 'is-open': isMobileMenuOpen }" @click="toggleMobileMenu"></div>
    <div class="mobile-slide-menu" :class="{ 'is-open': isMobileMenuOpen }">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">MENU</span>
        <button class="close-menu-btn" @click="toggleMobileMenu">??/button>
      </div>
      <nav class="mobile-nav-links">
        <a href="#company" @click="toggleMobileMenu">{{ t.nav.company }}</a>
        <a href="#" @click.prevent="goToMall(); toggleMobileMenu()" style="color: #59B3D9; font-weight: 700;">{{ t.nav.mall }}</a>
        <a href="#" @click.prevent="goToJobs(); toggleMobileMenu()">{{ t.nav.jobs }}</a>
        <a href="#" @click.prevent="scrollToConsulting(true)">{{ t.nav.personal }}</a>
        <a href="#" @click.prevent="scrollToConsulting(true)">{{ t.nav.ai }}</a>
        <a href="#" @click.prevent="scrollToConsulting(true)">{{ t.nav.kids }}</a>
        <a href="#" v-if="isAdmin" @click.prevent="goToAdmin(); toggleMobileMenu()" style="color: #ff6b6b; font-weight: 700;">ADMIN DASHBOARD</a>
        <template v-if="currentUser">
          <a href="#" @click.prevent="handleLogout" style="margin-top: 24px; font-weight: 700; color: #ff6b6b;">
            {{ currentLang === 'ko' ? '濡쒓??꾩썐' : 'Logout' }}
          </a>
        </template>
        <template v-else>
          <a href="#" @click.prevent="goToAuth('signup', true)" style="margin-top: 24px; font-weight: 700; color: #59B3D9;">
            {{ currentLang === 'ko' ? '???��媛?? : 'Sign Up' }}
          </a>
        </template>
      </nav>
    </div>

    <main class="main-content">
      <template v-if="currentView === 'support'">
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

      <template v-if="currentView === 'admin'">
        <div class="admin-view-container container">
          <div class="admin-header">
             <h1>Admin Control Panel</h1>
             <div class="admin-tabs">
               <button @click="adminActiveTab = 'inquiries'" :class="{ active: adminActiveTab === 'inquiries' }">?�좉�??�몄??({{ adminInquiries.length }})</button>
               <button @click="adminActiveTab = 'recruitments'" :class="{ active: adminActiveTab === 'recruitments' }">�?��??吏??({{ adminRecruitments.length }})</button>
               <button @click="adminActiveTab = 'mall'" :class="{ active: adminActiveTab === 'mall' }">??�븨�?二쇰Ц ({{ adminOrders.length }})</button>
             </div>
          </div>
          
          <!-- Inquiries Admin -->
          <div v-if="adminActiveTab === 'inquiries'" class="admin-section glass-panel">
            <div class="admin-actions-bar" style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
              <button @click="deleteSelected('inquiries')" class="admin-del-btn" :disabled="selectedInquiries.length === 0">?좏깮 ????({{ selectedInquiries.length }})</button>
            </div>
            <div class="table-scroll">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width: 40px;"><input type="checkbox" :checked="selectedInquiries.length === adminInquiries.length && adminInquiries.length > 0" @change="toggleAll('inquiries')" /></th>
                    <th>?좎�?</th>
                    <th>??��?/th>
                    <th>?�쇰??/th>
                    <th>??�ぉ</th>
                    <th>?곹깭</th>
                    <th>湲곕??/th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inq in adminInquiries" :key="inq.id" @click="viewDetail(inq)" class="clickable-row">
                    <td @click.stop><input type="checkbox" v-model="selectedInquiries" :value="inq.id" /></td>
                    <td>{{ new Date(inq.created_at).toLocaleDateString() }}</td>
                    <td>{{ inq.name }}</td>
                    <td><span class="tag-cat">{{ inq.category }}</span></td>
                    <td class="text-truncate" style="max-width: 250px;">{{ inq.subject }}</td>
                    <td>
                      <span class="status-tag" :class="inq.status">{{ inq.status === 'pending' ? '?뺤씤??�? : '泥섎??꾨즺' }}</span>
                    </td>
                    <td @click.stop>
                      <select :value="inq.status" @change="e => updateStatus('inquiries', inq.id, e.target.value)" class="admin-select">
                        <option value="pending">?뺤씤??�?/option>
                        <option value="completed">泥섎??꾨즺</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recruitments Admin -->
          <div v-if="adminActiveTab === 'recruitments'" class="admin-section glass-panel">
            <div class="admin-actions-bar" style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
              <button @click="deleteSelected('recruitments')" class="admin-del-btn" :disabled="selectedRecruitments.length === 0">?좏깮 ????({{ selectedRecruitments.length }})</button>
            </div>
            <div class="table-scroll">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width: 40px;"><input type="checkbox" :checked="selectedRecruitments.length === adminRecruitments.length && adminRecruitments.length > 0" @change="toggleAll('recruitments')" /></th>
                    <th>?좎�?</th>
                    <th>??��?/th>
                    <th>?곕씫�?/th>
                    <th>??��??/th>
                    <th>?곹깭</th>
                    <th>湲곕??/th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rec in adminRecruitments" :key="rec.id" @click="viewDetail(rec)" class="clickable-row">
                    <td @click.stop><input type="checkbox" v-model="selectedRecruitments" :value="rec.id" /></td>
                    <td>{{ new Date(rec.created_at).toLocaleDateString() }}</td>
                    <td>{{ rec.name }}</td>
                    <td>{{ rec.phone }}</td>
                    <td>{{ rec.email }}</td>
                    <td>
                      <span class="status-tag" :class="rec.status">{{ rec.status === 'pending' ? '??궗以? : '??�?꾨즺' }}</span>
                    </td>
                    <td @click.stop>
                       <select :value="rec.status" @change="e => updateStatus('recruitment_applications', rec.id, e.target.value)" class="admin-select">
                        <option value="pending">??궗以?/option>
                        <option value="completed">??�?꾨즺</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Orders Admin -->
          <div v-if="adminActiveTab === 'mall'" class="admin-section glass-panel">
            <div class="table-scroll">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>二쇰Ц??/th>
                    <th>?곹�?�?/th>
                    <th>?�щℓ??/th>
                    <th>?�앹�?/th>
                    <th>二쇰Ц?곹깭</th>
                    <th>諛곗??꾪솴</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ord in adminOrders" :key="ord.id" @click="viewDetail(ord)" class="clickable-row">
                    <td>{{ new Date(ord.created_at).toLocaleDateString() }}</td>
                    <td>{{ ord.product_name }}</td>
                    <td>{{ ord.receiver_name || ord.user_email }}</td>
                    <td>{{ ord.total_amount.toLocaleString() }}??/td>
                    <td>
                      <span class="status-tag" :class="ord.order_status">{{ ord.order_status === 'payment_pending' ? '寃곗???�? : '寃곗??꾨즺' }}</span>
                    </td>
                    <td>
                       <select :value="ord.delivery_status" @change="e => updateStatus('orders', ord.id, e.target.value, 'delivery_status')" class="admin-select" @click.stop>
                        <option value="preparing">諛곗?�以???/option>
                        <option value="shipping">諛곗?�以?/option>
                        <option value="delivered">諛곗??꾨즺</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <template v-if="currentView === 'mypage'">
        <div class="mypage-view-container container">
          <div class="mypage-header" style="text-align: center; margin-bottom: 50px;">
            <h1>{{ t.mypage.title }}</h1>
            <p class="user-welcome" style="font-size: 1.1rem; color: #59B3D9; margin-top: 10px;">
              {{ currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] }}{{ t.mypage.welcome }}
            </p>
          </div>

          <div class="mypage-grid">
            <div class="mypage-card glass-panel">
              <div class="card-header">
                <h3>?벀 {{ t.mypage.orderStatus }}</h3>
              </div>
              <div class="card-content">
                <div class="stat-row">
                  <span>{{ t.mypage.totalOrders }}</span>
                  <span class="stat-val">{{ userOrders.length }}</span>
                </div>
                <div class="stat-row">
                  <span>{{ t.mypage.activeDelivery }}</span>
                  <span class="stat-val">{{ userOrders.filter(o => o.delivery_status === 'shipping').length }}</span>
                </div>
                <div class="user-history-list" v-if="userOrders.length > 0">
                   <div v-for="ord in userOrders" :key="ord.id" class="history-item clickable" @click="viewDetail(ord)">
                     <span class="h-date">{{ new Date(ord.created_at).toLocaleDateString() }}</span>
                     <span class="h-title" style="color: #59B3D9;">{{ ord.product_name }}</span>
                     <span class="h-status" :class="ord.delivery_status">
                       {{ ord.delivery_status === 'preparing' ? '諛곗?�以??? : ord.delivery_status === 'shipping' ? '諛곗?�以? : '諛곗??꾨즺' }}
                     </span>
                   </div>
                </div>
                <p class="empty-msg" v-else>{{ t.mypage.empty }}</p>
              </div>
            </div>

            <div class="mypage-card glass-panel">
              <div class="card-header">
                <h3>???{{ t.mypage.cartStatus }}</h3>
              </div>
              <div class="card-content">
                <div class="stat-row">
                  <span>{{ t.mypage.itemsInCart }}</span>
                  <span class="stat-val">{{ cart.length }}</span>
                </div>
                <button class="small-action-btn" @click="goToCart">{{ t.mypage.viewCart }}</button>
              </div>
            </div>

            <div class="mypage-card glass-panel">
              <div class="card-header">
                <h3>?�?{{ t.mypage.inquiryStatus }}</h3>
              </div>
              <div class="card-content">
                <div class="stat-row">
                  <span>{{ t.mypage.myInquiries }}</span>
                  <span class="stat-val">{{ userInquiries.length }}</span>
                </div>
                <div class="user-history-list" v-if="userInquiries.length > 0">
                  <div v-for="inq in userInquiries" :key="inq.id" class="history-item clickable" @click="viewDetail(inq)">
                    <span class="h-date">{{ new Date(inq.created_at).toLocaleDateString() }}</span>
                    <span class="h-title">{{ inq.subject }}</span>
                    <span class="h-status pending">{{ inq.status === 'pending' ? '?묒닔?꾨즺' : '????꾨즺' }}</span>
                  </div>
                </div>
                <p class="empty-msg" v-else>{{ t.mypage.empty }}</p>
              </div>
            </div>

            <div class="mypage-card glass-panel">
              <div class="card-header">
                <h3>?�?{{ t.mypage.recruitStatus }}</h3>
              </div>
              <div class="card-content">
                <div class="stat-row">
                  <span>{{ t.mypage.myApps }}</span>
                  <span class="stat-val">{{ userRecruitments.length }}</span>
                </div>
                <div class="user-history-list" v-if="userRecruitments.length > 0">
                  <div v-for="app in userRecruitments" :key="app.id" class="history-item clickable" @click="viewDetail(app)">
                    <span class="h-date">{{ new Date(app.created_at).toLocaleDateString() }}</span>
                    <span class="h-title">{{ app.name }} ?�⑥�??�듃 吏??/span>
                    <span class="h-status" :class="app.status">{{ app.status === 'pending' ? '??궗以? : '??�?꾨즺' }}</span>
                  </div>
                </div>
                <p class="empty-msg" v-else>{{ t.mypage.empty }}</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <button class="logout-btn" @click="handleLogout">{{ currentLang === 'ko' ? '濡쒓??꾩썐' : 'Logout' }}</button>
          </div>
        </div>
      </template>

      <div v-show="currentView === 'home'">
        <section id="philosophy" class="philosophy-section">
            <div class="full-screen-quote intro-fade-in">
              <div class="quote-content">
                <span class="quote-mark">??/span>
                <h2 class="quote-text" v-html="t.hero.quote1"></h2>
                <p class="quote-eyebrow align-right">{{ t.hero.quote2 }}</p>
              </div>
            </div>
        
            <div class="full-screen-section">
              <div class="crop-bg slide2-crop"></div>
              <div class="dark-overlay"></div>
              <div class="phil-text-content animate-hidden">
                <h3>{{ t.hero.crisisTitle }}</h3>
                <p>{{ t.hero.crisisDesc1 }}</p>
                <p v-html="t.hero.crisisDesc2"></p>
              </div>
            </div>
        
            <div class="full-screen-section">
              <div class="crop-bg slide3-crop"></div>
              <div class="dark-overlay"></div>
              <div class="phil-text-content animate-hidden">
                <h3>{{ t.hero.waverTitle }}</h3>
                <h4 class="sub-heading">{{ t.hero.waverSub }}</h4>
                <p v-html="t.hero.waverDesc"></p>
                <div class="phil-box">
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
                    <span class="icon">?좑툘</span>
                    <p v-html="t.hero.signalList1"></p>
                  </li>
                  <li>
                    <span class="icon">?뽳툘</span>
                    <p v-html="t.hero.signalList2"></p>
                  </li>
                  <li>
                    <span class="icon">??�截?/span>
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

        <section id="products" class="products-section">
          <div class="section-container animate-hidden">
            <div id="consulting-boxes" class="grid-container">
              <div class="tech-card" @click="sendMail">
                <div class="card-img-placeholder" style="background-image: url('/images/ai.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>{{ t.products.ai }}</h3>
                  <button>{{ t.products.inquireBtn }}</button>
                </div>
              </div>

              <div class="tech-card" @click="sendMail">
                <div class="card-img-placeholder" style="background-image: url('/images/personal.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>{{ t.products.personal }}</h3>
                  <button>{{ t.products.inquireBtn }}</button>
                </div>
              </div>

              <div class="tech-card" @click="sendMail">
                <div class="card-img-placeholder" style="background-image: url('/images/kids.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>{{ t.products.kids }}</h3>
                  <button>{{ t.products.inquireBtn }}</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <template v-if="currentView === 'recruit'">
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
               <label>{{ currentLang === 'ko' ? '??�????????�???泥⑤? (PDF, Word, ZIP)' : 'Attach CV/Portfolio (PDF, Word, ZIP)' }}</label>
               <input id="cvFileInput" type="file" @change="handleCvFileChange" accept=".pdf,.doc,.docx,.zip" />
               <small style="color: #9DA1B4; margin-top:-5px;">(理쒕? 5MB ??�븳)</small>
             </div>
             
             <div class="recruit-input-group">
               <label>{{ t.recruit.content }}</label>
               <textarea rows="6" v-model="recruitForm.content" required></textarea>
             </div>
             
             <button type="submit" class="recruit-submit-btn">{{ t.recruit.submit }}</button>
           </form>
        </div>
      </template>

      <template v-if="currentView === 'detail'">
        <div class="detail-header">
          <button @click="goHome" class="back-btn">{{ t.detail.backBtn }}</button>
          <h2>{{ selectedDetailProduct === '?�????' ? t.products.cakeKnife : selectedDetailProduct === '?μ??? ? t.products.dipSauce : selectedDetailProduct }} {{ t.detail.detailInfo }}</h2>
        </div>
        
        <div class="product-detail-container" v-if="selectedDetailProduct === '?�????' || selectedDetailProduct === '?μ???">
          <div class="detail-images">
            <template v-if="selectedDetailProduct === '?�????'">
              <img src="/images/eco_paper_cake_knife.jpg" alt="Eco Paper Cake Knife" />
            </template>
            <template v-else-if="selectedDetailProduct === '?μ???">
              <img src="/images/dip_sauce_detail.jpg" alt="Korean Dipping Sauce" />
            </template>
          </div>
          
          <div class="shipping-info">
            <p v-html="t.detail.shipping"></p>
          </div>
          
          <div class="detail-action-bottom" style="display:flex; gap:10px;">
            <button class="primary-btn huge-btn" @click="goToCheckout(selectedDetailProduct)" style="flex:2;">
              {{ selectedDetailProduct === '?�????' ? t.detail.payCake : t.detail.payDip }}
            </button>
            <button class="outline-btn huge-btn" @click="addToCart(selectedDetailProduct)" style="flex:1;">
              {{ t.cart.addBtn }}
            </button>
          </div>

          <!-- ?뺤콉 ?뱀???�붽? -->
          <div class="policy-container glass-panel">
            <div class="policy-block">
              <h3>{{ t.policy.returnTitle }}</h3>
              <p class="pre-line">{{ t.policy.refundInfo }}</p>
              <div class="addr-box">
                <h4>{{ t.policy.addrTitle }}</h4>
                <p>{{ t.policy.addr }}</p>
              </div>
              <p class="notice">{{ t.policy.shippingNotice }}</p>
            </div>
            
            <div class="policy-block">
              <h3>{{ t.policy.shippingTitle }}</h3>
              <p class="pre-line">{{ t.policy.shippingDetail }}</p>
            </div>

            <div class="policy-block">
              <h3>{{ t.policy.cancelTitle }}</h3>
              <p class="pre-line text-small">{{ t.policy.cancelDetail }}</p>
            </div>
          </div>
        </div>
      </template>

      <template v-if="currentView === 'checkout'">
        <div class="checkout-header">
          <button @click="goBackFromCheckout" class="back-btn">{{ t.detail.backBtn }}</button>
          <h2>{{ selectedProduct === '?�????' ? t.products.cakeKnife : selectedProduct === '?μ??? ? t.products.dipSauce : selectedProduct }} {{ t.checkout.title }}</h2>
        </div>
        <CheckoutPage :productName="selectedProduct" :amount="checkoutAmount" />
        
        <!-- 寃곗????�씠吏 ??�떒?�?�� ??�씪 ?뺤콉 ?몄텧 -->
        <div class="policy-container glass-panel container-narrow" style="margin-top: 40px;">
          <div class="policy-block">
            <h3>{{ t.policy.returnTitle }}</h3>
            <p class="pre-line">{{ t.policy.refundInfo }}</p>
            <div class="addr-box">
              <h4>{{ t.policy.addrTitle }}</h4>
              <p>{{ t.policy.addr }}</p>
            </div>
            <p class="notice">{{ t.policy.shippingNotice }}</p>
          </div>
          
          <div class="policy-block">
            <h3>{{ t.policy.shippingTitle }}</h3>
            <p class="pre-line">{{ t.policy.shippingDetail }}</p>
          </div>
        </div>
      </template>
    
      <template v-if="currentView === 'cart'">
        <div class="detail-header">
          <button @click="goHome" class="back-btn">{{ t.detail.backBtn }}</button>
          <h2>{{ t.cart.title }}</h2>
        </div>
        
        <section class="cart-section container-narrow">
          <div v-if="cart.length === 0" class="empty-cart">
            <p>{{ t.cart.empty }}</p>
            <button class="primary-btn" @click="goToMall">{{ t.nav.mall }}</button>
          </div>
          
          <div v-else class="cart-list glass-panel">
            <div v-for="item in cart" :key="item.id" class="cart-item">
              <input type="checkbox" v-model="item.selected" />
              <div class="item-info">
                <h3>{{ item.name === '?�????' ? t.products.cakeKnife : item.name === '?μ??? ? t.products.dipSauce : item.name }}</h3>
                <p>{{ (item.price * item.quantity).toLocaleString() }} ??/p>
                <div class="qty-control">
                  <button class="qty-btn" @click="updateQuantity(item.id, -1)">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button class="qty-btn" @click="updateQuantity(item.id, 1)">+</button>
                </div>
              </div>
              <button class="del-btn" @click="removeFromCart(item.id)">{{ t.cart.delete }}</button>
            </div>
            
            <div class="cart-summary">
              <div class="summary-row" style="font-size: 1rem; opacity: 0.8; margin-bottom: 0.5rem;">
                <span>?곹�? ??��?/span>
                <span>{{ cartItemsTotal.toLocaleString() }} ??/span>
              </div>
              <div class="summary-row" style="font-size: 1rem; opacity: 0.8; margin-bottom: 1rem;">
                <span>諛곗?�鍮?/span>
                <span>+{{ shippingFee.toLocaleString() }} ??/span>
              </div>
              <div class="summary-row">
                <span>{{ t.cart.total }}</span>
                <span class="total-price">{{ cartTotal.toLocaleString() }} ??/span>
              </div>
              <div class="check-actions-row">
                 <button class="primary-btn huge-btn" @click="checkoutFromCart(false)">{{ t.cart.checkout }}</button>
                 <button v-if="!currentUser" class="outline-btn huge-btn" @click="checkoutFromCart(true)" style="margin-top: 10px;">{{ t.cart.guest }}</button>
              </div>

            </div>
          </div>
        </section>
      </template>

      <template v-if="currentView === 'auth'">
        <AuthPage :currentLang="currentLang" :initialMode="currentAuthMode" @back="goHome" />
      </template>

      <template v-if="currentView === 'mall'">
        <div class="detail-header mall-header">
          <button @click="goHome" class="back-btn">{{ t.detail.backBtn }}</button>
          <h2>{{ t.nav.mall }}</h2>
        </div>
        
        <section class="products-section mall-view" style="padding-top: 40px;">
          <div class="section-container">
            <div class="grid-container flex-center">
              <div class="tech-card" @click="goToDetail('?�????')">
                <div class="card-img-placeholder" style="background-image: url('/images/cake_knife.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>{{ t.products.cakeKnife }}</h3>
                  <div class="btn-group-row">
                    <button class="small-btn" @click="goToDetail('?�????')">{{ t.products.purchaseBtn }}</button>
                    <button class="small-btn outline-btn" @click.stop="addToCart('?�????')">{{ t.cart.addBtn }}</button>
                  </div>
                </div>
              </div>

              <div class="tech-card" @click="goToDetail('?μ???)">
                <div class="card-img-placeholder" style="background-image: url('/images/dip_sauce.png'); background-size: cover; background-position: center;">
                  <span class="glow"></span>
                </div>
                <div class="tech-card-info">
                  <h3>{{ t.products.dipSauce }}</h3>
                  <div class="btn-group-row">
                    <button class="small-btn" @click="goToDetail('?μ???)">{{ t.products.purchaseBtn }}</button>
                    <button class="small-btn outline-btn" @click.stop="addToCart('?μ???)">{{ t.cart.addBtn }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>


    <div class="modal-overlay" v-show="showContactModal" @click="showContactModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ t.modal.title }}</h3>
        <p class="modal-desc">{{ t.modal.desc }}</p>
        <div class="email-box">
          <strong>contact@c-braindesign.com</strong>
        </div>
        <div class="modal-actions">
          <button class="outline-btn" @click="copyEmail">{{ t.modal.copy }}</button>
          <button class="primary-btn" @click="triggerMailApp">{{ t.modal.app }}</button>
        </div>
        <button class="close-btn" @click="showContactModal = false">??/button>
      </div>
    </div>

    <!-- ?곸꽭 蹂닿�?紐⑤???�붽? -->
    <div class="modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
      <div class="modal-content detail-modal-content" @click.stop>
        <div class="detail-header-row">
          <h3>?�?{{ selectedItemDetail?.subject || (selectedItemDetail?.name + ' 吏????�뿭') }}</h3>
          <button class="close-btn" @click="closeDetailModal">??/button>
        </div>
        
        <div class="detail-body glass-panel">
          <div class="detail-info-grid">
            <div class="info-cell">
              <label>??��?/label>
              <span>{{ selectedItemDetail?.name }}</span>
            </div>
            <div class="info-cell">
              <label>??��??/label>
              <span>{{ selectedItemDetail?.email }}</span>
            </div>
            <div class="info-cell" v-if="selectedItemDetail?.phone">
              <label>?곕씫�?/label>
              <span>{{ selectedItemDetail?.phone }}</span>
            </div>
            <div class="info-cell" v-if="selectedItemDetail?.category">
              <label>移댄?�怨좊??/label>
              <span>{{ selectedItemDetail?.category }}</span>
            </div>
            <div class="info-cell">
              <label>?묒꽦 ??�떆</label>
              <span>{{ new Date(selectedItemDetail?.created_at).toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="detail-desc-box">
             <label>??�슜 ?�??/label>
             <div class="content-text" v-html="formatContent(selectedItemDetail?.content)"></div>
          </div>

          <!-- ??? ?뱀??(?�몄???�뿭??寃쎌??�?��: subject ??�꽦??�줈 ?�?�? -->
          <div v-if="selectedItemDetail?.subject" class="detail-desc-box" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
             <label>?�?�ъ옄 ???</label>
             
             <!-- ?�?�ъ옄 ??�젏: ??? ?묒꽦/??�젙 -->
             <div v-if="isAdmin">
                <textarea rows="4" v-model="adminReplyText" placeholder="?�좉�?�?�� 蹂�?�???????묒꽦??�꽭?? style="width: 100%; border-radius: 6px; padding: 10px; background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1); margin-top: 8px;"></textarea>
                <div style="text-align: right; margin-top: 10px;">
                  <button class="primary-btn" style="padding: 8px 16px; font-size: 0.9rem;" @click="submitAdminReply(selectedItemDetail.id)">??? ????�??꾨즺泥섎??/button>
                </div>
             </div>
             
             <!-- ??�컲 ???????�젏: ??? ??�??-->
             <div v-else>
                <div class="content-text" v-if="selectedItemDetail?.admin_reply" style="background: rgba(89, 179, 217, 0.1); border-left: 4px solid #59B3D9; padding: 15px; border-radius: 4px; margin-top: 8px;">
                  <span v-html="formatContent(selectedItemDetail.admin_reply)"></span>
                </div>
                <div v-else class="content-text" style="color: #888; font-style: italic; margin-top: 8px;">
                  ?꾩쭅 ??????깅줉??? ??�븯??�땲??
                </div>
             </div>
          </div>
        </div>
        
        <div class="modal-actions" style="margin-top:20px;">
           <button class="primary-btn" @click="closeDetailModal">??�린</button>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <div class="footer-content">
        <p>{{ t.footer.company }}</p>
        <p>{{ t.footer.bizNo }}</p>
        <p>{{ t.footer.contact }}</p>
        <p class="copyright">{{ t.footer.copyright }}</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* ??�겕 湲곕�??꾨━誘몄�???�겕 ???�� 蹂??*/
:root {
  --tech-bg: #1A1B26; /* 留ㅼ??源딆? ??�씠??蹂�??�鍮?諛곌�?*/
  --tech-nav-bg: #1A1B26; /* 諛곌꼍�??꾨꼍????�씪????�긽??�줈 ?�붾???*/
  --tech-text: #FFFFFF;
  --tech-muted: #9DA1B4;
  --tech-border: rgba(255, 255, 255, 0.15);
}

html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  background-color: var(--tech-bg) !important;
  color: var(--tech-text);
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
}

html {
  scroll-behavior: smooth;
}
</style>

<style scoped>
.admin-header h1 {
  font-size: 2.2rem;
  margin-bottom: 30px;
  background: linear-gradient(90deg, #fff, #59B3D9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.admin-tabs button {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.admin-tabs button.active {
  background: rgba(89, 179, 217, 0.1);
  border-color: #59B3D9;
  color: #59B3D9;
  border-bottom: 2px solid #59B3D9;
}

.admin-del-btn {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-del-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
  transform: translateY(-1px);
}

.admin-del-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.table-scroll {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th, .admin-table td {
  padding: 18px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.admin-table th {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background: rgba(255,255,255,0.02);
}

.tag-cat {
  background: rgba(89, 179, 217, 0.1);
  color: #59B3D9;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-tag.pending, .status-tag.payment_pending, .status-tag.preparing {
  background: rgba(255, 193, 7, 0.1);
  color: #FFC107;
}

.status-tag.completed, .status-tag.delivered, .status-tag.payment_finished {
  background: rgba(40, 167, 69, 0.1);
  color: #28A745;
}

.status-tag.shipping {
  background: rgba(89, 179, 217, 0.1);
  color: #59B3D9;
}

.admin-select {
  background: #2D2E3A;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-footer {
  background: var(--tech-bg);
  padding: 3rem 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
}
.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  color: var(--tech-muted);
  font-size: 1.02rem;
  line-height: 1.6;
}
.footer-content p {
  margin: 0.3rem 0;
}
.copyright {
  margin-top: 1rem !important;
  opacity: 0.6;
  font-size: 0.9rem;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 理쒖�???좏떥?�ы떚 �?(留ㅼ???묎�??고븳 ??�뒪?? */
.top-utility-bar {
  background-color: var(--tech-nav-bg);
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 1001;
  padding: 8px 0;
}

.utility-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  padding: 0 4rem;
}

.utility-content a {
  color: var(--tech-text);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.8;
  letter-spacing: -0.2px;
}

.utility-content a:hover {
  text-decoration: underline;
  opacity: 1;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 30px; /* ?좏떥?�ы떚 �??꾨옒???꾩튂 */
  left: 0;
  right: 0;
  height: 90px;
  background: var(--tech-nav-bg); /* #1A1B26 */
  backdrop-filter: blur(12px);
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav-content {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem;
}

.logo {
  flex-shrink: 0;
}

.nav-logo-img {
  height: 68px; /* 1.5�???린濡??곹뼢 */
  vertical-align: middle;
  object-fit: contain;
  /* CSS Magic: ?뺣룄?곸씤 ????���?JPG ?꾪떚??�듃???꾨꼍 ?�붾???�줈 ???�� ??챸泥?�━ */
  filter: grayscale(1) invert(1) contrast(1000%) brightness(150%);
  mix-blend-mode: screen;
}

/* 以묒�?硫붾??留곹�?*/
.nav-links {
  display: flex;
  gap: 1.8rem;
  align-items: center;
  flex-grow: 1;
  margin-left: 3rem;
}

.nav-links a {
  color: var(--tech-text);
  text-decoration: none;
  font-size: 1.14rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  transition: opacity 0.2s;
}

.nav-links a:hover {
  opacity: 0.7;
}

/* ?곗�? ??��?(寃??�갹, ?꾩씠?? */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 1rem;
  border: 1px solid transparent;
  transition: border 0.3s;
}

.search-bar:hover {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-icon {
  font-size: 1.08rem;
  opacity: 0.8;
}

.search-bar input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.02rem;
  width: 120px;
  outline: none;
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.icon-btn {
  color: #fff;
  text-decoration: none;
  font-size: 1.44rem;
  opacity: 0.9;
}

.icon-btn:hover {
  opacity: 1;
}

/* ??�겕�??좊땲硫붿????�댄�??�듃 */
.animate-hidden {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.animate-hidden.show {
  opacity: 1;
  transform: translateY(0);
}

/* -------------------------------------
   Hero Section (Samsung 媛ㅻ???S26 ?�?��)
-------------------------------------- */
.hero-section {
  position: relative;
  min-height: 100vh;
  width: 100%; /* ?꾩껜 ?붾㈃ ??�퉬 李⑥? */
  display: flex;
  align-items: center;
  justify-content: flex-start; /* ?�뚯�??뺣젹 */
  padding-left: 10%;
  overflow: hidden;
}

/* 源딄??硫�?깉由?�?蹂�????????洹몃??곗씠??諛�?�?*/
.hero-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 70% 50%, #2b305c 0%, #161723 60%, #0d0e15 100%);
  z-index: -1;
}

/* ??�쭏?명룿 ???���?媛숈? ?�? ??�낵??二쇨�??꾪븳 ????????*/
.hero-bg::after {
  content: '';
  position: absolute;
  right: -10vw;
  top: 20vh;
  width: 60vw;
  height: 80vh;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  border-radius: 50%;
  transform: rotate(-30deg);
  filter: blur(60px);
}

.hero-content {
  z-index: 10;
  max-width: 600px;
  margin-top: -50px;
}

.main-title {
  font-size: clamp(4.50rem, 9vw, 6.75rem);
  font-weight: 800;
  margin: 0;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1.1;
}

.sub-title {
  font-size: clamp(3rem, 6vw, 4.50rem);
  font-weight: 400;
  margin: 0.5rem 0 1.5rem 0;
  color: #fff;
  letter-spacing: -0.5px;
}

.hero-desc {
  font-size: 1.56rem;
  color: #E2E4EC;
  margin-bottom: 2.5rem;
  font-weight: 400;
  letter-spacing: -0.5px;
}

.hero-buttons {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.link-btn {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 6px;
  font-weight: 600;
  font-size: 1.2rem;
  transition: opacity 0.2s;
}

.link-btn:hover {
  opacity: 0.7;
}

.outline-btn {
  background: transparent;
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 1.14rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.outline-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}


/* -------------------------------------
   Philosophy Section (Dynamic Scroll Full-bleed)
-------------------------------------- */
.philosophy-section {
  padding: 0 0 4rem 0;
  background: var(--tech-bg);
  position: relative;
  width: 100%;
}

.full-screen-quote {
  width: 100vw;
  min-height: 85vh; /* ??�겕�???�슫???좊룄??�린 ?꾪빐 100vh?�?�� 85vh�?以꾩??*/
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tech-bg); /* Current background color */
  margin-left: calc(-50vw + 50%); /* Full bleed override */
  position: relative;
  overflow: hidden;
}

/* Subtle glowing background orb for extra dynamic feel */
.full-screen-quote::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(108,130,248,0.04) 0%, transparent 60%);
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
}

.quote-content {
  max-width: 900px;
  padding: 0 4rem;
  position: relative;
  z-index: 2;
  text-align: left;
  margin-top: 3rem; /* 湲???몃줈 ??�???린留?�겮 ????�?????�컖??以묒�??????*/
}

.quote-mark {
  font-size: 5.76rem;
  color: rgba(255, 255, 255, 0.08); /* Very faint watermark quote */
  position: absolute;
  top: -2.5rem;
  left: -1.5rem;
  font-family: Georgia, serif;
  line-height: 1;
  user-select: none;
}

.quote-text {
  font-size: clamp(2.16rem, 4.20vw, 3rem); /* 100% -> 80% ???�利??�뺤??*/
  font-weight: 300;
  line-height: 1.7;
  font-style: italic;
  margin: 0 0 2rem 0;
  color: #fff;
  letter-spacing: -0.5px;
}

.quote-eyebrow {
  color: var(--tech-muted);
  font-size: 1.14rem;
  letter-spacing: 1px;
  font-style: italic;
}

.align-right {
  text-align: right;
  display: block;
}

@keyframes slowFadeUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.intro-fade-in {
  animation: slowFadeUp 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes slowZoomCrop {
  0% { transform: scale(1.4); }
  100% { transform: scale(1.55); }
}

.full-screen-section {
  position: relative;
  width: 100vw;
  min-height: 85vh; /* ?붾㈃ ??�??留욊�?*/
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-left: calc(-50vw + 50%); /* 媛뺤?�濡?100% 媛�??뺤옣 蹂댁??*/
}

/* ??�?吏 ????�뒪????????꾪빐 ??�퉬??200%�???�젙 (媛�???��???�댁???��?媛뺤????�컲 ???? */
.crop-bg {
  position: absolute;
  top: 0;
  width: 200%; 
  height: 100%;
  background-size: cover;
  z-index: 1;
  animation: slowZoomCrop 15s infinite alternate ease-in-out; /* 25s -> 15s�???�룄 媛쒖�?*/
}

/* ?????��?2: 洹몃?????�Ⅸ�? 諛뺤????곗�? ??�컲 ??�슜, 諛깃???�슫??�룄 ?곗�? ?�좎?? ?????以묒?�異??곗�? 以묒�?75%) */
.slide2-crop { 
  left: -100%; 
  background-image: url('/philosophy/slide2.png'); 
  background-position: right center;
  transform-origin: 75% 50%;
}
/* ?????��?3: 洹몃?????�そ. 諛뺤????�뚯�???�슜, ?????以묒?�異??�뚯�?以묒�?25%) */
.slide3-crop { 
  left: 0; 
  background-image: url('/philosophy/slide3.png'); 
  background-position: left center;
  transform-origin: 25% 50%;
}
/* ?????��?4: 洹몃?????�Ⅸ�? */
.slide4-crop { 
  left: -100%; 
  background-image: url('/philosophy/slide4.png'); 
  background-position: right center;
  transform-origin: 75% 50%;
}
/* ?????��?5: ?�ъ“臾?洹몃?????�Ⅸ�? */
.slide5-crop { 
  left: -100%; 
  background-image: url('/philosophy/slide5.png'); 
  background-position: right center;
  transform-origin: 75% 50%;
}

.dark-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(22, 24, 38, 0.70); /* 媛??�꽦???꾪븳 ??�쾭??�씠 */
  z-index: 2;
}

.phil-text-content {
  position: relative;
  z-index: 3;
  color: white;
  text-align: center; /* ??�뒪???곸뿭 以묒�??뺣젹 */
  padding: 4rem 2rem;
  max-width: 900px;
  width: 100%;
}

.phil-text-content h3 {
  font-size: clamp(2.10rem, 3vw, 2.70rem); /* 湲????�???�??�뺤??*/
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #fff;
  letter-spacing: -1px;
}

.phil-text-content h3.giant-title {
  font-size: clamp(2.70rem, 3.75vw, 3.90rem);
  line-height: 1.1;
  color: #59B3D9; /* �?��룄瑜?30% ?????�??�윭????�뭅??�?�猷?*/
}

.phil-text-content p {
  font-size: 1.14rem; /* ??70% ?고듃 ???�利?*/
  line-height: 1.8;
  color: #D3D5DF;
  margin-bottom: 1rem;
  word-break: keep-all;
}

.phil-text-content p strong {
  color: #fff;
  font-weight: bold;
}

.sub-heading {
  font-size: 1.32rem;
  color: #59B3D9; /* �?��룄瑜?30% ?????�??�윭????�뭅??�?�猷?*/
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.phil-box {
  background: rgba(89, 179, 217, 0.1); /* ??�떎??��???�뒛??諛곌�?*/
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 2rem;
  border-left: 4px solid #59B3D9; /* ??�떎??��???�뒛??蹂�???*/
  text-align: left;
}

.phil-box p {
  margin: 0;
  font-size: 1.08rem;
}

.phil-list {
  list-style: none;
  padding: 0;
  margin-top: 2rem;
  text-align: left;
}

.phil-list li {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.05); /* ??�겕 ?????諛뺤????�? 泥섎??*/
  padding: 1.2rem;
  border-radius: 10px;
}
.phil-list li p { margin: 0; font-size: 1.08rem; }

.phil-list .icon {
  font-size: 1.68rem;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  /* No overrides needed, geometric crop math works perfectly on mobile now */
}

/* -------------------------------------
   Products Grid Section
-------------------------------------- */
.products-section {
  background: #12131C; /* ??�뼱�??꾨옒 源딆? ??��?*/
  padding: 6rem 0;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem;
}

.section-divider {
  text-align: center;
  margin: 4rem 0 2rem;
  padding-top: 4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.section-divider h2 {
  font-size: 2.16rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.grid-container.flex-center {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.grid-container.flex-center .tech-card {
  width: calc(33.333% - 1.34rem);
}

@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  .grid-container.flex-center .tech-card {
    width: calc(50% - 0.75rem);
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .grid-container.flex-center .tech-card {
    width: 100%;
  }
}

.tech-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}

.tech-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.06);
}

.card-img-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  background: #1B1E2B;
  overflow: hidden;
}

/* 移�?�???�???硫�?깉由??좊━ ????�뼱�??�ъ뒳 ?�?�� ??�낵 */
.glow {
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(108,130,248,0.4) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

.tech-card-info {
  padding: 1.5rem;
  text-align: center;
}

.tech-card-info h3 {
  font-size: 1.32rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #fff;
}

.tech-card-info button {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 1.02rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.tech-card-info button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* -------------------------------------
   Checkout View
-------------------------------------- */
.checkout-header {
  padding: 2rem;
  max-width: 600px;
  margin: 120px auto 30px;
  text-align: center;
}

.back-btn {
  background: transparent;
  border: 1px solid var(--tech-border);
  padding: 8px 20px;
  border-radius: 30px;
  color: var(--tech-text);
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1.08rem;
  font-weight: bold;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #fff;
  color: var(--tech-bg);
}

/* Mobile Responsiveness */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding-left: 0;
    justify-content: center;
  }
  .hero-content {
    text-align: center;
  }
  .hero-buttons {
    justify-content: center;
  }
  .grid-container {
    grid-template-columns: 1fr;
  }
  .section-divider {
    margin-left: -3rem;
    margin-right: -3rem;
  }
  .section-divider h2 {
    font-size: clamp(2.10rem, 9.75vw, 3.75rem);
    white-space: nowrap;
    letter-spacing: -1px;
    transform: scale(1.1);
  }
  /* 紐⑤�????�퉬寃뚯???理쒖???*/
  .navbar {
    height: 65px;
    top: 0 !important;
    background: var(--tech-bg) !important;
  }
  .nav-content {
    padding: 0 0.5rem;
  }
  .nav-logo-img {
    height: 40px; /* 紐⑤�??�뿉 留욊�?濡쒓???�뺤??*/
  }
  .top-utility-bar {
    display: none; /* ?�듦�??뺣낫???꾪빐 ?좏떥�???? */
  }
  .quote-content {
    padding: 0 2rem;
  }
  .quote-text {
    font-size: 1.44rem;
  }
}

/* Mobile Slide Menu Styles */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1002;
  padding: 5px 10px;
}

.hamburger-line {
  width: 22px;
  height: 2px;
  background-color: var(--tech-text);
  transition: all 0.3s ease;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 2000;
  backdrop-filter: blur(3px);
}

.mobile-overlay.is-open {
  opacity: 1;
  visibility: visible;
}

.mobile-slide-menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 260px;
  height: 100vh;
  background: var(--tech-bg);
  box-shadow: -5px 0 30px rgba(0,0,0,0.5);
  z-index: 2001;
  transition: right 0.4s cubic-bezier(0.77, 0, 0.175, 1);
  display: flex;
  flex-direction: column;
}

.mobile-slide-menu.is-open {
  right: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid var(--tech-border);
}

.mobile-menu-title {
  font-size: 1.32rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--tech-text);
}

.close-menu-btn {
  background: none;
  border: none;
  color: var(--tech-text);
  font-size: 1.8rem;
  cursor: pointer;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1.5rem;
}

.mobile-nav-links a {
  color: var(--tech-text);
  text-decoration: none;
  font-size: 1.32rem;
  font-weight: 600;
  transition: color 0.2s;
}

.mobile-nav-links a:hover {
  color: var(--tech-muted);
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
  .nav-actions {
    gap: 0.8rem !important;
  }
  .lang-toggle {
    margin-right: 0 !important;
    gap: 2px !important;
    font-size: 13.2px;
  }
  .lang-btn {
    padding: 2px !important;
  }
  .search-bar {
    width: auto;
    padding: 3px 6px;
    margin-right: 0 !important;
  }
  .search-bar .search-icon {
    font-size: 0.84rem;
  }
  .search-bar input {
    width: 40px;
    font-size: 0.84rem;
  }
  .mobile-menu-btn {
    margin-right: 0;
    padding: 2px;
  }
  .hamburger-line {
    width: 18px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: var(--tech-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.modal-content h3 {
  margin-top: 0;
  font-size: 1.68rem;
  color: #fff;
  margin-bottom: 1rem;
}
.modal-desc {
  color: var(--tech-muted);
  font-size: 1.14rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
.email-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 1.32rem;
  color: #59B3D9;
  user-select: all;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.modal-actions button {
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  border: none;
  font-size: 1.08rem;
  transition: opacity 0.2s;
}
.modal-actions button:hover {
  opacity: 0.8;
}
.modal-actions .outline-btn {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}
.modal-actions .primary-btn {
  background: #59B3D9;
  color: #111;
}
.close-btn {
  position: absolute;
  top: 1rem; right: 1rem;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.44rem;
  cursor: pointer;
}
.main-content {
  padding-top: 120px; /* ?�좎????�퉬寃뚯????�듦�??뺣낫 */
}
.detail-header {
  max-width: 800px;
  margin: 20px auto 20px;
  padding: 0 20px;
  text-align: center;
  position: relative;
}
.mall-header {
  margin-bottom: 60px;
}

/* --------------------------------------
   Policy UI (Shipping/Refund)
-------------------------------------- */
.policy-container {
  margin-top: 50px;
  padding: 30px;
  text-align: left;
}

.policy-block {
  margin-bottom: 30px;
}

.policy-block h3 {
  font-size: 1.25rem;
  color: #59B3D9;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--tech-border);
  padding-bottom: 10px;
}

.policy-block h4 {
  font-size: 1rem;
  margin: 15px 0 5px;
  opacity: 0.9;
}

.pre-line {
  white-space: pre-line;
  line-height: 1.6;
  opacity: 0.8;
  font-size: 0.96rem;
}

.addr-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.notice {
  font-size: 0.84rem;
  color: #ff6b6b;
  margin-top: 10px;
}

.text-small {
  font-size: 0.84rem;
}
.detail-header h2 {
  font-size: 28.8px;
  color: #fff;
  margin: 0;
}

/* --------------------------------------
   Shopping Cart UI
-------------------------------------- */
.cart-section {
  max-width: 800px;
  margin: 0 auto 100px;
}

.empty-cart {
  text-align: center;
  padding: 60px 0;
  color: var(--tech-muted);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--tech-border);
}

.cart-item h3 {
  margin: 0;
  font-size: 1.14rem;
}

.cart-item p {
  margin: 5px 0 0;
  color: #59B3D9;
  font-weight: bold;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.05);
  width: fit-content;
  padding: 5px 12px;
  border-radius: 6px;
}

.qty-btn {
  background: transparent;
  border: 1px solid var(--tech-border);
  color: #fff;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: #fff;
  color: #000;
}

.qty-val {
  font-weight: bold;
  font-size: 1.08rem;
  min-width: 20px;
  text-align: center;
}

.del-btn {
  background: rgba(255,107,107,0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255,107,107,0.3);
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;
}

.cart-summary {
  padding: 30px;
  border-top: 2px solid var(--tech-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.total-price {
  font-size: 1.5rem;
  color: #59B3D9;
  font-weight: 800;
}

.btn-group-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.small-btn {
  flex: 1;
  padding: 10px;
  font-size: 0.84rem;
  border-radius: 6px;
  cursor: pointer;
}

.container-narrow {
  max-width: 800px;
  margin: 0 auto;
}

.detail-header .back-btn {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: #59B3D9;
  border: none;
  font-size: 19.2px;
  cursor: pointer;
}
.product-detail-container {
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 20px;
  background: var(--tech-bg);
  border-radius: 12px;
}
.detail-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}
.detail-images img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  display: block;
}
.shipping-info {
  background: rgba(89, 179, 217, 0.1);
  border-left: 4px solid #59B3D9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 40px;
  font-size: 1.32rem;
  color: #fff;
  text-align: center;
}
.detail-action-bottom {
  text-align: center;
}
.huge-btn {
  width: 100%;
  padding: 20px;
  font-size: 1.56rem;
  border-radius: 12px;
  color: #111;
  background: #59B3D9;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.lang-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
  font-size: 16.8px;
}
.lang-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-weight: 600;
  padding: 4px;
  transition: color 0.2s;
}
.lang-btn.active {
  color: #fff;
}
.lang-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* Recruitment View */
.recruit-view-container {
  background-color: var(--tech-bg);
  color: #fff;
  min-height: 100vh;
  padding: 140px 20px 80px;
}

.recruit-header {
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: left;
}

.recruit-header h2 {
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #fff;
}

.recruit-header p {
  font-size: 1.14rem;
  line-height: 1.6;
  opacity: 0.8;
  color: #fff;
  margin: 0;
}

.recruit-form {
  background: rgba(255, 255, 255, 0.05);
  padding: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.recruit-input-group {
  margin-bottom: 25px;
}

.recruit-input-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #9DA1B4;
  text-align: left;
}

.recruit-input-group input, 
.recruit-input-group textarea {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;
  border-radius: 6px;
  box-sizing: border-box;
}

.phone-inputs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.phone-inputs input {
  flex: 1;
  text-align: center;
}

.phone-inputs span {
  color: var(--tech-muted);
}

.phone-inputs input {
  width: 80px;
  text-align: center;
}

.recruit-submit-btn {
  background: #59B3D9;
  color: #111;
  border: none;
  padding: 12px 40px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  display: block;
  margin: 20px auto 0;
  border-radius: 30px;
}

.recruit-submit-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.support-select {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  box-sizing: border-box;
}

.support-select option {
  background: #1a1b26;
  color: #fff;
}

/* My Page Styles */
.mypage-view-container {
  padding: 140px 20px 80px;
  min-height: 100vh;
}

.mypage-header {
  margin-bottom: 40px;
}

.mypage-header h1 {
  font-size: 2.16rem;
  margin-bottom: 8px;
}

.user-welcome {
  color: #59B3D9;
  font-weight: 700;
  font-size: 1.1rem;
}

.mypage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.mypage-card {
  padding: 24px;
  border-radius: 16px;
  transition: transform 0.3s;
}

.mypage-card:hover {
  transform: translateY(-5px);
}

.card-header h3 {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: rgba(255,255,255,0.7);
}

.stat-val {
  color: #59B3D9;
  font-weight: 700;
}

.empty-msg {
  font-size: 0.84rem;
  color: rgba(255,255,255,0.3);
  margin-top: 12px;
  text-align: center;
}

.small-action-btn {
  background: rgba(89, 179, 217, 0.1);
  border: 1px solid #59B3D9;
  color: #59B3D9;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
}

.small-action-btn:hover {
  background: #59B3D9;
  color: #111;
}

.logout-btn {
  background: transparent;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 8px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ff6b6b;
  color: #fff;
}

/* Admin Dashboard */
.admin-view-container {
  padding: 140px 20px 80px;
}

.admin-top {
  margin-bottom: 40px;
}

.admin-top h1 {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  background: #ff6b6b;
  color: #fff;
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
}

.admin-tabs {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.admin-tabs button {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 700;
  position: relative;
}

.admin-tabs button.active {
  color: #59B3D9;
}

.admin-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #59B3D9;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  text-align: left;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  font-size: 0.9rem;
  color: #9DA1B4;
}

.admin-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.9rem;
}

.category-tag {
  background: rgba(89, 179, 217, 0.1);
  color: #59B3D9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.content-cell {
  max-width: 300px;
  white-space: pre-wrap;
  color: rgba(255,255,255,0.7);
}

/* User History List in My Page */
.user-history-list {
  margin-top: 15px;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 5px;
}

.user-history-list::-webkit-scrollbar {
  width: 4px;
}
.user-history-list::-webkit-scrollbar-thumb {
  background: rgba(89, 179, 217, 0.3);
  border-radius: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.82rem;
}

.h-date {
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  min-width: 70px;
}

.h-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.h-status {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(89, 179, 217, 0.1);
  color: #59B3D9;
}

.h-status.preparing { background: rgba(255, 193, 7, 0.1); color: #FFC107; }
.h-status.shipping { background: rgba(89, 179, 217, 0.1); color: #59B3D9; }
.h-status.delivered { background: rgba(40, 167, 69, 0.1); color: #28A745; }

.h-status.pending {
  color: #59B3D9;
}

.history-item.clickable {
  cursor: pointer;
  transition: background 0.2s;
}
.history-item.clickable:hover {
  background: rgba(255,255,255,0.05);
}

/* Detail Modal Styles */
.detail-modal-content {
  max-width: 600px !important;
  width: 90% !important;
}

.detail-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 15px;
}

.detail-header-row h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #59B3D9;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-cell label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}

.info-cell span {
  font-size: 0.95rem;
  color: #fff;
}

.detail-desc-box {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.detail-desc-box label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  margin-bottom: 10px;
}

.content-text {
  background: rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  color: rgba(255,255,255,0.9);
  min-height: 100px;
}

@media (max-width: 768px) {
  .recruit-header h2 { font-size: 1.8rem; }
  .recruit-form { padding: 20px; }
}
</style>

