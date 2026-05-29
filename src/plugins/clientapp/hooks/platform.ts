import { ref, computed } from 'vue';
import type { PlatformData, PlatformFormData, PlatformListParams } from '../api/platform';
import {
    getPlatformList,
    createPlatform,
    updatePlatform,
    deletePlatform,
    getPlatformById,
    updatePlatformStatus,
    getPlatformOptions,
    getSupportedPlatforms
} from '../api/platform';

export const usePlatformHook = () => {
    const dataList = ref<PlatformData[]>([]);
    const optionList = ref<PlatformData[]>([]);
    const supportedPlatforms = ref<string[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchParams = ref<Partial<PlatformListParams>>({});

    const fetchDataList = async (params?: Partial<PlatformListParams>) => {
        loading.value = true;
        try {
            if (params?.pageNum !== undefined) currentPage.value = params.pageNum;
            if (params?.pageSize !== undefined) pageSize.value = params.pageSize;
            if (params) searchParams.value = { ...searchParams.value, ...params };

            const response = await getPlatformList({
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                clientId: searchParams.value.clientId,
                platform: searchParams.value.platform,
                platformAppId: searchParams.value.platformAppId,
                platformAppName: searchParams.value.platformAppName,
                status: searchParams.value.status
            });
            dataList.value = response.data.list || [];
            total.value = response.data.total || 0;
        } finally {
            loading.value = false;
        }
    };

    const fetchOptions = async (clientId?: number) => {
        const response = await getPlatformOptions(clientId);
        optionList.value = response.data.list || [];
    };

    const fetchSupportedPlatforms = async () => {
        const response = await getSupportedPlatforms();
        supportedPlatforms.value = response.data.list || [];
    };

    const getDetail = async (id: number) => getPlatformById(id);
    const createData = (data: PlatformFormData) => createPlatform(data);
    const updateData = (data: PlatformFormData) => updatePlatform(data);
    const deleteData = (id: number) => deletePlatform(id);
    const updateStatus = (id: number, status: number) => updatePlatformStatus({ id, status });

    const resetSearchParams = () => {
        searchParams.value = {};
        currentPage.value = 1;
    };

    return {
        dataList,
        optionList,
        supportedPlatforms,
        loading,
        total,
        currentPage,
        pageSize,
        searchParams,
        getDataList: computed(() => dataList.value),
        fetchDataList,
        fetchOptions,
        fetchSupportedPlatforms,
        getDetail,
        createData,
        updateData,
        deleteData,
        updateStatus,
        resetSearchParams
    };
};
