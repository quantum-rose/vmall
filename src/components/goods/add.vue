<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{goodsId?'编辑商品':'添加商品'}}</el-breadcrumb-item>
      <el-breadcrumb-item v-if="goodsId">#{{goodsId}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex-0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form :model="addGoodsForm" :rules="formRules" ref="addGoodsFormRef" label-position="top">
        <!-- 选项卡 -->
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-scrollbar :style="'height:' + tabPaneHeight">
              <el-form-item label="商品分类" prop="goods_cat">
                <!-- 层级选择器 -->
                <el-cascader
                  v-model="selectedCate"
                  :options="cateList"
                  :props="cascaderConfig"
                  clearable
                  :disabled="goodsId !== undefined"
                  @change="selectedChange"
                ></el-cascader>
              </el-form-item>
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model.trim="addGoodsForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model.trim="addGoodsForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model.trim="addGoodsForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model.trim="addGoodsForm.goods_weight" type="number"></el-input>
              </el-form-item>
            </el-scrollbar>
          </el-tab-pane>

          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-scrollbar :style="'height:' + tabPaneHeight">
              <el-form-item :label="item.attr_name" v-for="item in manyAttrs" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_value">
                  <el-checkbox
                    :label="a"
                    v-for="(a, i) in item.attr_vals"
                    :key="i"
                    border
                    size="mini"
                  ></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-scrollbar>
          </el-tab-pane>

          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-scrollbar :style="'height:' + tabPaneHeight">
              <el-form-item v-for="item in onlyAttrs" :key="item.attr_id" :label="item.attr_name">
                <el-input v-model.trim="item.attr_value"></el-input>
              </el-form-item>
            </el-scrollbar>
          </el-tab-pane>

          <!-- 上传图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-scrollbar :style="'height:' + tabPaneHeight">
              <el-upload
                :action="uploadURL"
                :headers="uploadHeaders"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="uploadSuccess"
                list-type="picture"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-scrollbar>
          </el-tab-pane>

          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <el-scrollbar :style="'height:' + tabPaneHeight">
              <quill-editor v-model="addGoodsForm.goods_introduce" ref="quillEditor"></quill-editor>
              <el-button type="primary" class="add-btn" @click="addGoods">添加商品</el-button>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
    // 如果路由中有参数，获取商品信息
    this.goodsId && this.getGoodsInfo()
  },
  mounted() {
    this.setQuillEditorHeight()
    window.onresize = () => {
      this.innerHeight = window.innerHeight
      this.setQuillEditorHeight()
    }
  },
  // 路由参数，如果有值说明是编辑操作，否则是添加操作
  props: ['goodsId'],
  data() {
    return {
      innerHeight: window.innerHeight,
      // 分类信息数据
      cateList: [],
      // 步骤条和选项卡共用的索引
      activeIndex: '0',
      // 表单数据
      addGoodsForm: {
        goods_name: '',
        goods_cat: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      // 选中的三级分类 id 数组
      selectedCate: [],
      // 层级选择器配置
      cascaderConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 表单验证规则
      formRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      },
      // 动态属性
      manyAttrs: [],
      // 静态参数
      onlyAttrs: [],
      // 图片上传地址
      uploadURL: this.$http.defaults.baseURL + 'upload',
      // 为上传图片的请求添加 token
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的对话框是否可见的标识
      previewVisible: false,
      // 预览图片的路径
      previewPath: ''
    }
  },
  computed: {
    // 标签页最大高度
    tabPaneHeight() {
      return this.innerHeight - 243 + 'px'
    },
    // 是否选中了三级分类的标识
    isSelected() {
      return this.selectedCate.length === 3
    },
    // 当前选中的第三级分类 id
    cateId() {
      return this.isSelected ? this.selectedCate[2] : null
    }
  },
  methods: {
    // 获取商品分类数据
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
    async selectedChange() {
      if (!this.isSelected) return (this.selectedCate = [])
      this.addGoodsForm.goods_cat = this.selectedCate.join(',')
      // 获取动态参数
      let result = await this.getAttrs('many')
      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.attr_value = item.attr_vals
      })
      this.manyAttrs = result.data
      // 获取静态属性
      result = await this.getAttrs('only')
      result.data.forEach(item => {
        item.attr_value = item.attr_vals
      })
      this.onlyAttrs = result.data
    },
    // 切换标签页之前触发
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && !this.isSelected) {
        this.$message.warning('请先选择商品分类')
        return false
      }
      return true
    },
    // 获取参数数据
    async getAttrs(sel) {
      const { data: result } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: sel } }
      )
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      return result
    },
    // 图片预览
    handlePreview(file) {
      this.previewVisible = true
      this.previewPath = file.url
    },
    // 图片移除
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addGoodsForm.pics.findIndex(item => item.pic === filePath)
      this.addGoodsForm.pics.splice(i, 1)
    },
    // 图片上传成功后触发
    uploadSuccess(response) {
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.$message.success(response.meta.msg)
      this.addGoodsForm.pics.push({ pic: response.data.tmp_path })
    },
    // 添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.warning('请填写必要的表单项')
        }
        // 将动态参数和静态属性转为符合要求的格式，并添加进请求表单中
        this.manyAttrs.forEach(item => {
          const attrInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(',')
          }
          this.addGoodsForm.attrs.push(attrInfo)
        })
        this.onlyAttrs.forEach(item => {
          const attrInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value
          }
          this.addGoodsForm.attrs.push(attrInfo)
        })
        console.log(this.addGoodsForm)
        // const { data: result } = await this.$http.post(
        //   'goods',
        //   this.addGoodsForm
        // )
        // if (result.meta.status !== 201) {
        //   return this.$message.error(result.meta.msg)
        // }
        // this.$message.success(result.meta.msg)
      })
    },
    // 设置富文本编辑器高度
    setQuillEditorHeight() {
      this.$refs.quillEditor.$el.children[1].children[0].style.height =
        this.innerHeight - 365 + 'px'
    },
    // 根据 id 获取编辑操作中的商品数据
    async getGoodsInfo() {
      const { data: result } = await this.$http.get('goods/' + this.goodsId)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      const goods = result.data
      this.selectedCate = goods.goods_cat.split(',')
      // 将数组的每一项转为数字类型
      this.selectedCate.forEach((item, i, arr) => {
        arr[i] -= 0
      })
      this.addGoodsForm.goods_name = goods.goods_name
      this.addGoodsForm.goods_cat = goods.goods_cat
      this.addGoodsForm.goods_price = goods.goods_price
      this.addGoodsForm.goods_number = goods.goods_number
      this.addGoodsForm.goods_weight = goods.goods_weight
      this.addGoodsForm.goods_introduce = goods.goods_introduce
      const many = goods.attrs.filter(item => item.attr_sel === 'many')
      many.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.attr_value = item.attr_value ? item.attr_value.split(',') : []
      })
      this.manyAttrs = many
      this.onlyAttrs = goods.attrs.filter(item => item.attr_sel === 'only')
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin-bottom: 15px;
}

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.add-btn {
  margin-top: 15px;
}

.quill-editor {
  min-width: 623px;
}
</style>
