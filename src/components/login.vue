<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像 -->
      <div class="avatar-box">
        <!-- <img src="../assets/images/logo.png" alt /> -->
        <el-avatar :size="avatarSize" :src="avatarUrl"></el-avatar>
      </div>
      <!-- 表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login-form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model.trim="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model.trim="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    // 验证密码
    var checkPassword = (rule, value, callback) => {
      const reg = /^[0-9a-zA-Z_]+$/
      if (reg.test(value)) return callback()
      callback(new Error('只能输入数字、字母和下划线'))
    }
    return {
      avatarSize: 130,
      avatarUrl:
        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { validator: checkPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login() {
      // 验证表单
      this.$refs.loginFormRef.validate(async valid => {
        // 表单数据不符合验证规则，直接退出函数
        if (!valid) return
        // 发送请求，解构赋值data
        const { data: result } = await this.$http.post('login', this.loginForm)
        // 如果状态不为200，提示信息并退出
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        // 登陆成功
        this.$message.success('登录成功!')
        // 保存token
        window.sessionStorage.setItem('token', result.data.token)
        // 编程式导航至home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background: linear-gradient(45deg, #9fbaa8, #31354c);
}

.login-box {
  width: 450px;
  height: 300px;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fffe;

  .avatar-box {
    height: 130px;
    width: 130px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;

    .btns {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
