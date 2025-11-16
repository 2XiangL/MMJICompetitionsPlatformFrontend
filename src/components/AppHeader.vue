<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-left">
        <h1 @click="goHome" class="logo">
          MMJI 竞赛平台
        </h1>
      </div>

      <nav class="nav-menu">
        <el-menu
          :default-active="$route.path"
          mode="horizontal"
          :ellipsis="false"
          class="nav-menu-desktop"
        >
          <el-menu-item index="/" @click="goHome">首页</el-menu-item>
          <el-menu-item index="/competitions" @click="goToCompetitions">竞赛列表</el-menu-item>
        </el-menu>
      </nav>

      <div class="header-right">
        <el-button
          type="primary"
          size="small"
          @click="goToAdmin"
          class="admin-btn"
        >
          管理后台
        </el-button>
      </div>

      <!-- 移动端菜单按钮 -->
      <el-button
        class="mobile-menu-btn"
        text
        @click="mobileMenuVisible = !mobileMenuVisible"
      >
        <el-icon size="24"><Menu /></el-icon>
      </el-button>
    </div>

    <!-- 移动端菜单 -->
    <el-drawer
      v-model="mobileMenuVisible"
      title="导航菜单"
      direction="rtl"
      size="280px"
    >
      <el-menu :default-active="$route.path" @select="handleMobileMenuSelect">
        <el-menu-item index="/" @click="goHome">首页</el-menu-item>
        <el-menu-item index="/competitions" @click="goToCompetitions">竞赛列表</el-menu-item>

        <el-divider />

        <el-button
          type="primary"
          @click="goToAdmin"
          style="width: 100%; margin-top: 10px;"
        >
          管理后台
        </el-button>
      </el-menu>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Menu } from '@element-plus/icons-vue'

const router = useRouter()

const mobileMenuVisible = ref(false)

const goHome = () => {
  router.push('/')
  mobileMenuVisible.value = false
}

const goToCompetitions = () => {
  router.push('/competitions')
  mobileMenuVisible.value = false
}

const goToAdmin = () => {
  router.push('/admin')
  mobileMenuVisible.value = false
}

const handleMobileMenuSelect = (index) => {
  mobileMenuVisible.value = false
}
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #667eea;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu-desktop {
  border-bottom: none;
  background: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 0.9rem;
  color: #333;
}

.admin-btn {
  margin-left: 8px;
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .nav-menu-desktop {
    display: none;
  }

  .username {
    display: none;
  }

  .admin-btn {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .header-container {
    padding: 0 16px;
  }
}
</style>