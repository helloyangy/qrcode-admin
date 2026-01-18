<template>
  <el-card class="qr-generator-card">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon"><Position /></el-icon>
        <span class="header-title">生成二维码</span>
      </div>
    </template>

    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      :label-width="isMobile ? '80px' : '90px'"
      :label-position="isMobile ? 'top' : 'right'"
      class="qr-form"
    >
      <!-- 类型选择 -->
      <el-form-item label="生成类型" prop="type">
        <el-radio-group v-model="form.type" @change="handleTypeChange">
          <el-radio-button value="url" :disabled="!typeSettings.url">链接 (URL)</el-radio-button>
          <el-radio-button value="text" :disabled="!typeSettings.text">文本 (Text)</el-radio-button>
          <el-radio-button value="image" :disabled="!typeSettings.image">图片 (Image)</el-radio-button>
          <el-radio-button value="pdf" :disabled="!typeSettings.pdf">PDF文档</el-radio-button>
          <el-radio-button value="word" :disabled="!typeSettings.word">Word文档</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- URL 输入 -->
      <el-form-item
        v-if="form.type === 'url'"
        label="目标链接"
        prop="url"
      >
        <el-input
          v-model="form.url"
          placeholder="https://example.com"
          clearable
          :prefix-icon="Link"
          type="url"
          :disabled="loading"
          @keyup.enter="submit"
        >
          <template #append>
            <el-button :loading="isChecking" @click="checkUrl" :icon="Check">
              检测有效性
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <!-- 文本输入 -->
      <el-form-item
        v-if="form.type === 'text'"
        label="文本内容"
        prop="text"
      >
        <el-input
          v-model="form.text"
          type="textarea"
          :rows="4"
          placeholder="请输入文本内容"
          clearable
          :disabled="loading"
        />
      </el-form-item>

      <!-- 文件上传 -->
      <el-form-item
        v-if="['image', 'pdf', 'word'].includes(form.type)"
        label="上传文件"
        prop="file"
      >
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处 或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              {{ getFileTip() }}
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <div class="form-row">
        <el-form-item label="尺寸大小">
          <el-input-number
            v-model="form.size"
            :min="100"
            :max="1000"
            :step="50"
            controls-position="right"
            :style="{ width: isMobile ? '100%' : '180px' }"
          />
          <span class="unit-text">像素</span>
        </el-form-item>

        <el-form-item label="边距">
          <el-input-number
            v-model="form.margin"
            :min="0"
            :max="50"
            controls-position="right"
            :style="{ width: isMobile ? '100%' : '180px' }"
          />
          <span class="unit-text">像素</span>
        </el-form-item>
      </div>



      <el-form-item class="form-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="isSubmitDisabled"
          @click="submit"
          :class="{ 'mobile-btn': isMobile }"
        >
          <el-icon v-if="!loading" class="btn-icon"><MagicStick /></el-icon>
          <span>生成并保存</span>
        </el-button>

        <el-button
          v-if="!isMobile && preview"
          @click="downloadQR"
          :disabled="loading"
        >
          <el-icon class="btn-icon"><Download /></el-icon>
          <span>下载二维码</span>
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 预览区域 -->
    <div v-if="preview" class="preview-section">
      <div class="preview-header">
        <el-icon class="preview-icon"><PictureFilled /></el-icon>
        <span class="preview-title">二维码预览</span>
      </div>

      <div class="preview-content">
        <div class="qr-wrapper">
          <img :src="preview" alt="二维码预览" class="qr-image" />
          
          <!-- 移动端下载按钮 -->
          <el-button
            v-if="isMobile"
            type="primary"
            @click="downloadQR"
            class="mobile-download-btn"
          >
            <el-icon><Download /></el-icon>
            <span>下载二维码</span>
          </el-button>
        </div>

        <el-alert
          type="success"
          :closable="false"
          show-icon
          class="success-tip"
        >
          <template #title>
            <span>已保存记录,可在"二维码记录"中查看</span>
          </template>
        </el-alert>

        <!-- 二维码信息 -->
        <div class="qr-info">
          <div class="info-item">
            <span class="info-label">类型</span>
            <span class="info-value">{{ getTypeName(form.type) }}</span>
          </div>
          <div class="info-item" v-if="form.type === 'url'">
            <span class="info-label">链接</span>
            <span class="info-value">{{ form.url }}</span>
          </div>
          <div class="info-item" v-if="form.type === 'text'">
            <span class="info-label">文本</span>
            <span class="info-value">{{ form.text }}</span>
          </div>
           <div class="info-item" v-if="['image', 'pdf', 'word'].includes(form.type)">
            <span class="info-label">文件</span>
            <span class="info-value">{{ fileList[0]?.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸</span>
            <span class="info-value">{{ form.size }} × {{ form.size }} px</span>
          </div>
          <div class="info-item">
            <span class="info-label">边距</span>
            <span class="info-value">{{ form.margin }} px</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { generateQRCode, generatePublicQRCode, checkUrlValidity } from '../../api/qrcode'
import { getSettings } from '../../api/settings'
import api from '../../api'

const props = defineProps({
  isPublic: {
    type: Boolean,
    default: false
  }
})
import {
  Link,
  Position,
  MagicStick,
  Download,
  PictureFilled,
  UploadFilled,
  Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['generated'])

const formRef = ref()
const loading = ref(false)
const isChecking = ref(false)
const preview = ref('')
const isMobile = ref(false)
const fileList = ref([])

const form = reactive({
  type: 'url',
  url: '',
  text: '',
  file: null,
  size: 300,
  margin: 10,
})

const getFileTip = () => {
  switch (form.type) {
    case 'image': return '支持 jpg，png和gif 格式，大小不超过 5MB'
    case 'pdf': return '支持 pdf 格式，大小不超过 5MB'
    case 'word': return '支持 doc和docx 格式，大小不超过 5MB'
    default: return ''
  }
}

const getTypeName = (type) => {
    const map = {
        url: '链接',
        text: '文本',
        image: '图片',
        pdf: 'PDF文档',
        word: 'Word文档'
    }
    return map[type] || type
}

const validateFile = (rule, value, callback) => {
    if (['image', 'pdf', 'word'].includes(form.type) && !form.file) {
        callback(new Error('请上传文件'))
    } else {
        callback()
    }
}

const rules = computed(() => {
    const commonRules = {}
    
    if (form.type === 'url') {
        commonRules.url = [
            { required: true, message: '请输入链接', trigger: 'blur' },
            {
              validator: (_, value, callback) => {
                if (!value) return callback()
                if (!/^https?:\/\//i.test(value)) {
                  return callback(new Error('请以 http:// 或 https:// 开头'))
                }
                callback()
              },
              trigger: 'blur',
            },
        ]
    } else if (form.type === 'text') {
        commonRules.text = [
            { required: true, message: '请输入文本内容', trigger: 'blur' }
        ]
    } else if (['image', 'pdf', 'word'].includes(form.type)) {
        commonRules.file = [
             { validator: validateFile, trigger: 'change' }
        ]
    }
    return commonRules
})

const checkUrl = async () => {
    const url = form.url?.trim()
    if (!url) {
        ElMessage.warning('请先输入链接')
        return
    }
    if (!/^https?:\/\//i.test(url)) {
        ElMessage.warning('链接格式不正确，请以 http:// 或 https:// 开头')
        return
    }

    isChecking.value = true
    try {
        const res = await checkUrlValidity(url)
        if (res.data && res.data.valid) {
             ElMessage.success('链接有效，可以正常访问')
        } else {
             ElMessage.warning(res.data?.message || '链接可能无法访问')
        }
    } catch (e) {
        ElMessage.error('链接检测失败：' + (e.response?.data?.message || e.message))
    } finally {
        isChecking.value = false
    }
}

const typeSettings = ref({
  url: true,
  text: true,
  image: true,
  pdf: true,
  word: true
})

const fetchSettings = async () => {
  if (props.isPublic) return // 公开模式下使用默认配置（全开启）

  try {
    const res = await getSettings()
    if (res.data) {
       // 适配后端返回格式
       const data = Array.isArray(res.data) 
         ? res.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) 
         : res.data

       const toBool = (val) => val === true || val === 1 || val === '1'

       if (data.qr_type_url_enabled !== undefined) typeSettings.value.url = toBool(data.qr_type_url_enabled)
       if (data.qr_type_text_enabled !== undefined) typeSettings.value.text = toBool(data.qr_type_text_enabled)
       if (data.qr_type_image_enabled !== undefined) typeSettings.value.image = toBool(data.qr_type_image_enabled)
       if (data.qr_type_pdf_enabled !== undefined) typeSettings.value.pdf = toBool(data.qr_type_pdf_enabled)
       if (data.qr_type_word_enabled !== undefined) typeSettings.value.word = toBool(data.qr_type_word_enabled)
       
       // 如果当前选中类型被禁用，切换到第一个可用类型
       if (!typeSettings.value[form.type]) {
          const firstAvailable = Object.keys(typeSettings.value).find(key => typeSettings.value[key])
          if (firstAvailable) {
              form.type = firstAvailable
              handleTypeChange()
          }
       }
    }
  } catch (e) {
    // console.error('Failed to fetch settings', e)
  }
}

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

const resolveQrUrl = (raw) => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const base = import.meta.env.VITE_API_BASE || api.defaults?.baseURL || ''
  const url = new URL(base, window.location.origin)
  const baseOrigin = `${url.protocol}//${url.host}`
  return raw.startsWith('/') ? baseOrigin + raw : `${baseOrigin}/${raw}`
}

const handleTypeChange = () => {
    form.url = ''
    form.text = ''
    form.file = null
    fileList.value = []
    preview.value = ''
    // Clear validation
    if (formRef.value) {
        formRef.value.clearValidate()
    }
}

const handleFileChange = (uploadFile) => {
    const rawFile = uploadFile.raw
    const sizeLimit = 5 * 1024 * 1024 // 5MB

    if (rawFile.size > sizeLimit) {
        ElMessage.error('文件大小不能超过 5MB')
        fileList.value = []
        form.file = null
        return
    }

    let validTypes = []
    if (form.type === 'image') validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (form.type === 'pdf') validTypes = ['application/pdf']
    if (form.type === 'word') validTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

    if (!validTypes.includes(rawFile.type)) {
         ElMessage.error('文件格式不正确')
         fileList.value = []
         form.file = null
         return
    }

    form.file = rawFile
    fileList.value = [uploadFile]
    // Trigger validation
     if (formRef.value) {
        formRef.value.validateField('file')
    }
}

const handleFileRemove = () => {
    form.file = null
    fileList.value = []
}

const isSubmitDisabled = computed(() => {
  if (loading.value) return true
  if (form.type === 'url') return !form.url
  if (form.type === 'text') return !form.text
  if (['image', 'pdf', 'word'].includes(form.type)) return !form.file
  return false
})

const submit = async () => {
  // Auto-trim inputs
  if (form.type === 'url') form.url = form.url.trim()
  if (form.type === 'text') form.text = form.text.trim()

  try {
    await formRef.value.validate()
  } catch (e) {
    // 验证失败，不执行后续逻辑，也不需要打印错误
    return
  }

  try {
    loading.value = true

    const formData = new FormData()
    formData.append('type', form.type)
    formData.append('size', form.size)
    formData.append('margin', form.margin)

    if (['image', 'pdf', 'word'].includes(form.type)) {
        formData.append('file', form.file)
    } else if (form.type === 'url') {
        formData.append('url', form.url)
    } else if (form.type === 'text') {
        formData.append('text', form.text)
    }

    const apiFunc = props.isPublic ? generatePublicQRCode : generateQRCode
    const res = await apiFunc(formData)

    if (res.data.success) {
      const qrUrl = resolveQrUrl(res.data.qr_url)
      preview.value = qrUrl
      emit('generated', res.data)
      ElMessage.success('二维码生成成功')

      // 滚动到预览区域
      setTimeout(() => {
        document.querySelector('.preview-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 100)
    } else {
      ElMessage.error(res.data.message || '生成失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '生成失败')
  } finally {
    loading.value = false
  }
}

const downloadQR = () => {
  if (!preview.value) return

  const link = document.createElement('a')
  link.href = preview.value
  link.download = `qrcode_${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('开始下载二维码')
}

const handleResize = () => {
  checkDevice()
}

onMounted(() => {
  checkDevice()
  fetchSettings()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.qr-generator-card {
  max-width: 700px;
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

.qr-form {
  padding: 0;
}

.form-row {
  display: flex;
  gap: 24px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 18px;
}

.unit-text {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
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

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-actions :deep(.el-form-item__content) {
    flex-direction: column;
    width: 100%;
  }

  .form-actions button {
    width: 100%;
    margin-left: 0 !important;
    margin-bottom: 12px;
  }

  .qr-generator-card {
    margin: 0 -10px;
    border-radius: 0;
  }
}
.preview-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #ebeef5;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.preview-icon {
  font-size: 18px;
  color: #67c23a;
}

.preview-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fb 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.qr-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  border: 2px solid #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.mobile-download-btn {
  width: 100%;
  max-width: 300px;
}

.success-tip {
  border-radius: 6px;
}

.qr-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.8;
}

.info-label {
  color: #606266;
  font-weight: 500;
  min-width: 45px;
  flex-shrink: 0;
}

.info-label::after {
  content: ':';
  margin-left: 2px;
}

.info-value {
  color: #303133;
  word-break: break-all;
  flex: 1;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .qr-generator-card {
    max-width: 100%;
  }

  .qr-generator-card :deep(.el-card__header) {
    padding: 14px 16px;
  }

  .qr-generator-card :deep(.el-card__body) {
    padding: 16px;
  }

  .header-title {
    font-size: 15px;
  }

  .qr-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .qr-form :deep(.el-form-item__label) {
    padding: 0;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .qr-form :deep(.el-input__inner) {
    height: 44px;
    font-size: 15px;
  }

  .qr-form :deep(.el-input__prefix) {
    font-size: 16px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-row .el-form-item {
    margin-bottom: 18px;
  }

  .form-row :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
  }

  .unit-text {
    margin-left: 12px;
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

  .preview-section {
    margin-top: 24px;
    padding-top: 24px;
  }

  .preview-header {
    margin-bottom: 16px;
  }

  .preview-content {
    gap: 16px;
  }

  .qr-wrapper {
    padding: 20px;
  }

  .qr-image {
    max-width: 260px;
  }

  .mobile-download-btn {
    max-width: 260px;
  }

  .qr-info {
    padding: 14px;
    gap: 10px;
  }

  .info-item {
    font-size: 13px;
  }

  .info-label {
    min-width: 40px;
  }
}

@media (max-width: 480px) {
  .qr-generator-card :deep(.el-card__header) {
    padding: 12px;
  }

  .qr-generator-card :deep(.el-card__body) {
    padding: 12px;
  }

  .header-icon {
    font-size: 16px;
  }

  .header-title {
    font-size: 14px;
  }

  .qr-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .qr-form :deep(.el-form-item__label) {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .qr-form :deep(.el-input__inner) {
    height: 42px;
    font-size: 14px;
  }

  .mobile-btn {
    height: 42px;
    font-size: 14px;
  }

  .unit-text {
    font-size: 13px;
  }

  .preview-section {
    margin-top: 20px;
    padding-top: 20px;
  }

  .qr-wrapper {
    padding: 16px;
  }

  .qr-image {
    max-width: 220px;
  }

  .mobile-download-btn {
    max-width: 220px;
    font-size: 14px;
  }

  .qr-info {
    padding: 12px;
    gap: 8px;
  }

  .info-item {
    font-size: 12px;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .qr-form :deep(.el-input__inner) {
    -webkit-tap-highlight-color: transparent;
  }

  .qr-form :deep(.el-button) {
    -webkit-tap-highlight-color: transparent;
  }
}

/* 聚焦优化 */
.qr-form :deep(.el-input.is-focus .el-input__inner) {
  border-color: #409eff;
}

/* 错误状态 */
.qr-form :deep(.el-form-item.is-error .el-input__inner) {
  border-color: #f56c6c;
}

.qr-form :deep(.el-form-item__error) {
  font-size: 12px;
  padding-top: 4px;
}

/* 数字输入框优化 */
.qr-form :deep(.el-input-number) {
  line-height: 32px;
}

.qr-form :deep(.el-input-number .el-input__inner) {
  text-align: left;
  padding-left: 12px;
  padding-right: 50px;
}

.qr-form :deep(.el-input-number .el-input-number__decrease),
.qr-form :deep(.el-input-number .el-input-number__increase) {
  width: 32px;
  font-size: 14px;
}

/* Upload styles */
.upload-demo {
  width: 100%;
}
</style>