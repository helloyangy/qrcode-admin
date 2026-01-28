<template>
  <div class="login-page">
    <div class="login-wrapper">
      <el-card class="login-card">
        <template #header>
          <div class="login-header">
            <h2>二维码管理后台</h2>
            <p>请输入管理员用户名和密码登录</p>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="用户名" prop="account">
            <el-input
              v-model="form.account"
              placeholder="请输入用户名/邮箱"
              clearable
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
              autocomplete="current-password"
            />
          </el-form-item>

          <!-- 验证码开始 -->
          <el-form-item label="验证码" prop="captcha_code">
            <div class="captcha-row">
              <el-input
                v-model="form.captcha_code"
                placeholder="请输入验证码"
                maxlength="6"
                autocomplete="off"
              />
              <div class="captcha-image-wrapper" @click="refreshCaptcha">
                <img
                  v-if="captcha.image"
                  :src="captcha.image"
                  alt="captcha"
                  class="captcha-image"
                />
                <span v-else class="captcha-placeholder">点击刷新</span>
              </div>
            </div>
            <div class="captcha-tip">
              看不清？点击图片换一张
            </div>
          </el-form-item>
          <!-- 验证码结束 -->

          <el-form-item>
            <el-checkbox v-model="remember">记住我</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              style="width: 100%"
              native-type="submit"
            >
              登录
            </el-button>
          </el-form-item>
          
          <div class="login-footer">
            <router-link to="/tools" class="footer-link">无需登录？使用在线工具 >></router-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login } from '../api/auth'
import api from '../api' // 保留 api 用于验证码请求，稍后重构

const router = useRouter()
const auth = useAuthStore()

const formRef = ref()
const remember = ref(true)
const loading = ref(false)

// 表单增加 captcha_code
const form = reactive({
  account: '',
  password: '',
  captcha_code: ''
})

// 验证码状态：image + key
const captcha = reactive({
  image: '',
  key: ''
})

onMounted(() => {
  const saved = localStorage.getItem('admin_account')
  if (saved) form.account = saved

  // 初始化加载一次验证码
  refreshCaptcha()
})

const rules = {
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '至少2位', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, message: '至少4位', trigger: 'blur' }
  ]
}

const getErrorMessage = (e) => {
  const data = e?.response?.data
  if (data?.message) return data.message
  const firstField = data?.errors ? Object.keys(data.errors)[0] : null
  if (firstField && data.errors[firstField]?.length) return data.errors[firstField][0]
  return '登录失败'
}

// 拉取/刷新验证码
const refreshCaptcha = async () => {
  try {
    const res = await api.get('/captcha', {
      params: { t: Date.now() } // 防缓存
    })
    // 后端示例返回：{ image: 'data:image/png;base64,...', key: 'xxx' }
    captcha.image = res.data.image || ''
    captcha.key = res.data.key || ''
    // 自动清空输入
    form.captcha_code = ''
  } catch (e) {
    console.error('加载验证码失败', e)
    ElMessage.error('加载验证码失败，请稍后重试')
  }
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (!captcha.key) {
    ElMessage.error('验证码加载失败，请刷新后重试')
    await refreshCaptcha()
    return
  }

  loading.value = true
  try {
    // 调用 API
    const res = await login({
      account: form.account,
      password: form.password,
      captcha_key: captcha.key,
      captcha_code: form.captcha_code
    })

    const token = res.data.token || res.data.data?.token
    const user = res.data.user || res.data.admin || res.data.data?.user || res.data.data?.admin

    if (!token) {
      throw new Error('未获取到 Token')
    }

    if (remember.value) {
      localStorage.setItem('admin_account', form.account)
    } else {
      localStorage.removeItem('admin_account')
    }

    ElMessage.success('登录成功')
    auth.setAuth(token, user)
    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    ElMessage.error(getErrorMessage(e))
    // 登录失败时自动刷新验证码，防止被重放
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  margin: 0;
  padding: 16px;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.login-wrapper {
  width: 100%;
  max-width: 440px; /* 稍微加宽 */
}

.login-card {
  width: 100%;
  border-radius: 12px; /* 更圆润 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); /* 更柔和的投影 */
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 10px 0;
}

.login-header h2 {
  margin: 0 0 12px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.login-footer {
  text-align: center;
  margin-top: -10px;
  margin-bottom: 10px;
}

.footer-link {
  font-size: 14px;
  color: #409eff;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

/* 验证码样式 */
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-image-wrapper {
  width: 140px; /* 增加宽度 */
  height: 48px; /* 增加高度 */
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #fff;
  transition: border-color 0.2s;
}

.captcha-image-wrapper:hover {
  border-color: #409eff;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 填充整个容器 */
  border-radius: 3px;
}

.captcha-placeholder {
  font-size: 13px;
  color: #909399;
}

.captcha-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 480px) {
  .login-page {
    padding: 8px;
  }
  .login-card {
    box-shadow: none;
  }
  .login-header h2 {
    font-size: 18px;
  }
}
</style>
