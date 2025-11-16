<template>
  <header class="admin-header">
    <div class="header-container">
      <div class="header-left">
        <h1 @click="goToDashboard" class="logo">
          MMJI 管理后台
        </h1>
      </div>

      <nav class="nav-menu">
        <el-menu
          :default-active="$route.path"
          mode="horizontal"
          :ellipsis="false"
          class="nav-menu-desktop"
        >
          <el-menu-item index="/admin" @click="goToDashboard">仪表板</el-menu-item>
          <el-menu-item index="/admin/competitions" @click="goToCompetitions">竞赛管理</el-menu-item>
          <el-menu-item index="/admin/teams" @click="goToTeams">团队管理</el-menu-item>
        </el-menu>
      </nav>

      <div class="header-right">
        <el-button
          type="primary"
          size="small"
          @click="goToFrontend"
          class="frontend-btn"
        >
          前台页面
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
      title="管理菜单"
      direction="rtl"
      size="280px"
    >
      <el-menu :default-active="$route.path">
        <el-menu-item index="/admin" @click="goToDashboard">仪表板</el-menu-item>
        <el-menu-item index="/admin/competitions" @click="goToCompetitions">竞赛管理</el-menu-item>
        <el-menu-item index="/admin/teams" @click="goToTeams">团队管理</el-menu-item>

        <el-divider />


        <el-button
          type="primary"
          @click="goToFrontend"
          style="width: 100%; margin-top: 10px;"
        >
          前台页面
        </el-button>
      </el-menu>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Menu } from '@element-plus/icons-vue'

const router = useRouter()

const mobileMenuVisible = ref(false)

const goToDashboard = () => {
  router.push('/admin')
  mobileMenuVisible.value = false
}

const goToCompetitions = () => {
  router.push('/admin/competitions')
  mobileMenuVisible.value = false
}

const goToTeams = () => {
  router.push('/admin/teams')
  mobileMenuVisible.value = false
}

const goToFrontend = () => {
  router.push('/')
  mobileMenuVisible.value = false
}

</script>

<style scoped>
.admin-header {
  background: #304156;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
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
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #409eff;
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

.nav-menu-desktop .el-menu-item {
  color: #bfcbd9;
  border-bottom: 2px solid transparent;
}

.nav-menu-desktop .el-menu-item:hover,
.nav-menu-desktop .el-menu-item.is-active {
  color: #409eff;
  background-color: transparent;
  border-bottom-color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}


.frontend-btn {
  margin-left: 8px;
}

.mobile-menu-btn {
  display: none;
  color: #bfcbd9;
}

@media (max-width: 768px) {
  .nav-menu-desktop {
    display: none;
  }


  .frontend-btn {
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