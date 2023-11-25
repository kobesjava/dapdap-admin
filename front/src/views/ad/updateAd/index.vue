<template>
  <div class="app-container">
    <el-card>
      <template #header>
        编辑广告信息
      </template>
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="150px" v-loading="loading">
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
        <el-form-item label="广告图片" prop="ad_images">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" accept="image/jpg,image/jpeg,image/png"
            :on-success="handleImageSuccess" :before-upload="beforeImageUpload" :on-change="changeImage"
            :auto-upload="false" :file-list="fileList">
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
import api from "@/api";
import { message } from '@/utils/message';
import router from "@/router";
import { updateAd } from "@/api/ad";
import { ElForm, ElMessage, ElUpload, ElIcon } from "element-plus";
import { formatToken, getToken } from '@/utils/auth';
import { useTags } from "@/layout/hooks/useTag";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import axios from 'axios';
const { VITE_ADMIN_HOST, VITE_S3_URL } = import.meta.env;


const rules = ref({
  category: [{ required: true, message: "请选择类别", trigger: "blur" }],
  category_id: [{ required: true, message: "请输入类别ID", trigger: "blur" }],
  ad_images: [{ required: true, message: "请选择广告图片", trigger: "blur" }],
  ad_link: [{ required: false, message: "请输入广告链接", trigger: "blur" }],
});
const loading = ref(false);
const route = useRoute();
const imageUrl = ref('');
const File = ref();
const dataFormRef = ref(ElForm);
const { multiTags } = useTags();
const fileList = ref([]);
const formData = reactive({
  id: 0,
  category: null,
  category_id: null,
  ad_link: "",
  ad_images: "",
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
function handleImageSuccess(res, file) {
  imageUrl.value = URL.createObjectURL(file.raw!)
  formData.ad_images = imageUrl.value
}
/**
 * 上传文件
 * @param file 
 */
function changeImage(file) {
  File.value = file;
  imageUrl.value = URL.createObjectURL(file.raw!)
}

async function handleQuery() {
  const { error, data } = await api.query({
    operationName: "Ad/GetOne",
    input: { id: Number(route.query?.id) }
  });
  if (!error) {
    formData.id = data.data.id;
    formData.category_id = data.data.category_id;
    if (data.data.category.toLowerCase() === "network") {
      formData.category = 1
    } else if (data.data.category.toLowerCase() === "dapp") {
      formData.category = 2
    }
    formData.ad_link = data.data.ad_link;
    formData.ad_images = data.data.ad_images;
    if (data.data.ad_images.length > 0) {
      imageUrl.value = VITE_S3_URL + data.data.ad_images;
    }
  }
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
      formData.ad_images = res.data[0].key;
    }).catch(err => {
      ElMessage.error(err)
    })
  }
  dataFormRef.value.validate(async (isValid: boolean) => {
    if (isValid) {
      await updateAd(formData.id, formData.category, formData.category_id, formData.ad_link, formData.ad_images).then(res => {
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
    return item.path === "/ad/updateAd";
  })
  const spliceRoute = (startIndex: number, length: number): void => {
    useMultiTagsStoreHook().handleTags("splice", "", { startIndex, length });
  }
  spliceRoute(valueIndex, 1);
  // 跳转到上一页
  router.replace({
    name: "Ad",
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