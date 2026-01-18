<template>
  <div class="monitor-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6" v-for="(value, key) in stats" :key="key" class="stat-col">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon" :style="{ color: getIconColor(key) }">
                <component :is="getStatIcon(key)" />
              </el-icon>
              <span>{{ formatStatKey(key) }}</span>
            </div>
          </template>
          <div class="stat-value">{{ value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 系统状态 -->
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-flex">
              <div class="flex-align-center">
                <el-icon class="mr-8"><Monitor /></el-icon>
                <span>系统状态</span>
              </div>
              <el-tag :type="getSystemStatusType(statusData.system_status)">
                {{ getSystemStatusText(statusData.system_status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="isMobile ? 1 : 2" border>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon><Clock /></el-icon>
                  检查时间
                </div>
              </template>
              {{ formatDate(statusData.timestamp) }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon><Coin /></el-icon>
                  数据库状态
                </div>
              </template>
               <el-tag :type="statusData.components?.database?.status === 'connected' ? 'success' : 'danger'" size="small">
                 {{ statusData.components?.database?.status === 'connected' ? '已连接' : '断开' }}
               </el-tag>
               <span class="latency" v-if="statusData.components?.database?.latency_ms">
                 ({{ statusData.components?.database?.latency_ms }}ms)
               </span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon><Files /></el-icon>
                  对象存储状态
                </div>
              </template>
               <el-tag :type="statusData.components?.object_storage?.status === 'connected' ? 'success' : 'danger'" size="small">
                 {{ statusData.components?.object_storage?.status === 'connected' ? '已连接' : '断开' }}
               </el-tag>
               <span class="latency" v-if="statusData.components?.object_storage?.latency_ms">
                 ({{ statusData.components?.object_storage?.latency_ms }}ms)
               </span>
               <span class="disk-type" v-if="statusData.components?.object_storage?.disk">
                 [{{ statusData.components?.object_storage?.disk }}]
               </span>
               <div v-if="statusData.components?.object_storage?.error" class="error-msg mt-4">
                 {{ statusData.components.object_storage.error }}
               </div>
            </el-descriptions-item>
            <el-descriptions-item v-if="statusData.components?.object_storage?.usage">
              <template #label>
                <div class="cell-item">
                  <el-icon><Odometer /></el-icon>
                  存储用量
                </div>
              </template>
              <div class="storage-usage">
                <span class="usage-item">
                  <span class="label">总量:</span>
                  <span class="value">{{ statusData.components?.object_storage?.usage?.total_formatted }}</span>
                </span>
                <el-divider direction="vertical" />
                <span class="usage-item">
                  <span class="label">今日增量:</span>
                  <span class="value new-usage">+{{ statusData.components?.object_storage?.usage?.today_formatted }}</span>
                </span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20" v-if="statusData.environment">
      <!-- 运行环境 -->
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-flex">
              <div class="flex-align-center">
                <el-icon class="mr-8"><Platform /></el-icon>
                <span>运行环境</span>
              </div>
              <el-tag effect="plain" type="info">PHP {{ statusData.environment.php_version }}</el-tag>
            </div>
          </template>
          
          <el-alert
            v-if="statusData.environment.missing_extensions && statusData.environment.missing_extensions.length > 0"
            title="缺失关键扩展"
            type="warning"
            show-icon
            :closable="false"
            class="mb-20"
          >
            <template #default>
              <div>
                以下 PHP 扩展未启用，可能导致系统功能受限：
                <span v-for="ext in statusData.environment.missing_extensions" :key="ext" class="missing-ext-text">
                  {{ ext }}
                </span>
              </div>
            </template>
          </el-alert>

          <el-descriptions :column="isMobile ? 1 : 4" border>
            <el-descriptions-item label="操作系统">
              <div class="cell-item">
                <el-icon><Monitor /></el-icon>
                {{ statusData.environment.os }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="上传限制">
              {{ statusData.environment.config?.upload_max_filesize }}
            </el-descriptions-item>
            <el-descriptions-item label="POST限制">
              {{ statusData.environment.config?.post_max_size }}
            </el-descriptions-item>
            <el-descriptions-item label="内存限制">
              {{ statusData.environment.config?.memory_limit }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="extensions-section mt-20">
            <div class="sub-title">已启用扩展</div>
            <div class="extensions-list">
              <el-tag 
                v-for="name in enabledExtensions" 
                :key="name"
                class="extension-tag"
                type="success"
                effect="light"
              >
                {{ name }}
              </el-tag>
              <span v-if="enabledExtensions.length === 0" class="no-data">无</span>
            </div>
          </div>

          <div class="extensions-section mt-20" v-if="disabledExtensions.length > 0">
            <div class="sub-title">未启用扩展</div>
            <div class="extensions-list">
              <el-tag 
                v-for="name in disabledExtensions" 
                :key="name"
                class="extension-tag"
                type="info"
                effect="plain"
              >
                {{ name }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getSystemStatus } from '../../api/monitor'
import { ElMessage } from 'element-plus'
import {
  DataLine,
  Warning,
  Bell,
  Timer,
  Monitor,
  Clock,
  Coin,
  Files,
  Odometer,
  Platform
} from '@element-plus/icons-vue'

const statusData = ref({})
const stats = ref({})
const loading = ref(false)
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)

const enabledExtensions = computed(() => {
  if (!statusData.value.environment?.extensions) return []
  return Object.entries(statusData.value.environment.extensions)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name)
})

const disabledExtensions = computed(() => {
  if (!statusData.value.environment?.extensions) return []
  return Object.entries(statusData.value.environment.extensions)
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name)
})

const statLabels = {
  qr_codes_count: '二维码总数',
  failed_logins: '失败登录(总)',
  notices_count: '公告数量',
  qr_today_count: '今日生成'
}

const statIcons = {
  qr_codes_count: DataLine,
  failed_logins: Warning,
  notices_count: Bell,
  qr_today_count: Timer
}

const iconColors = {
  qr_codes_count: '#409eff',
  failed_logins: '#f56c6c',
  notices_count: '#e6a23c',
  qr_today_count: '#67c23a'
}

const formatStatKey = (key) => statLabels[key] || key
const getStatIcon = (key) => statIcons[key] || Odometer
const getIconColor = (key) => iconColors[key] || '#303133'

const formatDate = (str) => {
  if (!str) return '-'
  return new Date(str).toLocaleString()
}

const fetchData = async () => {
  try {
    const res = await getSystemStatus()
    statusData.value = res.data || {}
    stats.value = res.data.stats || {}
  } catch (e) {
    console.error(e)
    ElMessage.error('获取系统监控数据失败')
  }
}

const getSystemStatusType = (status) => {
  if (status === 'healthy') return 'success'
  if (status === 'degraded') return 'warning'
  return 'danger'
}

const getSystemStatusText = (status) => {
  const map = {
    healthy: '健康',
    degraded: '降级',
    down: '异常'
  }
  return map[status] || '异常'
}
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.monitor-container {
  padding: 0;
}
.mt-20 {
  margin-top: 20px;
}
.mb-20 {
  margin-bottom: 20px;
}
.mt-4 {
  margin-top: 4px;
}
.error-msg {
  color: #f56c6c;
  font-size: 12px;
}
.stat-col {
  margin-bottom: 20px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #409eff;
}
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.latency {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.disk-type {
  margin-left: 8px;
  color: #67c23a;
  font-weight: bold;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-icon {
  font-size: 18px;
}
.flex-align-center {
  display: flex;
  align-items: center;
}
.mr-8 {
  margin-right: 8px;
}
.cell-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.storage-usage {
  display: flex;
  align-items: center;
}
.usage-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.usage-item .label {
  color: #909399;
}
.usage-item .value {
  font-weight: bold;
  color: #303133;
}
.usage-item .new-usage {
  color: #67c23a;
}
.sub-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}
.extensions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.extension-tag {
  min-width: 60px;
  text-align: center;
}
.missing-ext-text {
  font-weight: bold;
  color: #e6a23c;
  margin: 0 4px;
}
.no-data {
  font-size: 13px;
  color: #909399;
}
</style>
