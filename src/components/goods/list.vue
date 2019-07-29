<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
            @clear="getGoodsList"
          >
            <template #append>
              <el-button
                icon="el-icon-search"
                @click="
                  queryInfo.pagenum = 1
                  getGoodsList()
                "
              ></el-button>
            </template>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodsList" border stripe :max-height="maxTableHeight">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="102px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="79px"></el-table-column>
        <el-table-column label="创建时间" width="159px">
          <template #default="{row}">{{
            (row.add_time * 1000) | dateFormat('yyyy-MM-dd hh:mm:ss')
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="119px">
          <template #default="{row}">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              @click="goEditGoodsPage(row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              @click="removeGoods(row)"
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
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodsList()
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    return {
      innerHeight: window.innerHeight,
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表数据
      goodsList: [],
      // 数据总条数
      total: null
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 273
    }
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: result } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.goodsList = result.data.goods
      this.total = result.data.total
    },
    // 监听pagesize的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodsList()
    },
    // 监听pagenum的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    // 重置表单
    resetForm(ref) {
      this.$refs[ref].resetFields()
    },
    // 添加商品
    goAddGoodsPage() {
      this.$router.push('/goods/add')
    },
    // 编辑商品
    goEditGoodsPage(goodsId) {
      this.$router.push({ name: 'addGoods', query: { goodsId } })
    },
    // 移除商品
    removeGoods(row) {
      this.$confirm(`确定要删除此商品 “${row.goods_name}” 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.delete('goods/' + row.goods_id)
          if (result.meta.status !== 200) this.$message.error(result.meta.msg)
          this.$message.success(result.meta.msg)
          this.getGoodsList()
        })
        .catch(() => this.$message.info('已取消删除'))
    }
  }
}
</script>

<style lang="less" scoped>
</style>
