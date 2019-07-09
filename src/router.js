import Vue from 'vue'
import Router from 'vue-router'
import './assets/css/global.less'
import Login from './components/login.vue'
import Home from './components/home.vue'
import Welcome from './components/welcome.vue'
import Users from './components/users/users.vue'
import Rights from './components/power/rights.vue'
import Roles from './components/power/roles.vue'
import Cate from './components/goods/cate.vue'
import Params from './components/goods/params.vue'
import GoodsList from './components/goods/list.vue'
import AddGood from './components/goods/add.vue'
import Order from './components/order/order.vue'

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
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    }, {
      path: '/rights',
      component: Rights
    }, {
      path: '/roles',
      component: Roles
    }, {
      path: '/categories',
      component: Cate
    }, {
      path: '/params',
      component: Params
    }, {
      path: '/goods',
      component: GoodsList
    }, {
      path: '/goods/add',
      component: AddGood
    }, {
      path: '/orders',
      component: Order
    }]
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
