import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import VueQuillEditor from 'vue-quill-editor'
import NProgress from 'nprogress'
// require styles
import './assets/css/global.less'
import './assets/fonts/iconfont.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'nprogress/nprogress.css'

axios.defaults.baseURL = 'http://cuihaojie.top:8848/api/private/v1/'
axios.interceptors.request.use(config => {
  // 显示进度条
  NProgress.start()
  // Do something before request is sent
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

/* 格式化日期过滤器 */
Vue.filter('dateFormat', function (date, format) {
  if (typeof date === 'string') {
    var mts = date.match(/(\/Date\((\d+)\)\/)/)
    if (mts && mts.length >= 3) date = parseInt(mts[2])
  }
  date = new Date(date)
  if (!date || date.toUTCString() === 'Invalid Date') return ''
  var map = {
    'M': date.getMonth() + 1,
    'd': date.getDate(),
    'h': date.getHours(),
    'm': date.getMinutes(),
    's': date.getSeconds(),
    'q': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  }
  format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
    var v = map[t]
    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v
        v = v.substr(v.length - 2)
      }
      return v
    } else if (t === 'y') return (date.getFullYear() + '').substr(4 - all.length)
    return all
  })
  return format
})

Vue.config.productionTip = false

Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
