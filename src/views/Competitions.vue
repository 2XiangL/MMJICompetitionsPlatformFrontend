<template>
  <div class="competitions-container">
    <AppHeader />

    <div class="page-container">
      <h1 class="page-title">竞赛列表</h1>

      <!-- 搜索和筛选 -->
      <div class="search-filter-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
              v-model="searchQuery"
              placeholder="搜索竞赛名称或主办方..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="filterType"
              placeholder="竞赛类型"
              clearable
              @change="handleFilter"
            >
              <el-option label="个人赛" value="single" />
              <el-option label="团队赛" value="team" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="filterGrade"
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

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading :fullscreen="false" />
      </div>

      <!-- 竞赛卡片网格 -->
      <div v-else class="card-grid">
        <div
          v-for="competition in filteredCompetitions"
          :key="competition.id"
          class="competition-card card-shadow"
          @click="goToCompetition(competition.id)"
        >
          <div class="competition-card-header">
            <div class="header-content">
              <h3>{{ competition.name }}</h3>
              <span class="grade-tag" :class="getGradeClass(competition.grade)">
                {{ competition.grade }}
              </span>
            </div>
            <div class="status-section">
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
          <div class="competition-card-body">
            <div class="info-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span>主办方：{{ competition.organzer }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>比赛时间：{{ formatDate(competition.time) }}</span>
            </div>
            <div class="info-item" v-if="competition.time_information">
              <el-icon><Clock /></el-icon>
              <span>{{ competition.time_information }}</span>
            </div>
            <div class="info-item" v-if="competition.offical_website">
              <el-icon><Link /></el-icon>
              <a
                :href="competition.offical_website"
                target="_blank"
                @click.stop
              >
                官方网站
              </a>
            </div>
            <div class="description" v-if="competition.description">
              {{ truncateDescription(competition.description) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredCompetitions.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无符合条件的竞赛">
          <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
        </el-empty>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, OfficeBuilding, Calendar, Clock, Link } from '@element-plus/icons-vue'
import competitionAPI from '@/api/competition'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

const competitions = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterType = ref('')
const filterGrade = ref('')

onMounted(async () => {
  await loadCompetitions()
})

const loadCompetitions = async () => {
  loading.value = true
  try {
    const response = await competitionAPI.getAll()
    competitions.value = response.data
  } catch (error) {
    console.error('加载竞赛失败:', error)
    ElMessage.error('加载竞赛信息失败')
  } finally {
    loading.value = false
  }
}

const filteredCompetitions = computed(() => {
  let filtered = competitions.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(competition =>
      competition.name.toLowerCase().includes(query) ||
      competition.organzer.toLowerCase().includes(query)
    )
  }

  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(competition =>
      filterType.value === 'single' ? competition.is_single : !competition.is_single
    )
  }

  // 等级筛选
  if (filterGrade.value) {
    filtered = filtered.filter(competition =>
      competition.grade === filterGrade.value
    )
  }

  return filtered
})

const handleSearch = () => {
  // 搜索逻辑已经在computed中处理
}

const handleFilter = () => {
  // 筛选逻辑已经在computed中处理
}

const resetFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterGrade.value = ''
}

const goToCompetition = (id) => {
  router.push(`/competitions/${id}`)
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

const truncateDescription = (description, maxLength = 100) => {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength) + '...'
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
.competitions-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-container {
  padding: 40px 20px 20px;
}

.page-title {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  font-size: 2.5rem;
  font-weight: 300;
}

.search-filter-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.loading-container {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.competition-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.competition-card:hover {
  transform: translateY(-5px);
}

.competition-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-content h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.competition-card-body {
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  color: #666;
  font-size: 0.9rem;
}

.info-item a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.info-item a:hover {
  color: #764ba2;
}

.description {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  color: #666;
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
}

.status-unknown {
  background-color: #f0f0f0;
  color: #666;
}

@media (max-width: 768px) {
  .search-filter-section {
    margin-bottom: 20px;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    margin-bottom: 15px;
  }
}
</style>
