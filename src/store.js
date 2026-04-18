import { reactive, computed, watch, onMounted } from 'vue'
import { supabase } from './supabase.js'
import emailjs from '@emailjs/browser'

const state = reactive({
  currentUser: null,
  currentLang: 'ko',
  cart: JSON.parse(localStorage.getItem('cbd_cart') || '[]'),
  selectedProduct: '',
  selectedDetailProduct: null,
  checkoutAmount: 0,
  isMobileMenuOpen: false,
  adminInquiries: [],
  adminRecruitments: [],
  adminOrders: [],
  userInquiries: [],
  userRecruitments: [],
  userOrders: [],
  adminActiveTab: 'inquiries',
  selectedInquiries: [],
  selectedRecruitments: [],
  selectedOrders: [],
  showDetailModal: false,
  selectedItemDetail: null,
  adminReplyText: '',
  checkoutDraft: JSON.parse(localStorage.getItem('cbd_checkout_draft') || 'null'),
  // Leadership Dashboard State
  leadershipActiveTab: 'LEADER',
  leadershipTeamTab: 'LEADER',
  leadershipTasks: (() => {
    const tasks = JSON.parse(localStorage.getItem('leadership_tasks') || '{}')
    // Migrate CEO to LEADER if exists
    if (tasks['CEO'] && !tasks['LEADER']) {
      tasks['LEADER'] = tasks['CEO']
      delete tasks['CEO']
    }
    return tasks
  })()
})

// Initialize session
if (supabase) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    state.currentUser = session?.user || null
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    state.currentUser = session?.user || null
  })
}

// Persist cart
watch(() => state.cart, (newVal) => {
  localStorage.setItem('cbd_cart', JSON.stringify(newVal))
}, { deep: true })

// Persist checkout draft
watch(() => state.checkoutDraft, (newVal) => {
  localStorage.setItem('cbd_checkout_draft', JSON.stringify(newVal))
}, { deep: true })

// Persist leadership tasks
watch(() => state.leadershipTasks, (newVal) => {
  localStorage.setItem('leadership_tasks', JSON.stringify(newVal))
}, { deep: true })

const isAdmin = computed(() => state.currentUser?.email === 'contact@c-braindesign.com')

const shippingFee = 3000

const cartItemsTotal = computed(() => {
  return state.cart
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const cartTotal = computed(() => {
  const base = cartItemsTotal.value
  return base > 0 ? base + shippingFee : 0
})

const fetchAdminData = async () => {
  if (!supabase || !isAdmin.value) return
  const { data: inq } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
  const { data: rec } = await supabase.from('recruitment_applications').select('*').order('created_at', { ascending: false })
  const { data: ord } = await supabase.from('orders').select('*').eq('order_status', 'payment_finished').order('created_at', { ascending: false })
  
  state.adminInquiries = inq || []
  state.adminRecruitments = rec || []
  state.adminOrders = ord || []

  // Leadership tasks sync
  await fetchLeadershipTasks()
}

const fetchLeadershipTasks = async () => {
  if (!supabase || !isAdmin.value) return
  try {
    const { data, error } = await supabase.from('leadership_tasks').select('*')
    if (error) {
       console.warn('Leadership tasks fetch failed:', error.message)
       return
    }
    if (data && data.length > 0) {
      data.forEach(row => {
        const team = row.team_name
        const remoteTasks = row.tasks || []
        
        // 만약 로컬에 이미 데이터가 있고, 로컬 데이터가 더 비대하거나 비어있지 않다면 우선 유지할지 판단
        // 여기서는 서버 데이터를 공통 데이터로 보고 로컬에 없는 팀 데이터만 채우거나, 서버 데이터를 우선시하되 비어있는 경우 무시
        if (remoteTasks.length > 0) {
          state.leadershipTasks[team] = remoteTasks
        }
      })
      // 변경사항 반영을 위해 강제 트리거 (필요시)
      console.log('Leadership tasks synced from Supabase')
    }
  } catch (e) {
    console.error('Leadership tasks fetch error:', e)
  }
}

const fetchUserDashboardData = async () => {
  if (!supabase || !state.currentUser) return
  const userEmail = state.currentUser.email
  
  const { data: inq } = await supabase.from('inquiries').select('*').eq('email', userEmail).order('created_at', { ascending: false })
  const { data: rec } = await supabase.from('recruitment_applications').select('*').eq('email', userEmail).order('created_at', { ascending: false })
  const { data: ord } = await supabase.from('orders').select('*').eq('user_email', userEmail).eq('order_status', 'payment_finished').order('created_at', { ascending: false })
  
  state.userInquiries = inq || []
  state.userRecruitments = rec || []
  state.userOrders = ord || []
}

const addToCart = (productName) => {
  const price = productName === '케익칼' ? 2000 : 8000
  const existingItem = state.cart.find(item => item.name === productName)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    state.cart.push({
      id: Date.now(),
      name: productName,
      price: price,
      quantity: 1,
      selected: true
    })
  }
}

const removeFromCart = (id) => {
  state.cart = state.cart.filter(item => item.id !== id)
}

const updateQuantity = (id, delta) => {
  const item = state.cart.find(i => i.id === id)
  if (item) {
    const newQty = item.quantity + delta
    if (newQty > 0) item.quantity = newQty
  }
}

const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      state.currentUser = null
    }
}

const translations = {
  ko: {
    nav: { mall: '쇼핑몰', support: '고객지원', jobs: '채용정보', signup: '회원가입', company: '회사소개', ai: 'AI/로봇 컨설팅', personal: '퍼스널 컨설팅', kids: '키즈컨설팅', search: '검색' },
    recruit: {
      title: '파트너 컨설턴트 상시 모집',
      desc: '기업 교육 및 코칭 분야의 다양한 경험과 전문성 갖춘 컨설턴트 분들을 환영합니다!',
      name: '성함',
      phone: '연락처',
      email: '이메일',
      content: '내용',
      submit: '작성'
    },
    support: {
      title: '고객지원 및 문의',
      desc: '궁금하신 점이나 상담이 필요하신 내용을 남겨주시면 정성껏 답변해 드리겠습니다.',
      name: '성함',
      email: '이메일 주소',
      phone: '연락처 (선택)',
      category: '문의 유형',
      cat1: '제품 관련 문의',
      cat2: '컨설팅 상담 예약',
      cat3: '기타 문의',
      subject: '제목',
      content: '문의 내용',
      submit: '문의하기'
    },
    hero: { quote1: '시스템은 자유를 제한하는 것이 아니라<br>더 큰 자유로 가는 길을 여는 것입니다', quote2: '— System Design Philosophy', crisisTitle: '현대인의 의사결정 위기', crisisDesc1: '<br>우리는 매 순간 수많은 정보와 감정의 파도 속에서 결정을 내립니다<br>하지만 그 결정이 정말 당신의 의지에 의한 것입니까?<br><br>당신을 위한 영속적인 구조를 디자인합니다', crisisDesc2: '<strong>파편화된 선택과 순간의 충동</strong>은 우리의 삶을 불안정한 궤도로 몰아넣고 있습니다.', waverTitle: '왜 우리는 항상 흔들리는가', waverSub: '신경계 구조의 관점', waverDesc: '우리의 뇌는 <strong>불확실성</strong>을 생존의 위협으로 간주합니다. 기준이 없는 선택은 뇌의 \'편도체\'를 자극하여 불안을 증폭시킵니다.', waverBox: '🧠 <strong>감정 vs 시스템:</strong> 감정은 위험을 알리는 \'신호\'일 뿐이며, 의사결정의 \'기준\'이 되어서는 안 됩니다.', signalTitle: '감정은 신호지, 기준이 아니다', signalList1: '<strong>생각이 많을수록 인생이 느려지는 이유:</strong> 기준 없이 감정에 매몰되어 \'생각의 루프\'에 갇히기 때문입니다.', signalList2: '<strong>불안한 사람일수록 기준이 필요하다:</strong> 외부 환경이 흔들릴 때 나를 잡아줄 수 있는 것은 오직 명확한 \'판단 기준\'뿐입니다.', signalList3: '<strong>치유가 아닌 설계:</strong> 불안을 달래는 힐링보다, 불안 속에서도 작동하는 사고 구조를 만드는 것이 핵심입니다.', systemTitle: 'SYSTEM BEFORE<br>EMOTIONS', systemSub: '시스템이 감정을 앞섭니다', systemDesc1: '인간의 의지력은 고갈되는 자원입니다. 우리는 감정에 의존하지 않아도 일관된 성과를 낼 수 있는 실행 프로세스를 구축합니다.', systemDesc2: '기분이 좋지 않아도, 의지가 약해져도 작동하는 견고한 시스템이 당신의 일상을 보호합니다.' },
    products: { ai: 'AI/로봇 기반 컨설팅', personal: '하이엔드 퍼스널 컨설팅', kids: '프리미엄 키즈 컨설팅', cakeKnife: '케익칼', dipSauce: '딥소스', otherProducts: 'Brain Design 기타 제품', inquireBtn: '견적문의', purchaseBtn: '구매하기' },
    detail: { backBtn: '← 뒤로가기', detailInfo: '상세 정보', shipping: '🚚 <strong>배송 안내:</strong> 결제 완료 후 <strong>3일 이내</strong>에 안전하게 배송해 드립니다.', payCake: '결제하기 (2,000원)', payDip: '결제하기 (8,000원)' },
    checkout: { title: '결제/상담예약' },
    modal: { title: '견적 및 상담 문의', desc: '아래 이메일로 편하게 문의를 남겨주시면 빠르게 답변해 드리겠습니다.', copy: '주소 복사하기', app: '메일 앱 열기' },
    footer: { company: '상호명: 컨티뉴엄 by 브레인 디자인 (CBD) | 대표자명: 윤신희', bizNo: '사업자등록번호: 746-36-01588 | 통신판매업신고번호: 제2026-서울동대문-0710호 | 사업장 주소: 서울특별시 동대문구 한천로 46길 85-6', contact: '대표문의: contact@c-braindesign.com | 대표번호: 010-7567-7189', copyright: '© 2026 Continuum by Brain Design. All rights reserved.' },
    cart: { title: '장바구니', empty: '장바구니가 비어있습니다.', addBtn: '장바구니 담기', checkout: '선택 상품 결제', checkoutAll: '전체 상품 결제', delete: '삭제', total: '총 결제 금액', guest: '비회원 구매' },
    policy: {
      returnTitle: '교환 및 반품 정보',
      refundInfo: '/ 환불 & 교환\n- 환불 및 교환은 수령하신 날을 포함하여 7일 내에 요청을 해주셔야만 가능합니다. (홈페이지 내 Q&A 접수)\n- 오염 및 미세한 잡사, 착용의 흔적, 수령 후 7일 이후 환불/교환 신청은 불가하니 참고부탁드립니다.\n- 단순 변심은 왕복 배송비 5000원이 청구됩니다.',
      addrTitle: '/ 반품 주소',
      addr: '서울특별시 동대문구 한천로 46길 85-6',
      shippingNotice: '* 색상 교환 및 고객 변심은 고객 부담 왕복 배송비입니다. (사이즈 교환 포함)',
      shippingTitle: '배송정보',
      shippingDetail: '/ 배송안내\n배송방법 : 택배\n배송지역 : 전국 지역',
      cancelTitle: '제 19조 결제 취소 & 환불',
      cancelDetail: '① 회사와 구매에 관한 계약을 체결한 회원은 아래와 같이 결제에 대한 취소 및 환불을 요구할 수 있습니다.\n- 이용계약의 신청 후, 회사로부터의 상담이 제공되지 않은 경우, 결제취소가 가능합니다.\n- 회원이 상담 후 상대 프로필카드를 2회 이상 수령한 경우, 잔여횟수가 남은 회원에 한하여 이용 금액과 위약금 10%를 제외한 부분 환불이 가능합니다.'
    },
    mypage: {
      title: '마이페이지',
      welcome: '님, 반갑습니다.',
      orderStatus: '주문/배송 현황',
      cartStatus: '장바구니 현황',
      inquiryStatus: '문의 현황',
      recruitStatus: '채용 지원 현황',
      empty: '내역이 없습니다.',
      viewCart: '장바구니 보기',
      totalOrders: '총 주문',
      activeDelivery: '배송중',
      itemsInCart: '담긴 상품',
      myInquiries: '내 문의 내역',
      myApps: '채용 지원 내역'
    }
  },
  en: {
    nav: { mall: 'Shop', support: 'Support', jobs: 'Careers', signup: 'Sign Up', company: 'Philosophy', personal: 'Personal Core', ai: 'AI Algorithm', kids: 'Kids Program', search: 'Search' },
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
    hero: { quote1: 'A system does not restrict freedom<br>but opens the path to greater freedom', quote2: '— System Design Philosophy', crisisTitle: 'The Crisis of Decision Making', crisisDesc1: '<br>Every moment, we make decisions amidst a vast wave of information and emotions<br>But is that decision truly an act of your own will?<br><br>We design everlasting structures just for you', crisisDesc2: '<strong>Fragmented choices and momentary impulses</strong> are driving our lives into an unstable orbit.', waverTitle: 'Why We Always Waver', waverSub: 'A Nervous System Perspective', waverDesc: 'Our brains interpret <strong>uncertainty</strong> as a threat. Choices without standards stimulate the amygdala, amplifying anxiety.', waverBox: '🧠 <strong>Emotion vs System:</strong> Emotion is a \'signal\' for danger, not a \'standard\' for decision making.', signalTitle: 'Emotion is a Signal, Not a Standard', signalList1: '<strong>Why overthinking slows down life:</strong> Being trapped in a \'thought loop\' without clear standards.', signalList2: '<strong>Anxiety begs standardizations:</strong> Only clear \'judgments\' can ground you when the environment shakes.', signalList3: '<strong>Design, not healing:</strong> The key is building a thought process that works even in anxiety.', systemTitle: 'SYSTEM BEFORE<br>EMOTIONS', systemSub: 'The System Precedes Emotion', systemDesc1: 'Human willpower is a depleting resource. We build execution processes that yield consistent results without relying on emotions.', systemDesc2: 'A solid system protects your daily life, even when you\'re feeling down or weak.' },
    products: { ai: 'AI Algorithm Check', personal: 'High-End Personal Core', kids: 'Premium Kids Builder', cakeKnife: 'Cake Knife', dipSauce: 'Dipping Sauce', otherProducts: 'Brain Design Other Products', inquireBtn: 'Inquire', purchaseBtn: 'Purchase' },
    detail: { backBtn: '← Back', detailInfo: 'Details', shipping: '🚚 <strong>Shipping Info:</strong> Safe delivery within <strong>3 days</strong> of payment.', payCake: 'Checkout (2,000 KRW)', payDip: 'Checkout (8,000 KRW)' },
    checkout: { title: 'Checkout / Booking' },
    modal: { title: 'Quote & Inquiry', desc: 'Please leave inquiries via email below for a rapid response.', copy: 'Copy Address', app: 'Open Mail App' },
    footer: { company: 'Company: Continuum by Brain Design (CBD) | LEADER: Shinhee Yun', bizNo: 'Business Reg: 746-36-01588 | E-Commerce Reg: 제2026-서울동대문-0710호 | Address: 85-6, Hancheon-ro 46-gil, Dongdaemun-gu, Seoul', contact: 'Email: contact@c-braindesign.com | Phone: 010-7567-7189', copyright: '© 2026 Continuum by Brain Design. All rights reserved.' },
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
      cancelDetail: '① Members who have entered into a contract with the company may request cancellation and refund as follows.\n- Cancellation is possible if no consultation has been provided after the application.\n- If a profile card has been received twice or more after consultation, a partial refund excluding utilized amount and a 10% penalty is possible for remaining sessions.'
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

const t = computed(() => translations[state.currentLang])

export {
  state,
  t,
  isAdmin,
  shippingFee,
  cartItemsTotal,
  cartTotal,
  fetchAdminData,
  fetchUserDashboardData,
  addToCart,
  removeFromCart,
  updateQuantity,
  logout
}

