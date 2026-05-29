<template>
<div class="snow-page">
    <div class="snow-inner">
        <a-space wrap style="margin-bottom: 16px">
            <a-input v-model="searchForm.nickname" placeholder="昵称" allow-clear style="width: 160px" />
            <a-select v-model="searchForm.clientId" placeholder="注册客户端" allow-clear style="width: 200px">
                <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">{{ item.clientName }}</a-option>
            </a-select>
            <a-select v-model="searchForm.registerSource" placeholder="注册来源" allow-clear style="width: 140px">
                <a-option v-for="item in REGISTER_SOURCE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
                <a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-button type="primary" @click="loadData(1)">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" @click="openForm()" v-hasPerm="['plugins:clientapp:user:add']">
                <template #icon><icon-plus /></template>代注册
            </a-button>
        </a-space>

        <a-table :data="dataList" :loading="loading" :pagination="pagination"
            :bordered="{ wrapper: true, cell: true }" @page-change="onPageChange" @page-size-change="onPageSizeChange">
            <template #columns>
                <a-table-column title="ID" data-index="id" :width="70" align="center" />
                <a-table-column title="昵称" data-index="nickname" :width="140" />
                <a-table-column title="状态" data-index="status" :width="80" align="center">
                    <template #cell="{ record }">
                        <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? '正常' : '禁用' }}</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="注册来源" data-index="registerSource" :width="120">
                    <template #cell="{ record }">{{ REGISTER_SOURCE_OPTIONS.find(i => i.value === record.registerSource)?.label || record.registerSource }}</template>
                </a-table-column>
                <a-table-column title="身份数" data-index="identityCount" :width="80" align="center" />
                <a-table-column title="最后登录" data-index="lastLoginAt" :width="170" />
                <a-table-column title="操作" :width="220" fixed="right">
                    <template #cell="{ record }">
                        <a-space>
                            <a-button size="small" @click="openDetail(record)">详情</a-button>
                            <a-button size="small" @click="openForm(record)" v-hasPerm="['plugins:clientapp:user:edit']">编辑</a-button>
                            <a-popconfirm content="确定删除该用户？" @ok="handleDelete(record.id)">
                                <a-button size="small" status="danger" v-hasPerm="['plugins:clientapp:user:delete']">删除</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </a-table-column>
            </template>
        </a-table>

        <!-- 编辑/代注册 -->
        <a-modal v-model:visible="formVisible" :title="formData.id ? '编辑用户' : '代注册用户'" :width="720" :on-before-ok="handleSave" @cancel="formVisible = false">
            <a-form :model="formData" :rules="formRules" ref="formRef" layout="vertical">
                <a-row :gutter="16">
                    <a-col :span="12"><a-form-item field="nickname" label="昵称"><a-input v-model="formData.nickname" /></a-form-item></a-col>
                    <a-col :span="12">
                        <a-form-item field="gender" label="性别">
                            <a-select v-model="formData.gender"><a-option v-for="item in GENDER_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option></a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="16">
                    <a-col :span="12"><a-form-item field="status" label="状态"><a-select v-model="formData.status"><a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option></a-select></a-form-item></a-col>
                    <a-col :span="12"><a-form-item field="avatar" label="头像"><a-input v-model="formData.avatar" placeholder="头像URL" /></a-form-item></a-col>
                </a-row>
                <a-form-item field="remark" label="备注"><a-textarea v-model="formData.remark" :auto-size="{ minRows: 2 }" /></a-form-item>

                <template v-if="!formData.id">
                    <a-divider orientation="left">身份绑定（可选）</a-divider>
                    <div v-for="(item, index) in identityList" :key="index" style="margin-bottom: 12px; padding: 12px; border: 1px solid var(--color-border-2); border-radius: 4px;">
                        <a-row :gutter="12">
                            <a-col :span="8">
                                <a-select v-model="item.identityType" placeholder="身份类型">
                                    <a-option v-for="opt in IDENTITY_TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
                                </a-select>
                            </a-col>
                            <a-col :span="8" v-if="isMpIdentity(item.identityType)">
                                <a-select v-model="item.platformId" placeholder="平台渠道">
                                    <a-option v-for="p in platformOptions" :key="p.id" :value="p.id">{{ getPlatformLabel(p.platform) }} - {{ p.platformAppName || p.platformAppId }}</a-option>
                                </a-select>
                            </a-col>
                            <a-col :span="8">
                                <a-input v-model="item.identityKey" :placeholder="getIdentityPlaceholder(item.identityType)" />
                            </a-col>
                        </a-row>
                        <a-button type="text" status="danger" size="small" @click="removeIdentity(index)" style="margin-top: 8px">移除</a-button>
                    </div>
                    <a-button type="dashed" long @click="addIdentity">添加身份</a-button>
                </template>
            </a-form>
        </a-modal>

        <!-- 详情抽屉 -->
        <a-drawer v-model:visible="detailVisible" title="用户详情" :width="560">
            <a-descriptions :column="1" bordered size="medium" v-if="detailData">
                <a-descriptions-item label="ID">{{ detailData.id }}</a-descriptions-item>
                <a-descriptions-item label="昵称">{{ detailData.nickname }}</a-descriptions-item>
                <a-descriptions-item label="状态">{{ detailData.status === 1 ? '正常' : '禁用' }}</a-descriptions-item>
                <a-descriptions-item label="注册来源">{{ REGISTER_SOURCE_OPTIONS.find(i => i.value === detailData.registerSource)?.label }}</a-descriptions-item>
                <a-descriptions-item label="备注">{{ detailData.remark || '-' }}</a-descriptions-item>
            </a-descriptions>
            <a-divider orientation="left">身份绑定</a-divider>
            <a-table :data="detailData?.identities || []" :pagination="false" size="small">
                <template #columns>
                    <a-table-column title="类型" data-index="identityType">
                        <template #cell="{ record }">{{ getIdentityTypeLabel(record.identityType) }}</template>
                    </a-table-column>
                    <a-table-column title="平台" data-index="platform">
                        <template #cell="{ record }">{{ getPlatformLabel(record.platform) }}</template>
                    </a-table-column>
                    <a-table-column title="标识" data-index="identityKey" />
                    <a-table-column title="操作" :width="80">
                        <template #cell="{ record }">
                            <a-popconfirm content="确定解绑？" @ok="handleUnbind(record.id)">
                                <a-button size="mini" status="danger" v-hasPerm="['plugins:clientapp:user:edit']">解绑</a-button>
                            </a-popconfirm>
                        </template>
                    </a-table-column>
                </template>
            </a-table>

            <a-divider orientation="left">追加绑定</a-divider>
            <a-space direction="vertical" fill>
                <a-select v-model="bindForm.identityType" placeholder="身份类型">
                    <a-option v-for="item in IDENTITY_TYPE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                </a-select>
                <a-select v-if="isMpIdentity(bindForm.identityType)" v-model="bindForm.platformId" placeholder="平台渠道">
                    <a-option v-for="p in platformOptions" :key="p.id" :value="p.id">{{ getPlatformLabel(p.platform) }} - {{ p.platformAppName || p.platformAppId }}</a-option>
                </a-select>
                <a-input v-model="bindForm.identityKey" :placeholder="getIdentityPlaceholder(bindForm.identityType)" />
                <a-input v-if="bindForm.identityType === 'wallet_evm'" v-model="bindForm.providerId" placeholder="链ID，默认1" />
                <a-button type="primary" @click="handleBind" v-hasPerm="['plugins:clientapp:user:edit']">绑定</a-button>
            </a-space>
        </a-drawer>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useUserHook } from '../hooks/user';
import { useClientHook } from '../hooks/client';
import { usePlatformHook } from '../hooks/platform';
import type { UserData, IdentityInput } from '../api/user';
import {
    STATUS_OPTIONS, REGISTER_SOURCE_OPTIONS, IDENTITY_TYPE_OPTIONS, GENDER_OPTIONS,
    getPlatformLabel, getIdentityTypeLabel
} from '../constants';

const {
    dataList, loading, total, currentPage, pageSize,
    fetchDataList, createData, updateData, deleteData, getDetail, bindIdentity, unbindIdentity, resetSearchParams
} = useUserHook();

const { optionList: clientOptionList, fetchOptions: fetchClientOptions } = useClientHook();
const { optionList: platformOptionList, fetchOptions: fetchPlatformOptions } = usePlatformHook();

const clientOptions = computed(() => clientOptionList.value);
const platformOptions = computed(() => platformOptionList.value);

const searchForm = reactive({ nickname: '', clientId: undefined as number | undefined, registerSource: undefined as string | undefined, status: undefined as number | undefined });

const pagination = computed(() => ({
    total: total.value, current: currentPage.value, pageSize: pageSize.value,
    showTotal: true, showPageSize: true, pageSizeOptions: [10, 20, 50]
}));

const loadData = async (page = currentPage.value) => {
    await fetchDataList({ pageNum: page, pageSize: pageSize.value, ...searchForm });
};
const onPageChange = (p: number) => loadData(p);
const onPageSizeChange = (s: number) => { pageSize.value = s; loadData(1); };
const handleReset = () => { Object.assign(searchForm, { nickname: '', clientId: undefined, registerSource: undefined, status: undefined }); resetSearchParams(); loadData(1); };

const formVisible = ref(false);
const formRef = ref();
const formData = reactive({ id: 0, nickname: '', avatar: '', gender: 0, status: 1, remark: '' });
const identityList = ref<IdentityInput[]>([]);
const formRules = { nickname: [{ required: true, message: '请输入昵称' }] };

const isMpIdentity = (type?: string) => type === 'mp_openid' || type === 'mp_unionid';
const getIdentityPlaceholder = (type?: string) => {
    if (type === 'wallet_evm') return '0x...';
    if (type === 'phone') return '+8613800138000';
    return 'OpenID / UnionID';
};

const openForm = async (record?: UserData) => {
    identityList.value = [];
    if (record) {
        const detail = await getDetail(record.id);
        Object.assign(formData, detail.data);
    } else {
        Object.assign(formData, { id: 0, nickname: '', avatar: '', gender: 0, status: 1, remark: '' });
    }
    formVisible.value = true;
};

const addIdentity = () => identityList.value.push({ identityType: 'mp_openid', identityKey: '' });
const removeIdentity = (index: number) => identityList.value.splice(index, 1);

const handleSave = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return false;
    try {
        if (formData.id) {
            await updateData({ ...formData });
        } else {
            await createData({ ...formData, identities: identityList.value.filter(i => i.identityKey) });
        }
        Message.success('保存成功');
        await loadData();
        return true;
    } catch { return false; }
};

const handleDelete = async (id: number) => {
    await deleteData(id);
    Message.success('删除成功');
    await loadData();
};

const detailVisible = ref(false);
const detailData = ref<UserData | null>(null);
const bindForm = reactive<IdentityInput>({ identityType: 'phone', identityKey: '', providerId: '1' });

const openDetail = async (record: UserData) => {
    const detail = await getDetail(record.id);
    detailData.value = detail.data;
    Object.assign(bindForm, { identityType: 'phone', identityKey: '', providerId: '1', platformId: undefined });
    detailVisible.value = true;
};

const handleBind = async () => {
    if (!detailData.value || !bindForm.identityKey) return;
    await bindIdentity({ userId: detailData.value.id, ...bindForm });
    Message.success('绑定成功');
    const detail = await getDetail(detailData.value.id);
    detailData.value = detail.data;
    Object.assign(bindForm, { identityKey: '', platformId: undefined });
};

const handleUnbind = async (id: number) => {
    await unbindIdentity(id);
    Message.success('解绑成功');
    if (detailData.value) {
        const detail = await getDetail(detailData.value.id);
        detailData.value = detail.data;
    }
    await loadData();
};

onMounted(async () => {
    await fetchClientOptions();
    await fetchPlatformOptions();
    await loadData();
});
</script>

<style scoped lang="scss"></style>
