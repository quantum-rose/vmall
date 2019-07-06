<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="注意：只允许为三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>

      <el-row>
        <el-col>
          选择分类：
          <!-- 层级选择器 -->
          <el-cascader
            v-model="selectedCate"
            :options="cateList"
            :props="cascaderConfig"
            clearable
            @change="selectedChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="toggleTab">
        <!-- 动态属性 -->
        <el-tab-pane label="动态属性" name="many" :disabled="isSelected">
          <el-button type="primary" :disabled="isSelected">添加属性</el-button>
          <el-table :data="manyAttrs" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="分类参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数 -->
        <el-tab-pane label="静态参数" name="only" :disabled="isSelected">
          <el-button type="primary" :disabled="isSelected">添加参数</el-button>
          <el-table :data="onlyAttrs" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="分类参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      // 当前选中的分类
      selectedCate: [],
      // 分类信息数组
      cateList: [],
      // 层级选择器配置
      cascaderConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 当前选中的选项卡
      activeName: 'many',
      // 动态属性
      manyAttrs: [],
      // 静态参数
      onlyAttrs: []
    }
  },
  computed: {
    // 是否选中了三级分类的标识
    isSelected: function() {
      return this.selectedCate.length !== 3
    }
  },
  methods: {
    // 获取分类信息数据
    async getCateList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.cateList = result.data
    },
    // 选中项改变时触发，如果选中的不是三级分类重置为空数组
    selectedChange() {
      if (this.isSelected) return (this.selectedCate = [])
      this.getCateAttrs()
    },
    // 切换选项卡时触发
    toggleTab() {
      this.getCateAttrs()
    },
    // 获取分类参数
    async getCateAttrs() {
      const { data: result } = await this.$http.get(
        `categories/${this.selectedCate[2]}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.activeName === 'many' && (this.manyAttrs = result.data)
      this.activeName === 'only' && (this.onlyAttrs = result.data)
      console.log(this.manyAttrs)
      console.log(this.onlyAttrs)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  margin: 15px 0 15px 0;
}
</style>
