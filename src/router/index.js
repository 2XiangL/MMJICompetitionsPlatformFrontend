import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/AdminLogin.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/competitions',
    name: 'Competitions',
    component: () => import('@/views/Competitions.vue')
  },
  {
    path: '/competitions/:id',
    name: 'CompetitionDetail',
    component: () => import('@/views/CompetitionDetail.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue')
  },
  {
    path: '/admin/competitions',
    name: 'AdminCompetitions',
    component: () => import('@/views/admin/Competitions.vue')
  },
  {
    path: '/admin/teams',
    name: 'AdminTeams',
    component: () => import('@/views/admin/Teams.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router