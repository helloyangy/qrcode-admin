import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
})

request.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  config.headers = config.headers || {}

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    const { response } = error

    if (response) {
      // 401 Unauthorized
      if (response.status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        authStore.logout()
        router.push('/login')
      } else {
        // Other errors
        const msg = response.data?.message || response.data?.error || '请求失败'
        // 部分接口可能希望自己处理错误，这里可以加个配置跳过全局提示
        // 但目前简单起见，全局提示一下，具体业务中如果有 try-catch 可能会重复提示，
        // 不过 Element Plus 的 Message 会自动合并重复消息，问题不大
        ElMessage.error(msg)
      }
    } else {
      // Network error or timeout
      ElMessage.error(error.message || '网络异常')
    }

    return Promise.reject(error)
  }
)

export default request
