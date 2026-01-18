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
      :width="isCollapse ? '0' : '200px'"
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

        <el-menu-item index="/dashboard/generate">
          <el-icon><Position /></el-icon>
          <span>二维码生成</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/generate-colorful">
          <el-icon><MagicStick /></el-icon>
          <span>彩色二维码生成</span>
        </el-menu-item>

        <!-- ✅ 新增：隐藏二维码菜单 -->
        <el-menu-item index="/dashboard/hidden">
          <el-icon><View /></el-icon>
          <span>隐藏二维码（可扫）</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/records">
          <el-icon><List /></el-icon>
          <span>二维码记录</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/announcements">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/failed">
          <el-icon><Warning /></el-icon>
          <span>破解记录</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/profile">
          <el-icon><User /></el-icon>
          <span>修改用户名</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/password">
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
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
          <span class="user">{{ displayName }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
            退出
          </el-button>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="content">
        <div class="content-inner">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
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
  MagicStick,
  View,
  Bell,
  Odometer,
  Setting,
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
/* 保持你的原样式不变，下面直接原样贴回 */

.layout {
  height: 100vh;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 左侧菜单 */
.aside {
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}

/* 移动端抽屉样式 */
.aside.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 200px !important;
  z-index: 1001;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.aside.mobile-drawer.collapsed {
  transform: translateX(-100%);
}

.brand {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  color: #303133;
}

.brand-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-close {
  flex-shrink: 0;
}

.menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

/* 右侧主体 */
.main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;
  height: 56px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.user {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.content {
  padding: 16px;
  box-sizing: border-box;
  overflow: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.content-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.panel {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

/* 平板适配 (768px - 1024px) */
@media (max-width: 1024px) {
  .content-inner {
    max-width: 100%;
  }
}

/* 移动端适配 (≤768px) */
@media (max-width: 768px) {
  .header {
    padding: 0 12px;
    height: 50px;
  }

  .page-title {
    font-size: 15px;
  }

  .user {
    font-size: 13px;
  }

  .content {
    padding: 12px;
  }

  .panel {
    padding: 16px;
    border-radius: 6px;
  }

  .menu :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    font-size: 15px;
  }
}

/* 小屏手机适配 (≤480px) */
@media (max-width: 480px) {
  .header {
    padding: 0 10px;
    height: 48px;
  }

  .header-left {
    gap: 8px;
  }

  .header-right {
    gap: 8px;
  }

  .page-title {
    font-size: 14px;
  }

  .user {
    display: none;
  }

  .content {
    padding: 10px;
  }

  .panel {
    padding: 12px;
    border-radius: 4px;
  }

  .header-right :deep(.el-button) {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 超小屏适配 (≤375px) */
@media (max-width: 375px) {
  .header {
    padding: 0 8px;
  }

  .page-title {
    font-size: 13px;
  }

  .content {
    padding: 8px;
  }

  .panel {
    padding: 10px;
  }

  .header-right :deep(.el-button) {
    padding: 5px 10px;
    font-size: 12px;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .el-button {
    min-width: 44px;
    min-height: 44px;
  }

  .menu :deep(.el-menu-item) {
    -webkit-tap-highlight-color: transparent;
  }

  .menu :deep(.el-menu-item:active) {
    background-color: #f5f7fa;
  }
}

/* 防止内容溢出 */
* {
  box-sizing: border-box;
}

/* 滚动条美化（仅PC端） */
@media (min-width: 769px) {
  .content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .content::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 4px;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: #c0c4cc;
  }

  .menu::-webkit-scrollbar {
    width: 6px;
  }

  .menu::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }
}
</style>
