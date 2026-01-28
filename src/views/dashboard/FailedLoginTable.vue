<template>
  <el-card class="failed-login-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <span class="header-title">破解登录记录</span>
          <el-tag size="small" type="danger">{{ total }}</el-tag>
        </div>

        <!-- 仅 PC 显示批量删除 -->
        <div v-if="!isMobile" class="header-actions">
          <el-popconfirm
            title="确认删除选中的破解记录？"
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

        <el-table-column prop="account" width="200">
          <template #header>
            <el-icon style="margin-right: 4px; color: #409eff">
              <UserFilled />
            </el-icon>
            <span>账号</span>
          </template>
        </el-table-column>

        <el-table-column prop="ip_address" width="160">
          <template #header>
            <el-icon style="margin-right: 4px; color: #67c23a">
              <Location />
            </el-icon>
            <span>IP 地址</span>
          </template>
        </el-table-column>

        <el-table-column prop="attempts" width="120">
          <template #header>
            <el-icon style="margin-right: 4px; color: #e6a23c">
              <Refresh />
            </el-icon>
            <span>尝试次数</span>
          </template>
          <template #default="{ row }">
            <span :style="{ color: row.attempts >= 5 ? '#f56c6c' : '#606266' }">
              <el-icon v-if="row.attempts >= 5" style="margin-right: 2px">
                <WarningFilled />
              </el-icon>
              {{ row.attempts }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="last_attempted_at"
          width="180"
          :formatter="formatDate"
        >
          <template #header>
            <el-icon style="margin-right: 4px; color: #909399">
              <Clock />
            </el-icon>
            <span>时间</span>
          </template>
        </el-table-column>

        <el-table-column label="浏览器" min-width="200">
          <template #header>
            <el-icon style="margin-right: 4px; color: #409eff">
              <Monitor />
            </el-icon>
            <span>浏览器</span>
          </template>
          <template #default="{ row }">
            <span class="ua-text">
              {{ parseUA(row).browser }} - {{ parseUA(row).os }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row)">
              详情
            </el-button>
            <el-popconfirm
              title="确认删除这条破解记录？"
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
      <div
        v-for="item in list"
        :key="item.id"
        class="mobile-item"
        @click="openDetail(item)"
      >
        <div class="item-header">
          <div class="item-account">
            <el-icon class="icon-user"><UserFilled /></el-icon>
            <span class="account-text">{{ item.account }}</span>
          </div>
          <div class="item-header-right">
            <el-tag
              :type="item.attempts >= 5 ? 'danger' : 'warning'"
              size="small"
            >
              {{ item.attempts }} 次
            </el-tag>
            <el-button
              type="danger"
              link
              size="small"
              class="delete-btn-mobile"
              @click.stop="confirmDeleteMobile(item)"
            >
              删除
            </el-button>
          </div>
        </div>

        <div class="item-info">
          <div class="info-row">
            <el-icon class="info-icon"><Location /></el-icon>
            <span class="info-text">{{ item.ip_address }}</span>
          </div>

          <div class="info-row">
            <el-icon class="info-icon"><Monitor /></el-icon>
            <span class="info-text">
              {{ parseUA(item).browser }} - {{ parseUA(item).os }}
            </span>
          </div>

          <div class="info-row">
            <el-icon class="info-icon"><Clock /></el-icon>
            <span class="info-text">
              {{ formatDate(null, null, item.last_attempted_at) }}
            </span>
          </div>
        </div>

        <div class="item-action">
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div v-if="list.length === 0" class="no-data">
      <el-empty description="暂无破解记录" />
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

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="破解详情"
      :width="isMobile ? '90%' : '560px'"
      :fullscreen="isMobile && isSmallScreen"
    >
      <el-descriptions
        v-if="current"
        :column="1"
        border
        :size="isMobile ? 'small' : 'default'"
      >
        <el-descriptions-item label="ID">
          {{ current.id }}
        </el-descriptions-item>
        <el-descriptions-item label="账号">
          {{ current.account }}
        </el-descriptions-item>
        <el-descriptions-item label="IP 地址">
          {{ current.ip_address }}
        </el-descriptions-item>
        <el-descriptions-item label="尝试次数">
          <el-tag :type="current.attempts >= 5 ? 'danger' : 'warning'" size="small">
            {{ current.attempts }} 次
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="时间">
          {{ formatDate(null, null, current.last_attempted_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器类型">
          {{ detail.browser || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器版本">
          {{ detail.browserVersion || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作系统">
          {{ detail.os || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ detail.device || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="原始 UA">
          <div class="ua-full">{{ current.user_agent }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <el-popconfirm
            title="确认删除这条破解记录？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            confirm-button-type="danger"
            @confirm="current && handleDelete(current)"
          >
            <template #reference>
              <el-button type="danger">删除</el-button>
            </template>
          </el-popconfirm>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getFailedLogins } from '../../api/monitor'

import {
  UserFilled,
  Location,
  Refresh,
  WarningFilled,
  Clock,
  Monitor,
  ArrowRight,
} from '@element-plus/icons-vue'

const list = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const isMobile = ref(false)
const isSmallScreen = ref(false)

// 多选
const multipleSelection = ref([])

const detailVisible = ref(false)
const current = ref(null)
const detail = ref({
  browser: '',
  browserVersion: '',
  os: '',
  device: '',
})

// 检查设备类型
const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
  isSmallScreen.value = window.innerWidth <= 480
}

const fetchData = async (p = 1) => {
  try {
    page.value = p
    const res = await getFailedLogins({
        page: p,
        per_page: pageSize.value,
    })
    const data = res.data || {}
    list.value = data.data || []
    total.value = Number(data.total || 0)
    page.value = Number(data.current_page || p)
    pageSize.value = Number(data.per_page || pageSize.value)
  } catch (e) {
    console.error(e)
    ElMessage.error('获取破解记录失败')
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

const formatDate = (row, column, cellValue) => {
  if (!cellValue) return ''
  const value = String(cellValue).replace(' ', 'T')
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(cellValue)

  if (isMobile.value) {
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

const parseUserAgent = (ua) => {
  const text = ua || ''
  const lower = text.toLowerCase()

  let browser = '未知浏览器'
  let browserVersion = ''
  if (lower.includes('edge/')) {
    browser = 'Edge'
    browserVersion = text.match(/Edge\/([\d.]+)/i)?.[1] || ''
  } else if (lower.includes('chrome/')) {
    browser = 'Chrome'
    browserVersion = text.match(/Chrome\/([\d.]+)/i)?.[1] || ''
  } else if (lower.includes('firefox/')) {
    browser = 'Firefox'
    browserVersion = text.match(/Firefox\/([\d.]+)/i)?.[1] || ''
  } else if (lower.includes('safari/') && !lower.includes('chrome/')) {
    browser = 'Safari'
    browserVersion = text.match(/Version\/([\d.]+)/i)?.[1] || ''
  } else if (lower.includes('msie') || lower.includes('trident/')) {
    browser = 'Internet Explorer'
    browserVersion = text.match(/(MSIE |rv:)([\d.]+)/i)?.[2] || ''
  }

  let os = '未知系统'
  if (lower.includes('windows nt 10')) os = 'Windows 10'
  else if (lower.includes('windows nt 6.3')) os = 'Windows 8.1'
  else if (lower.includes('windows nt 6.1')) os = 'Windows 7'
  else if (lower.includes('android')) os = 'Android'
  else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS'
  else if (lower.includes('mac os x')) os = 'macOS'
  else if (lower.includes('linux')) os = 'Linux'

  let device = '桌面设备'
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
    device = '移动设备'
  } else if (lower.includes('ipad')) {
    device = '平板设备'
  }

  return { browser, browserVersion, os, device }
}

const parseUA = (row) => parseUserAgent(row?.user_agent)

const openDetail = (row) => {
  current.value = row
  detail.value = parseUserAgent(row.user_agent)
  detailVisible.value = true
}

// 单条删除
const handleDelete = async (row) => {
  if (!row?.id) return
  try {
    await api.delete(`/failed-logins/${row.id}`)
    ElMessage.success('删除成功')
    const isLastItemOfPage = list.value.length === 1 && page.value > 1
    await fetchData(isLastItemOfPage ? page.value - 1 : page.value)
    multipleSelection.value = []
    if (detailVisible.value) {
      detailVisible.value = false
    }
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
    await api.post('/failed-logins/batch-delete', { ids })
    ElMessage.success('批量删除成功')
    const isLastItemOfPage = list.value.length === ids.length && page.value > 1
    await fetchData(isLastItemOfPage ? page.value - 1 : page.value)
    multipleSelection.value = []
  } catch (e) {
    console.error(e)
    ElMessage.error('批量删除失败')
  }
}

// 移动端删除：弹出二次确认
const confirmDeleteMobile = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确认删除账号「${item.account}」的这条破解记录？`,
      '提示',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await handleDelete(item)
  } catch {
    // 用户取消，不处理
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
.failed-login-card {
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.table-container {
  overflow-x: auto;
}

/* 移动端列表样式 */
.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-item {
  background: var(--bg-card);
  border: none;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.mobile-item:active {
  background: var(--bg-color);
  transform: scale(0.98);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.item-account {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.item-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-user {
  color: var(--primary-color);
  font-size: 18px;
  flex-shrink: 0;
}

.account-text {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn-mobile {
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-regular);
}

.info-icon {
  font-size: 15px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-action {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-icon {
  color: var(--text-placeholder);
  font-size: 18px;
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

.ua-text {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ua-full {
  word-break: break-all;
  line-height: 1.6;
  font-size: 13px;
  color: var(--text-regular);
  background: var(--bg-color);
  padding: 10px;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .failed-login-card {
    background: transparent !important;
    box-shadow: none !important;
  }

  .failed-login-card :deep(.el-card__header) {
    padding: 0 0 16px 0;
    border: none;
    background: transparent;
  }

  .failed-login-card :deep(.el-card__body) {
    padding: 0;
    background: transparent;
  }

  .header-title {
    font-size: 20px;
  }

  .pagination {
    margin-top: 16px;
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
  .mobile-item {
    padding: 12px;
    border-radius: 8px;
  }

  .account-text {
    font-size: 15px;
  }

  .info-row {
    font-size: 13px;
  }

  .info-icon {
    font-size: 14px;
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
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }
}

/* 弹窗内容优化 */
@media (max-width: 480px) {
  :deep(.el-dialog__body) {
    padding: 16px;
  }

  :deep(.el-descriptions__label) {
    font-size: 13px;
  }

  :deep(.el-descriptions__content) {
    font-size: 13px;
  }
}
</style>
