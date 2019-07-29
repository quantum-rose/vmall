<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 树形表格 -->
      <el-table :data="cateList" row-key="cat_id" border stripe :max-height="maxTableHeight">
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="是否有效">
          <template #default="{row}">
            <i
              v-if="row.cat_deleted == 0"
              style="color:#67C23A;font-size:18px"
              class="el-icon-success"
            ></i>
            <i
              v-if="row.cat_deleted == 1"
              style="color:#F56C6C;font-size:18px"
              class="el-icon-error"
            ></i>
          </template>
        </el-table-column>
        <!-- 排序 -->
        <el-table-column label="排序">
          <template #default="{row}">
            <el-tag v-if="row.cat_level == 0">一级</el-tag>
            <el-tag v-if="row.cat_level == 1" type="success">二级</el-tag>
            <el-tag v-if="row.cat_level == 2" type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" width="177px">
          <template #default="{row}">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditCateDialog(row)"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(row)"
              >删除</el-button
            >
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

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="resetForm('addCateFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="addCateForm" :rules="formRules" ref="addCateFormRef" label-width="auto">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model.trim="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分类层级">
          <!-- 层级选择器 -->
          <el-cascader
            v-model="selectedParentCateId"
            :options="parentCateList"
            :props="cascaderConfig"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      @close="resetForm('editCateFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="editCateForm" :rules="formRules" ref="editCateFormRef" label-width="auto">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model.trim="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    // cate 组件创建后获取分类信息
    this.getCateList()
  },
  mounted() {
    window.onresize = () => {
      this.innerHeight = window.innerHeight
    }
  },
  data() {
    return {
      innerHeight: window.innerHeight,
      // 分类树查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 分类数据
      cateList: [],
      // 数据总条数
      total: null,
      // 添加分类的对话框是否可见的标识
      addCateDialogVisible: false,
      // 编辑分类的对话框是否可见的标识
      editCateDialogVisible: false,
      // 添加分类的参数
      addCateForm: {
        cat_pid: '',
        cat_name: '',
        cat_level: ''
      },
      // 编辑分类的表单
      editCateForm: { cat_name: '' },
      // 当前操作的分类的 id
      catId: null,
      // 表单验证规则
      formRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 层级选择器配置
      cascaderConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        checkStrictly: true
      },
      // 父级分类数据
      parentCateList: [],
      // 已选择的父级分类 id
      selectedParentCateId: []
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 273
    }
  },
  methods: {
    // 获取分类信息
    async getCateList() {
      const { data: result } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.cateList = result.data.result
      this.total = result.data.total
    },
    // 分页大小
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getCateList()
    },
    // 页码
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getCateList()
    },
    // 展示添加分类的对话框
    showAddCatDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 重置表单
    resetForm(ref) {
      this.$refs[ref].resetFields()
      if (ref === 'addCateFormRef') {
        this.selectedParentCateId = []
        this.addCateForm = {
          cat_pid: '',
          cat_name: '',
          cat_level: ''
        }
      }
    },
    // 获取父级分类信息
    async getParentCateList() {
      const { data: result } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.parentCateList = result.data
    },
    // 添加分类
    async addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 获取层级选择器选择结果数组的长度
        const length = this.selectedParentCateId.length
        // 长度大于0，说明选择了，父级 id 为数组最后一项
        if (length > 0) this.addCateForm.cat_pid = this.selectedParentCateId[length - 1]
        // 没选择，则作为一级分类，父级 id 为0
        else this.addCateForm.cat_pid = 0
        // 分类层级刚好等于长度
        this.addCateForm.cat_level = length
        const { data: result } = await this.$http.post('categories', this.addCateForm)
        if (result.meta.status !== 201) return this.$message.error(result.meta.msg)
        this.$message.success(result.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 展示编辑分类的对话框
    showEditCateDialog(row) {
      this.catId = row.cat_id
      this.editCateForm.cat_name = row.cat_name
      this.editCateDialogVisible = true
    },
    // 编辑分类
    async editCate() {
      const { data: result } = await this.$http.put('categories/' + this.catId, this.editCateForm)
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.$message.success(result.meta.msg)
      this.getCateList()
      this.editCateDialogVisible = false
    },
    // 删除分类
    removeCate(row) {
      this.$confirm(`确定要删除此分类 “${row.cat_name}” 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.delete('categories/' + row.cat_id)
          if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
          this.$message.success(result.meta.msg)
          let pagenum = this.queryInfo.pagenum
          let pagesize = this.queryInfo.pagesize
          if (pagenum * pagesize - this.total + 1 >= pagesize && row.cat_level === 0) {
            this.queryInfo.pagenum--
          }
          this.getCateList()
        })
        .catch(() => this.$message.info('已取消删除'))
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
