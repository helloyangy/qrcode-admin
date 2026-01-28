// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/login', 
      name: 'Login', 
      component: () => import('../views/Login.vue') 
    },

    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard/monitor',
      children: [
        {
          path: 'monitor',
          name: 'Monitor',
          component: () => import('../views/dashboard/SystemMonitor.vue'),
          meta: { title: '系统监控' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/dashboard/SystemSettings.vue'),
          meta: { title: '系统设置' }
        },
        {
          path: 'records',
          name: 'Records',
          component: () => import('../views/dashboard/QRTable.vue'),
          meta: { title: '二维码记录' }
        },
        {
          path: 'miniapp-files',
          name: 'MiniAppFiles',
          component: () => import('../views/dashboard/MiniAppFileManager.vue'),
          meta: { title: '小程序文件' }
        },
        {
          path: 'announcements',
          name: 'Announcements',
          component: () => import('../views/dashboard/AnnouncementTable.vue'),
          meta: { title: '公告管理' }
        },
        {
          path: 'failed',
          name: 'Failed',
          component: () => import('../views/dashboard/FailedLoginTable.vue'),
          meta: { title: '破解记录' }
        },
        {
          path: 'account',
          name: 'Account',
          component: () => import('../views/dashboard/AccountSettings.vue'),
          meta: { title: '账户设置' }
        }
      ]
    },

    {
      path: '/tools',
      name: 'PublicTools',
      component: () => import('../views/PublicTools.vue'),
      meta: { title: '在线二维码工具' }
    },

    // 根路径跳到工具页
    { path: '/', redirect: '/tools' },

    // 未匹配路径跳到工具页
    { path: '/:pathMatch(.*)*', redirect: '/tools' },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // 已登录访问 /login，则直接进后台
  if (to.path === '/login' && auth.token) {
    next('/dashboard')
    return
  }

  // 需要登录的页面但没有 token → 去登录页，并带 redirect
  if (to.meta.requiresAuth && !auth.token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
