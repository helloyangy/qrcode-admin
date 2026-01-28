<template>
  <el-card class="account-settings-card">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon"><User /></el-icon>
        <span class="header-title">账户设置</span>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="account-tabs">
      <!-- 修改用户名 -->
      <el-tab-pane label="修改用户名" name="profile">
        <div class="tab-content">
          <el-form
            :model="profileForm"
            :rules="profileRules"
            ref="profileFormRef"
            :label-width="isMobile ? '80px' : '100px'"
            :label-position="isMobile ? 'top' : 'right'"
            class="settings-form"
          >
            <el-form-item label="当前用户名">
              <el-input
                :value="originalName"
                disabled
                :prefix-icon="Avatar"
              />
            </el-form-item>

            <el-form-item label="新用户名" prop="name">
              <el-input
                v-model="profileForm.name"
                placeholder="请输入新的用户名"
                clearable
                :prefix-icon="User"
                maxlength="50"
                show-word-limit
                @keyup.enter="submitProfile"
              />
            </el-form-item>

            <el-form-item class="form-actions">
              <el-button
                type="primary"
                :loading="profileLoading"
                @click="submitProfile"
                :disabled="!isProfileChanged"
                :class="{ 'mobile-btn': isMobile }"
              >
                <el-icon v-if="!profileLoading" class="btn-icon"><Check /></el-icon>
                <span>保存修改</span>
              </el-button>

              <el-button
                v-if="!isMobile"
                @click="resetProfileForm"
                :disabled="profileLoading || !isProfileChanged"
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 修改密码 -->
      <el-tab-pane label="修改密码" name="password">
        <div class="tab-content">
          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            :label-width="isMobile ? '80px' : '90px'"
            :label-position="isMobile ? 'top' : 'right'"
            class="settings-form"
          >
            <el-form-item label="原密码" prop="old_password">
              <el-input
                v-model="passwordForm.old_password"
                type="password"
                show-password
                :prefix-icon="Lock"
                placeholder="请输入原密码"
                :size="isMobile ? 'default' : 'default'"
                clearable
              />
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                show-password
                :prefix-icon="Lock"
                placeholder="请输入新密码，至少6位"
                :size="isMobile ? 'default' : 'default'"
                clearable
              />
              <div class="form-hint">建议使用字母、数字和符号的组合</div>
            </el-form-item>

            <el-form-item label="确认密码" prop="new_password_confirmation">
              <el-input
                v-model="passwordForm.new_password_confirmation"
                type="password"
                show-password
                :prefix-icon="Lock"
                placeholder="请再次输入新密码"
                :size="isMobile ? 'default' : 'default'"
                clearable
                @keyup.enter="submitPassword"
              />
            </el-form-item>

            <el-form-item class="form-actions">
              <el-button
                type="primary"
                :loading="passwordLoading"
                @click="submitPassword"
                :class="{ 'mobile-btn': isMobile }"
              >
                <el-icon v-if="!passwordLoading" class="btn-icon"><Check /></el-icon>
                <span>修改密码</span>
              </el-button>

              <el-button
                v-if="!isMobile"
                @click="resetPasswordForm"
                :disabled="passwordLoading"
              >
                重置
              </el-button>
            </el-form-item>

            <el-alert
              v-if="isMobile"
              type="info"
              :closable="false"
              show-icon
              class="mobile-tip"
            >
              <template #title>
                <div class="tip-content">密码修改成功后将自动退出，需重新登录</div>
              </template>
            </el-alert>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { updateProfile, updatePassword } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { User, Lock, Check, Avatar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('profile')
const isMobile = ref(false)

// Profile related
const profileFormRef = ref()
const profileLoading = ref(false)
const originalName = ref('')
const profileForm = reactive({
  name: '',
})

const profileRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名至少2个字符', trigger: 'blur' },
    { max: 50, message: '用户名最多50个字符', trigger: 'blur' },
    { 
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, 
      message: '只能包含中英文、数字、下划线和空格', 
      trigger: 'blur' 
    },
  ],
}

const isProfileChanged = computed(() => {
  return profileForm.name.trim() !== '' && profileForm.name !== originalName.value
})

// Password related
const passwordFormRef = ref()
const passwordLoading = ref(false)
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const passwordRules = {
  old_password: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  new_password_confirmation: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
  ],
}

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

const getErrorMessage = (e) => {
  const data = e?.response?.data
  if (data?.message) return data.message
  const firstField = data?.errors ? Object.keys(data.errors)[0] : null
  if (firstField && data.errors[firstField]?.length) {
    return data.errors[firstField][0]
  }
  return '操作失败'
}

// Profile Actions
const submitProfile = async () => {
  try {
    await profileFormRef.value.validate()

    if (!isProfileChanged.value) {
      ElMessage.info('用户名未发生变化')
      return
    }

    profileLoading.value = true
    const res = await updateProfile({ name: profileForm.name.trim() })

    if (auth.setAuth) {
      auth.setAuth(auth.token, res.data.admin)
    } else {
      auth.user = res.data.admin
      localStorage.setItem('admin_user', JSON.stringify(res.data.admin))
    }

    originalName.value = res.data.admin.name || profileForm.name.trim()
    ElMessage.success('用户名修改成功')
  } catch (e) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    profileLoading.value = false
  }
}

const resetProfileForm = () => {
  profileForm.name = originalName.value
  profileFormRef.value?.clearValidate()
}

// Password Actions
const submitPassword = async () => {
  try {
    await passwordFormRef.value.validate()

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      ElMessage.error('两次新密码不一致')
      return
    }

    passwordLoading.value = true
    await updatePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.new_password_confirmation,
    })

    ElMessage.success('密码修改成功，请重新登录')

    auth.logout?.()
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    passwordFormRef.value.resetFields()

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (e) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    passwordLoading.value = false
  }
}

const resetPasswordForm = () => {
  passwordFormRef.value.resetFields()
}

const handleResize = () => {
  checkDevice()
}

onMounted(() => {
  checkDevice()
  originalName.value = auth.user?.name || ''
  profileForm.name = originalName.value
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.account-settings-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 20px;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 8px;
  border-radius: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.account-tabs {
  margin-top: 0;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--border-color);
}

:deep(.el-tabs__item) {
  font-size: 15px;
  color: var(--text-regular);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-content {
  padding: 24px 0;
  max-width: 600px;
}

.settings-form {
  padding: 0;
}

.form-actions {
  margin-top: 40px;
}

.form-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 16px;
}

.btn-icon {
  margin-right: 6px;
}

.form-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 6px;
  line-height: 1.6;
}

.mobile-tip {
  margin-top: 20px;
  border-radius: 8px;
}

.tip-content {
  font-size: 14px;
  line-height: 1.6;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .account-settings-card {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  .account-settings-card :deep(.el-card__header) {
    padding: 0 0 16px 0;
    border-bottom: none;
    background: transparent;
  }
  
  .account-settings-card :deep(.el-card__body) {
    padding: 0;
    background: transparent;
  }
  
  /* Create card look for tabs content on mobile */
  .account-tabs {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    box-shadow: var(--shadow-sm);
  }

  .tab-content {
    padding: 10px 0;
  }

  .header-title {
    font-size: 20px;
  }
  
  .header-icon {
    display: none;
  }

  .settings-form :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  .settings-form :deep(.el-form-item__label) {
    margin-bottom: 8px;
    font-size: 15px;
    color: var(--text-primary);
  }

  .settings-form :deep(.el-input__inner) {
    height: 48px;
    font-size: 16px;
  }
  
  .mobile-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 10px !important;
  }

  .form-actions {
    margin-top: 32px;
  }

  .form-actions :deep(.el-form-item__content) {
    flex-direction: column;
  }
}

/* 聚焦优化 */
.settings-form :deep(.el-input.is-focus .el-input__inner) {
  border-color: var(--primary-color);
}

/* 错误状态优化 */
.settings-form :deep(.el-form-item.is-error .el-input__inner) {
  border-color: var(--danger-color);
}

.settings-form :deep(.el-form-item__error) {
  font-size: 13px;
  padding-top: 6px;
}

/* 禁用状态 */
.settings-form :deep(.el-button.is-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>