import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MarketplaceView from '../views/MarketplaceView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import GachaView from '../views/GachaView.vue'
import GiveawayView from '../views/GiveawayView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import SellerProfileView from '../views/SellerProfileView.vue'

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
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetailView,
  },
  {
    path: '/artwork/:id',
    redirect: (to) => `/product/${to.params.id}`,
  },
  {
    path: '/gacha',
    name: 'gacha',
    component: GachaView,
  },
  {
    path: '/giveaway',
    name: 'giveaway',
    component: GiveawayView,
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
    path: '/reviews',
    name: 'reviews',
    component: ReviewsView,
  },
  {
    path: '/seller/:username',
    name: 'seller-profile',
    component: SellerProfileView,
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/dashboard',
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
