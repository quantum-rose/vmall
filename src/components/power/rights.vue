<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe :max-height="maxTableHeight">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template #default="{row}">
            <el-tag v-if="row.level == 0">一级</el-tag>
            <el-tag v-if="row.level == 1" type="success">二级</el-tag>
            <el-tag v-if="row.level == 2" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  created() {
    this.getRightsList()
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    return {
      innerHeight: window.innerHeight,
      // 权限数据列表
      rightsList: []
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 201
    }
  },
  methods: {
    // 获取权限列表
    async getRightsList() {
      const { data: result } = await this.$http.get('rights/list')
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.rightsList = result.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>
