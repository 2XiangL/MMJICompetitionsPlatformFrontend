import axios from 'axios'

const api = axios.create({
  baseURL: '/api/admin'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // 统计数据
  getStats: {
    users: () => api.get('/stats/users'),
    competitions: () => api.get('/stats/competitions'),
    teams: () => api.get('/stats/teams'),
    recentActivities: () => api.get('/activities/recent')
  },

  // 竞赛管理
  competitions: {
    getAll: (params) => api.get('/competitions', { params }),
    create: (competitionData) => api.post('/competitions', competitionData),
    update: (id, competitionData) => api.put(`/competitions/${id}`, competitionData),
    delete: (id) => api.delete(`/competitions/${id}`),
    batchUpdateType: (competitionIds, isSingle) => api.put('/competitions/batch-type', { competition_ids: competitionIds, is_single: isSingle }),
    batchDelete: (competitionIds) => api.delete('/competitions/batch', { data: { competition_ids: competitionIds } })
  },

  // 团队管理
  teams: {
    getAll: (params) => api.get('/teams', { params }),
    delete: (id) => api.delete(`/teams/${id}`),
    batchDelete: (teamIds) => api.delete('/teams/batch', { data: { team_ids: teamIds } }),
    // 组队审核
    getPending: (params) => api.get('/teams/pending', { params }),
    approve: (id) => api.put(`/teams/${id}/approve`),
    reject: (id) => api.put(`/teams/${id}/reject`),
    batchApprove: (teamIds) => api.put('/teams/batch-approve', { team_ids: teamIds }),
    batchReject: (teamIds) => api.put('/teams/batch-reject', { team_ids: teamIds })
  }
}