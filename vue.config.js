module.exports = {
  publicPath: '',
  chainWebpack: config => {
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
    // 生产模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // 打包时忽略的依赖项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
  }
}
