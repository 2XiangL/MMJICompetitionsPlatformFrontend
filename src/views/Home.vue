<template>
  <div class="home-container">
    <AppHeader />

    <div class="page-container">
      <div class="welcome-section">
        <h1 class="page-title">欢迎来到曼城联合学院竞赛信息发布平台</h1>
        <p class="welcome-text">探索各种竞赛机会，组建团队，展示才华</p>
      </div>

      <!-- 查看所有竞赛按钮 -->
      <div class="view-all-section">
        <el-button type="primary" size="large" @click="viewAllCompetitions" class="view-all-btn">
          查看所有竞赛
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
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

        <!-- 加载更多指示器 -->
        <div v-if="isLoading" class="loading-indicator">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在加载更多竞赛...</span>
        </div>
        <div v-if="!hasMore && recentCompetitions.length > 0" class="no-more-indicator">
          <span>没有更多竞赛了</span>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import competitionAPI from '@/api/competition'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Loading, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const recentCompetitions = ref([])
const currentPage = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)

onMounted(async () => {
  await loadRecentCompetitions()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const loadRecentCompetitions = async (page = 1) => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  try {
    const response = await competitionAPI.getAll({ page, limit: 12 })
    const data = response.data

    if (page === 1) {
      recentCompetitions.value = data.competitions
    } else {
      recentCompetitions.value.push(...data.competitions)
    }

    hasMore.value = data.hasMore
    currentPage.value = page
  } catch (error) {
    console.error('加载竞赛失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const windowHeight = window.innerHeight
  const scrollHeight = document.documentElement.scrollHeight

  // 当滚动到距离底部100px时加载更多
  if (scrollTop + windowHeight >= scrollHeight - 100 && hasMore.value && !isLoading.value) {
    loadRecentCompetitions(currentPage.value + 1)
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

.view-all-section {
  text-align: center;
  margin-bottom: 50px;
}

.view-all-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 32px;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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

.loading-indicator,
.no-more-indicator {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  color: #666;
}

.loading-indicator .el-icon {
  margin-right: 8px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
