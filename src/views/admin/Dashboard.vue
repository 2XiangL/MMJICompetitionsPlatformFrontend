<template>
  <div class="admin-dashboard">
    <AdminHeader />

    <div class="page-container">
      <h1 class="page-title">管理员仪表板</h1>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card card-shadow">
          <div class="stat-icon user-icon">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.users }}</h3>
            <p>用户总数</p>
          </div>
        </div>

        <div class="stat-card card-shadow">
          <div class="stat-icon competition-icon">
            <el-icon size="32"><Trophy /></el-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.competitions.total }}</h3>
            <p>竞赛总数</p>
            <div class="sub-stats">
              <span>进行中: {{ stats.competitions.active }}</span>
              <span>个人赛: {{ stats.competitions.single }}</span>
              <span>团队赛: {{ stats.competitions.team }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card card-shadow">
          <div class="stat-icon team-icon">
            <el-icon size="32"><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.teams }}</h3>
            <p>团队总数</p>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions card-shadow">
        <h2>快速操作</h2>
        <div class="actions-grid">
          <el-button
            type="primary"
            :icon="Plus"
            @click="createUser"
          >
            创建用户
          </el-button>
          <el-button
            type="success"
            :icon="Plus"
            @click="createCompetition"
          >
            创建竞赛
          </el-button>
          <el-button
            type="warning"
            :icon="Setting"
            @click="manageUsers"
          >
            用户管理
          </el-button>
          <el-button
            type="info"
            :icon="Setting"
            @click="manageCompetitions"
          >
            竞赛管理
          </el-button>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="recent-activities card-shadow">
        <h2>最近活动</h2>
        <div v-if="recentActivities.length > 0" class="activities-list">
          <div
            v-for="activity in recentActivities"
            :key="activity.time"
            class="activity-item"
          >
            <div class="activity-icon">
              <el-icon v-if="activity.type === 'user'"><User /></el-icon>
              <el-icon v-else-if="activity.type === 'competition'"><Trophy /></el-icon>
              <el-icon v-else><UserFilled /></el-icon>
            </div>
            <div class="activity-content">
              <p>{{ getActivityText(activity) }}</p>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-activities">
          <el-empty description="暂无最近活动" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Trophy, UserFilled, Plus, Setting } from '@element-plus/icons-vue'
import adminAPI from '@/api/admin'
import AdminHeader from '@/components/AdminHeader.vue'

const router = useRouter()

const stats = ref({
  users: 0,
  competitions: {
    total: 0,
    active: 0,
    single: 0,
    team: 0
  },
  teams: 0
})

const recentActivities = ref([])

onMounted(async () => {
  await loadStats()
  await loadRecentActivities()
})

const loadStats = async () => {
  try {
    const [userStats, competitionStats, teamStats] = await Promise.all([
      adminAPI.getStats.users(),
      adminAPI.getStats.competitions(),
      adminAPI.getStats.teams()
    ])

    stats.value = {
      users: userStats.data.total,
      competitions: competitionStats.data,
      teams: teamStats.data.total
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const loadRecentActivities = async () => {
  try {
    const response = await adminAPI.getStats.recentActivities()
    recentActivities.value = response.data
  } catch (error) {
    console.error('加载最近活动失败:', error)
  }
}

const createUser = () => {
  router.push('/admin/users')
}

const createCompetition = () => {
  router.push('/admin/competitions')
}

const manageUsers = () => {
  router.push('/admin/users')
}

const manageCompetitions = () => {
  router.push('/admin/competitions')
}

const getActivityText = (activity) => {
  switch (activity.type) {
    case 'user':
      return `新用户注册: ${activity.title}`
    case 'competition':
      return `新增竞赛: ${activity.title}`
    case 'team':
      return `创建团队: ${activity.title}`
    default:
      return activity.title
  }
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.competition-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.team-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 2rem;
  color: #333;
}

.stat-content p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 0.9rem;
}

.sub-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
  color: #999;
}

.quick-actions,
.recent-activities {
  background: white;
  padding: 25px;
  margin-bottom: 20px;
}

.quick-actions h2,
.recent-activities h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background: #e9ecef;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 5px 0;
  color: #333;
}

.activity-time {
  font-size: 0.8rem;
  color: #999;
}

.empty-activities {
  text-align: center;
  padding: 40px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .page-container {
    padding: 20px 16px;
  }
}
</style>