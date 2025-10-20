import axios from 'axios'

const api = axios.create({
  baseURL: '/api/auth'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/profile'),
  updateProfile: (userData) => api.put('/profile', userData),
  changePassword: (passwordData) => api.put('/change-password', passwordData)
}