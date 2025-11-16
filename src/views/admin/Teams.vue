<template>
  <div class="admin-teams">
    <AdminHeader />

    <div class="page-container">
      <div class="page-header">
        <h1>团队管理</h1>
      </div>

      <!-- 功能切换标签页 -->
      <div class="tabs-section">
        <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
          <el-tab-pane label="待审核团队" name="pending">
            <div class="tab-description">
              <el-text type="info">管理待审核的团队，进行审核操作</el-text>
            </div>
          </el-tab-pane>
          <el-tab-pane label="已审核团队" name="approved">
            <div class="tab-description">
              <el-text type="info">管理已通过审核的团队，进行日常维护</el-text>
            </div>
          </el-tab-pane>
          <el-tab-pane label="所有团队" name="all">
            <div class="tab-description">
              <el-text type="info">查看所有状态的团队</el-text>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchQuery"
              placeholder="搜索团队名称或队长姓名..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="competitionFilter"
              placeholder="按竞赛筛选"
              clearable
              filterable
              @change="handleFilter"
            >
              <el-option
                v-for="comp in competitions"
                :key="comp.id"
                :label="comp.name"
                :value="comp.id"
              />
            </el-select>
          </el-col>
          <el-col v-if="activeTab === 'all'" :span="6">
            <el-select
              v-model="statusFilter"
              placeholder="按状态筛选"
              clearable
              @change="handleFilter"
            >
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 团队表格 -->
      <div class="table-section">
        <el-table
          :data="filteredTeams"
          :loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="团队名称" min-width="150" />
          <el-table-column prop="competition_name" label="所属竞赛" min-width="150" />
          <el-table-column prop="real_name" label="队长" width="120" />
          <el-table-column prop="member_count" label="团队人数" width="100" />
          <el-table-column prop="roles_needed" label="招募需求" min-width="200" />
          <el-table-column prop="contact_info" label="联系方式" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                size="small"
              >
                {{ getStatusText(row.status) }}
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
                @click="viewTeam(row)"
              >
                查看
              </el-button>
              <el-button
                v-if="activeTab === 'pending' && row.status === 'pending'"
                type="success"
                size="small"
                @click="approveTeam(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="activeTab === 'pending' && row.status === 'pending'"
                type="warning"
                size="small"
                @click="rejectTeam(row)"
              >
                拒绝
              </el-button>
              <el-button
                v-if="activeTab === 'approved' && row.status === 'approved'"
                type="warning"
                size="small"
                @click="rejectTeam(row)"
              >
                撤销
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteTeam(row)"
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
            @size-change="loadTeams"
            @current-change="loadTeams"
          />
        </div>

        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedTeams.length > 0">
          <span>已选择 {{ selectedTeams.length }} 个团队</span>
          <el-button
            v-if="activeTab === 'pending'"
            type="success"
            @click="batchApprove"
          >
            批量通过
          </el-button>
          <el-button
            v-if="activeTab === 'pending'"
            type="warning"
            @click="batchReject"
          >
            批量拒绝
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

    <!-- 查看团队对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="团队详情"
      width="500px"
    >
      <div v-if="selectedTeam" class="team-details">
        <div class="detail-item">
          <strong>团队名称：</strong>{{ selectedTeam.title }}
        </div>
        <div class="detail-item">
          <strong>所属竞赛：</strong>{{ selectedTeam.competition_name }}
        </div>
        <div class="detail-item">
          <strong>队长：</strong>{{ selectedTeam.real_name }} ({{ selectedTeam.username }})
        </div>
        <div class="detail-item">
          <strong>团队人数：</strong>{{ selectedTeam.member_count || '未设定' }} 人
        </div>
        <div class="detail-item">
          <strong>招募需求：</strong>{{ selectedTeam.roles_needed || '无' }}
        </div>
        <div class="detail-item">
          <strong>联系方式：</strong>{{ selectedTeam.contact_info }}
        </div>
        <div class="detail-item">
          <strong>创建时间：</strong>{{ formatDate(selectedTeam.created_at) }}
        </div>
      </div>

      <template #footer>
        <el-button @click="showViewDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import adminAPI from '@/api/admin'
import AdminHeader from '@/components/AdminHeader.vue'

const teams = ref([])
const competitions = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const competitionFilter = ref('')
const statusFilter = ref('')
const activeTab = ref('pending')

const showViewDialog = ref(false)
const selectedTeam = ref(null)

const selectedTeams = ref([])

onMounted(async () => {
  await loadTeams()
  await loadCompetitions()
})

const loadTeams = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (competitionFilter.value) {
      params.competition_id = competitionFilter.value
    }

    // 根据标签页自动设置状态筛选
    if (activeTab.value === 'pending') {
      params.status = 'pending'
    } else if (activeTab.value === 'approved') {
      params.status = 'approved'
    } else if (activeTab.value === 'all' && statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await adminAPI.teams.getAll(params)
    teams.value = response.data.teams
    total.value = response.data.total
  } catch (error) {
    console.error('加载团队列表失败:', error)
    ElMessage.error('加载团队列表失败')
  } finally {
    loading.value = false
  }
}

const loadCompetitions = async () => {
  try {
    const response = await adminAPI.competitions.getAll({ limit: 100 })
    competitions.value = response.data.competitions
  } catch (error) {
    console.error('加载竞赛列表失败:', error)
  }
}

const filteredTeams = computed(() => {
  let filtered = teams.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(team =>
      team.title.toLowerCase().includes(query) ||
      (team.real_name && team.real_name.toLowerCase().includes(query)) ||
      (team.username && team.username.toLowerCase().includes(query))
    )
  }

  return filtered
})

const handleSearch = () => {
  // 搜索逻辑已经在computed中处理
}

const handleFilter = () => {
  // 筛选逻辑在loadTeams中处理
  currentPage.value = 1
  loadTeams()
}

const handleTabChange = () => {
  // 切换标签页时重置分页和筛选
  currentPage.value = 1
  statusFilter.value = ''
  loadTeams()
}

const viewTeam = (team) => {
  selectedTeam.value = team
  showViewDialog.value = true
}

const deleteTeam = async (team) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除团队 "${team.title}" 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.teams.delete(team.id)
    ElMessage.success('团队删除成功')
    await loadTeams()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('删除团队失败')
      }
    }
  }
}

const batchDelete = async () => {
  if (selectedTeams.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedTeams.value.length} 个团队吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.teams.batchDelete(selectedTeams.value)
    ElMessage.success('批量删除成功')
    selectedTeams.value = []
    await loadTeams()
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

const batchApprove = async () => {
  if (selectedTeams.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要通过选中的 ${selectedTeams.value.length} 个团队吗？`,
      '确认批量通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    await adminAPI.teams.batchApprove(selectedTeams.value)
    ElMessage.success('批量审核通过成功')
    selectedTeams.value = []
    await loadTeams()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量审核操作失败')
      }
    }
  }
}

const batchReject = async () => {
  if (selectedTeams.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要拒绝选中的 ${selectedTeams.value.length} 个团队吗？`,
      '确认批量拒绝',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.teams.batchReject(selectedTeams.value)
    ElMessage.success('批量拒绝成功')
    selectedTeams.value = []
    await loadTeams()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量拒绝操作失败')
      }
    }
  }
}

const approveTeam = async (team) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过团队 "${team.title}" 吗？`,
      '确认通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    await adminAPI.teams.approve(team.id)
    ElMessage.success('团队审核通过')
    await loadTeams()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('审核操作失败')
      }
    }
  }
}

const rejectTeam = async (team) => {
  try {
    await ElMessageBox.confirm(
      `确定要拒绝团队 "${team.title}" 吗？`,
      '确认拒绝',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.teams.reject(team.id)
    ElMessage.success('团队已拒绝')
    await loadTeams()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('审核操作失败')
      }
    }
  }
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.admin-teams {
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

.tabs-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-description {
  margin-top: 10px;
  padding: 8px 0;
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

.team-details {
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  line-height: 1.6;
}

.detail-item strong {
  color: #333;
  min-width: 100px;
  display: inline-block;
}
</style>