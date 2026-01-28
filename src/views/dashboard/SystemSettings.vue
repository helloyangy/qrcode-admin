<template>
  <el-card class="settings-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <el-icon class="header-icon"><Setting /></el-icon>
          <span class="header-title">系统功能设置</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="saveSettings" :loading="saving">
            <el-icon class="mr-1"><Check /></el-icon>
            保存配置
          </el-button>
          <el-button @click="fetchSettings">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </template>

    <el-form :model="settings" v-loading="loading" label-position="top">
      <el-tabs type="border-card" class="settings-tabs">
        <!-- 普通二维码配置 -->
        <el-tab-pane label="普通二维码配置">
          <div class="tab-content">
            <el-alert title="控制普通二维码生成器的可用类型" type="info" :closable="false" class="mb-20" show-icon />
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="链接二维码 (URL)">
                  <el-switch 
                    v-model="settings.qr_type_url_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="文本二维码 (Text)">
                  <el-switch 
                    v-model="settings.qr_type_text_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="图片二维码 (Image)">
                  <el-switch 
                    v-model="settings.qr_type_image_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="PDF 二维码">
                  <el-switch 
                    v-model="settings.qr_type_pdf_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="Word 二维码">
                  <el-switch 
                    v-model="settings.qr_type_word_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 彩色二维码配置 -->
        <el-tab-pane label="彩色二维码配置">
          <div class="tab-content">
            <el-alert title="控制彩色二维码生成器的可用类型" type="warning" :closable="false" class="mb-20" show-icon />
            <el-row :gutter="24">
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="链接二维码 (URL)">
                  <el-switch 
                    v-model="settings.colorful_qr_type_url_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="文本二维码 (Text)">
                  <el-switch 
                    v-model="settings.colorful_qr_type_text_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="图片二维码 (Image)">
                  <el-switch 
                    v-model="settings.colorful_qr_type_image_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="PDF 二维码">
                  <el-switch 
                    v-model="settings.colorful_qr_type_pdf_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8">
                <el-form-item label="Word 二维码">
                  <el-switch 
                    v-model="settings.colorful_qr_type_word_enabled" 
                    active-text="开启" 
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 存储设置 -->
        <el-tab-pane label="存储服务配置">
          <div class="tab-content">
            <el-alert title="配置系统文件上传的存储策略" type="success" :closable="false" class="mb-20" show-icon />
            
            <el-form-item label="存储驱动">
              <el-select v-model="settings.filesystem_driver" placeholder="请选择存储驱动" style="width: 100%; max-width: 400px;">
                <el-option label="本地存储 (public)" value="public" />
                <el-option label="本地存储 (local)" value="local" />
                <el-option label="S3 对象存储" value="s3" />
              </el-select>
              <div class="form-tip mt-2">选择 "public" 将文件存储在 public/storage 目录下，可直接访问。</div>
            </el-form-item>

            <template v-if="settings.filesystem_driver === 's3'">
              <el-divider content-position="left">S3 配置详情</el-divider>
              <el-row :gutter="24">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Access Key">
                    <el-input v-model="settings.s3_access_key" placeholder="AWS_ACCESS_KEY_ID" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Secret Key">
                    <el-input v-model="settings.s3_secret_key" type="password" show-password placeholder="AWS_SECRET_ACCESS_KEY" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="区域 (Region)">
                    <el-input v-model="settings.s3_region" placeholder="us-east-1" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Bucket 名称">
                    <el-input v-model="settings.s3_bucket" placeholder="AWS_BUCKET" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="访问域名 (URL)">
                    <el-input v-model="settings.s3_url" placeholder="https://..." />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="Endpoint API">
                    <el-input v-model="settings.s3_endpoint" placeholder="https://s3.us-east-1.amazonaws.com" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="Path Style">
                     <el-switch 
                      v-model="settings.s3_use_path_style_endpoint" 
                      active-text="开启" 
                      inactive-text="关闭"
                      :active-value="true"
                      :inactive-value="false"
                    />
                    <div class="form-tip ml-4" style="display: inline-block;">MinIO 等兼容服务通常需要开启此选项</div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Setting, Check, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'
import { getSettings, updateSettings } from '../../api/settings'

const loading = ref(false)
const saving = ref(false)

// 默认值
const settings = ref({
  qr_type_url_enabled: true,
  qr_type_text_enabled: true,
  qr_type_image_enabled: true,
  qr_type_pdf_enabled: true,
  qr_type_word_enabled: true,
  colorful_qr_type_url_enabled: true,
  colorful_qr_type_text_enabled: true,
  colorful_qr_type_image_enabled: true,
  colorful_qr_type_pdf_enabled: true,
  colorful_qr_type_word_enabled: true,
  // 存储设置
  filesystem_driver: 'public',
  s3_access_key: '',
  s3_secret_key: '',
  s3_region: 'us-east-1',
  s3_bucket: '',
  s3_url: '',
  s3_endpoint: '',
  s3_use_path_style_endpoint: false
})

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await getSettings()
    if (res.data) {
      // 假设后端返回的是键值对对象或者数组，这里做简单适配
      // 如果是数组 [{key: '...', value: '1'}, ...]
      if (Array.isArray(res.data)) {
        res.data.forEach(item => {
          if (item.key && settings.value.hasOwnProperty(item.key)) {
            // 后端可能返回字符串 '1'/'0' 或 boolean
            if (typeof settings.value[item.key] === 'boolean') {
              settings.value[item.key] = item.value === true || item.value === '1' || item.value === 1
            } else {
              settings.value[item.key] = item.value
            }
          }
        })
      } else if (typeof res.data === 'object') {
        // 如果是对象 { qr_type_url_enabled: true, ... }
        Object.keys(res.data).forEach(key => {
          if (settings.value.hasOwnProperty(key)) {
             const val = res.data[key]
             if (typeof settings.value[key] === 'boolean') {
               settings.value[key] = val === true || val === '1' || val === 1
             } else {
               settings.value[key] = val
             }
          }
        })
      }
    }
  } catch (error) {
    console.error('获取设置失败', error)
    ElMessage.error('获取系统设置失败')
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '<div style="text-align: center;">确定要保存当前的系统设置吗？<br/><span style="color: #909399; font-size: 13px; display: inline-block; margin-top: 8px;">此操作将立即影响所有用户的二维码生成功能。</span></div>',
      '确认保存',
      {
        confirmButtonText: '确定保存',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        roundButton: true,
        dangerouslyUseHTMLString: true,
        closeOnClickModal: false,
        draggable: true,
        distinguishCancelAndClose: true
      }
    )

    saving.value = true
    // 构造 payload
    const payload = {}
    Object.keys(settings.value).forEach(key => {
      const val = settings.value[key]
      if (typeof val === 'boolean') {
        // 统一转换为 1/0 发送，确保后端兼容性
        payload[key] = val ? 1 : 0
      } else {
        payload[key] = val
      }
    })

    const res = await updateSettings(payload)
    if (res.data && res.data.success !== false) {
       ElMessage.success('系统设置保存成功')
       // 保存后立即重新获取，确保显示的是服务器端的值
       await fetchSettings()
    } else {
       ElMessage.error(res.data?.message || '保存失败')
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
       console.error('保存设置失败', error)
       ElMessage.error('保存设置失败')
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-card {
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.header-icon {
  font-size: 22px;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 8px;
  border-radius: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-tabs {
  margin-top: 0;
  border: none !important;
  box-shadow: none !important;
}

:deep(.el-tabs__content) {
  padding: 24px 0 !important;
}

:deep(.el-tabs__header) {
  background: transparent !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-tabs__item) {
  height: 48px;
  line-height: 48px;
  border: none !important;
  color: var(--text-regular) !important;
  font-weight: 500;
  transition: all 0.3s;
  background: transparent !important;
  margin-right: 4px;
  border-radius: 8px 8px 0 0;
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color) !important;
  font-weight: 600;
  border-bottom: 2px solid var(--primary-color) !important;
  background: rgba(64, 158, 255, 0.05) !important;
}

:deep(.el-tabs__item:hover) {
  color: var(--primary-color) !important;
}

.tab-content {
  padding: 0 10px;
}

.mb-20 {
  margin-bottom: 24px;
}

.mt-2 {
  margin-top: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.mr-1 {
  margin-right: 6px;
}

.form-tip {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .settings-card {
    background: transparent !important;
    box-shadow: none !important;
  }

  .settings-card :deep(.el-card__header) {
    padding: 0 0 16px 0;
    border: none;
    background: transparent;
  }

  .settings-card :deep(.el-card__body) {
    padding: 0;
    background: transparent;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-icon {
    display: none;
  }

  .header-title {
    font-size: 20px;
  }
  
  .header-right {
    width: 100%;
  }

  .header-right .el-button {
    flex: 1;
    height: 40px;
  }
  
  .settings-tabs {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 10px;
    box-shadow: var(--shadow-sm) !important;
  }

  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
  }
}
</style>
