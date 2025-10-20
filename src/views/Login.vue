<template>
  <div class="login-container">
    <div class="login-card card-shadow">
      <div class="login-header">
        <h1>MMJI 竞赛管理平台</h1>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-actions">
          <el-button type="text" @click="goToAdminLogin">管理员登录</el-button>
          <el-button type="text" @click="goToRegister">注册账户</el-button>
        </div>
      </el-form>
    </div>

    <div class="footer-info">
      <h4>Powered By</h4>
      <p>湖北大学曼城联合学院</p>
      <p>湖北大学曼城联合学院学生会学术科技部</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    await userStore.login(loginForm)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const goToAdminLogin = () => {
  router.push('/admin/login')
}

const goToRegister = () => {
  ElMessage.info('注册功能暂未开放。如需注册新账户，请联系nzgbsm@outlook.com')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  margin-bottom: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 0.9rem;
}

.login-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.footer-info {
  max-width: 400px;
  text-align: center;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
}

.footer-info h4 {
  color: white;
  margin-bottom: 10px;
}

.footer-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}
</style>
