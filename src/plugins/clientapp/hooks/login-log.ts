import { ref, computed } from 'vue';
import type { LoginLogListParams } from '../api/login-log';
import { getLoginLogList } from '../api/login-log';

export const useLoginLogHook = () => {
    const dataList = ref<any[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchParams = ref<Partial<LoginLogListParams>>({});

    const fetchDataList = async (params?: Partial<LoginLogListParams>) => {
        loading.value = true;
        try {
            if (params?.pageNum !== undefined) currentPage.value = params.pageNum;
            if (params?.pageSize !== undefined) pageSize.value = params.pageSize;
            if (params) searchParams.value = { ...searchParams.value, ...params };

            const response = await getLoginLogList({
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                clientId: searchParams.value.clientId,
                platformId: searchParams.value.platformId,
                platform: searchParams.value.platform,
                userId: searchParams.value.userId,
                loginChannel: searchParams.value.loginChannel,
                status: searchParams.value.status
            });
            dataList.value = response.data.list || [];
            total.value = response.data.total || 0;
        } finally {
            loading.value = false;
        }
    };

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
        resetSearchParams
    };
};
