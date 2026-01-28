<template>
  <div class="monitor-container">
    <!-- 顶部状态栏 -->
    <el-card shadow="hover" class="status-header-card mb-20">
      <div class="status-header">
        <div class="header-left">
          <div class="heartbeat-container">
            <div class="heartbeat-dot" :class="statusData.system_status"></div>
            <div class="heartbeat-ring" :class="statusData.system_status"></div>
          </div>
          <span class="system-status-text">
            系统状态: {{ getSystemStatusText(statusData.system_status) }}
          </span>
          <el-tag :type="getSystemStatusType(statusData.system_status)" effect="dark" size="small" class="ml-2">
            {{ statusData.system_status?.toUpperCase() || 'UNKNOWN' }}
          </el-tag>
        </div>
        <div class="header-right">
          <span class="last-update">
            <el-icon><Clock /></el-icon>
            最后更新: {{ formatDate(statusData.timestamp) }}
          </span>
          <el-button type="primary" link @click="fetchData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 核心指标卡片 -->
      <el-col :xs="24" :sm="12" :md="6" v-for="(value, key) in stats" :key="key" class="stat-col">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-wrapper" :style="{ backgroundColor: getIconBgColor(key) }">
              <el-icon class="stat-icon" :style="{ color: getIconColor(key) }">
                <component :is="getStatIcon(key)" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ formatStatKey(key) }}</div>
              <div class="stat-value">{{ value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 左侧：实时延迟监控 -->
      <el-col :xs="24" :lg="16" class="mb-20">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>实时服务延迟监控 (ms)</span>
            </div>
          </template>
          <div ref="latencyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧：服务组件状态 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="components-card">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>组件连接状态</span>
            </div>
          </template>
          
          <div class="component-list">
            <!-- 数据库 -->
            <div class="component-item">
              <div class="comp-icon db-icon"><el-icon><Coin /></el-icon></div>
              <div class="comp-info">
                <div class="comp-name">数据库 (Database)</div>
                <div class="comp-status">
                  <el-tag :type="statusData.components?.database?.status === 'connected' ? 'success' : 'danger'" size="small">
                    {{ statusData.components?.database?.status === 'connected' ? '已连接' : '断开' }}
                  </el-tag>
                  <span class="latency-badge" v-if="statusData.components?.database?.latency_ms">
                    {{ statusData.components?.database?.latency_ms }}ms
                  </span>
                </div>
              </div>
            </div>

            <!-- 对象存储 -->
            <div class="component-item">
              <div class="comp-icon s3-icon"><el-icon><Files /></el-icon></div>
              <div class="comp-info">
                <div class="comp-name">对象存储 (S3)</div>
                <div class="comp-status">
                  <el-tag :type="statusData.components?.object_storage?.status === 'connected' ? 'success' : 'danger'" size="small">
                    {{ statusData.components?.object_storage?.status === 'connected' ? '已连接' : '断开' }}
                  </el-tag>
                  <span class="latency-badge" v-if="statusData.components?.object_storage?.latency_ms">
                    {{ statusData.components?.object_storage?.latency_ms }}ms
                  </span>
                </div>
                <div class="comp-detail" v-if="statusData.components?.object_storage?.disk">
                   驱动: {{ statusData.components?.object_storage?.disk }}
                </div>
                <div class="comp-detail" v-if="statusData.components?.object_storage?.usage">
                   用量: {{ statusData.components?.object_storage?.usage?.total_formatted }} 
                   <span class="text-green">(+{{ statusData.components?.object_storage?.usage?.today_formatted }})</span>
                </div>
                <div v-if="statusData.components?.object_storage?.error" class="error-msg">
                   {{ statusData.components.object_storage.error }}
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 环境信息 -->
        <el-card shadow="hover" class="mt-20 env-card" v-if="statusData.environment">
          <template #header>
            <div class="card-header">
              <el-icon><Platform /></el-icon>
              <span>运行环境</span>
            </div>
          </template>
          
          <div class="env-info">
            <div class="env-row">
              <span class="label">PHP 版本:</span>
              <span class="value">{{ statusData.environment.php_version }}</span>
            </div>
            <div class="env-row">
              <span class="label">操作系统:</span>
              <span class="value">{{ statusData.environment.os }}</span>
            </div>
            <div class="env-row">
              <span class="label">内存限制:</span>
              <span class="value">{{ statusData.environment.config?.memory_limit }}</span>
            </div>
          </div>

          <el-divider content-position="left">扩展状态</el-divider>
          
          <div class="extensions-section">
            <div class="ext-group">
               <div class="group-title success">已安装扩展 ({{ enabledExtensions.length }})</div>
               <div class="ext-list">
                 <el-tag 
                   v-for="name in enabledExtensions" 
                   :key="name"
                   class="ext-tag"
                   type="success"
                   size="small"
                   effect="light"
                 >
                   {{ name }}
                 </el-tag>
                 <span v-if="enabledExtensions.length === 0" class="no-data">无</span>
               </div>
            </div>

            <div class="ext-group mt-15" v-if="disabledExtensions.length > 0">
               <div class="group-title warning">未安装扩展 ({{ disabledExtensions.length }})</div>
               <div class="ext-list">
                 <el-tag 
                   v-for="name in disabledExtensions" 
                   :key="name"
                   class="ext-tag"
                   type="info"
                   size="small"
                   effect="plain"
                 >
                   {{ name }}
                 </el-tag>
               </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import { getSystemStatus } from '../../api/monitor'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
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
  Platform,
  Refresh,
  Connection
} from '@element-plus/icons-vue'

const statusData = ref({})
const stats = ref({})
const loading = ref(false)
const windowWidth = ref(window.innerWidth)
const latencyChartRef = ref(null)
let chartInstance = null
let pollTimer = null

// 历史数据缓存，用于图表展示
const chartHistory = {
  time: [],
  db: [],
  s3: []
}

const isMobile = computed(() => windowWidth.value < 768)

const enabledExtensions = computed(() => {
  if (!statusData.value?.environment?.extensions) return []
  return Object.entries(statusData.value.environment.extensions)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name)
})

const disabledExtensions = computed(() => {
  if (!statusData.value?.environment?.extensions) return []
  return Object.entries(statusData.value.environment.extensions)
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name)
})

const statLabels = {
  qr_codes_count: '二维码总数',
  failed_logins: '失败登录(总)',
  notices_count: '公告数量',
  qr_today_count: '今日生成',
  mini_program_files_count: '小程序文件',
  mini_program_files_size_formatted: '存储占用'
}

const statIcons = {
  qr_codes_count: DataLine,
  failed_logins: Warning,
  notices_count: Bell,
  qr_today_count: Timer,
  mini_program_files_count: Files,
  mini_program_files_size_formatted: Odometer
}

const iconColors = {
  qr_codes_count: '#409eff',
  failed_logins: '#f56c6c',
  notices_count: '#e6a23c',
  qr_today_count: '#67c23a',
  mini_program_files_count: '#909399',
  mini_program_files_size_formatted: '#409eff'
}

const iconBgColors = {
  qr_codes_count: '#ecf5ff',
  failed_logins: '#fef0f0',
  notices_count: '#fdf6ec',
  qr_today_count: '#f0f9eb',
  mini_program_files_count: '#f4f4f5',
  mini_program_files_size_formatted: '#ecf5ff'
}

const formatStatKey = (key) => statLabels[key] || key
const getStatIcon = (key) => statIcons[key] || Odometer
const getIconColor = (key) => iconColors[key] || '#303133'
const getIconBgColor = (key) => iconBgColors[key] || '#f5f7fa'

const formatDate = (str) => {
  if (!str) return '-'
  return new Date(str).toLocaleTimeString()
}

const initChart = () => {
  if (!latencyChartRef.value) return
  
  chartInstance = echarts.init(latencyChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['数据库延迟', '对象存储延迟'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value',
      name: '延迟 (ms)',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '数据库延迟',
        type: 'line',
        smooth: true,
        data: [],
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '对象存储延迟',
        type: 'line',
        smooth: true,
        data: [],
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      }
    ]
  }
  chartInstance.setOption(option)
}

const updateChart = (timestamp, dbLatency, s3Latency) => {
  if (!chartInstance) return

  const timeStr = new Date(timestamp).toLocaleTimeString()
  
  // 保持最近 20 个点
  if (chartHistory.time.length > 20) {
    chartHistory.time.shift()
    chartHistory.db.shift()
    chartHistory.s3.shift()
  }

  chartHistory.time.push(timeStr)
  chartHistory.db.push(dbLatency || 0)
  chartHistory.s3.push(s3Latency || 0)

  chartInstance.setOption({
    xAxis: {
      data: chartHistory.time
    },
    series: [
      { data: chartHistory.db },
      { data: chartHistory.s3 }
    ]
  })
}

const fetchData = async () => {
  try {
    const res = await getSystemStatus()
    statusData.value = res.data || {}
    
    // 过滤 stats
    const { mini_program_files_size, ...rest } = res.data.stats || {}
    stats.value = rest

    // 更新图表
    const dbLatency = res.data.components?.database?.latency_ms
    const s3Latency = res.data.components?.object_storage?.latency_ms
    const timestamp = res.data.timestamp ? new Date(res.data.timestamp).getTime() : Date.now()
    
    updateChart(timestamp, dbLatency, s3Latency)

  } catch (e) {
    console.error(e)
    // 失败时不弹窗，避免轮询时一直弹
  }
}

const getSystemStatusType = (status) => {
  if (status === 'healthy') return 'success'
  if (status === 'degraded') return 'warning'
  return 'danger'
}

const getSystemStatusText = (status) => {
  const map = {
    healthy: '运行正常',
    degraded: '性能降级',
    down: '服务异常'
  }
  return map[status] || '未知状态'
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  chartInstance?.resize()
}

onMounted(() => {
  fetchData()
  nextTick(() => {
    initChart()
  })
  
  window.addEventListener('resize', handleResize)
  
  // 5秒轮询一次
  pollTimer = setInterval(fetchData, 5000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (pollTimer) clearInterval(pollTimer)
  chartInstance?.dispose()
})
</script>

<style scoped>
.monitor-container {
  padding: 0;
}

.mb-20 { margin-bottom: 24px; }
.mt-20 { margin-top: 24px; }
.ml-2 { margin-left: 8px; }
.text-green { color: var(--success-color); }

/* 状态头样式 */
.status-header-card {
  border: none;
}

.status-header-card :deep(.el-card__body) {
  padding: 20px 24px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.system-status-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.last-update {
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-color);
  padding: 6px 12px;
  border-radius: 20px;
}

/* 心跳动画 */
.heartbeat-container {
  position: relative;
  width: 14px;
  height: 14px;
}

.heartbeat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--success-color);
  position: absolute;
  top: 2px;
  left: 2px;
  z-index: 2;
}

.heartbeat-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--success-color);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  animation: heartbeat 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
}

.heartbeat-dot.warning, .heartbeat-ring.warning { background-color: var(--warning-color); }
.heartbeat-dot.danger, .heartbeat-ring.danger { background-color: var(--danger-color); }

@keyframes heartbeat {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(2); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0; }
}

/* 统计卡片样式 */
.stat-card {
  height: 100%;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon {
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Roboto', sans-serif;
}

/* 图表卡片 */
.chart-card {
  height: 420px;
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  width: 100%;
  height: 340px;
}

/* 组件列表样式 */
.components-card {
  min-height: 200px;
  border: none;
}

.component-item {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}

.component-item:last-child {
  border-bottom: none;
}

.comp-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.db-icon { background-color: var(--primary-light); color: var(--primary-color); }
.s3-icon { background-color: #f0f9eb; color: var(--success-color); }

.comp-info {
  flex: 1;
}

.comp-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.comp-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.latency-badge {
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--bg-color);
  padding: 2px 8px;
  border-radius: 4px;
}

.comp-detail {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.error-msg {
  font-size: 12px;
  color: var(--danger-color);
  margin-top: 6px;
}

/* 环境信息 */
.env-card {
  border: none;
}

.env-info {
  font-size: 14px;
}

.env-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border-color);
}

.env-row:last-child {
  border-bottom: none;
}

.env-row .label {
  color: var(--text-secondary);
}

.env-row .value {
  font-weight: 500;
  color: var(--text-primary);
}

/* 扩展列表样式 */
.extensions-section {
  padding-top: 10px;
}

.mt-15 {
  margin-top: 20px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.group-title.success { color: var(--success-color); }
.group-title.warning { color: var(--warning-color); }

.ext-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ext-tag {
  border: none;
  font-size: 13px;
  padding: 4px 10px;
}

.no-data {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-col {
    margin-bottom: 16px;
  }
  
  .chart-card {
    height: 320px;
  }
  
  .chart-container {
    height: 240px;
  }
}
</style>