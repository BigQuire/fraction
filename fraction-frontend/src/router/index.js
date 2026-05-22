import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MarketplaceView from '../views/MarketplaceView.vue'
import ArtworkDetailView from '../views/ArtworkDetailView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/marketplace',
    name: 'marketplace',
    component: MarketplaceView,
  },
  {
    path: '/artwork/:id',
    name: 'artwork-detail',
    component: ArtworkDetailView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/artwork/:id',
    name: 'artwork-detail',
    component: ArtworkDetailView,
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router