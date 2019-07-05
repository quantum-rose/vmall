<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', {'bdtop': i1 === 0}, 'vcenter']"
              :key="item1.id"
              v-for="(item1, i1) in scope.row.children"
            >
              <el-col :span="4">
                <el-tag closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row
                  :class="[{'bdtop': i2 !== 0}, 'vcenter']"
                  :key="item2.id"
                  v-for="(item2, i2) in item1.children"
                >
                  <el-col :span="6">
                    <el-tag type="success" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :key="item3.id"
                      v-for="item3 in item2.children"
                      closable
                      @close="removeRight(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="284px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showAllotRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="allotRightsDialogVisible"
      width="30%"
      @close="defaultCheckedKeys = []"
    >
      <el-tree
        :data="rightsList"
        :props="rightsProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defaultCheckedKeys"
        ref="rightsTreeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      // 分配权限的对话框是否可见的标识
      allotRightsDialogVisible: false,
      // 角色列表数据对象
      rolesList: [],
      // 权限树数据对象
      rightsList: [],
      // 权限树配置
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 当前角色所有已拥有的位于权限树中叶节点对应的权限 id
      defaultCheckedKeys: [],
      // 当前角色的 id
      roleId: null
    }
  },
  methods: {
    // 获取角色数据列表
    async getRolesList() {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.rolesList = result.data
    },
    // 取消指定角色的指定权限
    removeRight(role, rightId) {
      this.$confirm('确认要删除此权限吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (result.meta.status !== 200) {
            return this.$message.error(result.meta.msg)
          }
          this.$message.success(result.meta.msg)
          role.children = result.data
        })
        .catch(() => this.$message.info('已取消删除'))
    },
    // 显示分配权限的对话框
    async showAllotRightsDialog(role) {
      this.roleId = role.id
      // 获取权限树
      const { data: result } = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.rightsList = result.data
      // 获取当前角色已拥有的位于权限树中叶节点对应的权限 id
      this.getDefaultCheckedKeys(role, this.defaultCheckedKeys)
      this.allotRightsDialogVisible = true
    },
    // 递归遍历权限树，获得所有叶节点对应的权限 id
    getDefaultCheckedKeys(node, arr) {
      // 如果当前节点没有 children 属性，说明这是个叶节点，将此节点对应的权限 id 存入数组
      if (!node.children) return arr.push(node.id)
      // 有就遍历 children 这个数组，令每一项都执行此函数
      node.children.forEach(item => this.getDefaultCheckedKeys(item, arr))
    },
    // 分配权限
    async allotRights() {
      // 利用展开运算符拼接两个数组
      const keys = [
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys(),
        ...this.$refs.rightsTreeRef.getCheckedKeys()
      ]
      const { data: result } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: keys.join(',') }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success(result.meta.msg)
      this.getRolesList()
      this.allotRightsDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>
