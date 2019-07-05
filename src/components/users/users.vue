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
      <!-- 搜索框和添加按钮 -->
      <el-row :gutter="15">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model.trim="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userList" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态" width="60px">
          <template v-slot="scope">
            <!-- switch状态改变后触发change事件 -->
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="173px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showAllotRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="resetForm('addFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model.trim="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNewUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="resetForm('editFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model.trim="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model.trim="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="allotRoleDialogVisible" width="30%">
      <el-row class="vcenter">
        <el-col :span="5" class="text-right">用户名：</el-col>
        <el-col :span="19">
          <el-tag type="info">{{userInfo.username}}</el-tag>
        </el-col>
      </el-row>
      <el-row class="vcenter">
        <el-col :span="5" class="text-right">邮箱：</el-col>
        <el-col :span="19">
          <el-tag type="info">{{userInfo.email}}</el-tag>
        </el-col>
      </el-row>
      <el-row class="vcenter">
        <el-col :span="5" class="text-right">角色名称：</el-col>
        <el-col :span="19">
          <el-select v-model="roleId" placeholder="请选择" size="small">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    // users组件创建后获取用户信息
    this.getUserList()
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
      // 接口查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 用户信息列表
      userList: [],
      // 数据总条数
      total: null,
      // 添加用户对话框是否可见的标识
      addDialogVisible: false,
      // 修改用户对话框是否可见的标识
      editDialogVisible: false,
      // 分配角色对话框是否可见的标识
      allotRoleDialogVisible: false,
      // 添加用户的表单数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据对象
      editForm: {},
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
  methods: {
    // 获取用户信息
    async getUserList() {
      const { data: result } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
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
    // 创建新用户
    addNewUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post('users', this.addForm)
        if (result.meta.status !== 201) {
          return this.$message.error
        }
        this.$message.success(result.meta.msg)
        this.getUserList()
        this.addDialogVisible = false
      })
    },
    // 展示修改用户对话框，并填充数据
    async showEditDialog(id) {
      const { data: result } = await this.$http.get('users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.editForm = result.data
      this.editDialogVisible = true
    },
    // 提交修改的数据
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (result.meta.status !== 200) {
          return this.$message.error
        }
        this.$message.success(result.meta.msg)
        this.getUserList()
        this.editDialogVisible = false
      })
    },
    // 删除用户
    removeUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.delete('users/' + id)
          if (result.meta.status !== 200) {
            return this.$message.error(result.meta.msg)
          }
          this.$message.success(result.meta.msg)
          this.getUserList()
        })
        .catch(() => this.$message.info('已取消删除'))
    },
    // 展示分配权限的对话框
    async showAllotRoleDialog(userInfo) {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.rolesList = result.data
      this.userInfo = userInfo
      this.allotRoleDialogVisible = true
    },
    // 分配角色
    async allotRole() {
      const { data: result } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.roleId
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success(result.meta.msg)
      this.getUserList()
      this.allotRoleDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-col {
  margin-bottom: 10px;
}
</style>
