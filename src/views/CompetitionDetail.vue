<template>
  <div class="competition-detail-container">
    <AppHeader />

    <div class="page-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading :fullscreen="false" />
      </div>

      <!-- 竞赛详情内容 -->
      <div v-else-if="competition" class="detail-content">
        <!-- 竞赛基本信息 -->
        <div class="competition-header card-shadow">
          <div class="header-top">
            <div class="title-section">
              <h1>{{ competition.name }}</h1>
              <div class="meta-tags">
                <span class="grade-tag" :class="getGradeClass(competition.grade)">
                  {{ competition.grade }}
                </span>
                <span
                  class="status-tag"
                  :class="getCompetitionStatus(competition.time)"
                >
                  {{ getCompetitionStatusText(competition.time) }}
                </span>
                <el-tag :type="competition.is_single ? 'success' : 'warning'">
                  {{ competition.is_single ? '个人赛' : '团队赛' }}
                </el-tag>
              </div>
            </div>
            <div class="actions">
              <el-button
                v-if="competition.offical_website"
                type="primary"
                @click="openOfficialWebsite"
                :icon="Link"
              >
                官方网站
              </el-button>
              <el-button
                v-if="!competition.is_single"
                type="success"
                @click="showCreateTeamDialog = true"
                :icon="Plus"
              >
                创建团队
              </el-button>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <el-icon><OfficeBuilding /></el-icon>
              <div>
                <h4>主办方</h4>
                <p>{{ competition.organzer }}</p>
              </div>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <div>
                <h4>比赛时间</h4>
                <p v-if="competition.time === 'unknown'" style="color: #999;">暂不确定</p>
                <p v-else>{{ formatDate(competition.time) }}</p>
              </div>
            </div>
            <div class="info-item" v-if="competition.time_information">
              <el-icon><Clock /></el-icon>
              <div>
                <h4>时间信息</h4>
                <p>{{ competition.time_information }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 竞赛描述 -->
        <div class="description-section card-shadow" v-if="competition.description">
          <h2>竞赛介绍</h2>
          <div class="description-content">
            {{ competition.description }}
          </div>
        </div>

        <!-- 团队信息（仅团队赛显示） -->
        <div
          v-if="!competition.is_single"
          class="teams-section card-shadow"
        >
          <div class="section-header">
            <h2>团队列表</h2>
            <div class="team-stats">
              <el-tag type="info">共 {{ teamsData.total }} 个团队</el-tag>
            </div>
          </div>

          <!-- 团队列表 -->
          <div v-if="teamsData.teams.length > 0" class="teams-list">
            <div
              v-for="team in teamsData.teams"
              :key="team.id"
              class="team-card"
            >
              <div class="team-header">
                <h3>{{ team.title }}</h3>
                <div class="team-meta">
                  <span class="member-count">
                    <el-icon><User /></el-icon>
                    {{ team.member_count || 0 }} 人
                  </span>
                  <span class="created-time">
                    <el-icon><Clock /></el-icon>
                    {{ formatDate(team.created_at) }}
                  </span>
                </div>
              </div>
              <div class="team-info">
              <p><strong>队长：</strong>{{ team.real_name || team.username }}</p>
              <p v-if="team.roles_needed">
                <strong>招募需求：</strong>{{ team.roles_needed }}
              </p>
              <p v-if="team.contact_info">
                <strong>联系方式：</strong>
                <el-button
                  type="text"
                  @click="showContactInfo(team.contact_info)"
                >
                  查看联系方式
                </el-button>
              </p>
            </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="teamsData.total > 10" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="teamsData.total"
              layout="prev, pager, next"
              @current-change="loadTeams"
            />
          </div>

          <!-- 空状态 -->
          <div v-if="teamsData.teams.length === 0" class="empty-teams">
            <el-empty description="暂无团队信息">
              <el-button
                type="primary"
                @click="showCreateTeamDialog = true"
              >
                创建第一个团队
              </el-button>
            </el-empty>
          </div>
        </div>

        <!-- 个人赛提示 -->
        <div
          v-if="competition.is_single"
          class="individual-section card-shadow"
        >
          <h2>个人赛说明</h2>
          <p>本次竞赛为个人赛，无需组队参与。请关注官方网站获取报名信息和比赛详情。</p>
          <el-button
            v-if="competition.offical_website"
            type="primary"
            @click="openOfficialWebsite"
          >
            前往官方网站
          </el-button>
        </div>
      </div>

      <!-- 竞赛不存在 -->
      <div v-else-if="!loading" class="not-found">
        <el-result
          icon="warning"
          title="竞赛不存在"
          sub-title="您访问的竞赛可能已被删除或不存在"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回上一页</el-button>
            <el-button @click="goToCompetitions">查看所有竞赛</el-button>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 创建团队对话框 -->
    <el-dialog
      v-model="showCreateTeamDialog"
      title="创建团队"
      width="500px"
    >
      <el-form
        ref="teamFormRef"
        :model="teamForm"
        :rules="teamRules"
        label-width="100px"
      >
        <el-form-item label="团队名称" prop="title">
          <el-input v-model="teamForm.title" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="招募需求" prop="roles_needed">
          <el-input
            v-model="teamForm.roles_needed"
            type="textarea"
            rows="3"
            placeholder="请描述需要招募的成员和技能要求"
          />
        </el-form-item>
        <el-form-item label="预期人数" prop="member_count">
          <el-input-number
            v-model="teamForm.member_count"
            :min="2"
            :max="10"
            placeholder="团队人数"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact_info">
          <el-input
            v-model="teamForm.contact_info"
            placeholder="QQ、微信或邮箱等联系方式"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateTeamDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="creatingTeam"
          @click="createTeam"
        >
          创建团队
        </el-button>
      </template>
    </el-dialog>

    <!-- 联系方式对话框 -->
    <el-dialog
      v-model="showContactDialog"
      title="联系方式"
      width="400px"
    >
      <p>{{ selectedContact }}</p>
      <template #footer>
        <el-button @click="showContactDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Link, Plus, OfficeBuilding, Calendar, Clock, User
} from '@element-plus/icons-vue'
import competitionAPI from '@/api/competition'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const router = useRouter()

const competition = ref(null)
const teamsData = reactive({
  teams: [],
  total: 0
})
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const showCreateTeamDialog = ref(false)
const showContactDialog = ref(false)
const selectedContact = ref('')
const creatingTeam = ref(false)

const teamFormRef = ref()
const teamForm = reactive({
  title: '',
  roles_needed: '',
  member_count: 3,
  contact_info: ''
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
  await loadCompetition()
  if (competition.value && !competition.value.is_single) {
    await loadTeams()
  }
})

const loadCompetition = async () => {
  loading.value = true
  try {
    const response = await competitionAPI.getById(route.params.id)
    competition.value = response.data
  } catch (error) {
    console.error('加载竞赛详情失败:', error)
    ElMessage.error('加载竞赛详情失败')
  } finally {
    loading.value = false
  }
}

const loadTeams = async (page = 1) => {
  try {
    const offset = (page - 1) * pageSize.value
    const response = await competitionAPI.getTeams(route.params.id, {
      offset,
      limit: pageSize.value
    })
    teamsData.teams = response.data.teams
    teamsData.total = response.data.total
  } catch (error) {
    console.error('加载团队信息失败:', error)
    ElMessage.error('加载团队信息失败')
  }
}

const createTeam = async () => {
  if (!teamFormRef.value) return

  try {
    await teamFormRef.value.validate()
    creatingTeam.value = true

    const response = await competitionAPI.createTeam(route.params.id, teamForm)

    if (response.data.message.includes('等待管理员审核')) {
      ElMessage.success('团队创建成功，等待管理员审核后即可显示')
    } else {
      ElMessage.success('团队创建成功')
    }

    showCreateTeamDialog.value = false
    Object.assign(teamForm, {
      title: '',
      roles_needed: '',
      member_count: 3,
      contact_info: ''
    })

    // 重新加载团队列表
    await loadTeams(currentPage.value)
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('创建团队失败')
    }
  } finally {
    creatingTeam.value = false
  }
}


const showContactInfo = (contact) => {
  selectedContact.value = contact
  showContactDialog.value = true
}

const openOfficialWebsite = () => {
  window.open(competition.value.offical_website, '_blank')
}

const goBack = () => {
  router.go(-1)
}

const goToCompetitions = () => {
  router.push('/competitions')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getGradeClass = (grade) => {
  const gradeMap = {
    'A': 'grade-a',
    'B': 'grade-b',
    'C': 'grade-c',
    'D': 'grade-d'
  }
  return gradeMap[grade] || 'grade-d'
}

const getCompetitionStatus = (time) => {
  if (time === 'unknown') return 'status-unknown'
  const now = new Date()
  const competitionTime = new Date(time)
  return competitionTime > now ? 'status-active' : 'status-past'
}

const getCompetitionStatusText = (time) => {
  if (time === 'unknown') return '待定'
  const now = new Date()
  const competitionTime = new Date(time)
  return competitionTime > now ? '进行中' : '已结束'
}
</script>

<style scoped>
.competition-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-container {
  padding: 40px 20px 20px;
}

.loading-container {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-content > * {
  margin-bottom: 30px;
}

.competition-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.title-section h1 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
}

.meta-tags {
  display: flex;
  gap: 12px;
  align-items: center;
}

.actions {
  display: flex;
  gap: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-item h4 {
  margin: 0 0 5px 0;
  color: #667eea;
  font-size: 0.9rem;
}

.info-item p {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.description-section,
.teams-section,
.individual-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
}

.description-section h2,
.teams-section h2,
.individual-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.description-content {
  line-height: 1.8;
  color: #666;
  font-size: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.team-stats {
  display: flex;
  gap: 12px;
}

.teams-list {
  display: grid;
  gap: 20px;
}

.team-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.team-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.team-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.team-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #666;
}

.member-count,
.created-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.team-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.team-info {
  flex: 1;
}

.team-info p {
  margin: 8px 0;
  color: #666;
  font-size: 0.9rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.empty-teams {
  text-align: center;
  padding: 40px;
}

.individual-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.not-found {
  background: white;
  border-radius: 12px;
  padding: 40px;
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 20px;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .team-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .team-actions {
    width: 100%;
  }
}

.status-unknown {
  background-color: #f0f0f0;
  color: #666;
}

.status-active {
  background-color: #f0f9ff;
  color: #1890ff;
}

.status-past {
  background-color: #fff2e8;
  color: #fa8c16;
}
</style>