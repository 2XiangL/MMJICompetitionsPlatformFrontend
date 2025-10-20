<template>
  <div class="teams-container">
    <AppHeader />

    <div class="page-container">
      <div class="page-header">
        <h1>我的团队</h1>
        <el-button type="primary" :icon="Plus" @click="createNewTeam">
          创建新团队
        </el-button>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && teamsData.length === 0" class="empty-state">
        <el-empty description="您还没有创建任何团队">
          <el-button type="primary" @click="createNewTeam">
            创建第一个团队
          </el-button>
        </el-empty>
      </div>

      <!-- 团队列表 -->
      <div v-else class="teams-grid">
        <div
          v-for="team in teamsData"
          :key="team.id"
          class="team-card card-shadow"
        >
          <div class="team-header">
            <div class="team-title-section">
              <h3>{{ team.title }}</h3>
              <span class="competition-badge">
                <el-icon><Trophy /></el-icon>
                {{ team.competition_name }}
              </span>
            </div>
            <div class="team-actions">
              <el-dropdown @command="handleCommand">
                <el-button type="primary" :icon="More" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'edit', team }">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'delete', team }" divided>
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="team-body">
            <div class="team-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>比赛时间：{{ formatDate(team.competition_time) }}</span>
              </div>
              <div class="info-item" v-if="team.member_count">
                <el-icon><User /></el-icon>
                <span>团队人数：{{ team.member_count }} 人</span>
              </div>
              <div class="info-item" v-if="team.roles_needed">
                <el-icon><Document /></el-icon>
                <span>招募需求：{{ team.roles_needed }}</span>
              </div>
              <div class="info-item" v-if="team.contact_info">
                <el-icon><Message /></el-icon>
                <span>联系方式：{{ team.contact_info }}</span>
              </div>
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>创建时间：{{ formatDate(team.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="team-footer">
            <el-tag :type="getCompetitionStatusType(team.competition_time)">
              {{ getCompetitionStatusText(team.competition_time) }}
            </el-tag>
            <el-tag type="info">
              {{ team.is_single ? '个人赛' : '团队赛' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[6, 12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadTeams"
          @current-change="loadTeams"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading :fullscreen="false" />
      </div>
    </div>

    <!-- 编辑团队对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑团队"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="teamRules"
        label-width="100px"
      >
        <el-form-item label="团队名称" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="招募需求">
          <el-input
            v-model="editForm.roles_needed"
            type="textarea"
            rows="3"
            placeholder="请描述需要招募的成员和技能要求"
          />
        </el-form-item>
        <el-form-item label="预期人数">
          <el-input-number
            v-model="editForm.member_count"
            :min="2"
            :max="10"
            placeholder="团队人数"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact_info">
          <el-input
            v-model="editForm.contact_info"
            placeholder="QQ、微信或邮箱等联系方式"
          />
        </el-form-item>
        <el-form-item label="所属竞赛">
          <el-input v-model="editForm.competition_name" disabled />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="updating"
          @click="updateTeam"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, More, Edit, Delete, Trophy, Calendar, User, Document, Message, Clock
} from '@element-plus/icons-vue'
import teamAPI from '@/api/team'
import competitionAPI from '@/api/competition'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

const teamsData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const showEditDialog = ref(false)
const updating = ref(false)

const editFormRef = ref()
const editForm = reactive({
  id: '',
  title: '',
  roles_needed: '',
  member_count: 3,
  contact_info: '',
  competition_name: ''
})

const teamRules = {
  title: [
    { required: true, message: '请输入团队名称', trigger: 'blur' }
  ],
  contact_info: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
}

onMounted(async () => {
  await loadTeams()
})

const loadTeams = async () => {
  loading.value = true
  try {
    const response = await teamAPI.getMyTeams({
      page: currentPage.value,
      limit: pageSize.value
    })
    teamsData.value = response.data.teams
    total.value = response.data.total
  } catch (error) {
    console.error('加载团队列表失败:', error)
    ElMessage.error('加载团队列表失败')
  } finally {
    loading.value = false
  }
}

const createNewTeam = () => {
  // 跳转到竞赛列表页面，让用户选择要创建团队的竞赛
  router.push('/competitions')
}

const handleCommand = async (command) => {
  const { action, team } = command

  switch (action) {
    case 'edit':
      editTeam(team)
      break
    case 'delete':
      await deleteTeam(team)
      break
  }
}

const editTeam = (team) => {
  Object.assign(editForm, {
    id: team.id,
    title: team.title,
    roles_needed: team.roles_needed,
    member_count: team.member_count,
    contact_info: team.contact_info,
    competition_name: team.competition_name
  })
  showEditDialog.value = true
}

const updateTeam = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    updating.value = true

    await teamAPI.update(editForm.id, {
      title: editForm.title,
      roles_needed: editForm.roles_needed,
      member_count: editForm.member_count,
      contact_info: editForm.contact_info
    })

    ElMessage.success('团队信息更新成功')
    showEditDialog.value = false
    await loadTeams()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新团队信息失败')
    }
  } finally {
    updating.value = false
  }
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

    await teamAPI.delete(team.id)
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCompetitionStatusType = (time) => {
  const now = new Date()
  const competitionTime = new Date(time)
  return competitionTime > now ? 'success' : 'info'
}

const getCompetitionStatusText = (time) => {
  const now = new Date()
  const competitionTime = new Date(time)
  return competitionTime > now ? '进行中' : '已结束'
}
</script>

<style scoped>
.teams-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: white;
  font-size: 2rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.team-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.team-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.team-title-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.competition-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  backdrop-filter: blur(10px);
}

.team-body {
  padding: 24px;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
  font-size: 0.95rem;
}

.info-item span {
  flex: 1;
}

.team-footer {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.loading-container {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .teams-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .team-header {
    flex-direction: column;
    gap: 16px;
  }

  .team-actions {
    align-self: flex-end;
  }
}
</style>