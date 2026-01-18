// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 初始化时从 localStorage 读取 token 和用户信息
  const token = ref(localStorage.getItem('admin_token') || '')
  const user = ref(null)

  const savedUser = localStorage.getItem('admin_user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch {
      user.value = null
    }
  }

  // 登录 / 刷新用户信息
  const setAuth = (newToken, newUser) => {
    token.value = newToken || ''
    user.value = newUser || null

    if (newToken) {
      localStorage.setItem('admin_token', newToken)
    } else {
      localStorage.removeItem('admin_token')
    }

    if (newUser) {
      localStorage.setItem('admin_user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('admin_user')
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return { token, user, setAuth, logout }
})
