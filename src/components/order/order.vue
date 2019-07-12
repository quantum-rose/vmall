<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
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
            @clear="getOrdersList"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="queryInfo.pagenum=1;getOrdersList()"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table
        :data="ordersList"
        border
        stripe
        :max-height="maxTableHeight"
        @expand-change="getOrderDetail"
      >
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template #default="scope">
            <el-form :model="scope.row" label-width="auto">
              <el-form-item label="发货状态：">
                <el-switch
                  v-model="scope.row.is_send"
                  active-text="已发货"
                  inactive-text="未发货"
                  @change="changeSendStatus(scope.row)"
                ></el-switch>
              </el-form-item>
              <el-form-item label="支付状态：">
                <el-switch
                  v-model="scope.row.pay_status"
                  active-text="已付款"
                  inactive-text="待付款"
                  @change="changePayStatus(scope.row)"
                ></el-switch>
              </el-form-item>
              <el-form-item label="支付方式：">
                <el-radio-group
                  v-model="scope.row.order_pay"
                  size="small"
                  @change="changeOrderPay(scope.row)"
                >
                  <el-radio-button label="0" :disabled="scope.row.pay_status">未支付</el-radio-button>
                  <el-radio-button label="1" :disabled="!scope.row.pay_status">支付宝</el-radio-button>
                  <el-radio-button label="2" :disabled="!scope.row.pay_status">微信</el-radio-button>
                  <el-radio-button label="3" :disabled="!scope.row.pay_status">银行卡</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="订单价格：">
                <el-input-number
                  v-model="scope.row.order_price"
                  :precision="2"
                  :step="0.1"
                  :max="10000"
                  :disabled="scope.row.pay_status"
                  size="small"
                  @change="changeOrderPrice(scope.row)"
                ></el-input-number>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)" width="102px"></el-table-column>
        <el-table-column label="是否付款" width="79px">
          <template #default="scope">
            <el-tag type="info" v-if="scope.row.pay_status">已付款</el-tag>
            <el-tag v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width="79px">
          <template #default="scope">
            <el-tag type="info" v-if="scope.row.is_send">已发货</el-tag>
            <el-tag v-else>未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="159px">
          <template
            #default="scope"
          >{{scope.row.update_time * 1000 | dateFormat('yyyy-MM-dd hh:mm:ss')}}</template>
        </el-table-column>
        <el-table-column label="操作" width="119px">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="修改订单地址"
              @click="showEditAddressForm"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              title="查看物流信息"
              @click="showProgress"
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

    <!-- 修改订单地址的对话框 -->
    <el-dialog
      title="修改收货地址"
      :visible.sync="editAddressDialogVisible"
      @close="resetForm('editAddressFormRef')"
    >
      <!-- 表单 -->
      <el-form
        :model="editAddressForm"
        :rules="formRules"
        ref="editAddressFormRef"
        label-width="auto"
      >
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            v-model="editAddressForm.address"
            :options="cityData"
            :props="cascaderConfig"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input v-model.trim="editAddressForm.addressDetail"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 物流信息 -->
    <el-dialog title="物流信息" :visible.sync="progressVisible" ref="dialogRef">
      <el-scrollbar :style="'height:' + dialogHeight">
        <el-timeline>
          <el-timeline-item
            v-for="(item, i) in progressInfo"
            :key="i"
            :timestamp="item.time"
          >{{item.context}}</el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
  created() {
    this.getOrdersList()
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    return {
      innerHeight: window.innerHeight,
      // 接口查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      ordersList: [],
      // 数据总条数
      total: null,
      // 修改收货地址的对话框是否可见的标识
      editAddressDialogVisible: false,
      // 修改收货地址的表单
      editAddressForm: {
        address: [],
        addressDetail: ''
      },
      // 表单验证规则
      formRules: {
        address: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        addressDetail: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 省市区/县数据树
      cityData,
      // 层级选择器配置
      cascaderConfig: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label'
      },
      // 物流信息对话框是否可见的标识
      progressVisible: false,
      // 物流信息数据
      progressInfo: [],
      // 对话框高度
      dialogHeight: 'auto'
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 274
    }
    // 对话框高度
    // dialogHeight() {
    //   return 'auto'
    // }
  },
  methods: {
    // 获取订单列表数据
    async getOrdersList() {
      const { data: result } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      // 将发货状态、支付状态转为布尔类型
      result.data.goods.forEach(item => {
        item.is_send = item.is_send === '是'
        item.pay_status = item.pay_status === '1'
      })
      this.ordersList = result.data.goods
      this.total = result.data.total
    },
    // 监听pagesize的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getOrdersList()
    },
    // 监听pagenum的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getOrdersList()
    },
    // 展示修改收货地址的对话框
    showEditAddressForm() {
      this.editAddressDialogVisible = true
    },
    // 重置表单
    resetForm(ref) {
      this.$refs[ref].resetFields()
    },
    // 修改收货地址
    editAddress() {
      this.editAddressDialogVisible = false
    },
    // 展示物流信息对话框
    async showProgress() {
      const { data: result } = await this.$http.get('/kuaidi/3834933429711')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.dialogHeight = result.data.length > 5 ? '360px' : 'auto'
      this.progressInfo = result.data
      this.progressVisible = true
    },
    // 获取订单详情
    async getOrderDetail(row, expandedRows) {
      if (expandedRows.length > 0) {
        const { data: result } = await this.$http.get('orders/' + row.order_id)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        row.goods = result.data.goods
      }
    },
    // 修改发货状态
    async changeSendStatus(row) {
      const flag = await this.changeOrderStatus(row.order_id, {
        is_send: row.is_send ? '1' : '0',
        order_price: row.order_price
      })
      if (!flag) row.is_send = !row.is_send
    },
    // 修改支付状态
    async changePayStatus(row) {
      row.order_pay = row.pay_status ? '1' : '0'
      const flag = await this.changeOrderStatus(row.order_id, {
        order_pay: row.order_pay,
        pay_status: row.pay_status ? '1' : '0',
        order_price: row.order_price
      })
      if (!flag) {
        row.pay_status = !row.pay_status
        row.order_pay = row.pay_status ? '1' : '0'
      }
    },
    // 更改支付方式
    async changeOrderPay(row) {
      this.changeOrderStatus(row.order_id, {
        order_pay: row.order_pay,
        order_price: row.order_price
      })
    },
    // 更改订单价格
    async changeOrderPrice(row) {
      this.changeOrderStatus(row.order_id, {
        order_price: row.order_price
      })
    },
    // 发送修改订单状态的请求
    async changeOrderStatus(id, body) {
      const { data: result } = await this.$http.put('orders/' + id, body)
      if (result.meta.status !== 201) {
        this.$message.error(result.meta.msg)
        return false
      }
      this.$message.success(result.meta.msg)
      return result.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>
