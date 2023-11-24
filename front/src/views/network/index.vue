<script lang="ts">
export default {
  name: "network",
  components: { WangEditor }
};
</script>

<script setup lang="ts">
import api, { convertPageQuery } from "@/api";
import WangEditor from "@/components/WangEditor/index.vue";
import { ElForm, ElMessage, ElMessageBox, ElPagination } from "element-plus";
import { ref, reactive, onMounted } from "vue";
import { Icon } from '@iconify/vue';
import { createOne } from "@/api/network";
//import axios from 'axios';
//import { formatToken, getToken } from '@/utils/auth';
import router from "@/router";
//import { getUserInfoByName } from "@/api/user";
import { useUserStoreHook } from "@/store/modules/user";


const store = useUserStoreHook();
const dataFormRef = ref(ElForm);
const hackReset = ref(false)
const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);
const queryParams = reactive<PageQuery>({
  pageNum: 1,
  pageSize: 20
});

const dataSource = ref([]);

const dialog = reactive<DialogOption>({
  visible: false
});


const formData = reactive({
  chain_id: null,
  name: "",
  technology: "",
  description: "",
  native_token: "",
  milestones: "",
});
const rules = ref({
  chain_id: [{ required: true, message: "请输入链ID", trigger: "blur" }],
  name: [{ required: true, message: "请输入链名称", trigger: "blur" }],
  technology: [{ required: false, message: "请输入技术栈", trigger: "blur" }],
  description: [{ required: false, message: "请输入描述", trigger: "blur" }],
  native_token: [{ required: false, message: "请输入Native Token", trigger: "blur" }],
  milestones: [{ required: false, message: "请输入里程碑", trigger: "blur" }],
});

/**
 * 查询
 */
async function handleQuery() {
  loading.value = true;
  const { error, data } = await api.query({
    operationName: "Network/GetList",
    input: convertPageQuery(queryParams, null)
  });
  if (!error) {
    dataSource.value = data!.data!;
    dataSource.value
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
*  时间格式转换
*/
function reverse(dateStr: string) {
  // 创建一个新的Date对象
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  // 定义月份的简写名称数组
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // 获取日期中的月份、日期、年份以及时区偏移
  const month = monthNames[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toTimeString().split(' ')[0];
  // const timezoneOffset = date.toString().match(/\((.*)\)/)[1];

  // 构建最终格式的字符串
  const formattedDate = `Mon ${month} ${day} ${year} ${time} GMT+0800 (GMT+08:00)`;
  return formattedDate;
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
  dialog.title = "新增Network";
}

/**
 * 新增表单提交
 */
async function handleSubmit() {
  loading.value = true;
  //const data = getToken();
  dataFormRef.value.validate(async (isValid: boolean) => {
    if (isValid) {
      //const username = useUserStoreHook().username;
      createOne(formData.chain_id, formData.name, formData.technology, formData.description, formData.native_token, formData.milestones).then(res => {
        if (res.data.data.data) {
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
  formData.chain_id = null;
  formData.name = "";
  formData.technology = "";
  formData.description = "";
  formData.native_token = "";
  formData.milestones = "";
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
      operationName: "Network/DeleteMany",
      input: { ids: idList }
    });
    if (!error) {
      ElMessage.success("删除成功");
      resetQuery();
    }
  });
}

/**
 * 编辑
 */
function updateNetwork(post) {
  router.push({
    name: "NetworkUpdate",
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
        <el-table-column label="Id" prop="id" width="60" align="center" ellipsis />
        <el-table-column label="链ID" prop="chain_id" width="100" align="center" ellipsis />
        <el-table-column label="名称" prop="name" width="120" align="center" ellipsis />
        <el-table-column label="技术栈" prop="technology" width="120" align="center" ellipsis />
        <el-table-column label="描述" prop="description" width="200" align="center" ellipsis />
        <el-table-column label="NativeToken" prop="native_token" width="120" align="center" ellipsis />
        <el-table-column label="里程碑" prop="milestones" width="200" align="center" ellipsis />
        <el-table-column label="发布时间" prop="created_at" align="center"
          :formatter="(row, col, v) => (v ? new Date(v).toLocaleDateString() : '')" width="180" />
        <el-table-column fixed="right" label="操作" align="center" min-width="220">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="updateNetwork(scope.row)">
              <Icon icon="ep:edit" />编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" @close="closeDialog">
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="链ID" prop="chain_id">
          <el-input v-model="formData.chain_id" placeholder="请输入链ID" />
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