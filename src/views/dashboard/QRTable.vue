<template>
  <el-card class="qr-table-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <span class="header-title">二维码记录</span>
          <el-tag size="small" type="primary">{{ total }}</el-tag>
        </div>

        <!-- PC 批量删除 -->
        <div v-if="!isMobile" class="header-actions">
          <el-popconfirm
            title="确认删除选中的二维码记录？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            confirm-button-type="danger"
            @confirm="handleBatchDelete"
          >
            <template #reference>
              <el-button
                type="danger"
                size="small"
                :disabled="multipleSelection.length === 0"
              >
                批量删除
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </template>

    <!-- PC端表格视图 -->
    <div v-if="!isMobile" class="table-container">
      <el-table
        :data="list"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />

        <el-table-column prop="id" label="ID" width="70" />

        <el-table-column prop="type" label="类型" width="100">
           <template #default="{ row }">
             <el-tag :type="getTypeTagEffect(row.type)">{{ getTypeName(row.type) }}</el-tag>
           </template>
        </el-table-column>

        <el-table-column prop="content" min-width="240">
          <template #header>
            <el-icon style="margin-right: 4px; color: #409eff">
              <Link />
            </el-icon>
            <span>内容 / 链接</span>
          </template>
          <template #default="{ row }">
            <div class="url-cell">
              <span class="url-text" :title="row.content || row.original_url">
                  {{ row.content || row.original_url }}
              </span>
              <el-button
                type="primary"
                link
                size="small"
                @click="copyUrl(row.content || row.original_url)"
              >
                复制
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="source_file_path" label="源文件" min-width="150">
             <template #default="{ row }">
                <span v-if="row.source_file_path" :title="row.source_file_path" class="url-text">
                    {{ row.source_file_path }}
                </span>
                <span v-else class="text-gray">-</span>
             </template>
        </el-table-column>

        <el-table-column prop="qr_filename" width="200">
          <template #header>
            <el-icon style="margin-right: 4px; color: #909399">
              <Document />
            </el-icon>
            <span>对象存储 Key</span>
          </template>
          <template #default="{ row }">
              <span :title="row.qr_filename" class="url-text">{{ row.qr_filename }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="qr_size" width="100">
          <template #header>
            <el-icon style="margin-right: 4px; color: #67c23a">
              <FullScreen />
            </el-icon>
            <span>尺寸</span>
          </template>
          <template #default="{ row }">
            {{ row.qr_size }} px
          </template>
        </el-table-column>

        <el-table-column label="大小" width="100">
          <template #header>
            <el-icon style="margin-right: 4px; color: #e6a23c">
              <Files />
            </el-icon>
            <span>大小</span>
          </template>
          <template #default="{ row }">
            {{ formatBytes(row.file_size) }}
          </template>
        </el-table-column>

        <el-table-column prop="created_at" width="170">
          <template #header>
            <el-icon style="margin-right: 4px; color: #909399">
              <Clock />
            </el-icon>
            <span>时间</span>
          </template>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="预览" width="100">
          <template #header>
            <el-icon style="margin-right: 4px; color: #409eff">
              <Picture />
            </el-icon>
            <span>预览</span>
          </template>
          <template #default="{ row }">
            <el-image
              v-if="row.qr_url"
              :src="row.qr_url"
              :preview-src-list="[row.qr_url]"
              :preview-teleported="true"
              fit="contain"
              style="width: 40px; height: 40px; cursor: pointer"
            >
              <template #error>
                <div class="image-error">FAILED</div>
              </template>
            </el-image>
            <span v-else class="image-error">无图片</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              title="确认删除这条二维码记录？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端卡片视图 -->
    <div v-else class="mobile-list">
      <div v-for="item in list" :key="item.id" class="mobile-item">
        <div class="mobile-item-header">
          <div class="item-id">ID: {{ item.id }}</div>
          <el-tag size="small" :type="getTypeTagEffect(item.type)">{{ getTypeName(item.type) }}</el-tag>
        </div>
        
        <div class="mobile-item-content">
          <div class="info-row">
            <el-icon class="info-icon"><Link /></el-icon>
            <div class="content-wrapper">
              <span class="info-text">{{ item.content || item.original_url }}</span>
              <el-icon class="copy-icon" @click="copyUrl(item.content || item.original_url)"><CopyDocument /></el-icon>
            </div>
          </div>

          <div class="info-row" v-if="item.source_file_path">
             <el-icon class="info-icon"><Folder /></el-icon>
             <span class="info-text">{{ item.source_file_path }}</span>
          </div>

          <div class="info-row">
            <el-icon class="info-icon"><FullScreen /></el-icon>
            <span class="info-text">{{ item.qr_size }}px</span>
          </div>

          <div class="info-row">
            <el-icon class="info-icon"><Clock /></el-icon>
            <span class="info-text">{{ formatDate(item.created_at, true) }}</span>
          </div>
          
          <div class="mobile-actions">
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="handlePreview(item.qr_path)"
            >
              查看二维码
            </el-button>
            <el-popconfirm
              title="确认删除此记录？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(item.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <div v-if="list.length === 0" class="no-data">
      <el-empty description="暂无二维码记录" />
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        background
        :size="isMobile ? 'small' : 'default'"
        :pager-count="isMobile ? 5 : 7"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getQRCodes, deleteQRCode, batchDeleteQRCode } from '../../api/qrcode'
import {
  Link,
  Document,
  FullScreen,
  Files,
  Clock,
  Picture,
  Histogram,
  Folder,
  CopyDocument
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10) // 和后端默认保持一致
const isMobile = ref(window.innerWidth <= 768)

// 多选
const multipleSelection = ref([])

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
  fetchData()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})

const getTypeName = (type) => {
    const map = {
        url: '链接',
        text: '文本',
        image: '图片',
        pdf: 'PDF',
        word: 'Word'
    }
    return map[type] || type || '链接'
}

const getTypeTagEffect = (type) => {
    const map = {
        url: '',
        text: 'info',
        image: 'success',
        pdf: 'danger',
        word: 'warning'
    }
    return map[type] || ''
}

// 统一分页请求：带上 page 和 per_page
const fetchData = async (p = 1) => {
  try {
    page.value = p
    const res = await getQRCodes({
        page: p,
        per_page: pageSize.value,
    })

    const data = res.data || {}
    list.value = data.data || []
    total.value = Number(data.total || 0)
    pageSize.value = Number(data.per_page || pageSize.value)
    page.value = Number(data.current_page || p)
  } catch (e) {
    ElMessage.error('获取二维码记录失败')
  }
}

const handlePageChange = (p) => {
  fetchData(p)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData(1)
}

const handleSelectionChange = (rows) => {
  multipleSelection.value = rows || []
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

const formatDate = (value, isMobileFormat = false) => {
  if (!value) return ''
  const v = String(value).replace(' ', 'T')
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(value)

  if (isMobileFormat) {
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 单条删除
const handleDelete = async (row) => {
  if (!row?.id) return
  try {
    await deleteQRCode(row.id)
    ElMessage.success('删除成功')

    const isLastItemOfPage = list.value.length === 1 && page.value > 1
    await fetchData(isLastItemOfPage ? page.value - 1 : page.value)
    multipleSelection.value = []
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  const ids = multipleSelection.value.map((item) => item.id).filter(Boolean)
  if (!ids.length) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  
  try {
    await batchDeleteQRCode({ ids })
    ElMessage.success('批量删除成功')

    const isLastItemOfPage = list.value.length === ids.length && page.value > 1
    await fetchData(isLastItemOfPage ? page.value - 1 : page.value)
    multipleSelection.value = []
  } catch (e) {
    console.error(e)
    ElMessage.error('批量删除失败')
  }
}

// 移动端：二次确认再删除
const confirmDeleteMobile = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确认删除 ID 为「${item.id}」的二维码记录？`,
      '提示',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await handleDelete(item)
  } catch {
    // 取消，不处理
  }
}

const handleResize = () => {
  checkDevice()
}

onMounted(() => {
  checkDevice()
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.qr-table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.table-container {
  overflow-x: auto;
}

.url-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.url-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-gray {
    color: #909399;
}

.image-error {
  font-size: 12px;
  color: #f56c6c;
  text-align: center;
}

/* 移动端列表样式 */
.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background: #fff;
}

.mobile-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.mobile-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.content-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.info-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  cursor: pointer;
  color: #409eff;
}

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.pagination :deep(.el-pagination) {
  padding: 8px 12px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

/* PC端表格优化 */
:deep(.el-table__body-wrapper .el-table__cell),
:deep(.el-table__header-wrapper .el-table__cell) {
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

:deep(.el-image-viewer__wrapper) {
  background-color: rgba(0, 0, 0, 0.8);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .qr-table-card :deep(.el-card__header) {
    padding: 14px 16px;
  }

  .qr-table-card :deep(.el-card__body) {
    padding: 12px;
  }

  .header-title {
    font-size: 15px;
  }

  .mobile-item {
    padding: 10px;
  }

  .pagination {
    margin-top: 12px;
  }

  .pagination :deep(.el-pager li) {
    min-width: 32px;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
  }

  .pagination :deep(.btn-prev),
  .pagination :deep(.btn-next) {
    min-width: 32px;
    height: 32px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .qr-table-card :deep(.el-card__header) {
    padding: 12px;
  }

  .qr-table-card :deep(.el-card__body) {
    padding: 10px;
  }

  .header-title {
    font-size: 14px;
  }

  .mobile-list {
    gap: 10px;
  }

  .mobile-item {
    padding: 10px;
    border-radius: 6px;
  }

  .item-header {
    margin-bottom: 10px;
    padding-bottom: 8px;
  }

  .id-text {
    font-size: 12px;
  }

  .qr-thumb {
    width: 45px;
    height: 45px;
  }

  .thumb-error {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  .info-row {
    font-size: 12px;
  }

  .info-grid {
    gap: 6px;
  }

  .info-item {
    padding: 5px 6px;
    font-size: 11px;
  }

  .key-text {
    font-size: 10px;
  }

  .copy-btn {
    font-size: 11px;
    padding: 0 6px;
  }

  .pagination :deep(.el-pager li) {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
  }

  .pagination :deep(.btn-prev),
  .pagination :deep(.btn-next) {
    min-width: 28px;
    height: 28px;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .mobile-item {
    -webkit-tap-highlight-color: transparent;
  }

  .qr-thumb {
    -webkit-tap-highlight-color: transparent;
  }

  .copy-btn {
    min-height: 32px;
  }
}
</style>