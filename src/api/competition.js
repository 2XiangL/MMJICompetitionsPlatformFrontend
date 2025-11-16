import axios from 'axios'

const api = axios.create({
  baseURL: '/api/competitions'
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
  getAll: (params = {}) => {
    const tempApi = axios.create({
      baseURL: '/api/competitions'
    })
    return tempApi.get('/', { params })
  },
  getById: (id) => {
    const tempApi = axios.create({
      baseURL: '/api/competitions'
    })
    return tempApi.get(`/${id}`)
  },
  search: (query) => {
    const tempApi = axios.create({
      baseURL: '/api/competitions'
    })
    return tempApi.get('/search', { params: { q: query } })
  },
  getTeams: (id, params = {}) => {
    const tempApi = axios.create({
      baseURL: '/api/competitions'
    })
    return tempApi.get(`/${id}/teams`, { params })
  },
  createTeam: (id, teamData) => {
    const teamAPI = axios.create({
      baseURL: '/api/teams'
    })
    teamAPI.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    teamAPI.interceptors.response.use(
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
    return teamAPI.post(`/competitions/${id}`, teamData)
  }
}