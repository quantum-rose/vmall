<template>
  <h1>welcome</h1>
</template>
<script>
export default {
  created() {
    // welcome 组件创建后触发自定义事件
    this.$emit('reset-current-menu')
  }
}
</script>
<style lang="less" scoped>
</style>
