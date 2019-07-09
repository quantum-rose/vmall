<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="12">
          <!-- 层级选择器 -->
          <el-cascader
            v-model="selectedCate"
            :options="cateList"
            :props="cascaderConfig"
            placeholder="请选择一个三级分类"
            clearable
            @change="selectedChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="tabClicked">
        <!-- 动态属性 -->
        <el-tab-pane label="动态属性" name="many" :disabled="!isSelected">
          <el-button
            type="primary"
            :disabled="!isSelected"
            @click="addAttrDialogVisible = true"
          >添加属性</el-button>
          <el-table :data="manyAttrs" border stripe :max-height="maxTableHeight">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template #default="scope">
                <el-tag
                  :key="tag"
                  v-for="tag in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag, scope.row)"
                >{{tag}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model.trim="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="分类参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作" width="177px">
              <template #default="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditAttrDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAttr(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数 -->
        <el-tab-pane label="静态参数" name="only" :disabled="!isSelected">
          <el-button
            type="primary"
            :disabled="!isSelected"
            @click="addAttrDialogVisible = true"
          >添加参数</el-button>
          <el-table :data="onlyAttrs" border stripe :max-height="maxTableHeight">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="分类参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作" width="177px">
              <template #default="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditAttrDialog(scope.row)"
                >编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addAttrDialogVisible"
      @close="resetForm('addAttrFormRef')"
    >
      <!-- 表单 -->
      <el-form :model="addAttrForm" :rules="formRules" ref="addAttrFormRef" label-width="auto">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model.trim="addAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog :title="'编辑'+titleText" :visible.sync="editAttrDialogVisible">
      <!-- 表单 -->
      <el-form :model="editAttrForm" :rules="formRules" ref="editAttrFormRef" label-width="auto">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model.trim="editAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <template #footer class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttr">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
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
      // 当前选中的分类
      selectedCate: [],
      // 分类信息数组
      cateList: [],
      // 层级选择器配置
      cascaderConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 当前选中的选项卡
      activeName: 'many',
      // 动态属性
      manyAttrs: [],
      // 静态参数
      onlyAttrs: [],
      // 添加参数的对话框是否可见的标识
      addAttrDialogVisible: false,
      // 编辑参数的对话框是否可见的标识
      editAttrDialogVisible: false,
      // 添加参数的请求体
      addAttrForm: {
        attr_name: '',
        attr_sel: 'many',
        attr_vals: ''
      },
      // 编辑参数的请求体
      editAttrForm: {
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      },
      // 当前操作的参数 id
      attrId: null,
      // 表单验证规则
      formRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 表格最大高度
    maxTableHeight() {
      return this.innerHeight - 365
    },
    // 是否选中了三级分类的标识
    isSelected() {
      return this.selectedCate.length === 3
    },
    // 当前选中的第三级分类 id
    cateId() {
      return this.isSelected ? this.selectedCate[2] : null
    },
    // 添加参数的对话框标题
    titleText() {
      return this.activeName === 'many' ? '动态属性' : '静态参数'
    }
  },
  methods: {
    // 获取分类信息数据
    async getCateList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      for (let i = 0; i < result.data.length; i++) {
        if (this.cateFilter(result.data[i])) {
          result.data.splice(i, 1)
          i--
        }
      }
      this.cateList = result.data
    },
    // 过滤分类数据，如果一个二级分类下的三级分类为空，删除此二级分类
    // 同理，如果一个一级分类下的二级分类为空，删除此一级分类
    cateFilter(node) {
      if (node.cat_level === 2) return
      if (node.children === undefined) return true
      // 遍历每一个子节点，递归执行此函数
      for (let i = 0; i < node.children.length; i++) {
        // 如果返回值是 true 删除当前子节点，索引值-1
        if (this.cateFilter(node.children[i])) {
          node.children.splice(i, 1)
          i--
        }
      }
      // 当前节点的 children 长度为0时，返回的是true
      return node.children.length === 0
    },
    // 选中项改变时触发，如果选中的不是三级分类重置为空数组
    selectedChange() {
      if (!this.isSelected) return (this.selectedCate = [])
      this.getCateAttrs()
    },
    // 切换选项卡时触发
    tabClicked() {
      this.addAttrForm.attr_sel = this.activeName
      this.getCateAttrs()
    },
    // 获取分类参数
    async getCateAttrs() {
      const { data: result } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      this.activeName === 'many' && (this.manyAttrs = result.data)
      this.activeName === 'only' && (this.onlyAttrs = result.data)
    },
    // 重置表单
    resetForm(ref) {
      this.$refs[ref].resetFields()
    },
    // 添加参数
    addAttr() {
      this.$refs.addAttrFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          this.addAttrForm
        )
        if (result.meta.status !== 201) {
          return this.$message.error(result.meta.msg)
        }
        this.$message.success(result.meta.msg)
        this.getCateAttrs()
        this.addAttrDialogVisible = false
      })
    },
    // 展示编辑参数的对话框
    showEditAttrDialog(row) {
      this.editAttrForm.attr_name = row.attr_name
      this.editAttrForm.attr_sel = row.attr_sel
      this.editAttrForm.attr_vals = row.attr_vals
      this.attrId = row.attr_id
      this.editAttrDialogVisible = true
    },
    // 编辑参数
    editAttr() {
      this.$refs.editAttrFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.attrId}`,
          this.editAttrForm
        )
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        this.$message.success(result.meta.msg)
        this.getCateAttrs()
        this.editAttrDialogVisible = false
      })
    },
    // 关闭标签
    async handleClose(tag, row) {
      row.attr_vals.splice(row.attr_vals.indexOf(tag), 1)
      const { data: result } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success(result.meta.msg)
    },
    // 切换为输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 切换为按钮
    async handleInputConfirm(row) {
      row.inputVisible = false
      if (!row.inputValue) return
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      // 发起请求，保存新标签
      const { data: result } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success(result.meta.msg)
    },
    // 移除参数
    async removeAttr(row) {
      const { data: result } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${row.attr_id}`
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success(result.meta.msg)
      this.getCateAttrs()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  margin: 15px 0 15px 0;
}

.el-tag {
  margin: 0 10px 0 0;
}

.button-new-tag {
  height: 32px;
  line-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  vertical-align: bottom;
}
</style>
