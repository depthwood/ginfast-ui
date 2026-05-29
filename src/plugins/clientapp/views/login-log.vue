<template>
<div class="snow-page">
    <div class="snow-inner">
        <a-space wrap style="margin-bottom: 16px">
            <a-select v-model="searchForm.clientId" placeholder="客户端" allow-clear style="width: 200px">
                <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">{{ item.clientName }}</a-option>
            </a-select>
            <a-select v-model="searchForm.platform" placeholder="平台" allow-clear style="width: 160px">
                <a-option v-for="(label, key) in PLATFORM_LABELS" :key="key" :value="key">{{ label }}</a-option>
            </a-select>
            <a-input-number v-model="searchForm.userId" placeholder="用户ID" allow-clear hide-button style="width: 140px" />
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
                <a-option :value="1">成功</a-option>
                <a-option :value="0">失败</a-option>
            </a-select>
            <a-button type="primary" @click="loadData(1)">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
        </a-space>

        <a-table :data="dataList" :loading="loading" :pagination="pagination"
            :bordered="{ wrapper: true, cell: true }" @page-change="onPageChange" @page-size-change="onPageSizeChange">
            <template #columns>
                <a-table-column title="ID" data-index="id" :width="70" align="center" />
                <a-table-column title="时间" data-index="createdAt" :width="170" />
                <a-table-column title="客户端" data-index="clientName" :width="120" ellipsis tooltip />
                <a-table-column title="平台" data-index="platform" :width="120">
                    <template #cell="{ record }">{{ getPlatformLabel(record.platform) }}</template>
                </a-table-column>
                <a-table-column title="用户ID" data-index="userId" :width="80" align="center" />
                <a-table-column title="登录方式" data-index="loginChannel" :width="100" />
                <a-table-column title="身份标识" data-index="identityKey" :width="160" ellipsis tooltip />
                <a-table-column title="IP" data-index="ip" :width="130" />
                <a-table-column title="状态" data-index="status" :width="80" align="center">
                    <template #cell="{ record }">
                        <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? '成功' : '失败' }}</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="失败原因" data-index="failReason" :width="160" ellipsis tooltip />
            </template>
        </a-table>
    </div>
</div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useLoginLogHook } from '../hooks/login-log';
import { useClientHook } from '../hooks/client';
import { PLATFORM_LABELS, getPlatformLabel } from '../constants';

const { dataList, loading, total, currentPage, pageSize, fetchDataList, resetSearchParams } = useLoginLogHook();
const { optionList: clientOptionList, fetchOptions } = useClientHook();
const clientOptions = computed(() => clientOptionList.value);

const searchForm = reactive({
    clientId: undefined as number | undefined,
    platform: undefined as string | undefined,
    userId: undefined as number | undefined,
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
    Object.assign(searchForm, { clientId: undefined, platform: undefined, userId: undefined, status: undefined });
    resetSearchParams();
    loadData(1);
};

onMounted(async () => {
    await fetchOptions();
    await loadData();
});
</script>

<style scoped lang="scss"></style>
