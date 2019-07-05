<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div class="logo">
        <img src="../assets/images/logo.png" alt />
        <span>VMall后台管理系统</span>
      </div>
      <!-- 登出 -->
      <el-button @click="logout" type="info">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <!-- 折叠和展开菜单的按钮 -->
        <div class="toggle-menu" @click="toggleMenu">
          <i :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'"></i>
        </div>
        <!-- 导航菜单 -->
        <el-menu
          ref="navMenu"
          background-color="#333"
          text-color="#fff"
          active-text-color="#87ceeb"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="currentMenu"
        >
          <el-submenu :index="item.path" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavStatus(subitem.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view @reset-current-menu="resetCurrentMenu"></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    // home组件创建后获取导航菜单数据
    this.getMenus()
    // 获取本地保存的当前被选中的菜单信息
    this.currentMenu = window.sessionStorage.getItem('currentMenu')
  },
  data() {
    return {
      // 导航菜单信息列表
      menuList: [],
      // 菜单图标映射
      menuIcon: {
        '125': 'el-icon-user-solid',
        '103': 'el-icon-monitor',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-data'
      },
      // 导航菜单是否折叠的标识
      isCollapse: false,
      // 当前被选中的菜单
      currentMenu: null
    }
  },
  methods: {
    // 登出
    logout() {
      // 移除token
      window.sessionStorage.removeItem('token')
      // 移除currentMenu
      window.sessionStorage.removeItem('currentMenu')
      this.$router.push('/login')
    },
    // 获取导航菜单数据
    async getMenus() {
      const { data: result } = await this.$http.get('menus')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.menuList = result.data
    },
    // 折叠或展开菜单
    toggleMenu() {
      this.isCollapse = !this.isCollapse
    },
    // 保存当前被选中的菜单项
    saveNavStatus(path) {
      window.sessionStorage.setItem('currentMenu', path)
      this.currentMenu = path
    },
    // welcome 组件创建后触发
    resetCurrentMenu() {
      console.log(this.$refs.navMenu)
      // 关闭已展开的子导航菜单
      this.$refs.navMenu.close(this.currentMenu)
      // 重置当前选中菜单项的标识
      this.currentMenu = null
      window.sessionStorage.removeItem('currentMenu')
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    background-color: #222;

    .logo {
      display: flex;
      align-items: center;
      color: #ccc;
      height: 100%;

      img {
        height: 50%;
      }

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333;
    transition: all 0.4s;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    height: 100%;
    background-color: #eee;
  }
}

.toggle-menu {
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #666;
  color: #aaa;
  font-size: 24px;
  font-weight: 100;
  letter-spacing: 0.2rem;
  cursor: pointer;
}

.toggle-menu:hover {
  color: #fff;
}
</style>
