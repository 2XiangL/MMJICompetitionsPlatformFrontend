<template>
  <div class="home-container">
    <AppHeader />

    <div class="page-container">
      <div class="welcome-section">
        <h1 class="page-title">欢迎来到曼城联合学院竞赛信息发布平台</h1>
        <p class="welcome-text">探索各种竞赛机会，组建团队，展示才华</p>
      </div>

      <!-- 快速统计 -->
      <div class="stats-grid">
        <div class="stat-card card-shadow">
          <div class="stat-icon">
            <el-icon size="40"><Trophy /></el-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalCompetitions }}</h3>
            <p>竞赛总数</p>
          </div>
        </div>

  
        <div class="stat-card card-shadow">
          <div class="stat-icon">
            <el-icon size="40"><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalTeams }}</h3>
            <p>团队总数</p>
          </div>
        </div>
      </div>

      <!-- 最新竞赛 -->
      <section class="recent-section">
        <h2>最新竞赛</h2>
        <div class="card-grid">
          <div
            v-for="competition in recentCompetitions"
            :key="competition.id"
            class="competition-card card-shadow"
            @click="goToCompetition(competition.id)"
          >
            <div class="competition-card-header">
              <h3>{{ competition.name }}</h3>
              <span class="grade-tag" :class="getGradeClass(competition.grade)">
                {{ competition.grade }}
              </span>
            </div>
            <div class="competition-card-body">
              <p class="organizer">
                <el-icon><OfficeBuilding /></el-icon>
                {{ competition.organzer }}
              </p>
              <p class="time">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(competition.time) }}
              </p>
              <div class="competition-type">
                <el-tag :type="competition.is_single ? 'success' : 'warning'">
                  {{ competition.is_single ? '个人赛' : '团队赛' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="section-footer">
          <el-button type="primary" size="large" @click="viewAllCompetitions">
            查看所有竞赛
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import competitionAPI from '@/api/competition'
import teamAPI from '@/api/team'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

const stats = ref({
  totalCompetitions: 0,
  totalTeams: 0
})

const recentCompetitions = ref([])

onMounted(async () => {
  await loadRecentCompetitions()
  await loadTeamStats()
})

const loadRecentCompetitions = async () => {
  try {
    const response = await competitionAPI.getAll()
    recentCompetitions.value = response.data.slice(0, 6) // 显示最新6个竞赛
    calculateStats() // 加载完竞赛数据后计算统计
  } catch (error) {
    console.error('加载竞赛失败:', error)
  }
}

const calculateStats = () => {
  stats.value.totalCompetitions = recentCompetitions.value.length
}

const loadTeamStats = async () => {
  try {
    const response = await teamAPI.getStats.count()
    stats.value.totalTeams = response.data.total
  } catch (error) {
    console.error('加载团队统计失败:', error)
    // 如果API调用失败，设置为0作为默认值
    stats.value.totalTeams = 0
  }
}

const goToCompetition = (id) => {
  router.push(`/competitions/${id}`)
}

const viewAllCompetitions = () => {
  router.push('/competitions')
}

const formatDate = (dateString) => {
  if (dateString === 'unknown') {
    return '未知时间'
  }
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
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.welcome-text {
  font-size: 1.2rem;
  margin-top: 10px;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.stat-card {
  background: white;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  color: #667eea;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: #333;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #666;
}

.recent-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
}

.recent-section h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.section-footer {
  text-align: center;
  margin-top: 30px;
}

.competition-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.competition-card:hover {
  transform: translateY(-5px);
}

.organizer, .time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: #666;
  font-size: 0.9rem;
}

.competition-type {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .recent-section {
    padding: 20px;
  }
}
</style>
