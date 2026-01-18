<template>
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><User /></el-icon>
          <span class="header-title">修改管理员用户名</span>
        </div>
      </template>
  
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        :label-width="isMobile ? '80px' : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
        class="profile-form"
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
            v-model="form.name"
            placeholder="请输入新的用户名"
            clearable
            :prefix-icon="User"
            maxlength="50"
            show-word-limit
            @keyup.enter="submit"
          />
        </el-form-item>
  
        <el-form-item class="form-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="submit"
            :disabled="!isChanged"
            :class="{ 'mobile-btn': isMobile }"
          >
            <el-icon v-if="!loading" class="btn-icon"><Check /></el-icon>
            <span>保存修改</span>
          </el-button>
  
          <el-button
            v-if="!isMobile"
            @click="resetForm"
            :disabled="loading || !isChanged"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { updateProfile } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import { User, Check, Avatar } from '@element-plus/icons-vue'
  
  const auth = useAuthStore()
  
  const formRef = ref()
  const loading = ref(false)
  const isMobile = ref(false)
  const originalName = ref('')
  
  const form = reactive({
    name: '',
  })
  
  const rules = {
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
  
  // 检查是否有修改
  const isChanged = computed(() => {
    return form.name.trim() !== '' && form.name !== originalName.value
  })
  
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
  
      if (!isChanged.value) {
        ElMessage.info('用户名未发生变化')
        return
      }
  
      loading.value = true
      const res = await updateProfile({ name: form.name.trim() })

      // 更新本地状态
      if (auth.setAuth) {
        auth.setAuth(auth.token, res.data.admin)
      } else {
        auth.user = res.data.admin
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin))
      }
  
      // 更新原始用户名
      originalName.value = res.data.admin.name || form.name.trim()
  
      ElMessage.success('用户名修改成功')
    } catch (e) {
      ElMessage.error(getErrorMessage(e))
    } finally {
      loading.value = false
    }
  }
  
  const resetForm = () => {
    form.name = originalName.value
    formRef.value?.clearValidate()
  }
  
  const handleResize = () => {
    checkDevice()
  }
  
  onMounted(() => {
    checkDevice()
    // 回填当前用户名
    originalName.value = auth.user?.name || ''
    form.name = originalName.value
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
  </script>
  
  <style scoped>
  .profile-card {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  
  .profile-form {
    padding: 0;
  }
  
  .form-actions {
    margin-top: 32px;
  }
  
  .form-actions :deep(.el-form-item__content) {
    display: flex;
    gap: 12px;
  }
  
  .btn-icon {
    margin-right: 4px;
  }
  
  /* 禁用输入框样式优化 */
  .profile-form :deep(.el-input.is-disabled .el-input__inner) {
    background-color: #f5f7fa;
    color: #606266;
    cursor: not-allowed;
  }
  
  /* 移动端优化 */
  @media (max-width: 768px) {
    .profile-card {
      max-width: 100%;
    }
  
    .profile-card :deep(.el-card__header) {
      padding: 14px 16px;
    }
  
    .profile-card :deep(.el-card__body) {
      padding: 16px;
    }
  
    .header-title {
      font-size: 15px;
    }
  
    .profile-form :deep(.el-form-item) {
      margin-bottom: 20px;
    }
  
    .profile-form :deep(.el-form-item__label) {
      padding: 0;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }
  
    .profile-form :deep(.el-input__inner) {
      height: 44px;
      font-size: 15px;
    }
  
    .profile-form :deep(.el-input__prefix) {
      font-size: 16px;
    }
  
    .mobile-btn {
      width: 100%;
      height: 44px;
      font-size: 15px;
    }
  
    .form-actions {
      margin-top: 24px;
    }
  
    .form-actions :deep(.el-form-item__content) {
      flex-direction: column;
      gap: 0;
    }
  }
  
  @media (max-width: 480px) {
    .profile-card :deep(.el-card__header) {
      padding: 12px;
    }
  
    .profile-card :deep(.el-card__body) {
      padding: 12px;
    }
  
    .header-icon {
      font-size: 16px;
    }
  
    .header-title {
      font-size: 14px;
    }
  
    .profile-form :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  
    .profile-form :deep(.el-form-item__label) {
      font-size: 13px;
      margin-bottom: 6px;
    }
  
    .profile-form :deep(.el-input__inner) {
      height: 42px;
      font-size: 14px;
    }
  
    .mobile-btn {
      height: 42px;
      font-size: 14px;
    }
  }
  
  /* 触摸优化 */
  @media (hover: none) and (pointer: coarse) {
    .profile-form :deep(.el-input__inner) {
      -webkit-tap-highlight-color: transparent;
    }
  
    .profile-form :deep(.el-button) {
      -webkit-tap-highlight-color: transparent;
    }
  }
  
  /* 聚焦优化 */
  .profile-form :deep(.el-input.is-focus .el-input__inner) {
    border-color: #409eff;
  }
  
  /* 错误状态优化 */
  .profile-form :deep(.el-form-item.is-error .el-input__inner) {
    border-color: #f56c6c;
  }
  
  .profile-form :deep(.el-form-item__error) {
    font-size: 12px;
    padding-top: 4px;
  }
  
  /* 禁用状态 */
  .profile-form :deep(.el-button.is-disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* 字数统计优化 */
  .profile-form :deep(.el-input__count) {
    font-size: 12px;
    color: #909399;
  }
  </style>