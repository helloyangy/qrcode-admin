<template>
  <div class="public-colorful-qr-generator">
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      :label-width="isMobile ? '80px' : '90px'"
      :label-position="isMobile ? 'top' : 'right'"
      class="qr-form"
    >
      <!-- 类型选择 -->
      <div class="type-selector">
        <el-radio-group v-model="form.type" @change="handleTypeChange" size="large">
          <el-radio-button value="url">
            <el-icon><Link /></el-icon> 链接
          </el-radio-button>
          <el-radio-button value="text">
            <el-icon><Document /></el-icon> 文本
          </el-radio-button>
          <el-radio-button value="image">
            <el-icon><Picture /></el-icon> 图片
          </el-radio-button>
          <el-radio-button value="pdf">
            <el-icon><Files /></el-icon> PDF
          </el-radio-button>
          <el-radio-button value="word">
            <el-icon><Document /></el-icon> Word
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- URL 输入 -->
      <el-form-item
        v-if="form.type === 'url'"
        prop="url"
        class="input-item"
      >
        <el-input
          v-model="form.url"
          placeholder="请输入以 http:// 或 https:// 开头的链接"
          clearable
          :prefix-icon="Link"
          type="url"
          :disabled="loading"
          size="large"
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
        prop="text"
        class="input-item"
      >
        <el-input
          v-model="form.text"
          type="textarea"
          :rows="6"
          placeholder="请输入文本内容，支持换行"
          clearable
          :disabled="loading"
        />
      </el-form-item>

      <!-- 文件上传 -->
      <el-form-item
        v-if="['image', 'pdf', 'word'].includes(form.type)"
        prop="file"
        class="input-item"
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

      <!-- 样式配置区域 -->
      <div class="style-config-panel">
        <h3 class="panel-title">个性化样式配置</h3>
        
        <div class="config-grid">
            <!-- 基础设置 -->
            <div class="config-group">
                <h4>基础参数</h4>
                <el-form-item label="尺寸大小">
                  <el-input-number
                    v-model="form.size"
                    :min="100"
                    :max="1000"
                    :step="50"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>

                <el-form-item label="边距">
                  <el-input-number
                    v-model="form.margin"
                    :min="0"
                    :max="80"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
                
                <el-form-item label="纠错等级">
                    <el-select v-model="form.ecc" style="width: 100%">
                        <el-option label="低 (L)" value="L" />
                        <el-option label="中 (M)" value="M" />
                        <el-option label="较高 (Q)" value="Q" />
                        <el-option label="最高 (H)" value="H" />
                    </el-select>
                </el-form-item>
            </div>

            <!-- 颜色设置 -->
            <div class="config-group">
                <h4>颜色风格</h4>
                <el-form-item label="前景颜色">
                    <div class="color-picker-row">
                        <el-color-picker v-model="form.foreground" color-format="hex" :predefine="predefineColors" />
                        <span class="color-val">{{ form.foreground }}</span>
                    </div>
                </el-form-item>

                <el-form-item label="背景颜色">
                    <div class="color-picker-row">
                        <el-color-picker v-model="form.background" color-format="hex" :predefine="predefineColors" />
                        <span class="color-val">{{ form.background }}</span>
                    </div>
                </el-form-item>
            </div>

            <!-- 样式细节 -->
            <div class="config-group">
                <h4>码点与码眼</h4>
                <el-form-item label="码点样式">
                    <el-select v-model="form.style_dot" placeholder="默认" style="width: 100%">
                        <el-option label="方块 (Square)" value="square" />
                        <el-option label="圆角 (Round)" value="round" />
                    </el-select>
                </el-form-item>

                <el-form-item label="码眼样式">
                    <el-select v-model="form.style_eye" placeholder="默认" style="width: 100%">
                        <el-option label="方块 (Square)" value="square" />
                        <el-option label="圆角 (Round)" value="round" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="码眼颜色">
                     <div class="eye-colors">
                        <div class="eye-color-item">
                            <span>内框</span>
                            <el-color-picker v-model="form.eye_color_inner" color-format="hex" :predefine="predefineColors" size="small"/>
                        </div>
                        <div class="eye-color-item">
                            <span>外框</span>
                            <el-color-picker v-model="form.eye_color_outer" color-format="hex" :predefine="predefineColors" size="small"/>
                        </div>
                     </div>
                </el-form-item>
            </div>
        </div>
      </div>

      <div class="form-actions">
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="isSubmitDisabled"
          @click="submit"
          class="submit-btn"
        >
          <el-icon v-if="!loading"><MagicStick /></el-icon>
          <span>生成彩色二维码</span>
        </el-button>
      </div>
    </el-form>

    <!-- 预览区域 -->
    <transition name="el-fade-in">
      <div v-if="preview" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">生成结果</span>
            <div class="preview-actions">
              <el-button @click="downloadQR" type="primary" plain size="small">
                <el-icon><Download /></el-icon> 下载图片
              </el-button>
            </div>
          </div>
          
          <div class="qr-display">
            <img :src="preview" alt="二维码预览" class="qr-image" />
          </div>

          <div class="qr-info-tags">
             <el-tag size="small">{{ getTypeName(form.type) }}</el-tag>
             <el-tag size="small" type="info">{{ form.size }}x{{ form.size }}</el-tag>
             <el-tag size="small" :color="form.foreground" effect="dark" style="border:none">前景色</el-tag>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { generatePublicColorfulQRCode, checkUrlValidity } from '../../api/qrcode'
import {
  Link,
  Document,
  Picture,
  Files,
  MagicStick,
  Download,
  UploadFilled,
  Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '../../api'

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
    foreground: '#4F46E5', // 默认前景
    background: '#FFFFFF', // 默认背景
    ecc: 'H',              // L/M/Q/H
    style_dot: 'square',
    style_eye: 'square',
    eye_color_inner: null,
    eye_color_outer: null,
})

const predefineColors = [
    '#000000',
    '#ffffff',
    '#4F46E5',
    '#6366F1',
    '#EC4899',
    '#F97316',
    '#22C55E',
    '#0EA5E9',
]

const getFileTip = () => {
  switch (form.type) {
    case 'image': return '支持 jpg, png, gif 格式，不超过 5MB'
    case 'pdf': return '支持 pdf 格式，不超过 5MB'
    case 'word': return '支持 doc, docx 格式，不超过 5MB'
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
        ElMessage.warning('链接格式不正确')
        return
    }

    isChecking.value = true
    try {
        const res = await checkUrlValidity(url)
        if (res.data && res.data.valid) {
             ElMessage.success('链接有效')
        } else {
             ElMessage.warning(res.data?.message || '链接可能无法访问')
        }
    } catch (e) {
        ElMessage.error('链接检测失败')
    } finally {
        isChecking.value = false
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
  if (form.type === 'url') form.url = form.url.trim()
  if (form.type === 'text') form.text = form.text.trim()

  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  try {
    loading.value = true

    const formData = new FormData()
    formData.append('type', form.type)
    formData.append('size', form.size)
    formData.append('margin', form.margin)
    formData.append('foreground', form.foreground)
    formData.append('background', form.background)
    formData.append('ecc', form.ecc)
    formData.append('style_dot', form.style_dot)
    formData.append('style_eye', form.style_eye)
    if (form.eye_color_inner) formData.append('eye_color_inner', form.eye_color_inner)
    if (form.eye_color_outer) formData.append('eye_color_outer', form.eye_color_outer)

    if (['image', 'pdf', 'word'].includes(form.type)) {
        formData.append('file', form.file)
    } else if (form.type === 'url') {
        formData.append('url', form.url)
    } else if (form.type === 'text') {
        formData.append('text', form.text)
    }

    const res = await generatePublicColorfulQRCode(formData)

    if (res.data.success) {
      const qrUrl = resolveQrUrl(res.data.qr_url)
      preview.value = qrUrl
      emit('generated', res.data)
      ElMessage.success('生成成功')
      
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
  link.download = `qrcode_colorful_${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
.public-colorful-qr-generator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
}

.type-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.type-selector :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.type-selector :deep(.el-radio-button) {
  flex: 0 1 auto;
}

.type-selector :deep(.el-radio-button__inner) {
  padding: 12px 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-item {
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload) {
  width: 100%;
  display: block;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 2px dashed #e2e8f0;
  transition: all 0.3s;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-demo .el-icon--upload {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.upload-demo .el-upload__text {
  font-size: 16px;
  color: #64748b;
}

.upload-demo .el-upload__text em {
  color: #3b82f6;
  font-style: normal;
  font-weight: 600;
}

/* 样式配置面板 */
.style-config-panel {
  background: #f8fafc;
  border-radius: 12px;
  padding: 30px;
  margin-top: 40px;
}

.panel-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 18px;
  color: #334155;
  font-weight: 600;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.config-group h4 {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 20px;
  border-left: 3px solid #3b82f6;
  padding-left: 10px;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-val {
  font-size: 12px;
  color: #94a3b8;
  font-family: monospace;
}

.eye-colors {
  display: flex;
  gap: 15px;
}

.eye-color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.eye-color-item span {
  font-size: 12px;
  color: #64748b;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.submit-btn {
  width: 240px;
  height: 50px;
  font-size: 18px;
  border-radius: 25px;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px rgba(37, 99, 235, 0.3);
}

.preview-section {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.preview-card {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.qr-display {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: inline-block;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.qr-info-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .config-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .type-selector {
    margin-bottom: 24px;
  }

  .type-selector :deep(.el-radio-group) {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }

  .type-selector :deep(.el-radio-button) {
    flex: 1 1 calc(33.33% - 8px);
    min-width: 96px;
  }

  .type-selector :deep(.el-radio-button__inner) {
    padding: 8px 12px;
    font-size: 14px;
    width: 100%;
    justify-content: center;
  }

  .input-item {
    margin-bottom: 20px;
    max-width: 100%;
  }

  .input-item :deep(.el-input__inner) {
    height: 40px;
  }

  .input-item :deep(.el-textarea__inner) {
    min-height: 120px;
  }

  .input-item :deep(.el-input-group__append) {
    padding: 0;
  }

  .input-item :deep(.el-input-group__append .el-button) {
    height: 40px;
    padding: 0 10px;
    font-size: 12px;
  }

  .upload-demo :deep(.el-upload-dragger) {
    height: 160px;
  }

  .upload-demo .el-icon--upload {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .upload-demo .el-upload__text {
    font-size: 13px;
  }

  .upload-demo :deep(.el-upload__tip) {
    font-size: 12px;
  }
  
  .submit-btn {
    width: 100%;
  }
  
  .style-config-panel {
    padding: 20px;
  }

  .panel-title {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .preview-card {
    padding: 20px;
  }

  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .preview-actions {
    width: 100%;
  }

  .preview-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
