<template>
  <div class="admin-competitions">
    <AdminHeader />

    <div class="page-container">
      <div class="page-header">
        <h1>竞赛管理</h1>
        <div class="header-actions">
          <el-button type="info" :icon="Setting" @click="showSettingsDialog = true">
            显示设置
          </el-button>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            创建竞赛
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索竞赛名称或主办方..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="typeFilter"
              placeholder="竞赛类型"
              clearable
              @change="handleFilter"
            >
              <el-option label="个人赛" :value="false" />
              <el-option label="团队赛" :value="true" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="gradeFilter"
              placeholder="竞赛等级"
              clearable
              @change="handleFilter"
            >
              <el-option label="A1" value="A1" />
              <el-option label="A2" value="A2" />
              <el-option label="B1" value="B1" />
              <el-option label="B2" value="B2" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 竞赛表格 -->
      <div class="table-section">
        <el-table
          :data="filteredCompetitions"
          :loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="竞赛名称" min-width="200" />
          <el-table-column prop="organzer" label="主办方" min-width="150" />
          <el-table-column prop="time" label="比赛时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.time) }}
            </template>
          </el-table-column>
          <el-table-column label="等级" width="80">
            <template #default="{ row }">
              <span class="grade-tag" :class="getGradeClass(row.grade)">
                {{ row.grade }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_single ? 'success' : 'warning'">
                {{ row.is_single ? '个人赛' : '团队赛' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="editCompetition(row)"
              >
                编辑
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="viewTeams(row)"
              >
                团队
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteCompetition(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadCompetitions"
            @current-change="loadCompetitions"
          />
        </div>

        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedCompetitions.length > 0">
          <span>已选择 {{ selectedCompetitions.length }} 个竞赛</span>
          <el-button
            type="warning"
            @click="batchUpdateType(true)"
          >
            设为团队赛
          </el-button>
          <el-button
            type="success"
            @click="batchUpdateType(false)"
          >
            设为个人赛
          </el-button>
          <el-button
            type="danger"
            @click="batchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 创建竞赛对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建竞赛"
      width="600px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="competitionRules"
        label-width="120px"
      >
        <el-form-item label="竞赛名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入竞赛名称" />
        </el-form-item>
        <el-form-item label="主办方" prop="organzer">
          <el-input v-model="createForm.organzer" placeholder="请输入主办方" />
        </el-form-item>
        <el-form-item label="比赛时间">
          <el-radio-group v-model="timeMode" @change="handleTimeMode">
            <el-radio value="unknown">暂不确定</el-radio>
            <el-radio value="custom">自定义</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="timeMode === 'custom'"
            v-model="createForm.time"
            type="datetime"
            placeholder="选择比赛时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%; margin-top: 10px"
          />
        </el-form-item>
        <el-form-item label="时间信息">
          <el-input
            v-model="createForm.time_information"
            type="textarea"
            rows="2"
            placeholder="报名时间、比赛时间等详细信息"
          />
        </el-form-item>
        <el-form-item label="竞赛介绍">
          <el-input
            v-model="createForm.description"
            type="textarea"
            rows="4"
            placeholder="竞赛详细介绍"
          />
        </el-form-item>
        <el-form-item label="竞赛等级">
          <el-select v-model="createForm.grade" placeholder="选择等级">
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
          </el-select>
        </el-form-item>
        <el-form-item label="竞赛类型">
          <el-switch
            v-model="createForm.is_single"
            active-text="个人赛"
            inactive-text="团队赛"
          />
        </el-form-item>
        <el-form-item label="官方网站">
          <el-input v-model="createForm.offical_website" placeholder="https://..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="creating"
          @click="createCompetition"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑竞赛对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑竞赛"
      width="600px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="competitionRules"
        label-width="120px"
      >
        <el-form-item label="竞赛名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入竞赛名称" />
        </el-form-item>
        <el-form-item label="主办方" prop="organzer">
          <el-input v-model="editForm.organzer" placeholder="请输入主办方" />
        </el-form-item>
        <el-form-item label="比赛时间">
          <el-radio-group v-model="editTimeMode" @change="handleEditTimeMode">
            <el-radio value="unknown">暂不确定</el-radio>
            <el-radio value="custom">自定义</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="editTimeMode === 'custom'"
            v-model="editForm.time"
            type="datetime"
            placeholder="选择比赛时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%; margin-top: 10px"
          />
        </el-form-item>
        <el-form-item label="时间信息">
          <el-input
            v-model="editForm.time_information"
            type="textarea"
            rows="2"
            placeholder="报名时间、比赛时间等详细信息"
          />
        </el-form-item>
        <el-form-item label="竞赛介绍">
          <el-input
            v-model="editForm.description"
            type="textarea"
            rows="4"
            placeholder="竞赛详细介绍"
          />
        </el-form-item>
        <el-form-item label="竞赛等级">
          <el-select v-model="editForm.grade" placeholder="选择等级">
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
          </el-select>
        </el-form-item>
        <el-form-item label="竞赛类型">
          <el-switch
            v-model="editForm.is_single"
            active-text="个人赛"
            inactive-text="团队赛"
          />
        </el-form-item>
        <el-form-item label="官方网站">
          <el-input v-model="editForm.offical_website" placeholder="https://..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="editing"
          @click="updateCompetition"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 显示设置对话框 -->
    <el-dialog
      v-model="showSettingsDialog"
      title="显示设置"
      width="400px"
    >
      <el-form label-width="120px">
        <el-form-item label="未知时间文本">
          <el-input
            v-model="unknownTimeText"
            placeholder="请输入未知时间的显示文本"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showSettingsDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveSettings"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Setting } from '@element-plus/icons-vue'
import adminAPI from '@/api/admin'
import AdminHeader from '@/components/AdminHeader.vue'

const router = useRouter()

const competitions = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const typeFilter = ref('')
const gradeFilter = ref('')

const showCreateDialog = ref(false)
const showSettingsDialog = ref(false)
const timeMode = ref('unknown')
const editTimeMode = ref('unknown')
const unknownTimeText = ref('未知时间')
const showEditDialog = ref(false)
const creating = ref(false)
const editing = ref(false)

const createFormRef = ref()
const editFormRef = ref()

const createForm = reactive({
  name: '',
  organzer: '',
  time: 'unknown',
  time_information: '',
  description: '',
  grade: '',
  is_single: false,
  offical_website: ''
})

const editForm = reactive({
  id: '',
  name: '',
  organzer: '',
  time: '',
  time_information: '',
  description: '',
  grade: '',
  is_single: false,
  offical_website: ''
})

const competitionRules = {
  name: [
    { required: true, message: '请输入竞赛名称', trigger: 'blur' }
  ],
  organzer: [
    { required: true, message: '请输入主办方', trigger: 'blur' }
  ]
}

const selectedCompetitions = ref([])

onMounted(async () => {
  // 从localStorage加载未知时间文本设置
  const savedUnknownTimeText = localStorage.getItem('adminUnknownTimeText')
  if (savedUnknownTimeText) {
    unknownTimeText.value = savedUnknownTimeText
  }

  await loadCompetitions()
})

const loadCompetitions = async () => {
  loading.value = true
  try {
    const response = await adminAPI.competitions.getAll({
      page: currentPage.value,
      limit: pageSize.value
    })
    competitions.value = response.data.competitions
    total.value = response.data.total
  } catch (error) {
    console.error('加载竞赛列表失败:', error)
    ElMessage.error('加载竞赛列表失败')
  } finally {
    loading.value = false
  }
}

const filteredCompetitions = computed(() => {
  let filtered = competitions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(comp =>
      comp.name.toLowerCase().includes(query) ||
      comp.organzer.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value !== '') {
    filtered = filtered.filter(comp => comp.is_single === typeFilter.value)
  }

  if (gradeFilter.value) {
    filtered = filtered.filter(comp => comp.grade === gradeFilter.value)
  }

  return filtered
})

const handleSearch = () => {
  // 搜索逻辑已经在computed中处理
}

const handleFilter = () => {
  // 筛选逻辑已经在computed中处理
}

const createCompetition = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    await adminAPI.competitions.create(createForm)

    ElMessage.success('竞赛创建成功')
    showCreateDialog.value = false
    Object.assign(createForm, {
      name: '',
      organzer: '',
      time: 'unknown',
      time_information: '',
      description: '',
      grade: '',
      is_single: false,
      offical_website: ''
    })
    timeMode.value = 'unknown'

    await loadCompetitions()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('创建竞赛失败')
    }
  } finally {
    creating.value = false
  }
}

const editCompetition = (competition) => {
  Object.assign(editForm, {
    id: competition.id,
    name: competition.name,
    organzer: competition.organzer,
    time: competition.time,
    time_information: competition.time_information,
    description: competition.description,
    grade: competition.grade,
    is_single: competition.is_single,
    offical_website: competition.offical_website
  })

  // 设置编辑模式的时间选择
  if (competition.time === 'unknown') {
    editTimeMode.value = 'unknown'
  } else {
    editTimeMode.value = 'custom'
  }

  showEditDialog.value = true
}

const updateCompetition = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    editing.value = true

    await adminAPI.competitions.update(editForm.id, editForm)

    ElMessage.success('竞赛信息更新成功')
    showEditDialog.value = false
    await loadCompetitions()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新竞赛信息失败')
    }
  } finally {
    editing.value = false
  }
}

const deleteCompetition = async (competition) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除竞赛 "${competition.name}" 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.competitions.delete(competition.id)
    ElMessage.success('竞赛删除成功')
    await loadCompetitions()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('删除竞赛失败')
      }
    }
  }
}

const batchUpdateType = async (isSingle) => {
  if (selectedCompetitions.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedCompetitions.value.length} 个竞赛设为${isSingle ? '个人赛' : '团队赛'}吗？`,
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.competitions.batchUpdateType(selectedCompetitions.value, isSingle)
    ElMessage.success('批量更新类型成功')
    selectedCompetitions.value = []
    await loadCompetitions()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量操作失败')
      }
    }
  }
}

const batchDelete = async () => {
  if (selectedCompetitions.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCompetitions.value.length} 个竞赛吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.competitions.batchDelete(selectedCompetitions.value)
    ElMessage.success('批量删除成功')
    selectedCompetitions.value = []
    await loadCompetitions()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量删除失败')
      }
    }
  }
}

const viewTeams = (competition) => {
  router.push(`/admin/teams?competition_id=${competition.id}`)
}

const formatDate = (dateString) => {
  if (dateString === 'unknown') {
    return unknownTimeText.value
  }
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleTimeMode = (mode) => {
  if (mode === 'unknown') {
    createForm.time = 'unknown'
  } else {
    createForm.time = ''
  }
}

const handleEditTimeMode = (mode) => {
  if (mode === 'unknown') {
    editForm.time = 'unknown'
  } else {
    editForm.time = ''
  }
}

const getGradeClass = (grade) => {
  const gradeMap = {
    'A1': 'grade-a',
    'A2': 'grade-b',
    'B1': 'grade-c',
    'B2': 'grade-d'
  }
  return gradeMap[grade] || 'grade-d'
}

const saveSettings = () => {
  localStorage.setItem('adminUnknownTimeText', unknownTimeText.value)
  ElMessage.success('显示设置保存成功')
  showSettingsDialog.value = false
}
</script>

<style scoped>
.admin-competitions {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.batch-actions span {
  font-weight: 500;
  color: #666;
}

.grade-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
}

.grade-a { background: #ff4d4f; }
.grade-b { background: #ff7a45; }
.grade-c { background: #ffa940; }
.grade-d { background: #52c41a; }
</style>
