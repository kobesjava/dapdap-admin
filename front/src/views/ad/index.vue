<script lang="ts">
export default {
  name: "Ad",
  components: { WangEditor }
};
</script>

<script setup lang="ts">
import api, { convertPageQuery } from "@/api";
import WangEditor from "@/components/WangEditor/index.vue";
import { ElForm, ElMessage, ElMessageBox, ElPagination, ElUpload, UploadUserFile } from "element-plus";
import { ref, reactive, onMounted } from "vue";
import { Icon } from '@iconify/vue';
import { createOne } from "@/api/ad";
import axios from 'axios';
import router from "@/router";
//import { getUserInfoByName } from "@/api/user";
import { useUserStoreHook } from "@/store/modules/user";
import { formatToken, getToken } from '@/utils/auth';
const { VITE_ADMIN_HOST, VITE_S3_URL } = import.meta.env;


const store = useUserStoreHook();
const dataFormRef = ref(ElForm);
const hackReset = ref(false)
const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);
const fileList = ref<UploadUserFile[]>([])
const Files = new Map<string, UploadUserFile>()
const queryParams = reactive<PageQuery>({
  pageNum: 1,
  pageSize: 20
});

const dataSource = ref([]);
const dialog = reactive<DialogOption>({
  visible: false
});


const formData = reactive({
  id: 0,
  category: null,
  category_id: null,
  ad_link: "",
  ad_images: "",
});
const rules = ref({
  category: [{ required: true, message: "请选择类别", trigger: "blur" }],
  category_id: [{ required: true, message: "请输入类别ID", trigger: "blur" }],
  ad_images: [{ required: true, message: "请选择广告图片", trigger: "blur" }],
  ad_link: [{ required: false, message: "请输入广告链接", trigger: "blur" }],
});

/**
 * 查询
 */
async function handleQuery() {
  loading.value = true;
  const { error, data } = await api.query({
    operationName: "Ad/GetList",
    input: convertPageQuery(queryParams, null)
  });
  if (!error) {
    if (data!.data!.length > 0) {
      for (let ad of data!.data!) {
        if (ad.ad_images.length > 0) {
          let imagesUrl = ""
          const adImages = ad.ad_images.split(",")
          for (let adImageUrl of adImages) {
            if (adImageUrl.startsWith("http")) {
              imagesUrl += adImageUrl + ","
            } else {
              imagesUrl += VITE_S3_URL + adImageUrl + ","
            }
          }
          ad.ad_images = imagesUrl.substring(0, imagesUrl.length - 1)
        }
      }
    }
    dataSource.value = data!.data!;
    total.value = data!.total!;
    loading.value = false;
  }
  loading.value = false;
}

/**
 * 重置查询
 */
function resetQuery() {
  queryParams.pageNum = 1;
  handleQuery();
}

/**
 * 行checkbox change事件
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
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
  hackReset.value = true;
  dialog.visible = true;
  dialog.title = "新增广告";
}

/**
 * 新增表单提交
 */
async function handleSubmit() {
  loading.value = true;
  dataFormRef.value.validate(async (isValid: boolean) => {
    if (isValid) {
      if (fileList.value.length == 0) {
        ElMessage.warning("请选择广告图片");
        return
      }
      //const username = useUserStoreHook().username;
      const data = getToken();
      const uploadFiles = []
      for (let file of fileList.value) {
        uploadFiles.push(Files[file.url])
      }
      await axios.post(VITE_ADMIN_HOST + "/s3/aws/upload?directory=public", uploadFiles, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": formatToken(data.accessToken),
        }
      }).then(res => {
        formData.ad_images = ""
        for (let fileData of res.data) {
          formData.ad_images += fileData.key + ","
        }
        formData.ad_images = formData.ad_images.substring(0, formData.ad_images.length - 1)
        createOne(formData.category, formData.category_id, formData.ad_link, formData.ad_images).then(res => {
          if (res.data.data.data) {
            ElMessage.success("新增成功");
            closeDialog();
            handleQuery();
          } else {
            ElMessage.error("新增失败");
          }
        });
      }).catch(err => {
        ElMessage.error(err)
      })
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
  Files.clear()
  formData.category = null;
  formData.category_id = null;
  formData.ad_link = "";
  formData.ad_images = "";
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
      operationName: "Ad/DeleteMany",
      input: { ids: idList }
    });
    if (!error) {
      ElMessage.success("删除成功");
      resetQuery();
    }
  });
}

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
// function handleImageSuccess(res, file) {
//   imageUrl.value = URL.createObjectURL(file.raw!)
//   formData.ad_images = imageUrl.value
//   console.log("handleImageSuccess file: " + imageUrl.value)
// }
function changeImage(file) {
  const fileUrl = URL.createObjectURL(file.raw!)
  fileList.value.push({
    name: file.name,
    url: fileUrl,
  })
  Files[fileUrl] = file
}

/**
 * 编辑
 */
function updateAd(post) {
  router.push({
    name: "AdUpdate",
    query: {
      id: post.id
    }
  })
}

onMounted(() => {
  handleQuery();
});

</script>

<template>
  <div class="app-container">
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
        <el-table-column label="ID" prop="id" width="60" align="center" ellipsis />
        <el-table-column label="类别ID" prop="category_id" width="100" align="center" ellipsis />
        <el-table-column label="类别" prop="category" width="100" align="center" ellipsis />
        <el-table-column label="广告链接" prop="ad_link" width="400" align="center" ellipsis />
        <el-table-column label="广告图片" width="400" align="center">
          <template #default="scope">
            <el-image v-if="scope.row.ad_images.length > 0" v-for="adImageUrl in scope.row.ad_images.split(',')"
              :key="adImageUrl" :src="adImageUrl" fit="fill" :preview-teleported="true" :hide-on-click-modal="true"
              lazy />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" min-width="100">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="updateAd(scope.row)">
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
        <el-form-item label="类别" prop="category">
          <el-radio-group v-model="formData.category">
            <el-radio :label="1">Network</el-radio>
            <el-radio :label="2">Dapp</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类别ID" prop="category_id">
          <el-input v-model="formData.category_id" placeholder="请输入类别ID" />
        </el-form-item>
        <el-form-item label="广告链接" prop="ad_link">
          <el-input v-model="formData.ad_link" placeholder="请输入广告连接" />
        </el-form-item>
        <el-form-item label="广告图片" prop="fileList">
          <el-upload v-model:file-list="fileList" class="upload-demo" action="#" :before-upload="beforeImageUpload"
            accept="image/jpg,image/jpeg,image/png" :on-change="changeImage" list-type="picture">
            <el-button type="primary">Click to upload</el-button>
            <template #tip>
              <div class="el-upload__tip">
                jpg/png files with a size less than 2M
              </div>
            </template>
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
</style>