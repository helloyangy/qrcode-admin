<template>
  <el-card class="announcement-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <span class="header-title">公告管理</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增公告
          </el-button>
        </div>
      </div>
    </template>

    <div class="table-container" v-if="!isMobile">
      <el-table :data="list" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确认删除这条公告？"
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

    <!-- 移动端列表视图 -->
    <div class="mobile-list" v-else v-loading="loading">
      <div v-for="row in list" :key="row.id" class="mobile-item">
        <div class="mobile-item-header">
          <span class="item-title">{{ row.title }}</span>
          <el-tag size="small" :type="row.is_active ? 'success' : 'info'">
            {{ row.is_active ? '已发布' : '草稿' }}
          </el-tag>
        </div>
        
        <div class="mobile-item-content">
          <div class="item-text">{{ row.content }}</div>
          <div class="item-date">
            <el-icon><Clock /></el-icon>
            {{ formatDate(row.created_at) }}
          </div>
        </div>

        <div class="mobile-actions">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确认删除这条公告？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            confirm-button-type="danger"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button type="danger" link size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
      <el-empty v-if="list.length === 0" description="暂无公告" />
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchData"
      />
    </div>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '新增公告'"
      :width="isMobile ? '90%' : '500px'"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入公告内容"
          />
        </el-form-item>

        <el-form-item label="状态" prop="is_active">
          <el-radio-group v-model="form.is_active">
            <el-radio :value="true">发布</el-radio>
            <el-radio :value="false">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Plus, Clock } from '@element-plus/icons-vue'
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api/announcement'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const formRef = ref()
const isMobile = ref(window.innerWidth <= 768)

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', checkDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})

const form = reactive({
  id: null,
  title: '',
  content: '',
  is_active: true
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAnnouncements({
      page: page.value,
      per_page: pageSize.value
    })
    const data = res.data || {}
    // 兼容不同的后端返回格式
    list.value = data.data || data.list || []
    total.value = Number(data.total || 0)
    
    // 如果后端返回了分页信息，同步更新
    if (data.per_page) pageSize.value = Number(data.per_page)
    if (data.current_page) page.value = Number(data.current_page)
  } catch (e) {
    console.error(e)
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.title = row.title
  form.content = row.content
  form.is_active = !!row.is_active // Ensure boolean
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await deleteAnnouncement(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateAnnouncement(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await createAnnouncement(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (e) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  form.id = null
  form.title = ''
  form.content = ''
  form.is_active = true
  if (formRef.value) formRef.value.resetFields()
}
</script>

<style scoped>
.announcement-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  font-weight: bold;
  font-size: 16px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.item-title {
  font-weight: 500;
  color: #303133;
  font-size: 15px;
}

.mobile-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.item-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}
</style>
