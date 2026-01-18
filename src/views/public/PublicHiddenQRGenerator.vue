<template>
  <div class="public-hidden-qr-generator">
    <div class="main-layout" :class="{ 'is-mobile': isMobile }">
      <!-- 左侧：表单配置 -->
      <div class="form-section card-box">
        <h3 class="section-title">
          <el-icon><Tools /></el-icon> 配置参数
        </h3>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="qr-form"
        >
          <!-- 1. 上传区域 -->
          <div class="upload-group">
            <el-form-item label="1. 上传背景图" prop="bg_image">
              <el-upload
                class="full-width-upload"
                drag
                :auto-upload="false"
                :show-file-list="false"
                accept="image/png,image/jpeg,image/jpg"
                :on-change="onBgUploadChange"
              >
                <div v-if="bgPreview" class="preview-thumb">
                    <img :src="bgPreview" />
                    <div class="overlay">点击更换</div>
                </div>
                <div v-else class="upload-placeholder">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">建议选择亮色、纹理较细的图片</div>
                </div>
              </el-upload>
            </el-form-item>

            <el-form-item label="2. 上传二维码" prop="qr_image">
              <el-upload
                class="full-width-upload"
                drag
                :auto-upload="false"
                :show-file-list="false"
                accept="image/png,image/jpeg,image/jpg"
                :on-change="onQrUploadChange"
              >
                <div v-if="qrPreview" class="preview-thumb">
                    <img :src="qrPreview" />
                    <div class="overlay">点击更换</div>
                </div>
                <div v-else class="upload-placeholder">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">建议黑白分明、边缘清晰</div>
                </div>
              </el-upload>
            </el-form-item>
          </div>

          <el-divider>融合参数</el-divider>

          <!-- 2. 核心参数 -->
          <div class="params-group">
            <div class="param-row">
                <el-form-item label="透明度 (Alpha)">
                  <el-slider v-model="form.alpha" :min="1" :max="255" show-input input-size="small" />
                </el-form-item>
            </div>
            
            <div class="param-row">
                <el-form-item label="阈值 (Threshold)">
                  <el-slider v-model="form.threshold" :min="0" :max="255" show-input input-size="small" />
                </el-form-item>
            </div>

            <div class="param-row">
                 <el-form-item label="二维码大小 (px)">
                  <el-input-number
                    v-model="form.qr_size"
                    :min="50"
                    :max="3000"
                    :step="10"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
            </div>

            <div class="param-row">
                <el-form-item label="位置预设">
                  <el-select
                    v-model="form.position"
                    @change="onPositionChange"
                    placeholder="选择位置"
                    style="width: 100%"
                  >
                    <el-option label="自定义 (可在右侧拖拽)" value="custom" />
                    <el-option label="居中" value="center" />
                    <el-option label="右下" value="bottom-right" />
                    <el-option label="左上" value="top-left" />
                    <el-option label="右上" value="top-right" />
                    <el-option label="左下" value="bottom-left" />
                  </el-select>
                </el-form-item>
            </div>
            
            <div class="coords-row" v-if="form.position === 'custom'">
                <el-form-item label="X">
                   <el-input-number v-model="form.x" controls-position="right" size="small" style="width: 100%" />
                </el-form-item>
                <el-form-item label="Y">
                   <el-input-number v-model="form.y" controls-position="right" size="small" style="width: 100%" />
                </el-form-item>
            </div>
          </div>

          <div class="submit-area">
            <el-button
              type="primary"
              :loading="loading"
              @click="submit"
              class="submit-btn"
              size="large"
            >
              <el-icon v-if="!loading"><MagicStick /></el-icon>
              <span>立即融合生成</span>
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 右侧：交互预览区域 -->
      <div class="preview-section-interactive card-box">
        <h3 class="section-title">
          <el-icon><View /></el-icon> 实时预览与调整
        </h3>
        
        <div class="tip-bar">
            <el-alert title="您可以直接在下方画布中拖拽移动二维码位置，或拖拽右下角手柄缩放大小" type="info" :closable="false" show-icon />
        </div>

        <div
          class="canvas-container"
          ref="canvasContainerRef"
          v-loading="!bgPreview"
          element-loading-text="请先在左侧上传背景图"
        >
          <div v-if="bgPreview" class="canvas-wrapper">
            <!-- 背景层 -->
            <img
              ref="bgImgRef"
              :src="bgPreview"
              class="bg-layer"
              @load="onBgLoad"
              alt="Background"
            />

            <!-- 二维码层 (可拖拽) -->
            <div
              v-if="qrPreview"
              class="qr-layer"
              :style="qrLayerStyle"
              @mousedown="startDrag"
              @touchstart="startDrag"
            >
              <img :src="qrPreview" class="qr-img-content" alt="QR" />
              <!-- 拖拽手柄/边框 -->
              <div class="qr-border"></div>
              
              <!-- 缩放手柄 -->
              <div 
                class="resize-handle"
                @mousedown.stop="startResize"
                @touchstart.stop="startResize"
              >
                <el-icon><BottomRight /></el-icon>
              </div>
            </div>
            
            <div v-else class="qr-placeholder">
              等待上传二维码...
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-content">
                <el-icon class="empty-icon"><PictureFilled /></el-icon>
                <p>预览区域</p>
            </div>
          </div>
        </div>

        <!-- 结果展示 -->
        <transition name="el-zoom-in-center">
            <div v-if="resultUrl" class="result-area">
              <div class="result-header">
                <span>生成结果</span>
                <el-tag type="success" size="small">生成成功</el-tag>
              </div>
              
              <div class="result-img-wrapper">
                  <el-image
                    :src="resultUrl"
                    fit="contain"
                    :preview-src-list="[resultUrl]"
                    class="result-img"
                  />
              </div>
              
              <div class="result-actions">
                <el-button type="primary" @click="downloadQR" icon="Download">下载图片</el-button>
                <el-button @click="copy(resultUrl)" icon="CopyDocument">复制链接</el-button>
              </div>
            </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  UploadFilled,
  MagicStick,
  Download,
  PictureFilled,
  View,
  BottomRight,
  Tools,
  CopyDocument
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { generatePublicHiddenQRCode } from '../../api/qrcode'

const isMobile = ref(false)
const loading = ref(false)
const formRef = ref()

// 资源
const bgFile = ref(null)
const bgPreview = ref('')
const qrFile = ref(null)
const qrPreview = ref('')
const resultUrl = ref('')
const bgMeta = ref(null)

// 交互相关
const bgImgRef = ref(null)
const canvasContainerRef = ref(null)
const bgRealW = ref(0)
const bgRealH = ref(0)
const displayScale = ref(1) // displayW / realW

// 拖拽状态
const isDragging = ref(false)
const dragStart = { x: 0, y: 0, left: 0, top: 0 }

// 缩放状态
const isResizing = ref(false)
const resizeStart = { x: 0, initialSize: 0 }

const form = reactive({
  alpha: 150,
  threshold: 200,
  qr_size: 300,
  position: 'center', // 默认居中
  padding: 20,
  x: 0,
  y: 0,
})

const rules = {
  bg_image: [{ required: true, message: '请上传背景图' }],
  qr_image: [{ required: true, message: '请上传二维码' }],
  qr_size: [{ required: true, message: '请输入大小' }],
}

// 计算二维码在画布上的样式
const qrLayerStyle = computed(() => {
  const scale = displayScale.value
  const w = form.qr_size * scale
  const h = form.qr_size * scale
  const left = form.x * scale
  const top = form.y * scale
  
  return {
    width: `${w}px`,
    height: `${h}px`,
    left: `${left}px`,
    top: `${top}px`,
    position: 'absolute',
    cursor: 'move',
    zIndex: 10
  }
})

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 900 // 调宽一点，因为是左右布局
}

const getImageMetaFromFile = (rawFile) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(rawFile)
    const img = new Image()
    img.onload = () => {
      const meta = {
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0,
        sizeBytes: rawFile.size || 0,
      }
      URL.revokeObjectURL(url)
      resolve(meta)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败'))
    }
    img.src = url
  })
}

const formatMB = (bytes) => {
  if (!bytes || bytes <= 0) return '0MB'
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

const isHardTooLargeBg = (meta) => {
  const pixels = (meta?.width || 0) * (meta?.height || 0)
  return meta?.width > 8000 || meta?.height > 8000 || pixels > 30000000 || meta?.sizeBytes > 25 * 1024 * 1024
}

const isWarnTooLargeBg = (meta) => {
  return meta?.width > 4000 || meta?.height > 3000 || meta?.sizeBytes > 8 * 1024 * 1024
}

const buildBgTooLargeMessage = (meta, hard = false) => {
  const sizeText = formatMB(meta?.sizeBytes || 0)
  const dimText = `${meta?.width || 0}×${meta?.height || 0}`
  if (hard) {
    return `背景图过大（${dimText}，${sizeText}），请压缩分辨率/体积后再上传`
  }
  return `背景图较大（${dimText}，${sizeText}），可能生成失败，建议压缩到≤4000×3000`
}

// 图片上传处理
const onBgUploadChange = async (file) => {
  if (!file.raw) return
  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('请上传图片格式')
    return
  }
  try {
    const meta = await getImageMetaFromFile(file.raw)
    if (isHardTooLargeBg(meta)) {
      ElMessage.error(buildBgTooLargeMessage(meta, true))
      return
    }
    if (isWarnTooLargeBg(meta)) {
      ElMessage.warning(buildBgTooLargeMessage(meta, false))
    }

    bgMeta.value = meta
    bgFile.value = file.raw
    if (bgPreview.value) URL.revokeObjectURL(bgPreview.value)
    bgPreview.value = URL.createObjectURL(file.raw)
  } catch {
    ElMessage.error('背景图读取失败，请重新选择')
  }
}

const onQrUploadChange = (file) => {
  if (!file.raw) return
  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('请上传图片格式')
    return
  }
  qrFile.value = file.raw
  if (qrPreview.value) URL.revokeObjectURL(qrPreview.value)
  qrPreview.value = URL.createObjectURL(file.raw)
  
  // 上传二维码后，如果位置是预设的，重新计算位置
  nextTick(() => recalcPosition())
}

const onBgLoad = () => {
  if (!bgImgRef.value) return
  bgRealW.value = bgImgRef.value.naturalWidth
  bgRealH.value = bgImgRef.value.naturalHeight
  if (bgFile.value && (!bgMeta.value || !bgMeta.value.width || !bgMeta.value.height)) {
    bgMeta.value = {
      width: bgRealW.value,
      height: bgRealH.value,
      sizeBytes: bgFile.value.size || 0,
    }
  }
  updateScale()
  recalcPosition()
}

const updateScale = () => {
  if (!bgImgRef.value) return
  const displayW = bgImgRef.value.offsetWidth
  if (bgRealW.value > 0) {
    displayScale.value = displayW / bgRealW.value
  }
}

// 重新计算位置（针对预设值）
const recalcPosition = () => {
  if (!bgRealW.value || !bgRealH.value) return
  
  const size = form.qr_size
  const pad = form.padding || 20
  
  let newX = 0
  let newY = 0
  
  switch (form.position) {
    case 'center':
      newX = (bgRealW.value - size) / 2
      newY = (bgRealH.value - size) / 2
      break
    case 'top-left':
      newX = pad
      newY = pad
      break
    case 'top-right':
      newX = bgRealW.value - size - pad
      newY = pad
      break
    case 'bottom-left':
      newX = pad
      newY = bgRealH.value - size - pad
      break
    case 'bottom-right':
      newX = bgRealW.value - size - pad
      newY = bgRealH.value - size - pad
      break
    case 'custom':
      // 保持当前 xy 不变，除非越界
      return
  }
  
  form.x = Math.round(newX)
  form.y = Math.round(newY)
}

// 监听位置预设变化
const onPositionChange = () => {
  if (form.position !== 'custom') {
    recalcPosition()
  }
}

// 监听 size 变化，如果是预设位置，也要微调
watch(() => form.qr_size, () => {
  if (form.position !== 'custom') {
    recalcPosition()
  }
})

// 拖拽逻辑
const startDrag = (e) => {
  e.preventDefault()
  isDragging.value = true
  
  // 兼容 touch
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  
  dragStart.x = clientX
  dragStart.y = clientY
  dragStart.left = form.x
  dragStart.top = form.y
  
  // 切换为自定义模式
  if (form.position !== 'custom') {
    form.position = 'custom'
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault() // 防止滚动
  
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  
  const deltaX = clientX - dragStart.x
  const deltaY = clientY - dragStart.y
  
  // 将屏幕位移转换为真实像素位移
  const realDeltaX = deltaX / displayScale.value
  const realDeltaY = deltaY / displayScale.value
  
  form.x = Math.round(dragStart.left + realDeltaX)
  form.y = Math.round(dragStart.top + realDeltaY)
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 缩放逻辑
const startResize = (e) => {
  e.preventDefault()
  
  isResizing.value = true
  
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  
  resizeStart.x = clientX
  resizeStart.initialSize = form.qr_size
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResize, { passive: false })
  document.addEventListener('touchend', stopResize)
}

const onResize = (e) => {
  if (!isResizing.value) return
  e.preventDefault()
  
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const deltaX = clientX - resizeStart.x
  
  // 转换为真实像素变化
  const realDelta = deltaX / displayScale.value
  
  let newSize = resizeStart.initialSize + realDelta

  // 限制范围
  if (newSize < 50) newSize = 50
  if (newSize > 3000) newSize = 3000
  
  form.qr_size = Math.round(newSize)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResize)
}

// 提交
const submit = async () => {
  if (!bgFile.value || !qrFile.value) {
    ElMessage.warning('请先上传背景和二维码')
    return
  }

  if (!bgMeta.value || !bgMeta.value.width || !bgMeta.value.height) {
    try {
      bgMeta.value = await getImageMetaFromFile(bgFile.value)
    } catch {
      bgMeta.value = null
    }
  }
  if (bgMeta.value && isHardTooLargeBg(bgMeta.value)) {
    ElMessage.error(buildBgTooLargeMessage(bgMeta.value, true))
    return
  }
  
  loading.value = true
  resultUrl.value = ''
  
  try {
    const fd = new FormData()
    fd.append('bg_image', bgFile.value)
    fd.append('qr_image', qrFile.value)
    fd.append('alpha', form.alpha)
    fd.append('threshold', form.threshold)
    fd.append('qr_size', form.qr_size)
    fd.append('position', form.position)
    
    // 强制传坐标，后端如果 position=custom 会用
    fd.append('x', Math.round(form.x))
    fd.append('y', Math.round(form.y))
    fd.append('padding', form.padding)
    
    const res = await generatePublicHiddenQRCode(fd)
    if (res.data?.qr_url) {
      resultUrl.value = res.data.qr_url
      ElMessage.success('融合成功')
    }
  } catch (e) {
    const status = e?.response?.status
    const data = e?.response?.data
    const backendMessage = data?.message || data?.error || ''
    const errors = data?.errors || {}
    const errorsText = Object.values(errors).flat().filter(Boolean).join(' ')
    const rawText = `${backendMessage} ${errorsText} ${e?.message || ''}`.trim()
    const lowered = rawText.toLowerCase()

    let msg = backendMessage || e?.message || '未知错误'
    if (
      status === 413 ||
      lowered.includes('payload too large') ||
      lowered.includes('request entity too large') ||
      lowered.includes('post_max_size') ||
      lowered.includes('upload_max_filesize')
    ) {
      msg = '图片过大，超过服务器上传限制。请压缩背景图后重试'
    } else if (
      lowered.includes('allowed memory size') ||
      lowered.includes('out of memory') ||
      lowered.includes('memory exhausted')
    ) {
      msg = '背景图分辨率过高导致服务器内存不足。请压缩背景图后重试'
    } else if (status === 422) {
      if (errors?.bg_image?.length) msg = `背景图不符合要求：${errors.bg_image[0]}`
      else if (errors?.qr_image?.length) msg = `二维码不符合要求：${errors.qr_image[0]}`
      else if (errorsText) msg = errorsText
      else if (backendMessage) msg = backendMessage
    } else if (e?.code === 'ECONNABORTED' || lowered.includes('timeout')) {
      msg = '请求超时，图片可能过大或网络较慢。请压缩后重试'
    } else if (status >= 500 && isWarnTooLargeBg(bgMeta.value)) {
      msg = '服务器处理失败，背景图可能过大。请压缩后重试'
    }

    ElMessage.error(`生成失败：${msg}`)
  } finally {
    loading.value = false
  }
}

const downloadQR = () => {
  const a = document.createElement('a')
  a.href = resultUrl.value
  a.download = `hidden_qr_${Date.now()}.png`
  a.click()
}

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 窗口大小改变时，displayScale 会变，需要重新计算
window.addEventListener('resize', () => {
  checkDevice()
  updateScale()
})

onMounted(() => {
  checkDevice()
})
</script>

<style scoped>
.public-hidden-qr-generator {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 16px;
}

.main-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  width: 100%;
}

.main-layout.is-mobile {
  flex-direction: column;
}

.card-box {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-section {
  flex: 0 0 380px;
  width: 380px;
  max-width: 440px;
}

.preview-section-interactive {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.section-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 上传样式优化 */
.full-width-upload {
  width: 100%;
}

.full-width-upload :deep(.el-upload) {
    width: 100%;
    display: block;
}

.full-width-upload :deep(.el-upload-dragger) {
    width: 100%;
    height: 140px;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: #f8fafc;
    border: 2px dashed #e2e8f0;
    transition: all 0.3s;
}

.full-width-upload :deep(.el-upload-dragger:hover) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.upload-placeholder .el-icon--upload {
    font-size: 32px;
    color: #94a3b8;
    margin-bottom: 8px;
}

.upload-placeholder .el-upload__text {
    font-size: 14px;
    color: #64748b;
}

.preview-thumb {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
}

.preview-thumb img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.preview-thumb .overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    backdrop-filter: blur(2px);
}

.preview-thumb:hover .overlay {
    opacity: 1;
}

.coords-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
}

.coords-row :deep(.el-form-item) {
  flex: 1;
  min-width: 140px;
  margin-bottom: 0;
}

.submit-area {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  font-size: 18px;
  border-radius: 25px;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  transition: all 0.3s;
  font-weight: 600;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px rgba(37, 99, 235, 0.3);
}

/* 预览画布区域 */
.tip-bar {
    margin-bottom: 15px;
}

.canvas-container {
  position: relative;
  width: 100%;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e1;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  line-height: 0;
}

.bg-layer {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
}

.qr-layer {
  border: 2px dashed rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.2);
  touch-action: none;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.qr-layer:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: #60a5fa;
}

.qr-img-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.8;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  right: -8px;
  bottom: -8px;
  width: 24px;
  height: 24px;
  background: #fff;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: se-resize;
  z-index: 11;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: #3b82f6;
}

.empty-state {
    color: #94a3b8;
}
.empty-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

/* 结果展示区 */
.result-area {
    margin-top: 30px;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
}

.result-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    font-weight: 600;
}

.result-img-wrapper {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.result-img {
    max-height: 400px;
    max-width: 100%;
}

.result-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
}

@media (max-width: 1200px) {
  .main-layout {
    gap: 20px;
  }

  .form-section {
    flex-basis: 360px;
    width: 360px;
  }
}

@media (max-width: 900px) {
    .public-hidden-qr-generator {
        padding: 16px 12px;
    }

    .card-box {
        padding: 16px;
    }

    .main-layout {
        gap: 16px;
    }

    .form-section {
        width: 100%;
        flex: none;
        max-width: none;
    }

    .coords-row {
        flex-wrap: wrap;
    }

    .canvas-container {
        min-height: 320px;
    }

    .result-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .result-actions :deep(.el-button) {
        width: 100%;
    }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 16px;
  }

  .submit-btn {
    height: 46px;
    font-size: 16px;
  }

  .canvas-container {
    min-height: 260px;
  }

  .result-img-wrapper {
    padding: 12px;
  }
}
</style>
