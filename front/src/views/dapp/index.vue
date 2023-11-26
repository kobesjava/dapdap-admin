<script lang="ts">
export default {
  name: "dapp",
  components: { WangEditor }
};
</script>

<script setup lang="ts">
import api, { convertPageQuery } from "@/api";
import WangEditor from "@/components/WangEditor/index.vue";
import { ElForm, ElMessage, ElMessageBox, ElPagination, ElUpload, ElIcon } from "element-plus";
import { ref, reactive, onMounted } from "vue";
import { Icon } from '@iconify/vue';
import { createOne, createDappCategory, createDappNetwork, getDappLike } from "@/api/dapp";
import axios from 'axios';
import router from "@/router";
//import { getUserInfoByName } from "@/api/user";
import { useUserStoreHook } from "@/store/modules/user";
import { formatToken, getToken } from '@/utils/auth';
const { VITE_ADMIN_HOST, VITE_S3_URL } = import.meta.env;


const store = useUserStoreHook();
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const hackReset = ref(false)
const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);
const imageUrl = ref('');
const fileList = ref([]);
const currentSearchCategory = ref("类别");
const currentSearchNetwork = ref("链");
const queryParams = reactive<PageQuery>({
  pageNum: 1,
  pageSize: 20
});
const searchFormData = reactive({
  name: "",
  id: "",
})
const dataSource = ref([]);
const categorySource = ref([]);
const networkSource = ref([]);

const dialog = reactive<DialogOption>({
  visible: false
});


const formData = reactive({
  name: "",
  description: "",
  native_token: "",
  recommend: "",
  recommend_icon: "",
  category: [],
  network: [],
});
const rules = ref({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择类别", trigger: "blur" }],
  network: [{ required: true, message: "请选择链", trigger: "blur" }],
  description: [{ required: false, message: "请输入描述", trigger: "blur" }],
  native_token: [{ required: false, message: "请输入NativeToken", trigger: "blur" }],
  recommend: [{ required: false, message: "请选择是否推荐展示", trigger: "blur" }],
  recommend_icon: [{ required: false, message: "请选择推荐展示图片", trigger: "blur" }],
});

/**
 * 搜索
 */
async function handleSearch() {
  if (searchFormData.id) {
    const { error, data } = await api.query({
      operationName: "Dapp/GetOne",
      input: { id: Number(searchFormData.id) }
    });
    if (!error) {
      setDataSource([data.data])
    }
  } else if (searchFormData.name) {
    await getDappLike(searchFormData).then(res => {
      setDataSource(res.data.data.data)
    }).catch(error => {
      ElMessage.error("查询失败");
    })
  }
}

/**
 * 查询
 */
async function handleQuery() {
  loading.value = true;
  if (searchFormData.id || searchFormData.name) {
    handleSearch()
  } else {
    const { error, data } = await api.query({
      operationName: "Dapp/GetList",
      input: convertPageQuery(queryParams, null)
    });
    if (!error) {
      setDataSource(data!.data!)
      total.value = data!.total!;
    }
  }
  loading.value = false;
}

function setDataSource(data) {
  if (data.length > 0) {
    for (let dapp of data) {
      let categoryContent = ""
      let networkContent = ""
      if (dapp.category.data.length > 0) {
        for (let category of dapp.category.data) {
          categoryContent += category.category_name.data.name + ","
        }
      }
      if (dapp.network.data.length > 0) {
        for (let network of dapp.network.data) {
          networkContent += network.network_name.data.name + ","
        }
      }
      if (categoryContent.length > 0) {
        categoryContent = categoryContent.substring(0, categoryContent.length - 1)
      }
      if (networkContent.length > 0) {
        networkContent = networkContent.substring(0, networkContent.length - 1)
      }
      dapp.categoryContent = categoryContent
      dapp.networkContent = networkContent
      if (dapp.recommend_icon.length > 0 && !dapp.recommend_icon.startsWith("http")) {
        dapp.recommend_icon = VITE_S3_URL + dapp.recommend_icon
      }
    }
  }
  dataSource.value = data
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
  searchFormData.id = "";
  searchFormData.name = "";
  currentSearchCategory.value = "类别";
  currentSearchNetwork.value = "链";
}

/**
 * 行checkbox change事件
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

async function initCategoryData() {
  const { error, data } = await api.query({
    operationName: "Dapp/GetCategoryList",
  });
  if (!error) {
    categorySource.value = data?.data
  }
}

async function initNetworkData() {
  const params = reactive<PageQuery>({
    pageNum: 1,
    pageSize: 1000
  });
  const { error, data } = await api.query({
    operationName: "Network/GetList",
    input: convertPageQuery(params, null)
  });
  if (!error) {
    networkSource.value = data?.data
  }
}

/**
 * 新增
 */
async function openDialog() {
  // 查询当前用户的userId
  // const equals = store.username;
  // await getUserInfoByName(equals).then(res => {
  //   formData.userId = res.data.data.data[0].id;
  // })
  if (categorySource.value.length == 0) {
    await initCategoryData()
  }
  if (networkSource.value.length == 0) {
    await initNetworkData()
  }
  hackReset.value = true;
  dialog.visible = true;
  dialog.title = "新增Dapp";
}

/**
 * 新增表单提交
 */
async function handleSubmit() {
  loading.value = true;
  //const data = getToken();
  if (formData.category.length == 0) {
    ElMessage.warning("请选择类别");
    return
  }
  if (formData.network.length == 0) {
    ElMessage.warning("请选择链");
    return
  }
  dataFormRef.value.validate(async (isValid: boolean) => {
    if (isValid) {
      if (File) {
        //const username = useUserStoreHook().username;
        const data = getToken();
        await axios.post(VITE_ADMIN_HOST + "/s3/aws/upload?directory=images", File, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": formatToken(data.accessToken),
          }
        }).then(res => {
          formData.recommend_icon = res.data[0].key;
        }).catch(err => {
          ElMessage.error(err)
        })
      }

      let categorySelect: number[] = []
      let networkSelect: number[] = []
      for (let cateId of formData.category) {
        categorySelect.push(Number(cateId))
      }
      for (let networkId of formData.network) {
        networkSelect.push(Number(networkId))
      }
      createOne(formData.name, formData.description, formData.native_token, formData.recommend, formData.recommend_icon).then(res => {
        if (res.data.data.data) {
          createDappCategory(Number(res.data.data.data.id), categorySelect).then(res => {
            if (!res.data.data) {
              ElMessage.success("新增关联类别失败");
            }
          })
          createDappNetwork(Number(res.data.data.data.id), networkSelect).then(res => {
            if (!res.data.data) {
              ElMessage.success("新增关联链失败");
            }
          })
          ElMessage.success("新增成功");
          closeDialog();
          handleQuery();
        } else {
          ElMessage.error("新增失败");
        }
        loading.value = false;
      });
    }
  });
  loading.value = false;
}

/**
 * 关闭弹窗
 */
function closeDialog() {
  hackReset.value = false;
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.name = "";
  formData.description = "";
  formData.native_token = "";
  formData.recommend = "";
  formData.recommend_icon = "";
  formData.category = [];
  formData.network = [];
}

/**
 * 删除
 */
function handleDelete(id?: number) {
  const idList = id ? [id] : ids.value;
  if (!idList.length) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { error } = await api.mutate({
      operationName: "Dapp/DeleteMany",
      input: { ids: idList }
    });
    if (!error) {
      ElMessage.success("删除成功");
      resetQuery();
    }
  });
}

let File = undefined;
function beforeImageUpload(rawFile) {
  const isIMAGE = rawFile.type === 'image/jpeg' || 'image/jpg' || 'image/png';
  if (!isIMAGE) {
    ElMessage.error("上传文件只能是图片格式")
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("上传文件大小不能超过2MB")
    return false;
  }
  return true;
}
function handleImageSuccess(res, file) {
  console.log("handleImageSuccess: " + file.value)
  imageUrl.value = URL.createObjectURL(file.raw!)
}
function changeImage(file) {
  console.log("changeImage: " + file.value)
  File = file;
  imageUrl.value = URL.createObjectURL(file.raw!)
}

function searchByCategory(cate) {
  currentSearchCategory.value = cate.name;
}

function searchByNetwork(network) {
  currentSearchNetwork.value = network.name;
}

/**
 * 编辑
 */
function updateDapp(post) {
  router.push({
    name: "DappUpdate",
    query: {
      id: post.id
    }
  })
}

onMounted(() => {
  initCategoryData()
  initNetworkData()
  handleQuery();
});

</script>

<template>
  <div class="app-container">
    <div class="search">
      <el-form ref="queryFormRef" :model="searchFormData" :inline="true">
        <el-form-item label="Id: " prop="id">
          <el-input v-model="searchFormData.id" placeholder="id" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="名称: " prop="name">
          <el-input v-model="searchFormData.name" placeholder="名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-dropdown trigger="click" @command="searchByCategory">
            <el-button type="primary">
              {{ currentSearchCategory }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="cate in categorySource" :command="cate">{{
                  cate.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-form-item>
        <el-form-item>
          <el-dropdown trigger="click" @command="searchByNetwork">
            <el-button type="primary">
              {{ currentSearchNetwork }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="network in networkSource" :command="network">{{
                  network.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-form-item>
        <el-form-item>
          <!-- <Auth value="post:query"> -->
          <el-button type="primary" @click="handleQuery()">
            <Icon icon="ep:search" />搜索
          </el-button>
          <!-- </Auth> -->
          <el-button @click="resetQuery()">
            <Icon icon="ep:refresh" />重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <template #header>
        <!-- <Auth value="post:edit"> -->
        <el-button type="success" @click="openDialog()">
          <Icon icon="ep:plus" />新增
        </el-button>
        <!-- </Auth> -->

        <!-- <Auth value="post:remove"> -->
        <el-button type="danger" :disabled="ids.length === 0" @click="handleDelete()">
          <Icon icon="ep:delete" />删除
        </el-button>
        <!-- </Auth> -->

      </template>
      <el-table highlight-current-row :data="dataSource" v-loading="loading" @selection-change="handleSelectionChange"
        border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Id" prop="id" width="60" align="center" ellipsis />
        <el-table-column label="名称" prop="name" width="200" align="center" ellipsis />
        <el-table-column label="类别" prop="categoryContent" width="150" align="center" ellipsis />
        <el-table-column label="链" prop="networkContent" width="150" align="center" ellipsis />
        <el-table-column label="描述" prop="description" width="150" align="center" ellipsis />
        <el-table-column label="NativeToken" prop="native_token" width="120" align="center" ellipsis />
        <el-table-column label="推荐展示" prop="recommend" width="100" align="center" ellipsis />
        <el-table-column label="推荐展示图片" width="200" align="center" ellipsis>
          <template #default="scope">
            <el-image
              v-if="scope.row.recommend_icon ? scope.row.recommend_icon.startsWith('https') : scope.row.recommend_icon"
              :src="scope.row.recommend_icon" fit="fill" :preview-src-list="[scope.row.recommend_icon]"
              :preview-teleported="true" :hide-on-click-modal="true" />
          </template>
        </el-table-column>
        <el-table-column label="发布时间" prop="created_at" align="center"
          :formatter="(row, col, v) => (v ? new Date(v).toLocaleDateString() : '')" width="100" />
        <el-table-column fixed="right" label="操作" align="center" min-width="150">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="updateDapp(scope.row)">
              <Icon icon="ep:edit" />编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" @close="closeDialog">
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-checkbox-group v-model="formData.category">
            <el-checkbox v-for="cate in categorySource" :label="cate.id">{{ cate.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="链" prop="network">
          <el-checkbox-group v-model="formData.network">
            <el-checkbox v-for="network in networkSource" :label="network.id">{{ network.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :rows="5" v-model="formData.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="NativeToken" prop="native_token">
          <el-input v-model="formData.native_token" placeholder="请输入NativeToken" />
        </el-form-item>
        <el-form-item label="推荐展示" prop="recommend">
          <el-radio-group v-model="formData.recommend">
            <el-radio :label="1">推荐</el-radio>
            <el-radio :label="0">不推荐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推荐展示图片" prop="recommend_icon">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" accept="image/jpg,image/jpeg,image/png"
            :on-success="handleImageSuccess" :before-upload="beforeImageUpload" :on-change="changeImage"
            :file-list="fileList">
            <img v-if="imageUrl" :src="imageUrl" class="avatar" title="点击重新上传" />
            <el-icon v-else class="avatar-uploader-icon">
              <plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <Auth value="post:edit">
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
          </Auth>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>