<template>
<div class="snow-page">
    <div class="snow-inner">
        <a-tabs v-model:active-key="activeTab">
            <a-tab-pane key="client" title="客户端管理">
                <a-space wrap style="margin-bottom: 16px">
                    <a-input v-model="clientSearch.clientKey" placeholder="客户端Key" allow-clear style="width: 180px" />
                    <a-input v-model="clientSearch.clientName" placeholder="客户端名称" allow-clear style="width: 180px" />
                    <a-select v-model="clientSearch.clientType" placeholder="客户端类型" allow-clear style="width: 140px">
                        <a-option v-for="item in CLIENT_TYPE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                    </a-select>
                    <a-select v-model="clientSearch.status" placeholder="状态" allow-clear style="width: 120px">
                        <a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                    </a-select>
                    <a-button type="primary" @click="loadClients(1)">查询</a-button>
                    <a-button @click="resetClientSearch">重置</a-button>
                    <a-button type="primary" @click="openClientModal()" v-hasPerm="['plugins:clientapp:client:add']">
                        <template #icon><icon-plus /></template>新增客户端
                    </a-button>
                </a-space>

                <a-table :data="clientList" :loading="clientLoading" :pagination="clientPagination"
                    :bordered="{ wrapper: true, cell: true }" @page-change="onClientPageChange" @page-size-change="onClientPageSizeChange">
                    <template #columns>
                        <a-table-column title="ID" data-index="id" :width="70" align="center" />
                        <a-table-column title="客户端Key" data-index="clientKey" :width="140">
                            <template #cell="{ record }"><a-tag color="arcoblue">{{ record.clientKey }}</a-tag></template>
                        </a-table-column>
                        <a-table-column title="名称" data-index="clientName" :width="160" ellipsis tooltip />
                        <a-table-column title="类型" data-index="clientType" :width="100">
                            <template #cell="{ record }">{{ getClientTypeLabel(record.clientType) }}</template>
                        </a-table-column>
                        <a-table-column title="EVM" data-index="walletEvmEnabled" :width="70" align="center">
                            <template #cell="{ record }">
                                <a-tag :color="record.walletEvmEnabled ? 'green' : 'gray'">{{ record.walletEvmEnabled ? '开' : '关' }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="渠道数" data-index="platformCount" :width="80" align="center" />
                        <a-table-column title="状态" data-index="status" :width="80" align="center">
                            <template #cell="{ record }">
                                <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? '启用' : '停用' }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="操作" :width="220" fixed="right">
                            <template #cell="{ record }">
                                <a-space>
                                    <a-button size="small" @click="openPlatformForClient(record)">渠道</a-button>
                                    <a-button size="small" @click="openClientModal(record)" v-hasPerm="['plugins:clientapp:client:edit']">编辑</a-button>
                                    <a-popconfirm content="确定删除该客户端？" @ok="handleDeleteClient(record.id)">
                                        <a-button size="small" status="danger" v-hasPerm="['plugins:clientapp:client:delete']">删除</a-button>
                                    </a-popconfirm>
                                </a-space>
                            </template>
                        </a-table-column>
                    </template>
                </a-table>
            </a-tab-pane>

            <a-tab-pane key="platform" title="平台渠道">
                <a-space wrap style="margin-bottom: 16px">
                    <a-select v-model="platformSearch.clientId" placeholder="所属客户端" allow-clear style="width: 200px">
                        <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">{{ item.clientName }} ({{ item.clientKey }})</a-option>
                    </a-select>
                    <a-select v-model="platformSearch.platform" placeholder="平台" allow-clear style="width: 160px">
                        <a-option v-for="item in supportedPlatforms" :key="item" :value="item">{{ getPlatformLabel(item) }}</a-option>
                    </a-select>
                    <a-select v-model="platformSearch.status" placeholder="状态" allow-clear style="width: 120px">
                        <a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                    </a-select>
                    <a-button type="primary" @click="loadPlatforms(1)">查询</a-button>
                    <a-button @click="resetPlatformSearch">重置</a-button>
                    <a-button type="primary" @click="openPlatformModal()" v-hasPerm="['plugins:clientapp:platform:add']">
                        <template #icon><icon-plus /></template>新增渠道
                    </a-button>
                </a-space>

                <a-table :data="platformList" :loading="platformLoading" :pagination="platformPagination"
                    :bordered="{ wrapper: true, cell: true }" @page-change="onPlatformPageChange" @page-size-change="onPlatformPageSizeChange">
                    <template #columns>
                        <a-table-column title="ID" data-index="id" :width="70" align="center" />
                        <a-table-column title="客户端" data-index="clientName" :width="140" ellipsis tooltip />
                        <a-table-column title="客户端Key" data-index="clientKey" :width="120" />
                        <a-table-column title="平台" data-index="platform" :width="120">
                            <template #cell="{ record }">{{ getPlatformLabel(record.platform) }}</template>
                        </a-table-column>
                        <a-table-column title="平台AppID" data-index="platformAppId" :width="180" ellipsis tooltip />
                        <a-table-column title="渠道名称" data-index="platformAppName" :width="140" ellipsis tooltip />
                        <a-table-column title="状态" data-index="status" :width="80" align="center">
                            <template #cell="{ record }">
                                <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? '启用' : '停用' }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="操作" :width="160" fixed="right">
                            <template #cell="{ record }">
                                <a-space>
                                    <a-button size="small" @click="openPlatformModal(record)" v-hasPerm="['plugins:clientapp:platform:edit']">编辑</a-button>
                                    <a-popconfirm content="确定删除该渠道？" @ok="handleDeletePlatform(record.id)">
                                        <a-button size="small" status="danger" v-hasPerm="['plugins:clientapp:platform:delete']">删除</a-button>
                                    </a-popconfirm>
                                </a-space>
                            </template>
                        </a-table-column>
                    </template>
                </a-table>
            </a-tab-pane>
        </a-tabs>

        <!-- 客户端弹窗 -->
        <a-modal v-model:visible="clientModalVisible" :title="clientForm.id ? '编辑客户端' : '新增客户端'" :width="640" :on-before-ok="handleSaveClient" @cancel="clientModalVisible = false">
            <a-form :model="clientForm" :rules="clientRules" ref="clientFormRef" layout="vertical">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item field="clientKey" label="客户端Key">
                            <a-input v-model="clientForm.clientKey" placeholder="如 mall-main" :disabled="!!clientForm.id" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item field="clientName" label="客户端名称">
                            <a-input v-model="clientForm.clientName" placeholder="请输入名称" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item field="clientType" label="客户端类型">
                            <a-select v-model="clientForm.clientType">
                                <a-option v-for="item in CLIENT_TYPE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item field="status" label="状态">
                            <a-select v-model="clientForm.status">
                                <a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-divider orientation="left">EVM 钱包配置</a-divider>
                <a-form-item field="walletEvmEnabled" label="启用EVM钱包登录">
                    <a-switch :checked="clientForm.walletEvmEnabled === 1" @change="onWalletEvmEnabledChange" />
                </a-form-item>
                <template v-if="clientForm.walletEvmEnabled === 1">
                    <a-form-item field="allowedChainIds" label="允许链">
                        <a-select v-model="selectedChains" multiple allow-clear placeholder="选择EVM链">
                            <a-option v-for="item in EVM_CHAIN_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item field="walletSignMessage" label="签名消息模板">
                        <a-textarea v-model="clientForm.walletSignMessage" placeholder="支持 {nonce} {clientKey}" :auto-size="{ minRows: 2 }" />
                    </a-form-item>
                </template>
                <a-form-item field="logo" label="Logo">
                    <a-input v-model="clientForm.logo" placeholder="Logo URL" />
                </a-form-item>
                <a-form-item field="remark" label="备注">
                    <a-textarea v-model="clientForm.remark" :auto-size="{ minRows: 2 }" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 平台渠道弹窗 -->
        <a-modal v-model:visible="platformModalVisible" :title="platformForm.id ? '编辑平台渠道' : '新增平台渠道'" :width="640" :on-before-ok="handleSavePlatform" @cancel="platformModalVisible = false">
            <a-form :model="platformForm" :rules="platformRules" ref="platformFormRef" layout="vertical">
                <a-form-item field="clientId" label="所属客户端">
                    <a-select v-model="platformForm.clientId" :disabled="!!platformForm.id" placeholder="选择客户端">
                        <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">{{ item.clientName }} ({{ item.clientKey }})</a-option>
                    </a-select>
                </a-form-item>
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item field="platform" label="平台">
                            <a-select v-model="platformForm.platform" :disabled="!!platformForm.id">
                                <a-option v-for="item in supportedPlatforms" :key="item" :value="item">{{ getPlatformLabel(item) }}</a-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item field="platformAppId" label="平台AppID">
                            <a-input v-model="platformForm.platformAppId" :disabled="!!platformForm.id" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-form-item field="platformAppName" label="渠道名称">
                    <a-input v-model="platformForm.platformAppName" placeholder="展示名称" />
                </a-form-item>
                <a-form-item field="appSecret" label="AppSecret / 密钥">
                    <a-input-password v-model="credentialForm.appSecret" placeholder="留空则不修改" />
                </a-form-item>
                <a-form-item v-if="platformForm.platform === 'alipay'" field="privateKey" label="应用私钥">
                    <a-textarea v-model="credentialForm.privateKey" :auto-size="{ minRows: 3 }" placeholder="留空则不修改" />
                </a-form-item>
                <a-form-item v-if="platformForm.platform === 'alipay'" field="alipayPublicKey" label="支付宝公钥">
                    <a-textarea v-model="credentialForm.alipayPublicKey" :auto-size="{ minRows: 3 }" placeholder="留空则不修改" />
                </a-form-item>
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item field="loginEnabled" label="启用登录">
                            <a-switch v-model="featureForm.loginEnabled" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item field="unionIdEnabled" label="启用UnionID">
                            <a-switch v-model="featureForm.unionIdEnabled" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-form-item field="status" label="状态">
                    <a-select v-model="platformForm.status">
                        <a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                    </a-select>
                </a-form-item>
                <a-form-item field="remark" label="备注">
                    <a-textarea v-model="platformForm.remark" :auto-size="{ minRows: 2 }" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useClientHook } from '../hooks/client';
import { usePlatformHook } from '../hooks/platform';
import type { ClientData } from '../api/client';
import type { PlatformData } from '../api/platform';
import {
    CLIENT_TYPE_OPTIONS, STATUS_OPTIONS, EVM_CHAIN_OPTIONS,
    getPlatformLabel, getClientTypeLabel
} from '../constants';

const activeTab = ref('client');

const {
    dataList: clientList, loading: clientLoading, total: clientTotal,
    currentPage: clientPage, pageSize: clientPageSize, optionList,
    fetchDataList: fetchClients, createData: createClient, updateData: updateClient,
    deleteData: deleteClientData, getDetail: getClientDetail, fetchOptions, resetSearchParams: resetClientHook
} = useClientHook();

const {
    dataList: platformList, loading: platformLoading, total: platformTotal,
    currentPage: platformPage, pageSize: platformPageSize, supportedPlatforms,
    fetchDataList: fetchPlatforms, createData: createPlatform, updateData: updatePlatform,
    deleteData: deletePlatformData, getDetail: getPlatformDetail,
    fetchSupportedPlatforms, resetSearchParams: resetPlatformHook
} = usePlatformHook();

const clientOptions = computed(() => optionList.value);
const clientSearch = reactive({ clientKey: '', clientName: '', clientType: undefined as string | undefined, status: undefined as number | undefined });
const platformSearch = reactive({ clientId: undefined as number | undefined, platform: undefined as string | undefined, status: undefined as number | undefined });

const clientPagination = computed(() => ({
    total: clientTotal.value, current: clientPage.value, pageSize: clientPageSize.value,
    showTotal: true, showPageSize: true, pageSizeOptions: [10, 20, 50]
}));
const platformPagination = computed(() => ({
    total: platformTotal.value, current: platformPage.value, pageSize: platformPageSize.value,
    showTotal: true, showPageSize: true, pageSizeOptions: [10, 20, 50]
}));

const loadClients = async (page = clientPage.value) => {
    await fetchClients({ pageNum: page, pageSize: clientPageSize.value, ...clientSearch });
};
const loadPlatforms = async (page = platformPage.value) => {
    await fetchPlatforms({ pageNum: page, pageSize: platformPageSize.value, ...platformSearch });
};
const onClientPageChange = (p: number) => loadClients(p);
const onClientPageSizeChange = (s: number) => { clientPageSize.value = s; loadClients(1); };
const onPlatformPageChange = (p: number) => loadPlatforms(p);
const onPlatformPageSizeChange = (s: number) => { platformPageSize.value = s; loadPlatforms(1); };

const resetClientSearch = () => { Object.assign(clientSearch, { clientKey: '', clientName: '', clientType: undefined, status: undefined }); resetClientHook(); loadClients(1); };
const resetPlatformSearch = () => { Object.assign(platformSearch, { clientId: undefined, platform: undefined, status: undefined }); resetPlatformHook(); loadPlatforms(1); };

const openPlatformForClient = (record: ClientData) => {
    platformSearch.clientId = record.id;
    activeTab.value = 'platform';
    loadPlatforms(1);
};

// 客户端表单
const clientModalVisible = ref(false);
const clientFormRef = ref();
const selectedChains = ref<string[]>([]);
const clientForm = reactive({
    id: 0, clientKey: '', clientName: '', clientType: 'mini_program', status: 1,
    walletEvmEnabled: 0, walletSignMessage: '', logo: '', remark: ''
});
const clientRules = {
    clientKey: [{ required: true, message: '请输入客户端Key' }],
    clientName: [{ required: true, message: '请输入客户端名称' }],
    clientType: [{ required: true, message: '请选择类型' }]
};

const openClientModal = async (record?: ClientData) => {
    if (record) {
        const detail = await getClientDetail(record.id);
        const data = detail.data;
        Object.assign(clientForm, {
            id: data.id, clientKey: data.clientKey, clientName: data.clientName, clientType: data.clientType,
            status: data.status, walletEvmEnabled: data.walletEvmEnabled, walletSignMessage: data.walletSignMessage || '',
            logo: data.logo || '', remark: data.remark || ''
        });
        try { selectedChains.value = data.allowedChainIds ? JSON.parse(data.allowedChainIds) : []; } catch { selectedChains.value = []; }
    } else {
        Object.assign(clientForm, { id: 0, clientKey: '', clientName: '', clientType: 'mini_program', status: 1, walletEvmEnabled: 0, walletSignMessage: '', logo: '', remark: '' });
        selectedChains.value = [];
    }
    clientModalVisible.value = true;
};

const onWalletEvmEnabledChange = (enabled: boolean) => {
    clientForm.walletEvmEnabled = enabled ? 1 : 0;
    if (!enabled) {
        selectedChains.value = [];
        clientForm.walletSignMessage = '';
    }
};

const handleSaveClient = async () => {
    const valid = await clientFormRef.value?.validate();
    if (valid) return false;
    const walletEnabled = clientForm.walletEvmEnabled === 1;
    const payload = {
        ...clientForm,
        walletSignMessage: walletEnabled ? clientForm.walletSignMessage : '',
        allowedChainIds: walletEnabled ? JSON.stringify(selectedChains.value) : '[]'
    };
    try {
        if (clientForm.id) await updateClient(payload);
        else await createClient(payload);
        Message.success('保存成功');
        await loadClients();
        await fetchOptions();
        return true;
    } catch { return false; }
};

const handleDeleteClient = async (id: number) => {
    await deleteClientData(id);
    Message.success('删除成功');
    await loadClients();
    await fetchOptions();
};

// 平台表单
const platformModalVisible = ref(false);
const platformFormRef = ref();
const platformForm = reactive({
    id: 0, clientId: undefined as number | undefined, platform: 'wechat', platformAppId: '',
    platformAppName: '', status: 1, remark: ''
});
const credentialForm = reactive({ appSecret: '', privateKey: '', alipayPublicKey: '' });
const featureForm = reactive({ loginEnabled: true, unionIdEnabled: false });
const platformRules = {
    clientId: [{ required: true, message: '请选择客户端' }],
    platform: [{ required: true, message: '请选择平台' }],
    platformAppId: [{ required: true, message: '请输入平台AppID' }]
};

const buildCredentials = () => {
    const cred: Record<string, string> = {};
    if (credentialForm.appSecret) cred.appSecret = credentialForm.appSecret;
    if (platformForm.platform === 'alipay') {
        if (credentialForm.privateKey) cred.privateKey = credentialForm.privateKey;
        if (credentialForm.alipayPublicKey) cred.alipayPublicKey = credentialForm.alipayPublicKey;
    }
    return Object.keys(cred).length ? JSON.stringify(cred) : '';
};

const openPlatformModal = async (record?: PlatformData) => {
    Object.assign(credentialForm, { appSecret: '', privateKey: '', alipayPublicKey: '' });
    if (record) {
        const detail = await getPlatformDetail(record.id);
        const data = detail.data;
        Object.assign(platformForm, {
            id: data.id, clientId: data.clientId, platform: data.platform, platformAppId: data.platformAppId,
            platformAppName: data.platformAppName || '', status: data.status, remark: data.remark || ''
        });
        try {
            const f = data.features ? JSON.parse(data.features) : {};
            featureForm.loginEnabled = f.loginEnabled !== false;
            featureForm.unionIdEnabled = !!f.unionIdEnabled;
        } catch { featureForm.loginEnabled = true; featureForm.unionIdEnabled = false; }
    } else {
        Object.assign(platformForm, { id: 0, clientId: platformSearch.clientId, platform: 'wechat', platformAppId: '', platformAppName: '', status: 1, remark: '' });
        featureForm.loginEnabled = true;
        featureForm.unionIdEnabled = false;
    }
    platformModalVisible.value = true;
};

const handleSavePlatform = async () => {
    const valid = await platformFormRef.value?.validate();
    if (valid) return false;
    const payload = {
        ...platformForm,
        clientId: platformForm.clientId!,
        credentials: buildCredentials(),
        features: JSON.stringify(featureForm)
    };
    try {
        if (platformForm.id) await updatePlatform(payload);
        else await createPlatform(payload);
        Message.success('保存成功');
        await loadPlatforms();
        return true;
    } catch { return false; }
};

const handleDeletePlatform = async (id: number) => {
    await deletePlatformData(id);
    Message.success('删除成功');
    await loadPlatforms();
};

onMounted(async () => {
    await fetchSupportedPlatforms();
    await fetchOptions();
    await loadClients();
    await loadPlatforms();
});
</script>

<style scoped lang="scss"></style>
