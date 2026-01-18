<template>
  <el-card class="password-card">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon"><Lock /></el-icon>
        <span class="header-title">修改管理员密码</span>
      </div>
    </template>

    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      :label-width="isMobile ? '80px' : '90px'"
      :label-position="isMobile ? 'top' : 'right'"
      class="password-form"
    >
      <el-form-item label="原密码" prop="old_password">
        <el-input
          v-model="form.old_password"
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
          v-model="form.new_password"
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
          v-model="form.new_password_confirmation"
          type="password"
          show-password
          :prefix-icon="Lock"
          placeholder="请再次输入新密码"
          :size="isMobile ? 'default' : 'default'"
          clearable
          @keyup.enter="submit"
        />
      </el-form-item>

      <el-form-item class="form-actions">
        <el-button
          type="primary"
          :loading="loading"
          @click="submit"
          :class="{ 'mobile-btn': isMobile }"
        >
          <el-icon v-if="!loading" class="btn-icon"><Check /></el-icon>
          <span>修改密码</span>
        </el-button>

        <el-button
          v-if="!isMobile"
          @click="resetForm"
          :disabled="loading"
        >
          重置
        </el-button>
      </el-form-item>

      <!-- 移动端提示卡片 -->
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
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { updatePassword } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { Lock, Check } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const isMobile = ref(false)

const form = reactive({
  old_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const rules = {
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
  return '修改失败'
}

const submit = async () => {
  try {
    await formRef.value.validate()

    if (form.new_password !== form.new_password_confirmation) {
      ElMessage.error('两次新密码不一致')
      return
    }

    loading.value = true
    await updatePassword({
      old_password: form.old_password,
      new_password: form.new_password,
      new_password_confirmation: form.new_password_confirmation,
    })

    ElMessage.success('密码修改成功，请重新登录')

    // 清理本地登录状态
    auth.logout?.()
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    formRef.value.resetFields()

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (e) {
    ElMessage.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formRef.value.resetFields()
}

const handleResize = () => {
  checkDevice()
}

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.password-card {
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
  color: #409eff;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.password-form {
  padding: 0;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.form-actions {
  margin-top: 24px;
}

.form-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 12px;
}

.btn-icon {
  margin-right: 4px;
}

.mobile-tip {
  margin-top: 16px;
  border-radius: 6px;
}

.tip-content {
  font-size: 13px;
  line-height: 1.6;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .password-card {
    max-width: 100%;
  }

  .password-card :deep(.el-card__header) {
    padding: 14px 16px;
  }

  .password-card :deep(.el-card__body) {
    padding: 16px;
  }

  .header-title {
    font-size: 15px;
  }

  .password-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .password-form :deep(.el-form-item__label) {
    padding: 0;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  .password-form :deep(.el-input) {
    font-size: 15px;
  }

  .password-form :deep(.el-input__inner) {
    height: 44px;
    line-height: 44px;
  }

  .password-form :deep(.el-input__prefix) {
    font-size: 16px;
  }

  .mobile-btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
  }

  .form-actions {
    margin-top: 20px;
  }

  .form-actions :deep(.el-form-item__content) {
    flex-direction: column;
    gap: 0;
  }

  .form-hint {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .password-card :deep(.el-card__header) {
    padding: 12px;
  }

  .password-card :deep(.el-card__body) {
    padding: 12px;
  }

  .header-icon {
    font-size: 16px;
  }

  .header-title {
    font-size: 14px;
  }

  .password-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .password-form :deep(.el-form-item__label) {
    font-size: 13px;
  }

  .password-form :deep(.el-input) {
    font-size: 14px;
  }

  .password-form :deep(.el-input__inner) {
    height: 42px;
    line-height: 42px;
  }

  .mobile-btn {
    height: 42px;
    font-size: 14px;
  }

  .mobile-tip {
    margin-top: 12px;
  }

  .tip-content {
    font-size: 12px;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .password-form :deep(.el-input__inner) {
    -webkit-tap-highlight-color: transparent;
  }

  .password-form :deep(.el-button) {
    -webkit-tap-highlight-color: transparent;
  }
}

/* 聚焦优化 */
.password-form :deep(.el-input.is-focus .el-input__inner) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 错误状态优化 */
.password-form :deep(.el-form-item.is-error .el-input__inner) {
  border-color: #f56c6c;
}

.password-form :deep(.el-form-item__error) {
  font-size: 12px;
  padding-top: 4px;
}

/* 按钮加载状态 */
.password-form :deep(.el-button.is-loading) {
  pointer-events: none;
}

/* 平滑过渡 */
* {
  transition: all 0.2s ease;
}
</style>