import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import indexView from '../views/index.vue'
import zcView from '../views/zc.vue'
import asrView from '../views/asr.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../views/index.vue')
    },
    {
      path: '/zc',
      name: 'zc',
      component: () => import('../views/zc.vue')
    },
    {
      path: '/asr',
      name: 'asr',
      component: () => import('../views/asr.vue')
    },
    {
      path: '/sprd',
      name: 'sprd',
      component: () => import('../views/sprd.vue')
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
