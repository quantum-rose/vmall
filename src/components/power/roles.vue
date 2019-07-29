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
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="rolesList" border stripe :max-height="maxTableHeight">
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template #default="{row}">
            <el-row
              :class="['bdbottom', { bdtop: i1 === 0 }, 'vcenter']"
              :key="item1.id"
              v-for="(item1, i1) in row.children"
            >
              <!-- 一级分类 -->
              <el-col :span="4" style="min-width:120px">
                <el-tag closable @close="removeRight(row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row
                  style="padding:5px 0 5px 0"
                  :class="[{ bdtop: i2 !== 0 }, 'vcenter']"
                  :key="item2.id"
                  v-for="(item2, i2) in item1.children"
                >
                  <!-- 二级分类 -->
                  <el-col :span="5" style="min-width:120px">
                    <el-tag type="success" closable @close="removeRight(row, item2.id)">{{
                      item2.authName
                    }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级分类 -->
                  <el-col :span="19">
                    <el-tag
                      type="warning"
                      :key="item3.id"
                      v-for="item3 in item2.children"
                      closable
                      @close="removeRight(row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
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
          <template #default="{row}">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(row)"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(row)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showAllotRightsDialog(row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      @close="resetForm('addRoleFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="addRoleForm" :rules="formRules" ref="addRoleFormRef" label-width="auto">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model.trim="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible">
      <!-- 表单 -->
      <el-form :model="editRoleForm" :rules="formRules" ref="editRoleFormRef" label-width="auto">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model.trim="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="allotRightsDialogVisible"
      @close="defaultCheckedKeys = []"
    >
      <!-- 权限树 -->
      <el-tree
        :data="rightsList"
        :props="rightsProps"
        node-key="id"
        show-checkbox
        :default-checked-keys="defaultCheckedKeys"
        ref="rightsTreeRef"
      ></el-tree>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="allotRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList()
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    return {
      innerHeight: window.innerHeight,
      // 角色列表数据对象
      rolesList: [],
      // 权限树数据对象
      rightsList: [],
      // 分配权限的对话框是否可见的标识
      allotRightsDialogVisible: false,
      // 添加角色的对话框是否可见的标识
      addRoleDialogVisible: false,
      // 修改角色的对话框是否可见的标识
      editRoleDialogVisible: false,
      // 权限树配置
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 当前操作的角色所有已拥有的位于权限树中叶节点对应的权限 id
      defaultCheckedKeys: [],
      // 当前操作的角色
      currentRole: {},
      // 添加角色的请求参数
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色的请求参数
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 表单验证规则
      formRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { max: 10, message: '角色名称长度不能超过10个字符' }
        ]
      }
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 241
    }
  },
  methods: {
    // 获取角色数据列表
    async getRolesList() {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      result.data.forEach(item => this.rightsFilter(item))
      this.rolesList = result.data
    },
    // 过滤权限数据，如果一个二级权限下的三级权限为空，删除此二级权限
    // 同理，如果一个一级权限下的二级权限为空，删除此一级权限
    rightsFilter(node) {
      if (node.children === undefined) return
      // 遍历每一个子节点，递归执行此函数
      for (let i = 0; i < node.children.length; i++) {
        // 如果返回值是 true 删除当前子节点，索引值-1
        if (this.rightsFilter(node.children[i])) {
          node.children.splice(i, 1)
          i--
        }
      }
      // 当前节点的 children 长度为0时，返回的是true
      return node.children.length === 0
    },
    // 取消指定角色的指定权限
    async removeRight(role, rightId) {
      const { data: result } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.$message.success(result.meta.msg)
      // 用同样的方法过滤权限数据
      // 这里的返回值不包括角色信息，所以一级权限的过滤要在 rightsFilter 外部完成
      for (let i = 0; i < result.data.length; i++) {
        if (this.rightsFilter(result.data[i])) {
          result.data.splice(i, 1)
          i--
        }
      }
      role.children = result.data
    },
    // 展示分配权限的对话框
    async showAllotRightsDialog(role) {
      this.currentRole = role
      // 获取权限树
      const { data: result } = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
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
      const { data: result } = await this.$http.post(`roles/${this.currentRole.id}/rights`, {
        rids: keys.join(',')
      })
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.$message.success(result.meta.msg)
      this.getRolesList()
      this.allotRightsDialogVisible = false
    },
    // 重置表单
    resetForm(ref) {
      this.$refs[ref].resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post('roles', this.addRoleForm)
        if (result.meta.status !== 201) return this.$message.error(result.meta.msg)
        this.$message.success(result.meta.msg)
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    // 展示修改角色的对话框
    showEditRoleDialog(role) {
      this.currentRole = role
      this.editRoleForm.roleName = role.roleName
      this.editRoleForm.roleDesc = role.roleDesc
      this.editRoleDialogVisible = true
    },
    // 修改角色
    editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.put(
          'roles/' + this.currentRole.id,
          this.editRoleForm
        )
        if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
        this.$message.success('角色修改成功')
        this.getRolesList()
        this.editRoleDialogVisible = false
      })
    },
    // 删除角色
    deleteRole(role) {
      this.$confirm(`确定要删除该角色 “${role.roleName}” 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.delete('roles/' + role.id)
          if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
          this.$message.success(result.meta.msg)
          this.getRolesList()
        })
        .catch(() => this.$message.info('已取消删除'))
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 5px 10px 5px 0;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>
