<template>
  <el-card class="file-manager-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <span class="header-title">小程序上传文件</span>
          <el-tag size="small" type="primary">{{ total }}</el-tag>
        </div>
        <div class="header-actions">
          <el-popconfirm
            title="确认删除选中的文件？"
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
          <el-button size="small" @click="refreshList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </template>

    <div v-if="!isMobile" class="table-container">
      <el-table
        :data="list"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="原文件名" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="file-name" :title="getFileName(row)">
              {{ getFileName(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="存储 Key" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="file-key" :title="getFileKey(row)">
              {{ getFileKey(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="地址" min-width="260">
          <template #default="{ row }">
            <div class="url-cell" v-if="getFileUrl(row)">
              <span class="url-text" :title="getFileUrl(row)">
                {{ getFileUrl(row) }}
              </span>
              <el-button type="primary" link size="small" @click="copyUrl(getFileUrl(row))">
                复制
              </el-button>
            </div>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row)">{{ getTypeLabel(row) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatBytes(getFileSize(row)) }}
          </template>
        </el-table-column>

        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.last_modified || row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="预览" width="110">
          <template #default="{ row }">
            <el-image
              v-if="isImageFile(row) && getFileUrl(row)"
              :src="getFileUrl(row)"
              :preview-src-list="[getFileUrl(row)]"
              :preview-teleported="true"
              fit="contain"
              style="width: 44px; height: 44px; cursor: pointer"
            >
              <template #error>
                <div class="image-error">FAILED</div>
              </template>
            </el-image>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="getFileUrl(row)"
              type="primary"
              link
              size="small"
              @click="openUrl(getFileUrl(row))"
            >
              打开
            </el-button>
            <el-popconfirm
              title="确认删除此文件？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="mobile-list">
      <div v-for="item in list" :key="item.id" class="mobile-item">
        <div class="mobile-item-header">
          <div class="item-id">ID: {{ item.id }}</div>
          <el-tag size="small" :type="getTypeTag(item)">{{ getTypeLabel(item) }}</el-tag>
        </div>
        <div class="mobile-item-content">
          <div class="info-row">
            <el-icon class="info-icon"><Document /></el-icon>
            <span class="info-text">{{ getFileName(item) }}</span>
          </div>
          <div class="info-row" v-if="getFileUrl(item)">
            <el-icon class="info-icon"><Link /></el-icon>
            <div class="content-wrapper">
              <span class="info-text">{{ getFileUrl(item) }}</span>
              <el-icon class="copy-icon" @click="copyUrl(getFileUrl(item))">
                <CopyDocument />
              </el-icon>
            </div>
          </div>
          <div class="info-row">
            <el-icon class="info-icon"><Files /></el-icon>
            <span class="info-text">{{ formatBytes(getFileSize(item)) }}</span>
          </div>
          <div class="info-row">
            <el-icon class="info-icon"><Clock /></el-icon>
            <span class="info-text">
              {{ formatDate(item.last_modified || item.created_at, true) }}
            </span>
          </div>
        </div>
        <div class="mobile-actions">
          <el-button
            v-if="getFileUrl(item)"
            type="primary"
            link
            size="small"
            @click="openUrl(getFileUrl(item))"
          >
            打开
          </el-button>
          <el-button type="danger" link size="small" @click="confirmDeleteMobile(item)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="list.length === 0" class="no-data">
      <el-empty description="暂无文件" />
    </div>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'
import {
  Refresh,
  Document,
  Link,
  Files,
  Clock,
  CopyDocument,
} from '@element-plus/icons-vue'
import {
  getMiniappFiles,
  deleteMiniappFile,
  batchDeleteMiniappFiles,
} from '../../api/file'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const multipleSelection = ref([])

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

const fetchData = async (p = 1) => {
  loading.value = true
  try {
    page.value = p
    const res = await getMiniappFiles({
      page: p,
      per_page: pageSize.value,
    })
    const raw = res.data || {}
    const root =
      raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw
    const items =
      (Array.isArray(root.data) && root.data) ||
      (Array.isArray(root.list) && root.list) ||
      (Array.isArray(root.items) && root.items) ||
      (Array.isArray(root.records) && root.records) ||
      []
    list.value = items
    total.value = Number(root.total || root.count || raw.total || raw.count || items.length || 0)
    pageSize.value = Number(root.per_page || raw.per_page || pageSize.value)
    page.value = Number(root.page || root.current_page || raw.page || raw.current_page || p)
  } catch (e) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  fetchData(page.value)
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

const getFileName = (row) => {
  return (
    row?.original_filename ||
    row?.original_name ||
    row?.filename ||
    row?.file_name ||
    row?.name ||
    row?.key ||
    row?.path ||
    row?.url ||
    '-'
  )
}

const getFileKey = (row) => {
  return (
    row?.key ||
    row?.storage_key ||
    row?.path ||
    row?.file_path ||
    row?.filepath ||
    row?.object_key ||
    row?.filename ||
    row?.file_name ||
    '-'
  )
}

const getFileUrl = (row) => {
  return (
    row?.url ||
    row?.file_url ||
    row?.public_url ||
    row?.preview_url ||
    row?.download_url ||
    row?.path_url ||
    ''
  )
}

const getFileSize = (row) => {
  return row?.size || row?.file_size || row?.bytes || 0
}

const getFileExtension = (name) => {
  if (!name) return ''
  const parts = String(name).split('.')
  if (parts.length < 2) return ''
  return parts.pop().toLowerCase()
}

const isImageFile = (row) => {
  const mime = row?.mime_type || row?.content_type || ''
  if (mime.startsWith('image/')) return true
  const ext = getFileExtension(getFileName(row))
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
}

const getTypeLabel = (row) => {
  const mime = row?.mime_type || row?.content_type || ''
  if (mime.includes('pdf')) return 'PDF'
  if (mime.startsWith('image/')) return '图片'
  const ext = getFileExtension(getFileName(row))
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return '图片'
  if (ext === 'pdf') return 'PDF'
  return '文件'
}

const getTypeTag = (row) => {
  const label = getTypeLabel(row)
  if (label === '图片') return 'success'
  if (label === 'PDF') return 'warning'
  return 'info'
}

const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const openUrl = (url) => {
  if (!url) return
  window.open(url, '_blank')
}

const handleDelete = async (row) => {
  const key = getFileKey(row)
  if (!key || key === '-') return
  try {
    await deleteMiniappFile(key)
    ElMessage.success('删除成功')
    const isLastItemOfPage = list.value.length === 1 && page.value > 1
    await fetchData(isLastItemOfPage ? page.value - 1 : page.value)
    multipleSelection.value = []
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const handleBatchDelete = async () => {
  const keys = multipleSelection.value.map((item) => getFileKey(item)).filter(Boolean)
  if (!keys.length) {
    ElMessage.warning('请先选择要删除的文件')
    return
  }
  try {
    await batchDeleteMiniappFiles({ keys })
    ElMessage.success('批量删除成功')
    const isLastItemOfPage = list.value.length === keys.length && page.value > 1
    await fetchData(isLastItemOfPage ? page.value - 1 : page.value)
    multipleSelection.value = []
  } catch (e) {
    ElMessage.error('批量删除失败')
  }
}

const confirmDeleteMobile = async (item) => {
  const key = getFileKey(item)
  try {
    await ElMessageBox.confirm(
      `确认删除「${key}」的文件？`,
      '提示',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await handleDelete(item)
  } catch {}
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
.file-manager-card {
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.url-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.url-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--primary-color);
}

.file-name,
.file-key {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.text-gray {
  color: var(--text-placeholder);
}

.image-error {
  width: 44px;
  height: 44px;
  font-size: 10px;
  color: var(--danger-color);
  background: var(--bg-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-item {
  border: none;
  border-radius: 12px;
  padding: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.mobile-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.item-id {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
}

.mobile-item-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-regular);
}

.info-icon {
  font-size: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.content-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow: hidden;
}

.copy-icon {
  font-size: 16px;
  color: var(--primary-color);
  cursor: pointer;
  flex-shrink: 0;
  padding: 4px;
}

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.pagination :deep(.el-pagination) {
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .file-manager-card {
    background: transparent !important;
    box-shadow: none !important;
  }

  .file-manager-card :deep(.el-card__header) {
    padding: 0 0 16px 0;
    border: none;
    background: transparent;
  }

  .file-manager-card :deep(.el-card__body) {
    padding: 0;
    background: transparent;
  }

  .header-title {
    font-size: 20px;
  }

  .pagination {
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .mobile-item {
    padding: 12px;
  }

  .info-row {
    font-size: 13px;
  }
}
</style>
