<template>
  <div class="profile-container">
    <AppHeader />

    <div class="page-container">
      <div class="page-header">
        <h1>个人资料</h1>
      </div>

      <div class="profile-content">
        <!-- 基本信息 -->
        <div class="info-section card-shadow">
          <h2>基本信息</h2>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="120px"
            class="profile-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            <el-form-item label="学号">
              <el-input v-model="profileForm.student_id" disabled />
            </el-form-item>
            <el-form-item label="真实姓名" prop="real_name">
              <el-input v-model="profileForm.real_name" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="认证状态">
              <el-tag :type="profileForm.auth_status ? 'success' : 'danger'">
                {{ profileForm.auth_status ? '已认证' : '未认证' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="注册时间">
              <el-input :value="formatDate(profileForm.created_at)" disabled />
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button type="primary" :loading="updating" @click="updateProfile">
              保存修改
            </el-button>
          </div>
        </div>

        <!-- 修改密码 -->
        <div class="password-section card-shadow">
          <h2>修改密码</h2>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            class="password-form"
          >
            <el-form-item label="当前密码" prop="current_password">
              <el-input
                v-model="passwordForm.current_password"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                placeholder="请输入新密码（至少6位）"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirm_password">
              <el-input
                v-model="passwordForm.confirm_password"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button type="warning" :loading="changingPassword" @click="changePassword">
              修改密码
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const userStore = useUserStore()

const profileFormRef = ref()
const passwordFormRef = ref()
const updating = ref(false)
const changingPassword = ref(false)

const profileForm = reactive({
  username: '',
  real_name: '',
  student_id: '',
  auth_status: 0,
  created_at: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const profileRules = {
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ]
}

const passwordRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    await userStore.getProfile()
    if (userStore.user) {
      Object.assign(profileForm, userStore.user)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

const updateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    updating.value = true

    await userStore.updateProfile({
      real_name: profileForm.real_name
    })

    ElMessage.success('个人信息更新成功')
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新个人信息失败')
    }
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    await userStore.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    })

    ElMessage.success('密码修改成功')

    // 清空密码表单
    Object.assign(passwordForm, {
      current_password: '',
      new_password: '',
      confirm_password: ''
    })

    // 重置表单验证
    passwordFormRef.value.clearValidate()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('修改密码失败')
    }
  } finally {
    changingPassword.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-container {
  padding: 40px 20px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.info-section,
.password-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
}

.info-section h2,
.password-section h2 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.profile-form,
.password-form {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .page-container {
    padding: 20px 15px 15px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .info-section,
  .password-section {
    padding: 20px;
  }
}

:deep(.el-input:disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #909399;
  cursor: not-allowed;
}
</style>