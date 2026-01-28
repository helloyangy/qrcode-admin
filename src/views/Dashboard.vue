<template>
  <el-container class="layout">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && !isCollapse"
      class="mobile-overlay"
      @click="isCollapse = true"
    ></div>

    <!-- 左侧菜单 -->
    <el-aside
      :width="isCollapse ? '0' : '240px'"
      class="aside"
      :class="{ 'mobile-drawer': isMobile, collapsed: isCollapse }"
    >
      <div class="brand">
        <span class="brand-text">二维码管理</span>
        <!-- 移动端关闭按钮 -->
        <el-button
          v-if="isMobile"
          circle
          size="small"
          class="mobile-close"
          @click="isCollapse = true"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <el-menu
        class="menu"
        :default-active="activeMenu"
        :collapse="false"
        :collapse-transition="false"
        router
      >
        <el-menu-item index="/dashboard/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/monitor">
          <el-icon><Odometer /></el-icon>
          <span>系统监控</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/records">
          <el-icon><List /></el-icon>
          <span>二维码记录</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/miniapp-files">
          <el-icon><Folder /></el-icon>
          <span>小程序文件</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/announcements">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/failed">
          <el-icon><Warning /></el-icon>
          <span>破解记录</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/account">
          <el-icon><User /></el-icon>
          <span>账户设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container class="main">
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button circle size="small" @click="toggleAside">
            <el-icon>
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <span class="page-title">{{ pageTitle }}</span>
        </div>

        <div class="header-right">
          <el-button type="primary" size="small" @click="goToTools">
            <el-icon :class="{ 'mr-1': !isMobile }"><Position /></el-icon>
            <span v-if="!isMobile">返回前台</span>
          </el-button>
          <span v-if="!isMobile" class="user">{{ displayName }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
            <el-icon :class="{ 'mr-1': !isMobile }"><SwitchButton /></el-icon>
            <span v-if="!isMobile">退出</span>
          </el-button>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="content">
        <div class="content-inner">
          <router-view v-slot="{ Component }">
            <transition name="fade">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { logout } from '../api/auth'

// Element Plus 图标
import {
  Position,
  List,
  Warning,
  User,
  Lock,
  Fold,
  Expand,
  Close,
  Bell,
  Odometer,
  Setting,
  Folder,
  SwitchButton,
} from '@element-plus/icons-vue'

const props = defineProps({
  userName: { type: String, default: '管理员' },
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isCollapse = ref(false)
const isMobile = ref(false)

// 根据当前路由路径高亮菜单
const activeMenu = computed(() => route.path)

const displayName = computed(() => auth.user?.name || props.userName)

const pageTitle = computed(() => {
  return route.meta.title || '后台管理'
})

const toggleAside = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = async () => {
  try {
    await logout().catch(() => {})
  } finally {
    auth.logout()
    router.push('/login')
  }
}

const goToTools = () => {
  router.push('/tools')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

const handleResize = () => {
  checkMobile()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Modern Layout Styles */
.layout {
  height: 100vh;
  background: var(--bg-color);
  position: relative;
  overflow: hidden;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Sidebar */
.aside {
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
  z-index: 10;
  border-right: none;
}

/* Mobile Drawer */
.aside.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px !important;
  z-index: 1001;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
  transform: translateX(0);
}

.aside.mobile-drawer.collapsed {
  transform: translateX(-100%);
}

.brand {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  font-weight: 700;
  font-size: 18px;
  color: var(--primary-color);
  letter-spacing: -0.5px;
}

.brand-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: linear-gradient(135deg, var(--primary-color), #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mobile-close {
  flex-shrink: 0;
}

/* Menu Customization */
.menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

:deep(.el-menu) {
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin-bottom: 4px;
  border-radius: 8px;
  color: var(--text-regular);
  font-weight: 500;
}

:deep(.el-menu-item:hover) {
  background-color: var(--bg-color);
  color: var(--primary-color);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 12px;
}

/* Main Area */
.main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
  height: 64px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.025em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.user {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-regular);
  background: var(--bg-color);
  padding: 6px 12px;
  border-radius: 20px;
}

.content {
  padding: 24px;
  box-sizing: border-box;
  overflow: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.content-inner {
  max-width: 1400px;
  margin: 0 auto;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    height: 56px;
  }
  
  .content {
    padding: 16px;
  }
  
  .page-title {
    font-size: 16px;
  }
}
</style>
