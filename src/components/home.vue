<template>
  <el-button @click="logout" type="danger">Logout</el-button>
</template>

<script>
export default {
  methods: {
    logout: function() {
      // 移除token
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
