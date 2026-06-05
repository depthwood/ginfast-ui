import { computed, ref } from 'vue';
import type { AppConfigData, AppConfigFormData, AppConfigListParams } from '../api/app-config';
import {
    deleteAppConfig,
    getAppConfigById,
    getAppConfigList,
    publishAppConfig,
    saveAppConfig,
    updateAppConfigStatus
} from '../api/app-config';

export const useAppConfigHook = () => {
    const dataList = ref<AppConfigData[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchParams = ref<Partial<AppConfigListParams>>({});

    const fetchDataList = async (params?: Partial<AppConfigListParams>) => {
        loading.value = true;
        try {
            if (params?.pageNum !== undefined) currentPage.value = params.pageNum;
            if (params?.pageSize !== undefined) pageSize.value = params.pageSize;
            if (params) searchParams.value = { ...searchParams.value, ...params };
            const response = await getAppConfigList({
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                clientId: searchParams.value.clientId,
                name: searchParams.value.name,
                status: searchParams.value.status
            });
            dataList.value = response.data.list || [];
            total.value = response.data.total || 0;
        } finally {
            loading.value = false;
        }
    };

    const getDetail = (id: number) => getAppConfigById(id);
    const saveData = (data: AppConfigFormData) => saveAppConfig(data);
    const publishData = (data: AppConfigFormData) => publishAppConfig(data);
    const deleteData = (id: number) => deleteAppConfig(id);
    const updateStatus = (id: number, status: number) => updateAppConfigStatus({ id, status });
    const resetSearchParams = () => {
        searchParams.value = {};
        currentPage.value = 1;
    };

    return {
        dataList,
        loading,
        total,
        currentPage,
        pageSize,
        searchParams,
        getDataList: computed(() => dataList.value),
        fetchDataList,
        getDetail,
        saveData,
        publishData,
        deleteData,
        updateStatus,
        resetSearchParams
    };
};
