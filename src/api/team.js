import axios from 'axios'

const api = axios.create({
  baseURL: '/api/teams'
})

export default {
  create: (competitionId, teamData) => {
    return api.post(`/competitions/${competitionId}`, teamData)
  },
  getStats: {
    count: () => api.get('/stats/count')
  }
}