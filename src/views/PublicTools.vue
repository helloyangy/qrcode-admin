<template>
  <div class="public-tools-page">
    <div class="tools-header" :class="{ 'scrolled': isScrolled }">
      <div class="logo">
        <el-icon class="logo-icon"><Grid /></el-icon>
        <span>二维码工具箱</span>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">极速创建您的专属二维码</h1>
        <p class="hero-subtitle">简单、高效、免费的多功能二维码生成工具。支持链接、文本、图片、文档等多种格式，个性化定制，即刻生成。</p>
      </div>
      <div class="hero-waves">
        <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
            <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlink:href="#gentle-wave" x="48" y="7" fill="#f5f7fa" />
          </g>
        </svg>
      </div>
    </div>
    
    <div class="tools-content">
      <div class="announcements-area" v-if="announcements.length">
        <div class="announcement-panel">
          <div class="announcement-header">
            <div class="announcement-header-left">
              <el-icon><Bell /></el-icon>
              <span class="announcement-count">({{ announcements.length }})</span>
            </div>
            <el-button
              v-if="announcements.length > 3"
              class="announcement-toggle"
              link
              type="primary"
              size="small"
              @click="announcementsExpanded = !announcementsExpanded"
            >
              {{ announcementsExpanded ? '收起' : '查看更多' }}
            </el-button>
          </div>
          <div class="announcement-list" :class="{ expanded: announcementsExpanded }">
            <div class="announcement-item" v-for="item in visibleAnnouncements" :key="item.id || item.title">
              <div class="announcement-item-main">
                <span class="announcement-item-title">{{ item.title }}</span>
                <span class="announcement-item-sep">：</span>
                <span class="announcement-item-content">{{ item.content }}</span>
              </div>
              <div class="announcement-item-meta" v-if="item.created_at">
                {{ formatAnnouncementDate(item.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tools-container">
        <el-tabs v-model="activeTab" class="tools-tabs">
          <el-tab-pane label="普通二维码" name="normal">
            <QRGenerator class="public-component" />
            <div class="seo-content">
               <h3>关于普通二维码</h3>
               <p>普通二维码是最常见的二维码类型，广泛应用于网站链接分享、文本信息传递、名片交换等场景。我们的在线生成器支持将 URL、文本、图片、PDF 和 Word 文档快速转换为二维码。支持自定义尺寸和边距，生成高清图片下载。</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="彩色二维码" name="colorful">
            <ColorfulQRGenerator class="public-component" />
             <div class="seo-content">
               <h3>关于彩色二维码</h3>
               <p>打破黑白的单调，彩色二维码让您的编码更加生动有趣。支持自定义前景颜色和背景颜色，可选择方块或圆角样式，甚至可以调整码眼的形状和颜色。非常适合品牌营销、创意设计和个性化展示。</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="隐形二维码" name="hidden">
             <HiddenQRGenerator class="public-component" />
             
             <!-- 隐藏二维码 SEO 详细介绍 -->
             <div class="seo-content hidden-qr-seo">
                <h2>什么是 AI 隐形二维码？</h2>
                <p>隐形二维码（Hidden QR Code），也称为视觉融合二维码或 AI 艺术二维码，是一种将二维码信息巧妙隐藏在背景图片中的技术。通过调整透明度、阈值和融合算法，使二维码在保持可扫描性的同时，与背景图像完美融合，达到"隐形"的视觉效果。</p>
                
                <div class="seo-features">
                  <div class="feature-item">
                    <h4>视觉美观</h4>
                    <p>告别突兀的黑白方块，让二维码成为图片的一部分，提升整体设计美感。</p>
                  </div>
                  <div class="feature-item">
                     <h4>营销利器</h4>
                     <p>增加用户扫描的好奇心和互动率，非常适合海报、广告牌和社交媒体推广。</p>
                  </div>
                  <div class="feature-item">
                     <h4>防伪溯源</h4>
                     <p>由于其隐蔽性，也可用于特定场景的防伪和隐秘信息传递。</p>
                  </div>
                </div>

                <h3>如何制作效果最好的隐形二维码？</h3>
                <ul>
                   <li><strong>选择合适的背景图：</strong> 建议使用纹理较少、亮度适中或对比度较高的图片。</li>
                   <li><strong>调整透明度与阈值：</strong> 我们的工具提供实时预览，您可以拖拽滑块找到最佳平衡点。透明度过高可能导致扫描困难，过低则影响美观。</li>
                   <li><strong>二维码位置：</strong> 将二维码放置在背景图相对干净或颜色对比较为明显的区域。</li>
                </ul>
             </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <div class="tools-footer">
      <p>&copy; {{ new Date().getFullYear() }} 二维码工具箱 - 免费在线工具</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Grid, Bell } from '@element-plus/icons-vue'
import QRGenerator from './public/PublicQRGenerator.vue'
import ColorfulQRGenerator from './public/PublicColorfulQRGenerator.vue'
import HiddenQRGenerator from './public/PublicHiddenQRGenerator.vue'
import { getPublicAnnouncements } from '../api/announcement'

const activeTab = ref('normal')
const isScrolled = ref(false)
const announcements = ref([])
const announcementsExpanded = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const visibleAnnouncements = computed(() =>
  announcementsExpanded.value ? announcements.value : announcements.value.slice(0, 3)
)

const formatAnnouncementDate = (value) => {
  if (!value) return ''
  const text = String(value).replace(' ', 'T')
  const d = new Date(text)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchAnnouncement = async () => {
  try {
    const all = []
    let page = 1
    const perPage = 50

    for (let i = 0; i < 50; i += 1) {
      const res = await getPublicAnnouncements({ page, per_page: perPage })
      const data = res?.data || {}
      const list = data.data || data.list || (Array.isArray(data) ? data : [])

      if (Array.isArray(list) && list.length) {
        all.push(...list)
      }

      const lastPage = Number(data.last_page || 1)
      const currentPage = Number(data.current_page || page)
      if (currentPage >= lastPage) break
      page = currentPage + 1
    }

    announcements.value = all.filter((item) => {
      if (!item) return false
      if (item.is_active === undefined) return true
      return item.is_active === true || item.is_active === 1 || item.is_active === '1'
    })
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
    announcements.value = []
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  fetchAnnouncement()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.public-tools-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.tools-header {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  background: transparent;
}

.tools-header.scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #fff; /* 初始为白色 */
  transition: color 0.3s;
}

.tools-header.scrolled .logo {
  color: #333; /* 滚动后变深色 */
}

.logo-icon {
  margin-right: 10px;
  font-size: 24px;
  color: #60a5fa; /* 浅蓝色 */
}

.tools-header.scrolled .logo-icon {
  color: #2563eb;
}

.hero-section {
  position: relative;
  min-height: 480px;
  background-color: #1e293b; /* 纯色深蓝背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  padding-top: 60px;
}

.hero-content {
  z-index: 10;
  max-width: 800px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
  margin-bottom: 30px;
}

.announcements-area {
  max-width: 1000px;
  margin: 0 auto 16px;
}

.announcement-panel {
  width: 100%;
  background: #fff;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #eaeef5;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.announcement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.announcement-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.announcement-header-left .el-icon {
  font-size: 18px;
  color: #f59e0b;
}

.announcement-header-text {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

.announcement-count {
  font-size: 12px;
  color: #64748b;
}

.announcement-toggle {
  color: #2563eb;
}

.announcement-toggle:hover {
  color: #1d4ed8;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  max-height: 160px;
  overflow: auto;
  padding-right: 4px;
}

.announcement-list.expanded {
  max-height: 320px;
}

.announcement-item {
  font-size: 13px;
  color: #334155;
  line-height: 1.45;
  word-break: break-word;
  padding: 12px 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #eaeef5;
}

.announcement-item-main {
  display: block;
}

.announcement-item-title {
  font-weight: 600;
  color: #0f172a;
}

.announcement-item-sep {
  opacity: 0.9;
}

.announcement-item-content {
  opacity: 0.95;
}

.announcement-item-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.hero-waves {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.waves {
  width: 100%;
  height: 100%;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% { transform: translate3d(-90px,0,0); }
  100% { transform: translate3d(85px,0,0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tools-content {
  flex: 1;
  padding: 0 20px 60px;
  margin-top: -100px; /* 悬浮效果 */
  position: relative;
  z-index: 20;
}

.tools-container {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow: hidden;
  padding: 20px;
}

/* 覆盖 Element Plus Tabs 样式 */
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  height: 50px;
  line-height: 50px;
  font-weight: 500;
  color: #64748b;
}

:deep(.el-tabs__item.is-active) {
  color: #2563eb;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #2563eb;
  height: 3px;
  border-radius: 3px;
}

/* 样式穿透：美化子组件 */
:deep(.public-component .el-card) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

:deep(.public-component .el-card__body) {
  padding: 20px 0;
}

:deep(.public-component .el-form-item__label) {
  font-weight: 500;
  color: #334155;
}

/* SEO Content Styles */
.seo-content {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #eee;
  color: #334155;
  line-height: 1.8;
}

.seo-content h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #1e293b;
}

.seo-content h3 {
  font-size: 20px;
  margin-bottom: 15px;
  margin-top: 30px;
  color: #1e293b;
}

.seo-content p {
  margin-bottom: 15px;
  font-size: 15px;
  color: #475569;
}

.seo-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.feature-item {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.3s;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-item h4 {
  color: #2563eb;
  margin-bottom: 10px;
  font-size: 16px;
}

.seo-content ul {
  padding-left: 20px;
  margin-bottom: 20px;
}

.seo-content li {
  margin-bottom: 10px;
  color: #475569;
}

.tools-footer {
  text-align: center;
  padding: 30px 0;
  color: #94a3b8;
  font-size: 14px;
  background-color: #fff;
  border-top: 1px solid #f1f5f9;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .tools-header {
    padding: 0 20px;
    height: 56px;
  }
  
  .hero-section {
    min-height: 420px;
    padding-top: 56px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 15px;
  }
  
  .tools-content {
    margin-top: -60px;
    padding: 0 15px 40px;
  }
  
  .tools-container {
    border-radius: 12px;
    padding: 15px;
  }

  .seo-features {
    grid-template-columns: 1fr;
  }

  .announcements-area {
    margin-bottom: 12px;
  }

  .announcement-panel {
    box-sizing: border-box;
    padding: 14px 14px;
  }

  .announcement-list {
    max-height: 120px;
  }
}
</style>
