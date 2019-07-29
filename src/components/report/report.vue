<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    const { data: result } = await this.$http.get('reports/type/1')
    if (result.meta.status !== 200) this.$message.error(result.meta.msg)
    const option = result.data
    // 配置信息
    option.title = { text: '用户来源' }
    option.tooltip = {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#E9EEF3'
        }
      }
    }
    option.grid = {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
    option.xAxis.push({ boundaryGap: false })
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  }
}
</script>
<style lang="less" scoped>
</style>
