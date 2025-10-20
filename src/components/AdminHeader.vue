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
          <el-menu-item index="/admin/users" @click="goToUsers">用户管理</el-menu-item>
          <el-menu-item index="/admin/competitions" @click="goToCompetitions">竞赛管理</el-menu-item>
          <el-menu-item index="/admin/teams" @click="goToTeams">团队管理</el-menu-item>
        </el-menu>
      </nav>

      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :icon="UserFilled" />
            <span class="username">{{ userStore.user?.real_name || userStore.user?.username }}</span>
            <el-icon class="el-icon--right"><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

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
      <el-menu :default-active="$route.path" @select="handleMobileMenuSelect">
        <el-menu-item index="/admin" @click="goToDashboard">仪表板</el-menu-item>
        <el-menu-item index="/admin/users" @click="goToUsers">用户管理</el-menu-item>
        <el-menu-item index="/admin/competitions" @click="goToCompetitions">竞赛管理</el-menu-item>
        <el-menu-item index="/admin/teams" @click="goToTeams">团队管理</el-menu-item>

        <el-divider />

        <el-menu-item index="profile">个人资料</el-menu-item>
        <el-menu-item index="settings">设置</el-menu-item>
        <el-menu-item index="logout">退出登录</el-menu-item>

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
import { UserFilled, CaretBottom, Menu } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const mobileMenuVisible = ref(false)

const goToDashboard = () => {
  router.push('/admin')
  mobileMenuVisible.value = false
}

const goToUsers = () => {
  router.push('/admin/users')
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

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.logout()
        router.push('/admin/login')
        ElMessage.success('已退出登录')
      } catch {
        // 用户取消
      }
      break
  }
}

const handleMobileMenuSelect = (index) => {
  mobileMenuVisible.value = false

  if (index === 'profile') {
    handleCommand('profile')
  } else if (index === 'settings') {
    handleCommand('settings')
  } else if (index === 'logout') {
    handleCommand('logout')
  }
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
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 0.9rem;
  color: #bfcbd9;
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

  .username {
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