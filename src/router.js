import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/login.vue'
import Home from './components/home.vue'

Vue.use(Router)

const router = new Router({
  routes: [{
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/home',
    component: Home
  }]
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  const token = window.sessionStorage.getItem('token')
  // 请求路径为login时，若token已存在，跳转至home
  if (to.path === '/login') return token ? next('/home') : next()
  // 请求路径不为login时，若token不存在，跳转至login
  if (!token) return next('/login')

  next()
})

export default router
