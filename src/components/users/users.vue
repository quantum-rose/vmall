<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="15">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model.trim="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <template #append>
              <el-button
                icon="el-icon-search"
                @click="
                  queryInfo.pagenum = 1
                  getUserList()
                "
              ></el-button>
            </template>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="userList" border stripe :max-height="maxTableHeight">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态" width="60px">
          <template #default="{row}">
            <!-- switch状态改变后触发change事件 -->
            <el-switch v-model="row.mg_state" @change="changeUserState(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="173px">
          <template #default="{row}">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              @click="showEditUserDialog(row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              @click="removeUser(row)"
            ></el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              title="分配角色"
              @click="showAllotRoleDialog(row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      @close="resetForm('addUserFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="addUserForm" :rules="formRules" ref="addUserFormRef" label-width="auto">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="addUserForm.username" maxlength="10" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="addUserForm.password" maxlength="20" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model.trim="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogVisible"
      @close="resetForm('editUserFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="editUserForm" :rules="formRules" ref="editUserFormRef" label-width="auto">
        <el-form-item label="用户名">
          <el-input v-model.trim="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model.trim="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="allotRoleDialogVisible">
      <el-form label-width="auto">
        <el-form-item label="用户名：">
          <el-tag type="info">{{ userInfo.username }}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱：">
          <el-tag type="info">{{ userInfo.email }}</el-tag>
        </el-form-item>
        <el-form-item label="角色名称：">
          <el-select v-model="roleId" placeholder="请选择" size="small">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    // users组件创建后获取用户信息
    this.getUserList()
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    // 验证邮箱地址
    var checkEmail = (rule, value, callback) => {
      const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (value === '' || reg.test(value)) return callback()
      callback(new Error('请输入合法的邮箱地址'))
    }
    // 验证手机号
    var checkMobile = (rule, value, callback) => {
      const reg = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/
      if (value === '' || reg.test(value)) return callback()
      callback(new Error('请输入正确的手机号码'))
    }
    return {
      innerHeight: window.innerHeight,
      // 接口查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 用户信息列表
      userList: [],
      // 数据总条数
      total: null,
      // 添加用户对话框是否可见的标识
      addUserDialogVisible: false,
      // 修改用户对话框是否可见的标识
      editUserDialogVisible: false,
      // 分配角色对话框是否可见的标识
      allotRoleDialogVisible: false,
      // 添加用户的表单数据对象
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据对象
      editUserForm: {},
      // 要分配角色的当前用户信息
      userInfo: {},
      // 要分配的角色 id
      roleId: null,
      // 角色列表数据对象
      rolesList: [],
      // 表单验证规则
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符之间' }
        ],
        password: [
          { required: true, message: '请设置登录密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6~20个字符之间' }
        ],
        email: [{ validator: checkEmail, trigger: 'blur' }],
        mobile: [{ validator: checkMobile, trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 273
    }
  },
  methods: {
    // 获取用户信息
    async getUserList() {
      const { data: result } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.userList = result.data.users
      this.total = result.data.total
    },
    // 修改用户状态信息
    async changeUserState(userInfo) {
      const { data: result } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (result.meta.status !== 200) {
        this.$message.error(result.meta.msg)
        userInfo.mg_state = !userInfo.mg_state
        return
      }
      this.$message.success(result.meta.msg)
    },
    // 监听pagesize的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    // 监听pagenum的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    // 重置表单
    resetForm(ref) {
      this.$refs[ref].resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post('users', this.addUserForm)
        if (result.meta.status !== 201) return this.$message.error(result.meta.msg)
        this.$message.success(result.meta.msg)
        this.getUserList()
        this.addUserDialogVisible = false
      })
    },
    // 展示修改用户对话框，并填充数据
    async showEditUserDialog(id) {
      const { data: result } = await this.$http.get('users/' + id)
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.editUserForm = result.data
      this.editUserDialogVisible = true
    },
    // 提交修改的数据
    editUserInfo() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.put('users/' + this.editUserForm.id, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (result.meta.status !== 200) return this.$message.error
        this.$message.success(result.meta.msg)
        this.getUserList()
        this.editUserDialogVisible = false
      })
    },
    // 删除用户
    removeUser(row) {
      this.$confirm(`此操作将永久删除该用户 “${row.username}”, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.delete('users/' + row.id)
          if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
          this.$message.success(result.meta.msg)
          let pagenum = this.queryInfo.pagenum
          let pagesize = this.queryInfo.pagesize
          if (pagenum * pagesize - this.total + 1 >= pagesize) this.queryInfo.pagenum--
          this.getUserList()
        })
        .catch(() => this.$message.info('已取消删除'))
    },
    // 展示分配权限的对话框
    async showAllotRoleDialog(userInfo) {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.rolesList = result.data
      this.userInfo = userInfo
      this.allotRoleDialogVisible = true
    },
    // 分配角色
    async allotRole() {
      const { data: result } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.roleId
      })
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.$message.success(result.meta.msg)
      this.getUserList()
      this.allotRoleDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
</style>
