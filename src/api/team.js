import axios from 'axios'

const api = axios.create({
  baseURL: '/api/teams'
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
  create: (competitionId, teamData) => api.post(`/competitions/${competitionId}`, teamData),
  getLatest: () => api.get('/latest'),
  getMyTeams: (params) => api.get('/my', { params }),
  getById: (id) => api.get(`/${id}`),
  update: (id, teamData) => api.put(`/${id}`, teamData),
  delete: (id) => api.delete(`/${id}`),
  getStats: {
    count: () => api.get('/stats/count')
  }
}