<template>
  <div>
    <el-card :style="'height:' + cardHeight">
      <el-scrollbar :style="'height:' + cardHeight">
        <el-alert title="Welcome!" type="success" :closable="false"></el-alert>
        <el-calendar></el-calendar>
      </el-scrollbar>
    </el-card>
  </div>
</template>
<script>
export default {
  created() {
    // welcome 组件创建后触发自定义事件
    this.$emit('reset-current-menu')
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    return {
      innerHeight: window.innerHeight
    }
  },
  computed: {
    cardHeight() {
      return this.innerHeight - 102 + 'px'
    }
  }
}
</script>
<style lang="less" scoped>
</style>
