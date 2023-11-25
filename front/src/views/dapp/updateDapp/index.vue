<template>
  <div class="app-container">
    <el-card>
      <template #header>
        编辑Dapp信息
      </template>
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="150px" v-loading="loading">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" style="width: 200px" />
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
            :before-upload="beforeImageUpload" :on-change="changeImage">
            <img v-if="imageUrl" :src="imageUrl" class="avatar" title="点击重新上传" />
            <el-icon v-else class="avatar-uploader-icon">
              <plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <!-- 后端接收文件的URL -->
        <!-- <el-form-item label="封面" prop="poster">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" accept="image/jpg,image/jpeg,image/png"
            :before-upload="beforeAvatarUpload" :on-change="changeImage" :auto-upload="false">
            <img v-if="imageUrl" :src="imageUrl" class="avatar" title="点击重新上传" />
            <el-icon v-else class="avatar-uploader-icon">
              <plus />
            </el-icon>
          </el-upload>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="onSubmitUpdate">修 改</el-button>
          <el-button @click="close">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import api, { convertPageQuery } from "@/api";
import { message } from '@/utils/message';
import router from "@/router";
import { updateDapp } from "@/api/dapp";
import { ElForm, ElMessage, ElUpload, ElIcon } from "element-plus";
import { formatToken, getToken } from '@/utils/auth';
import { useTags } from "@/layout/hooks/useTag";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import axios from 'axios';
const { VITE_ADMIN_HOST, VITE_S3_URL } = import.meta.env;


const rules = ref({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择类别", trigger: "blur" }],
  network: [{ required: true, message: "请选择链", trigger: "blur" }],
  description: [{ required: false, message: "请输入描述", trigger: "blur" }],
  native_token: [{ required: false, message: "请输入NativeToken", trigger: "blur" }],
  recommend: [{ required: false, message: "请选择是否推荐展示", trigger: "blur" }],
  recommend_icon: [{ required: false, message: "请选择推荐展示图片", trigger: "blur" }],
});
const loading = ref(false);
const route = useRoute();
const imageUrl = ref('');
const File = ref();
const dataFormRef = ref(ElForm);
const { multiTags } = useTags();
const categorySource = ref([]);
const networkSource = ref([]);
const currentNetwork = ref<{ id: number, networkId: number }[]>([]);
const currentCategory = ref<{ id: number, categoryId: number }[]>([]);
const formData = reactive({
  id: 0,
  name: "",
  description: "",
  native_token: "",
  recommend: 0,
  recommend_icon: "",
  category: [],
  network: [],
})

function beforeImageUpload(rawFile) {
  const isIMAGE = rawFile.type === 'image/jpeg' || 'image/jpg' || 'image/png';
  if (!isIMAGE) {
    message("上传文件只能是图片格式", { type: "error" });
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    message("上传文件大小不能超过2MB", { type: "error" });
    return false;
  }
  return true;
}
/**
 * 上传文件
 * @param file 
 */
function changeImage(file) {
  File.value = file;
  imageUrl.value = URL.createObjectURL(file.raw!)
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

async function handleQuery() {
  const { error, data } = await api.query({
    operationName: "Dapp/GetOne",
    input: { id: Number(route.query?.id) }
  });
  if (!error) {
    formData.id = data.data.id;
    formData.name = data.data.name;
    formData.description = data.data.description;
    formData.native_token = data.data.native_token;
    formData.recommend = data.data.recommend ? 1 : 0;
    formData.recommend_icon = data.data.recommend_icon;
    if (data.data.recommend_icon) {
      imageUrl.value = VITE_S3_URL + data.data.recommend_icon;
    }
    if (data.data.category.data.length > 0) {
      for (let cate of data.data.category.data) {
        currentCategory.value.push({
          categoryId: cate.category_id,
          id: cate.id
        })
        formData.category.push(cate.category_id)
      }
    }
    if (data.data.network.data.length > 0) {
      for (let network of data.data.network.data) {
        currentNetwork.value.push({
          networkId: network.network_id,
          id: network.id,
        })
        formData.network.push(network.network_id)
      }
    }
  }
  await initCategoryData()
  await initNetworkData()
}

/**
 * 提交修改
 */
async function onSubmitUpdate() {
  loading.value = true;
  if (File.value) {
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
  dataFormRef.value.validate(async (isValid: boolean) => {
    if (isValid) {
      await updateDapp(formData.id, formData.name, currentNetwork.value, currentCategory.value, formData.network, formData.category, formData.description, formData.native_token, formData.recommend, formData.recommend_icon).then(res => {
        ElMessage.success("修改成功");
        close();
      }).catch(error => {
        ElMessage.error("修改失败");
      })
    }
  })
  loading.value = false;
}

onMounted(() => {
  handleQuery();
})


/**
 * 撤退到Dapp管理页面
 */
function close() {
  // 关闭当前标签页
  const valueIndex: number = multiTags.value.findIndex((item: any) => {
    return item.path === "/dapp/updateDapp";
  })
  const spliceRoute = (startIndex: number, length: number): void => {
    useMultiTagsStoreHook().handleTags("splice", "", { startIndex, length });
  }
  spliceRoute(valueIndex, 1);
  // 跳转到上一页
  router.replace({
    name: "Dapp",
  });
}
</script>



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