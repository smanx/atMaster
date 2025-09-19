import { createRouter, createWebHashHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/index.vue'),
    meta: {
      title: 'AT命令工具 - 首页'
    }
  },
  {
    path: '/zc',
    name: 'zte',
    component: () => import('../views/zc.vue'),
    meta: {
      title: 'AT命令工具 - 中兴微'
    }
  },
  {
    path: '/asr',
    name: 'asr',
    component: () => import('../views/asr.vue'),
    meta: {
      title: 'AT命令工具 - ASR'
    }
  },
  {
    path: '/sprd',
    name: 'sprd',
    component: () => import('../views/sprd.vue'),
    meta: {
      title: 'AT命令工具 - 展锐'
    }
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/test.vue'),
    meta: {
      title: 'AT命令工具 - 测试'
    }
  },
  // 404页面处理
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
