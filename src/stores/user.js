import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authAPI from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return response
    } catch (error) {
      throw error
    }
  }

  const adminLogin = async (credentials) => {
    try {
      const response = await authAPI.adminLogin(credentials)
      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(user.value))
      return response
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(user.value))
      return response
    } catch (error) {
      throw error
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData)
      return response
    } catch (error) {
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    adminLogin,
    logout,
    getProfile,
    updateProfile,
    changePassword
  }
})