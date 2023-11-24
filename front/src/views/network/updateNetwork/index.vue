<template>
  <div class="app-container">
    <el-card>
      <template #header>
        编辑Network信息
      </template>
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="150px" v-loading="loading">
        <el-form-item label="链ID" prop="chain_id">
          <el-input v-model="formData.chain_id" placeholder="请输入链ID" style="width: 200px" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入链名称" />
        </el-form-item>
        <el-form-item label="技术栈" prop="technology">
          <el-input v-model="formData.technology" placeholder="请输入技术栈" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="NativeToken" prop="native_token">
          <el-input v-model="formData.native_token" placeholder="请输入Native Token" />
        </el-form-item>
        <el-form-item label="里程碑" prop="milestones">
          <el-input type="textarea" :rows="5" v-model="formData.milestones" placeholder="请输入里程碑" />
        </el-form-item>
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
import router from "@/router";
import { updateNetwork } from "@/api/network";
import { ElForm, ElMessage } from "element-plus";
//import { formatToken, getToken } from '@/utils/auth';
import { useTags } from "@/layout/hooks/useTag";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";


const rules = ref({
  chain_id: [{ required: true, message: "请输入链ID", trigger: "blur" }],
  name: [{ required: true, message: "请输入链名称", trigger: "blur" }],
  technology: [{ required: false, message: "请输入技术栈", trigger: "blur" }],
  description: [{ required: false, message: "请输入描述", trigger: "blur" }],
  native_token: [{ required: false, message: "请输入Native Token", trigger: "blur" }],
  milestones: [{ required: false, message: "请输入里程碑", trigger: "blur" }],
});
const loading = ref(false);
const route = useRoute();
const dataFormRef = ref(ElForm);
const { multiTags } = useTags();
const formData = reactive({
  id: 0,
  chain_id: 0,
  name: "",
  description: "",
  native_token: "",
  technology: "",
  milestones: "",
})

async function handleQuery() {
  const { error, data } = await api.query({
    operationName: "Network/GetOne",
    input: { id: Number(route.query?.id) }
  });
  if (!error) {
    formData.id = data.data.id;
    formData.chain_id = data.data.chain_id;
    formData.name = data.data.name;
    formData.description = data.data.description;
    formData.native_token = data.data.native_token;
    formData.milestones = data.data.milestones;
    formData.technology = data.data.technology;
  }
}

/**
 * 提交修改
 */
async function onSubmitUpdate() {
  loading.value = true;
  dataFormRef.value.validate(async (isValid: boolean) => {
    if (isValid) {
      //await updateDapp(formData.id, name, description).then(res => {
      await updateNetwork(formData.id, formData.chain_id, formData.name, formData.technology, formData.description, formData.native_token, formData.milestones).then(res => {
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
    return item.path === "/network/updateNetwork";
  })
  const spliceRoute = (startIndex: number, length: number): void => {
    useMultiTagsStoreHook().handleTags("splice", "", { startIndex, length });
  }
  spliceRoute(valueIndex, 1);
  // 跳转到上一页
  router.replace({
    name: "Network",
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