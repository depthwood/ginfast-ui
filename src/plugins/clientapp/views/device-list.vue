<template>
<div class="snow-page">
    <div class="snow-inner">
        <!-- 搜索栏 -->
        <a-space wrap style="margin-bottom: 16px">
            <a-input v-model="searchForm.deviceUUID" placeholder="设备UUID" allow-clear style="width: 200px" />
            <a-select v-model="searchForm.clientId" placeholder="所属客户端" allow-clear style="width: 200px">
                <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">{{ item.clientName }} ({{ item.clientKey }})</a-option>
            </a-select>
            <a-select v-model="searchForm.platform" placeholder="设备平台" allow-clear style="width: 140px">
                <a-option v-for="item in DEVICE_PLATFORM_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
                <a-option v-for="item in DEVICE_STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-button type="primary" @click="loadData(1)">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="outline" status="success" @click="handleSimulate">
                <template #icon><icon-experiment /></template>模拟发现
            </a-button>
        </a-space>

        <!-- 设备列表 -->
        <a-table :data="dataList" :loading="loading" :pagination="pagination"
            :bordered="{ wrapper: true, cell: true }" @page-change="onPageChange" @page-size-change="onPageSizeChange">
            <template #columns>
                <a-table-column title="ID" data-index="id" :width="70" align="center" />
                <a-table-column title="设备UUID" data-index="deviceUUID" :width="200" ellipsis tooltip>
                    <template #cell="{ record }">
                        <a-tag color="arcoblue">{{ truncateUUID(record.deviceUUID) }}</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="设备名称" data-index="deviceName" :width="140" ellipsis tooltip />
                <a-table-column title="客户端" data-index="clientName" :width="140" ellipsis tooltip>
                    <template #cell="{ record }">
                        <span v-if="record.clientName">{{ record.clientName }}</span>
                        <span v-else style="color: #999">未绑定</span>
                    </template>
                </a-table-column>
                <a-table-column title="客户端Key" data-index="clientKey" :width="120" ellipsis tooltip />
                <a-table-column title="平台" data-index="platform" :width="90" align="center">
                    <template #cell="{ record }">
                        <a-tag :color="getPlatformColor(record.platform)">{{ getDevicePlatformLabel(record.platform) }}</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="版本" data-index="appVersion" :width="80" />
                <a-table-column title="状态" data-index="status" :width="90" align="center">
                    <template #cell="{ record }">
                        <a-tag :color="getStatusColor(record.status)">{{ getDeviceStatusLabel(record.status) }}</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="注册时间" data-index="registeredAt" :width="170">
                    <template #cell="{ record }">{{ formatTime(record.registeredAt) }}</template>
                </a-table-column>
                <a-table-column title="最后活跃" data-index="lastSeenAt" :width="170">
                    <template #cell="{ record }">{{ formatTime(record.lastSeenAt) }}</template>
                </a-table-column>
                <a-table-column title="操作" :width="200" fixed="right">
                    <template #cell="{ record }">
                        <a-space>
                            <a-button v-if="record.status !== 0" size="small" status="warning"
                                v-hasPerm="['plugins:clientapp:device:status']"
                                @click="handleToggleStatus(record, 0)">停用</a-button>
                            <a-button v-else size="small" status="success"
                                v-hasPerm="['plugins:clientapp:device:status']"
                                @click="handleToggleStatus(record, 1)">启用</a-button>
                            <a-button size="small" @click="openBindModal(record)"
                                v-hasPerm="['plugins:clientapp:device:bind']">绑定</a-button>
                            <a-popconfirm content="确定删除该设备？" @ok="handleDelete(record.id)">
                                <a-button size="small" status="danger" v-hasPerm="['plugins:clientapp:device:delete']">删除</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </a-table-column>
            </template>
        </a-table>

        <!-- 绑定客户端弹窗 -->
        <a-modal v-model:visible="bindModalVisible" title="绑定客户端" :width="480" :on-before-ok="handleBindSave" @cancel="bindModalVisible = false">
            <a-form :model="bindForm" layout="vertical">
                <a-form-item label="设备UUID">
                    <a-input :model-value="bindForm.deviceUUID" disabled />
                </a-form-item>
                <a-form-item field="clientId" label="绑定客户端">
                    <a-select v-model="bindForm.clientId" placeholder="选择客户端" allow-search>
                        <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">
                            {{ item.clientName }} ({{ item.clientKey }})
                        </a-option>
                    </a-select>
                </a-form-item>
                <a-form-item field="remark" label="备注">
                    <a-textarea v-model="bindForm.remark" placeholder="备注信息" :auto-size="{ minRows: 2, maxRows: 4 }" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useDeviceHook } from '../hooks/device';
import { useClientHook } from '../hooks/client';
import type { DeviceData } from '../api/device';
import {
    DEVICE_PLATFORM_OPTIONS, DEVICE_STATUS_OPTIONS,
    getDevicePlatformLabel, getDeviceStatusLabel
} from '../constants';

const {
    dataList, loading, total, currentPage, pageSize,
    fetchDataList, updateStatus, bindClient, deleteData, simulate, resetSearchParams
} = useDeviceHook();

const { optionList: clientOptionList, fetchOptions } = useClientHook();
const clientOptions = computed(() => clientOptionList.value);

// 搜索
const searchForm = reactive({
    deviceUUID: '',
    clientId: undefined as number | undefined,
    platform: undefined as string | undefined,
    status: undefined as number | undefined
});

const pagination = computed(() => ({
    total: total.value, current: currentPage.value, pageSize: pageSize.value,
    showTotal: true, showPageSize: true, pageSizeOptions: [10, 20, 50]
}));

const loadData = async (page = currentPage.value) => {
    await fetchDataList({ pageNum: page, pageSize: pageSize.value, ...searchForm });
};
const onPageChange = (p: number) => loadData(p);
const onPageSizeChange = (s: number) => { pageSize.value = s; loadData(1); };
const handleReset = () => {
    Object.assign(searchForm, { deviceUUID: '', clientId: undefined, platform: undefined, status: undefined });
    resetSearchParams();
    loadData(1);
};

// 工具函数
const truncateUUID = (uuid: string) => {
    if (!uuid || uuid.length <= 13) return uuid || '-';
    return uuid.substring(0, 8) + '...' + uuid.substring(uuid.length - 4);
};

const formatTime = (iso: string) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return iso;
    }
};

const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = { android: 'green', ios: 'arcoblue', web: 'purple' };
    return colors[platform] || 'gray';
};

const getStatusColor = (status: number) => {
    const colors: Record<number, string> = { 0: 'red', 1: 'green', 2: 'orangered' };
    return colors[status] ?? 'gray';
};

// 启停设备
const handleToggleStatus = async (record: DeviceData, newStatus: number) => {
    try {
        await updateStatus({ id: record.id, status: newStatus });
        Message.success(newStatus === 1 ? '已启用' : '已停用');
        await loadData();
    } catch { /* handled by http interceptor */ }
};

// 绑定弹窗
const bindModalVisible = ref(false);
const bindForm = reactive({
    id: 0,
    deviceUUID: '',
    clientId: undefined as number | undefined,
    remark: ''
});

const openBindModal = (record: DeviceData) => {
    Object.assign(bindForm, {
        id: record.id,
        deviceUUID: record.deviceUUID,
        clientId: record.clientID || undefined,
        remark: record.remark || ''
    });
    bindModalVisible.value = true;
};

const handleBindSave = async () => {
    if (!bindForm.clientId) {
        Message.warning('请选择客户端');
        return false;
    }
    try {
        await bindClient({ id: bindForm.id, clientId: bindForm.clientId, remark: bindForm.remark });
        Message.success('绑定成功');
        await loadData();
        return true;
    } catch {
        return false;
    }
};

// 删除
const handleDelete = async (id: number) => {
    try {
        await deleteData(id);
        Message.success('删除成功');
        await loadData();
    } catch { /* handled by http interceptor */ }
};

// 模拟发现
const handleSimulate = async () => {
    const platforms = ['android', 'ios', 'web'];
    const names = ['华为 Mate 60', 'iPhone 15 Pro', '小米 14', 'OPPO Find X7', 'vivo X100', 'Pixel 8'];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    try {
        const res = await simulate({ deviceName: randomName, platform: randomPlatform });
        const d = res.data as any;
        const label = d?.isNew ? '新注册' : '已存在';
        Message.success(`模拟设备${label}: ${d?.deviceUUID || ''} (${d?.clientKey || ''})`);
        await loadData();
    } catch { /* handled by http interceptor */ }
};

onMounted(async () => {
    await fetchOptions();
    await loadData();
});
</script>

<style scoped lang="scss"></style>
