<template>
  <div class="admin-users">
    <AdminHeader />

    <div class="page-container">
      <div class="page-header">
        <h1>用户管理</h1>
        <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
          创建用户
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户名、真实姓名或学号..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="authFilter"
              placeholder="认证状态"
              clearable
              @change="handleFilter"
            >
              <el-option label="已认证" :value="1" />
              <el-option label="未认证" :value="0" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="roleFilter"
              placeholder="用户角色"
              clearable
              @change="handleFilter"
            >
              <el-option label="普通用户" value="user" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 用户表格 -->
      <div class="table-section">
        <el-table
          :data="filteredUsers"
          :loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="real_name" label="真实姓名" min-width="120" />
          <el-table-column prop="student_id" label="学号" min-width="120" />
          <el-table-column label="认证状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.auth_status ? 'success' : 'danger'">
                {{ row.auth_status ? '已认证' : '未认证' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'warning' : 'info'">
                {{ row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="注册时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="editUser(row)"
              >
                编辑
              </el-button>
              <el-button
                :type="row.auth_status ? 'danger' : 'success'"
                size="small"
                @click="toggleUserAuth(row)"
              >
                {{ row.auth_status ? '取消认证' : '认证' }}
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteUser(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadUsers"
            @current-change="loadUsers"
          />
        </div>

        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedUsers.length > 0">
          <span>已选择 {{ selectedUsers.length }} 个用户</span>
          <el-button
            type="success"
            @click="batchUpdateAuth(1)"
          >
            批量认证
          </el-button>
          <el-button
            type="warning"
            @click="batchUpdateAuth(0)"
          >
            批量取消认证
          </el-button>
          <el-button
            type="danger"
            @click="batchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建用户"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="createForm.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="student_id">
          <el-input v-model="createForm.student_id" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-switch
            v-model="createForm.auth_status"
            :active-value="1"
            :inactive-value="0"
            active-text="已认证"
            inactive-text="未认证"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="creating"
          @click="createUser"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑用户"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="editForm.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="student_id">
          <el-input v-model="editForm.student_id" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-switch
            v-model="editForm.auth_status"
            :active-value="1"
            :inactive-value="0"
            active-text="已认证"
            inactive-text="未认证"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="editing"
          @click="updateUser"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import adminAPI from '@/api/admin'
import AdminHeader from '@/components/AdminHeader.vue'

const users = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const authFilter = ref('')
const roleFilter = ref('')

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const editing = ref(false)

const createFormRef = ref()
const editFormRef = ref()

const createForm = reactive({
  username: '',
  password: '',
  real_name: '',
  student_id: '',
  auth_status: 0
})

const editForm = reactive({
  id: '',
  real_name: '',
  student_id: '',
  auth_status: 0
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const editRules = {
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  student_id: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ]
}

const selectedUsers = ref([])

onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await adminAPI.users.getAll({
      page: currentPage.value,
      limit: pageSize.value
    })
    users.value = response.data.users
    total.value = response.data.total
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      (user.real_name && user.real_name.toLowerCase().includes(query)) ||
      (user.student_id && user.student_id.toString().includes(query))
    )
  }

  if (authFilter.value !== '') {
    filtered = filtered.filter(user => user.auth_status === authFilter.value)
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

const handleSearch = () => {
  // 搜索逻辑已经在computed中处理
}

const handleFilter = () => {
  // 筛选逻辑已经在computed中处理
}

const createUser = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    await adminAPI.users.create(createForm)

    ElMessage.success('用户创建成功')
    showCreateDialog.value = false
    Object.assign(createForm, {
      username: '',
      password: '',
      real_name: '',
      student_id: '',
      auth_status: 0
    })

    await loadUsers()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('创建用户失败')
    }
  } finally {
    creating.value = false
  }
}

const editUser = (user) => {
  Object.assign(editForm, {
    id: user.id,
    real_name: user.real_name,
    student_id: user.student_id,
    auth_status: user.auth_status
  })
  showEditDialog.value = true
}

const updateUser = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    editing.value = true

    await adminAPI.users.update(editForm.id, {
      real_name: editForm.real_name,
      student_id: editForm.student_id,
      auth_status: editForm.auth_status
    })

    ElMessage.success('用户信息更新成功')
    showEditDialog.value = false
    await loadUsers()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('更新用户信息失败')
    }
  } finally {
    editing.value = false
  }
}

const toggleUserAuth = async (user) => {
  try {
    const newAuthStatus = user.auth_status ? 0 : 1
    await adminAPI.users.updateAuth(user.id, newAuthStatus)
    ElMessage.success(`用户${newAuthStatus ? '认证' : '取消认证'}成功`)
    await loadUsers()
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.users.delete(user.id)
    ElMessage.success('用户删除成功')
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('删除用户失败')
      }
    }
  }
}

const batchUpdateAuth = async (authStatus) => {
  if (selectedUsers.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要${authStatus ? '认证' : '取消认证'}选中的 ${selectedUsers.value.length} 个用户吗？`,
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.users.batchUpdateAuth(selectedUsers.value, authStatus)
    ElMessage.success(`批量${authStatus ? '认证' : '取消认证'}成功`)
    selectedUsers.value = []
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量操作失败')
      }
    }
  }
}

const batchDelete = async () => {
  if (selectedUsers.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminAPI.users.batchDelete(selectedUsers.value)
    ElMessage.success('批量删除成功')
    selectedUsers.value = []
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量删除失败')
      }
    }
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
.admin-users {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.batch-actions span {
  font-weight: 500;
  color: #666;
}
</style>