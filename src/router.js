import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import( /* webpackChunkName: "Login" */ './components/login.vue')
const Home = () => import( /* webpackChunkName: "Home-Welcome" */ './components/home.vue')
const Welcome = () => import( /* webpackChunkName: "Home-Welcome" */ './components/welcome.vue')
const Users = () => import( /* webpackChunkName: "Users" */ './components/users/users.vue')
const Rights = () => import( /* webpackChunkName: "Rights" */ './components/power/rights.vue')
const Roles = () => import( /* webpackChunkName: "Roles" */ './components/power/roles.vue')
const Cate = () => import( /* webpackChunkName: "Cate" */ './components/goods/cate.vue')
const Params = () => import( /* webpackChunkName: "Params" */ './components/goods/params.vue')
const GoodsList = () => import( /* webpackChunkName: "GoodsList" */ './components/goods/list.vue')
const AddGood = () => import( /* webpackChunkName: "AddGood" */ './components/goods/add.vue')
const Order = () => import( /* webpackChunkName: "Order" */ './components/order/order.vue')
const Report = () => import( /* webpackChunkName: "Report" */ './components/report/report.vue')

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
      name: 'addGoods',
      component: AddGood,
      props: route => ({
        goodsId: route.query.goodsId
      })
    }, {
      path: '/orders',
      component: Order
    }, {
      path: '/reports',
      component: Report
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
